from pathlib import Path

from playwright.sync_api import expect

EVIDENCE = Path(__file__).resolve().parents[2] / "evidence"


def submit(page, selector):
    page.locator(selector).evaluate("form => form.requestSubmit()")


def authenticate(page):
    page.evaluate("sessionStorage.setItem('sgs.session.v1', 'authenticated')")
    page.reload(wait_until="networkidle")


def test_invalid_then_valid_login_and_logout(app_page):
    app_page.fill("#loginEmail", "usuario@teste.local")
    app_page.fill("#loginPassword", "senha-errada")
    submit(app_page, "#loginForm")
    expect(app_page.locator("#loginError")).to_be_visible()
    assert app_page.evaluate("sessionStorage.getItem('sgs.session.v1')") is None

    app_page.fill("#loginEmail", " DEMO@SGS.LOCAL ")
    app_page.fill("#loginPassword", "Sgs@2026")
    submit(app_page, "#loginForm")
    expect(app_page.locator("#appView")).to_be_visible()
    assert app_page.title() == "Solicitações — SGS"
    assert app_page.evaluate("sessionStorage.getItem('sgs.session.v1')") == "authenticated"

    app_page.click("#userMenuButton")
    expect(app_page.locator("#userMenu")).to_be_visible()
    app_page.click("#logoutButton")
    expect(app_page.locator("#loginView")).to_be_visible()
    assert app_page.title() == "Entrar — SGS"


def test_form_validation_and_persistent_request_creation(app_page):
    authenticate(app_page)
    app_page.click("#newRequestButton")
    expect(app_page.locator("#formPage")).to_be_visible()
    assert app_page.title() == "Nova Solicitação — SGS"

    submit(app_page, "#requestForm")
    expect(app_page.locator("#formErrorSummary")).to_be_visible()
    assert app_page.locator("#clientName").get_attribute("aria-invalid") == "true"

    app_page.fill("#clientName", "Cliente Integração")
    app_page.fill("#phone", "11987654321")
    app_page.fill("#subject", "Acesso ao portal")
    app_page.fill("#description", "Solicitação criada pelo teste automatizado.")
    submit(app_page, "#requestForm")

    requests = app_page.evaluate("JSON.parse(localStorage.getItem('sgs.requests.v1'))")
    assert len(requests) == 6
    assert requests[-1]["id"] == 10235
    assert requests[-1]["client"] == "Cliente Integração"
    assert requests[-1]["phone"] == "(11) 98765-4321"
    assert requests[-1]["status"] == "Pendente"
    expect(app_page.locator("#successAlert")).to_be_visible()
    assert "10235" in app_page.locator("#successDetail").inner_text()
    assert "Cliente Integração" in app_page.locator("#requestRows").inner_text()
    EVIDENCE.mkdir(exist_ok=True)
    app_page.screenshot(path=str(EVIDENCE / "01-cadastro-aprovado.png"), full_page=True)

    app_page.click("#closeSuccess")
    expect(app_page.locator("#successAlert")).to_be_hidden()


def test_invalid_phone_is_blocked_and_error_clears_on_input(app_page):
    authenticate(app_page)
    app_page.evaluate("location.hash = 'nova-solicitacao'")
    expect(app_page.locator("#formPage")).to_be_visible()
    app_page.fill("#clientName", "AC")
    app_page.fill("#phone", "1199")
    app_page.fill("#subject", "ABC")
    app_page.fill("#description", "Descrição suficiente")
    submit(app_page, "#requestForm")
    assert "DDD" in app_page.locator('[data-error-for="phone"]').inner_text()
    app_page.fill("#phone", "")
    assert app_page.locator("#phone").get_attribute("aria-invalid") == "false"


def test_search_combined_filters_empty_state_and_clear(app_page):
    authenticate(app_page)
    app_page.fill("#searchFilter", "correcao")
    assert app_page.locator("#requestRows tr").count() == 1
    assert "Correção de cadastro" in app_page.locator("#requestRows").inner_text()

    app_page.select_option("#statusFilter", label="Concluído")
    assert app_page.locator("#requestRows tr").count() == 0
    expect(app_page.locator("#emptyState")).to_be_visible()
    expect(app_page.locator("#requestsPage table")).to_be_hidden()

    app_page.click("#clearFilters")
    assert app_page.locator("#searchFilter").input_value() == ""
    assert app_page.locator("#statusFilter").input_value() == ""
    assert app_page.locator("#requestRows tr").count() == 5


