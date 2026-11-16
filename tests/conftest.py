from __future__ import annotations

import functools
import http.server
import socketserver
import sys
import threading
from pathlib import Path

import pytest
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from tools.v8_coverage_report import build_report
EVIDENCE = ROOT / "evidence"
COVERAGE_SAMPLES: list[list[dict]] = []


@pytest.fixture(scope="session")
def base_url():
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(ROOT))
    with socketserver.TCPServer(("127.0.0.1", 0), handler) as server:
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        yield f"http://127.0.0.1:{server.server_address[1]}"
        server.shutdown()
        thread.join(timeout=5)


@pytest.fixture(scope="session")
def browser():
    with sync_playwright() as playwright:
        available = sorted(Path("/opt/pw-browsers").glob("chromium-*/chrome-linux64/chrome"))
        options = {"headless": True}
        if available:
            options["executable_path"] = str(available[-1])
        browser = playwright.chromium.launch(**options)
        yield browser
        browser.close()


@pytest.fixture
def app_page(browser, base_url):
    context = browser.new_context(locale="pt-BR", timezone_id="America/Sao_Paulo", viewport={"width": 1440, "height": 980})
    page = context.new_page()
    cdp = context.new_cdp_session(page)
    cdp.send("Profiler.enable")
    cdp.send("Profiler.startPreciseCoverage", {"callCount": True, "detailed": True, "allowTriggeredUpdates": False})
    page.goto(f"{base_url}/tests/browser_harness.html", wait_until="networkidle")
    yield page
    result = cdp.send("Profiler.takePreciseCoverage")
    COVERAGE_SAMPLES.append(result["result"])
    cdp.send("Profiler.stopPreciseCoverage")
    cdp.detach()
    context.close()


def pytest_sessionfinish(session, exitstatus):
    if not COVERAGE_SAMPLES:
        return
    report = build_report(COVERAGE_SAMPLES, ROOT / "js" / "app.js", EVIDENCE)
    terminal = session.config.pluginmanager.get_plugin("terminalreporter")
    if terminal:
        terminal.write_sep("=", "Cobertura V8 de js/app.js")
        terminal.write_line(
            f"Linhas {report['lines']['pct']:.2f}% | Funções {report['functions']['pct']:.2f}% | "
            f"Blocos {report['blocks']['pct']:.2f}% | Bytes {report['bytes']['pct']:.2f}%"
        )
