"""Gera métricas reproduzíveis a partir da cobertura precisa do V8/Chromium."""
from __future__ import annotations

import html
import json
from pathlib import Path


def _pct(covered: int, total: int) -> float:
    return round((covered / total * 100) if total else 100.0, 2)


def build_report(samples: list[dict], source_path: Path, output_dir: Path) -> dict:
    source = source_path.read_text(encoding="utf-8")
    scripts = [item for sample in samples for item in sample if item.get("url", "").endswith("/js/app.js")]
    if not scripts:
        raise RuntimeError("O Chromium não retornou dados de cobertura para js/app.js")

    merged_ranges: dict[tuple[int, int], int] = {}
    merged_functions: dict[tuple[str, int, int], int] = {}
    merged_blocks: dict[tuple[int, int], int] = {}

    for script in scripts:
        for function in script.get("functions", []):
            ranges = function.get("ranges", [])
            if not ranges:
                continue
            root = ranges[0]
            function_key = (function.get("functionName") or "(anônima)", root["startOffset"], root["endOffset"])
            merged_functions[function_key] = max(merged_functions.get(function_key, 0), root.get("count", 0))
            for index, item in enumerate(ranges):
                key = (item["startOffset"], item["endOffset"])
                merged_ranges[key] = max(merged_ranges.get(key, 0), item.get("count", 0))
                if index > 0:
                    merged_blocks[key] = max(merged_blocks.get(key, 0), item.get("count", 0))

    ranges = [(start, end, count) for (start, end), count in merged_ranges.items()]

    def hit_at(offset: int):
        candidates = [(end - start, count) for start, end, count in ranges if start <= offset < end]
        if not candidates:
            return None
        return min(candidates, key=lambda item: item[0])[1] > 0

    meaningful_offsets = [index for index, char in enumerate(source) if not char.isspace()]
    byte_hits = sum(1 for index in meaningful_offsets if hit_at(index))

    lines = source.splitlines(keepends=True)
    line_rows = []
    offset = 0
    for number, line in enumerate(lines, 1):
        stripped = line.strip()
        code_line = bool(stripped and not stripped.startswith("//"))
        positions = [offset + i for i, char in enumerate(line) if not char.isspace()]
        hits = [hit_at(position) for position in positions]
        executable = code_line and any(hit is not None for hit in hits)
        covered = executable and any(hit is True for hit in hits)
        if executable:
            line_rows.append({"line": number, "covered": covered, "source": line.rstrip("\n")})
        offset += len(line)

    line_total = len(line_rows)
    line_covered = sum(row["covered"] for row in line_rows)
    function_total = len(merged_functions)
    function_covered = sum(count > 0 for count in merged_functions.values())
    block_total = len(merged_blocks)
    block_covered = sum(count > 0 for count in merged_blocks.values())

    report = {
        "engine": "Chromium V8 Profiler.startPreciseCoverage",
        "source": "js/app.js",
        "methodology": {
            "lines": "Linha executável coberta quando ao menos um intervalo V8 aplicável foi executado.",
            "functions": "Função coberta quando o intervalo-raiz da função teve contagem maior que zero.",
            "blocks": "Bloco coberto quando um intervalo detalhado não-raiz teve contagem maior que zero.",
            "bytes": "Caracteres não brancos cobertos, atribuídos ao menor intervalo V8 que os contém."
        },
        "lines": {"covered": line_covered, "total": line_total, "pct": _pct(line_covered, line_total)},
        "functions": {"covered": function_covered, "total": function_total, "pct": _pct(function_covered, function_total)},
        "blocks": {"covered": block_covered, "total": block_total, "pct": _pct(block_covered, block_total)},
        "bytes": {"covered": byte_hits, "total": len(meaningful_offsets), "pct": _pct(byte_hits, len(meaningful_offsets))},
        "uncovered_lines": [row["line"] for row in line_rows if not row["covered"]]
    }

    output_dir.mkdir(parents=True, exist_ok=True)
    (output_dir / "coverage-summary.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    text = (
        "COBERTURA REAL DO SGS — js/app.js\n"
        "Motor: Chromium V8 Precise Coverage\n"
        f"Linhas:  {line_covered}/{line_total} ({report['lines']['pct']:.2f}%)\n"
        f"Funções: {function_covered}/{function_total} ({report['functions']['pct']:.2f}%)\n"
        f"Blocos:  {block_covered}/{block_total} ({report['blocks']['pct']:.2f}%)\n"
        f"Bytes:   {byte_hits}/{len(meaningful_offsets)} ({report['bytes']['pct']:.2f}%)\n"
        f"Linhas não cobertas: {', '.join(map(str, report['uncovered_lines'])) or 'nenhuma'}\n"
    )
    (output_dir / "coverage-summary.txt").write_text(text, encoding="utf-8")

    rows = []
    for row in line_rows:
        css = "covered" if row["covered"] else "uncovered"
        mark = "✓" if row["covered"] else "✗"
        rows.append(f'<tr class="{css}"><td>{row["line"]}</td><td>{mark}</td><td><code>{html.escape(row["source"])}</code></td></tr>')
    page = f"""<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Cobertura SGS</title>
<style>body{{font:16px system-ui;margin:2rem;color:#172033}}.metrics{{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem}}.card{{padding:1rem;border:1px solid #ccd5e0;border-radius:10px}}.value{{font-size:2rem;font-weight:700}}table{{border-collapse:collapse;width:100%;margin-top:2rem}}td,th{{border-bottom:1px solid #ddd;padding:.35rem;text-align:left;vertical-align:top}}.covered{{background:#ecfdf3}}.uncovered{{background:#fff1f2}}code{{white-space:pre-wrap}}</style></head><body>
<h1>Cobertura automatizada — SGS</h1><p><strong>Arquivo:</strong> js/app.js · <strong>Motor:</strong> Chromium V8 Precise Coverage</p>
<div class="metrics"><div class="card"><div>Linhas</div><div class="value">{report['lines']['pct']:.2f}%</div><div>{line_covered}/{line_total}</div></div><div class="card"><div>Funções</div><div class="value">{report['functions']['pct']:.2f}%</div><div>{function_covered}/{function_total}</div></div><div class="card"><div>Blocos</div><div class="value">{report['blocks']['pct']:.2f}%</div><div>{block_covered}/{block_total}</div></div><div class="card"><div>Bytes instrumentados</div><div class="value">{report['bytes']['pct']:.2f}%</div><div>{byte_hits}/{len(meaningful_offsets)}</div></div></div>
<h2>Detalhamento por linha executável</h2><table><thead><tr><th>Linha</th><th>Status</th><th>Código</th></tr></thead><tbody>{''.join(rows)}</tbody></table>
</body></html>"""
    (output_dir / "coverage-report.html").write_text(page, encoding="utf-8")
    return report
