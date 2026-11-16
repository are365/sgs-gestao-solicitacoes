import pytest


def submit(page, selector):
    page.locator(selector).evaluate("form => form.requestSubmit()")


def authenticate_and_reload(page):
    page.evaluate("sessionStorage.setItem('sgs.session.v1', 'authenticated')")
    page.reload(wait_until="networkidle")


def test_login_required_fields_are_validated_independently(app_page):
    submit(app_page, "#loginForm")
    assert app_page.locator("#loginEmail").get_attribute("aria-invalid") == "true"
    assert app_page.locator('[data-error-for="loginEmail"]').inner_text() == "Informe o usuário ou e-mail."
    assert app_page.locator("#loginPassword").get_attribute("aria-invalid") == "true"
    assert app_page.locator('[data-error-for="loginPassword"]').inner_text() == "Informe a senha."


def test_password_visibility_and_accessibility_attributes(app_page):
    app_page.click("#togglePassword")
    assert app_page.locator("#loginPassword").get_attribute("type") == "text"
    assert app_page.locator("#togglePassword").get_attribute("aria-pressed") == "true"
    assert app_page.locator("#togglePassword").inner_text() == "Ocultar"
    app_page.click("#togglePassword")
    assert app_page.locator("#loginPassword").get_attribute("type") == "password"
    assert app_page.locator("#togglePassword").get_attribute("aria-pressed") == "false"


@pytest.mark.parametrize(
    ("raw", "expected"),
    [
        ("1", "(1"),
        ("119999", "(11) 9999"),
        ("1199999999", "(11) 9999-9999"),
        ("11999999999", "(11) 99999-9999"),
        ("(11) 99999-9999 texto extra", "(11) 99999-9999"),
    ],
)
def test_phone_mask_variations(app_page, raw, expected):
    app_page.locator("#phone").evaluate(
        "(element, value) => { element.value = value; element.dispatchEvent(new Event('input', {bubbles:true})); }",
        raw,
    )
    assert app_page.locator("#phone").input_value() == expected


def test_description_counter(app_page):
    app_page.locator("#description").evaluate(
        "(element, value) => { element.value = value; element.dispatchEvent(new Event('input', {bubbles:true})); }",
        "Descrição de teste",
    )
    assert app_page.locator("#descriptionCount").inner_text() == "18/500"


def test_invalid_json_is_replaced_by_five_seed_records(app_page):
    app_page.evaluate("localStorage.setItem('sgs.requests.v1', '{json inválido')")
    app_page.reload(wait_until="networkidle")
    count = app_page.evaluate("JSON.parse(localStorage.getItem('sgs.requests.v1')).length")
    assert count == 5
    assert app_page.locator("#notificationCount").inner_text() == "2"


def test_invalid_ids_and_statuses_are_discarded(app_page):
    records = [
        {"id": 1, "client": "Válido", "phone": "", "subject": "Teste", "description": "Descrição válida", "date": "2026-11-16", "status": "Pendente"},
        {"id": "abc", "client": "Inválido", "status": "Pendente"},
        {"id": 2, "client": "Inválido", "status": "Cancelado"},
        None,
    ]
    app_page.evaluate("records => localStorage.setItem('sgs.requests.v1', JSON.stringify(records))", records)
    authenticate_and_reload(app_page)
    assert app_page.locator("#requestRows tr").count() == 1
    assert "de 1 solicitação" in app_page.locator("#tableSummary").inner_text()


def test_storage_fallback_keeps_login_and_logout_operational(app_page):
    app_page.add_init_script("""
      Storage.prototype.getItem = function(){ throw new Error('storage bloqueado'); };
      Storage.prototype.setItem = function(){ throw new Error('storage bloqueado'); };
      Storage.prototype.removeItem = function(){ throw new Error('storage bloqueado'); };
    """)
    app_page.reload(wait_until="networkidle")
    app_page.fill("#loginEmail", "demo@sgs.local")
    app_page.fill("#loginPassword", "Sgs@2026")
    submit(app_page, "#loginForm")
    assert app_page.locator("#appView").is_visible()
    app_page.click("#userMenuButton")
    app_page.click("#logoutButton")
    assert app_page.locator("#loginView").is_visible()


def test_three_statuses_have_distinct_badges(app_page):
    authenticate_and_reload(app_page)
    assert app_page.locator(".status-badge.status-done").filter(has_text="✓").count() >= 1
    assert app_page.locator(".status-badge.status-progress").filter(has_text="↻").count() >= 1
    assert app_page.locator(".status-badge.status-pending").filter(has_text="◷").count() >= 1