def test_date_filters_sorting_and_pagination(app_page):
    today = app_page.evaluate("new Date(Date.now() - new Date().getTimezoneOffset()*60000).toISOString().slice(0,10)")
    records = [
        {
            "id": 20000 + index,
            "client": f"Cliente {index:02d}",
            "phone": "",
            "subject": f"Assunto {chr(65 + index)}",
            "description": f"Descrição automatizada {index}",
            "date": today if index == 0 else "2026-10-01",
            "status": "Concluído" if index % 3 == 0 else "Em andamento" if index % 3 == 1 else "Pendente",
            "createdAt": "2026-11-16T12:00:00.000Z",
        }
        for index in range(12)
    ]
    app_page.evaluate("records => localStorage.setItem('sgs.requests.v1', JSON.stringify(records))", records)
    authenticate(app_page)

    assert app_page.locator("#requestRows tr").count() == 5
    assert "3" in app_page.locator("#pagination").inner_text()
    app_page.click('button[aria-label="Próxima página"]')
    assert "6–10 de 12" in app_page.locator("#tableSummary").inner_text()

    app_page.click('[data-sort="subject"]')
    assert app_page.locator("#requestRows tr").first.locator("td").nth(1).inner_text() == "Assunto A"
    app_page.click('[data-sort="subject"]')
    assert app_page.locator("#requestRows tr").first.locator("td").nth(1).inner_text() == "Assunto L"

    for period in ("today", "7", "30"):
        app_page.select_option("#periodFilter", period)
        assert app_page.locator("#requestRows tr").count() == 1


def test_view_modal_status_update_and_persistence(app_page):
    authenticate(app_page)
    app_page.click('button[aria-label="Visualizar solicitação 10234"]')
    expect(app_page.locator("#modalBackdrop")).to_be_visible()
    assert app_page.locator("#modalTitle").inner_text() == "Detalhes da solicitação"
    assert "Empresa Alfa" in app_page.locator("#modalContent").inner_text()
    app_page.click("#modalClose")

    app_page.click('button[aria-label="Editar solicitação 10232"]')
    assert app_page.locator("#modalTitle").inner_text() == "Atualizar solicitação"
    app_page.select_option("#modalStatus", label="Concluído")
    submit(app_page, "#statusForm")

    status = app_page.evaluate("JSON.parse(localStorage.getItem('sgs.requests.v1')).find(item => item.id === 10232).status")
    assert status == "Concluído"
    assert "Pendente → Concluído" in app_page.locator("#toastRegion").inner_text()
    expect(app_page.locator("#modalBackdrop")).to_be_hidden()
    EVIDENCE.mkdir(exist_ok=True)
    app_page.screenshot(path=str(EVIDENCE / "02-status-atualizado.png"), full_page=True)


def test_notification_clients_registers_and_placeholder(app_page):
    authenticate(app_page)
    app_page.click("#notificationButton")
    assert app_page.locator("#statusFilter").input_value() == "Pendente"
    assert app_page.locator("#requestRows tr").count() == 2
    assert "Filtro aplicado" in app_page.locator("#toastRegion").inner_text()

    app_page.evaluate("location.hash = 'clientes'")
    expect(app_page.locator("#clientsPage")).to_be_visible()
    assert app_page.locator("#clientCards .summary-card").count() == 4
    assert "Empresa Alfa" in app_page.locator("#clientCards").inner_text()

    app_page.evaluate("location.hash = 'cadastros'")
    expect(app_page.locator("#registersPage")).to_be_visible()
    assert app_page.locator("#registerSummary .summary-card").count() == 5
    assert "Solicitações" in app_page.locator("#registerSummary").inner_text()
    assert "Clientes" in app_page.locator("#registerSummary").inner_text()

    app_page.click('[data-placeholder="Ajuda"]')
    assert "fora do escopo" in app_page.locator("#toastRegion").inner_text()


def test_sidebar_user_menu_and_document_click(app_page):
    authenticate(app_page)
    app_page.click("#menuButton")
    assert "open" in (app_page.locator("#sidebar").get_attribute("class") or "")
    assert app_page.locator("#menuButton").get_attribute("aria-expanded") == "true"
    app_page.locator("#sidebarBackdrop").dispatch_event("click")
    assert "open" not in (app_page.locator("#sidebar").get_attribute("class") or "")

    app_page.click("#userMenuButton")
    expect(app_page.locator("#userMenu")).to_be_visible()
    app_page.locator("body").click(position={"x": 5, "y": 5})
    expect(app_page.locator("#userMenu")).to_be_hidden()


def test_modal_focus_trap_escape_and_backdrop_close(app_page):
    authenticate(app_page)
    app_page.click('button[aria-label="Editar solicitação 10231"]')
    expect(app_page.locator("#modalBackdrop")).to_be_visible()
    first = app_page.locator("#modalClose")
    last = app_page.locator('#statusForm button[type="submit"]')

    last.focus()
    app_page.keyboard.press("Tab")
    assert app_page.evaluate("document.activeElement.id") == "modalClose"
    first.focus()
    app_page.keyboard.press("Shift+Tab")
    assert app_page.evaluate("document.activeElement.outerHTML.includes('Atualizar')")
    app_page.keyboard.press("Escape")
    expect(app_page.locator("#modalBackdrop")).to_be_hidden()

    app_page.click('button[aria-label="Visualizar solicitação 10234"]')
    app_page.locator("#modalBackdrop").click(position={"x": 1, "y": 1})
    expect(app_page.locator("#modalBackdrop")).to_be_hidden()


def test_invalid_route_and_cancel_new_request(app_page):
    authenticate(app_page)
    app_page.evaluate("location.hash = 'rota-inexistente'")
    assert app_page.title() == "Solicitações — SGS"
    app_page.click("#newRequestButton")
    expect(app_page.locator("#formPage")).to_be_visible()
    app_page.click("#cancelRequest")
    expect(app_page.locator("#requestsPage")).to_be_visible()
