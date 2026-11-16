(() => {
  'use strict';

  const DEMO_USER = 'demo@sgs.local';
  const DEMO_PASSWORD = 'Sgs@2026';
  const REQUESTS_KEY = 'sgs.requests.v1';
  const SESSION_KEY = 'sgs.session.v1';
  const PAGE_SIZE = 5;
  const ALLOWED_STATUS = ['Pendente', 'Em andamento', 'Concluído'];

  const seedRequests = [
    { id: 10234, client: 'Empresa Alfa', phone: '(11) 90000-0001', subject: 'Acesso ao sistema', description: 'Cliente solicita orientação para recuperar o acesso ao sistema.', date: '2026-11-13', status: 'Concluído', createdAt: '2026-11-13T10:20:00' },
    { id: 10233, client: 'Empresa Exemplo', phone: '(11) 90000-0002', subject: 'Inclusão de novo usuário', description: 'Cadastrar um novo usuário para a equipe de atendimento.', date: '2026-11-13', status: 'Em andamento', createdAt: '2026-11-13T09:15:00' },
    { id: 10232, client: 'Cliente Exemplo', phone: '', subject: 'Correção de cadastro', description: 'Corrigir o nome exibido no cadastro da organização.', date: '2026-11-12', status: 'Pendente', createdAt: '2026-11-12T16:40:00' },
    { id: 10231, client: 'Instituto Vida', phone: '(11) 90000-0004', subject: 'Erro no login', description: 'O usuário não consegue acessar o ambiente com a senha atual.', date: '2026-11-11', status: 'Pendente', createdAt: '2026-11-11T11:10:00' },
    { id: 10230, client: 'Empresa Alfa', phone: '(11) 90000-0001', subject: 'Dúvida sobre atendimento', description: 'Solicitação de informações sobre o fluxo de atendimento.', date: '2026-11-10', status: 'Concluído', createdAt: '2026-11-10T14:35:00' }
  ];

  const memoryStorage = new Map();
  const storage = {
    get(key) {
      try { return window.localStorage.getItem(key); }
      catch { return memoryStorage.get(key) || null; }
    },
    set(key, value) {
      try { window.localStorage.setItem(key, value); }
      catch { memoryStorage.set(key, value); }
    },
    remove(key) {
      try { window.localStorage.removeItem(key); }
      catch { memoryStorage.delete(key); }
    }
  };
  const session = {
    get(key) {
      try { return window.sessionStorage.getItem(key); }
      catch { return memoryStorage.get(`session:${key}`) || null; }
    },
    set(key, value) {
      try { window.sessionStorage.setItem(key, value); }
      catch { memoryStorage.set(`session:${key}`, value); }
    },
    remove(key) {
      try { window.sessionStorage.removeItem(key); }
      catch { memoryStorage.delete(`session:${key}`); }
    }
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const elements = {
    loginView: $('#loginView'), appView: $('#appView'), loginForm: $('#loginForm'), loginEmail: $('#loginEmail'),
    loginPassword: $('#loginPassword'), loginError: $('#loginError'), togglePassword: $('#togglePassword'),
    requestsPage: $('#requestsPage'), formPage: $('#formPage'), clientsPage: $('#clientsPage'), registersPage: $('#registersPage'),
    newRequestButton: $('#newRequestButton'), requestForm: $('#requestForm'), cancelRequest: $('#cancelRequest'),
    requestDate: $('#requestDate'), description: $('#description'), descriptionCount: $('#descriptionCount'),
    formErrorSummary: $('#formErrorSummary'), requestRows: $('#requestRows'), emptyState: $('#emptyState'),
    tableSummary: $('#tableSummary'), pagination: $('#pagination'), filterForm: $('#filterForm'),
    clientFilter: $('#clientFilter'), statusFilter: $('#statusFilter'), periodFilter: $('#periodFilter'), searchFilter: $('#searchFilter'), clearFilters: $('#clearFilters'),
    successAlert: $('#successAlert'), successDetail: $('#successDetail'), closeSuccess: $('#closeSuccess'),
    notificationButton: $('#notificationButton'), notificationCount: $('#notificationCount'),
    menuButton: $('#menuButton'), sidebar: $('#sidebar'), sidebarBackdrop: $('#sidebarBackdrop'),
    userMenuButton: $('#userMenuButton'), userMenu: $('#userMenu'), logoutButton: $('#logoutButton'),
    modalBackdrop: $('#modalBackdrop'), requestModal: $('#requestModal'), modalClose: $('#modalClose'), modalTitle: $('#modalTitle'),
    modalRequestId: $('#modalRequestId'), modalContent: $('#modalContent'), statusForm: $('#statusForm'), modalStatus: $('#modalStatus'),
    toastRegion: $('#toastRegion'), clientCards: $('#clientCards'), registerSummary: $('#registerSummary')
  };

  const state = {
    requests: loadRequests(),
    page: 1,
    sort: { key: 'id', direction: 'desc' },
    recentId: null,
    modalId: null,
    lastFocused: null
  };

  function loadRequests() {
    const raw = storage.get(REQUESTS_KEY);
    if (!raw) {
      storage.set(REQUESTS_KEY, JSON.stringify(seedRequests));
      return structuredClone(seedRequests);
    }
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error('Formato inválido');
      return parsed.filter(item => item && Number.isInteger(Number(item.id)) && ALLOWED_STATUS.includes(item.status));
    } catch {
      storage.set(REQUESTS_KEY, JSON.stringify(seedRequests));
      return structuredClone(seedRequests);
    }
  }

  function saveRequests() {
    storage.set(REQUESTS_KEY, JSON.stringify(state.requests));
  }

  function isAuthenticated() {
    return session.get(SESSION_KEY) === 'authenticated';
  }

  function showLogin() {
    elements.appView.classList.add('is-hidden');
    elements.loginView.classList.remove('is-hidden');
    document.title = 'Entrar — SGS';
    setTimeout(() => elements.loginEmail.focus(), 0);
  }

  function showApp() {
    elements.loginView.classList.add('is-hidden');
    elements.appView.classList.remove('is-hidden');
    route();
  }

  function setFieldError(input, message) {
    const field = input.closest('.field');
    const target = $(`[data-error-for="${input.id}"]`);
    if (field) field.classList.toggle('invalid', Boolean(message));
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (target) {
      target.textContent = message || '';
      if (message) input.setAttribute('aria-describedby', target.getAttribute('id') || `${input.id}-error`);
    }
  }

  function clearFormErrors(form) {
    $$('.field', form).forEach(field => field.classList.remove('invalid'));
    $$('[aria-invalid="true"]', form).forEach(input => input.setAttribute('aria-invalid', 'false'));
    $$('.field-error', form).forEach(error => { error.textContent = ''; });
  }

  function validateLogin() {
    clearFormErrors(elements.loginForm);
    let valid = true;
    if (!elements.loginEmail.value.trim()) { setFieldError(elements.loginEmail, 'Informe o usuário ou e-mail.'); valid = false; }
    if (!elements.loginPassword.value) { setFieldError(elements.loginPassword, 'Informe a senha.'); valid = false; }
    return valid;
  }

  function handleLogin(event) {
    event.preventDefault();
    elements.loginError.classList.add('is-hidden');
    if (!validateLogin()) return;
    if (elements.loginEmail.value.trim().toLowerCase() !== DEMO_USER || elements.loginPassword.value !== DEMO_PASSWORD) {
      elements.loginError.classList.remove('is-hidden');
      elements.loginError.focus();
      return;
    }
    session.set(SESSION_KEY, 'authenticated');
    location.hash = 'solicitacoes';
    showApp();
  }

  function logout() {
    session.remove(SESSION_KEY);
    elements.userMenu.classList.add('is-hidden');
    elements.userMenuButton.setAttribute('aria-expanded', 'false');
    closeSidebar();
    showLogin();
  }

  function todayIso() {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }

  function formatDate(iso) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || '')) return '—';
    const [year, month, day] = iso.split('-').map(Number);
    return new Intl.DateTimeFormat('pt-BR').format(new Date(year, month - 1, day));
  }

  function normalize(value) {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  function statusClass(status) {
    if (status === 'Concluído') return 'status-done';
    if (status === 'Em andamento') return 'status-progress';
    return 'status-pending';
  }

  function statusIcon(status) {
    if (status === 'Concluído') return '✓';
    if (status === 'Em andamento') return '↻';
    return '◷';
  }

  function createStatusBadge(status) {
    const badge = document.createElement('span');
    badge.className = `status-badge ${statusClass(status)}`;
    const icon = document.createElement('span');
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = statusIcon(status);
    badge.append(icon, document.createTextNode(` ${status}`));
    return badge;
  }

  function getFilteredRequests() {
    const client = elements.clientFilter.value;
    const status = elements.statusFilter.value;
    const period = elements.periodFilter.value;
    const query = normalize(elements.searchFilter.value.trim());
    const today = new Date(`${todayIso()}T12:00:00`);

    const filtered = state.requests.filter(item => {
      if (client && item.client !== client) return false;
      if (status && item.status !== status) return false;
      if (period) {
        const itemDate = new Date(`${item.date}T12:00:00`);
        const delta = Math.floor((today - itemDate) / 86400000);
        if (period === 'today' && delta !== 0) return false;
        if (period !== 'today' && (delta < 0 || delta > Number(period))) return false;
      }
      if (query) {
        const haystack = normalize([item.id, item.subject, item.client, item.description, item.phone].join(' '));
        if (!haystack.includes(query)) return false;
      }
      return true;
    });

    const direction = state.sort.direction === 'asc' ? 1 : -1;
    const key = state.sort.key;
    filtered.sort((a, b) => {
      const av = key === 'date' ? a.date : a[key];
      const bv = key === 'date' ? b.date : b[key];
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * direction;
      return String(av).localeCompare(String(bv), 'pt-BR', { numeric: true, sensitivity: 'base' }) * direction;
    });
    return filtered;
  }

  function makeCell(text) {
    const td = document.createElement('td');
    td.textContent = text;
    return td;
  }

  function createActionButton(label, symbol, id, mode) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'icon-button';
    button.setAttribute('aria-label', `${label} solicitação ${id}`);
    button.title = label;
    button.textContent = symbol;
    button.addEventListener('click', () => openRequestModal(id, mode));
    return button;
  }

  function renderRequests() {
    populateClientFilter();
    const requests = getFilteredRequests();
    const totalPages = Math.max(1, Math.ceil(requests.length / PAGE_SIZE));
    if (state.page > totalPages) state.page = totalPages;
    const start = (state.page - 1) * PAGE_SIZE;
    const pageItems = requests.slice(start, start + PAGE_SIZE);

    elements.requestRows.replaceChildren();
    pageItems.forEach(item => {
      const row = document.createElement('tr');
      if (item.id === state.recentId) row.classList.add('new-row');
      row.append(
        makeCell(String(item.id)),
        makeCell(item.subject),
        makeCell(item.client),
        makeCell(formatDate(item.date))
      );
      const statusCell = document.createElement('td');
      statusCell.append(createStatusBadge(item.status));
      const actionCell = document.createElement('td');
      const actions = document.createElement('div');
      actions.className = 'table-actions';
      actions.append(
        createActionButton('Visualizar', '◉', item.id, 'view'),
        createActionButton('Editar', '✎', item.id, 'edit')
      );
      actionCell.append(actions);
      row.append(statusCell, actionCell);
      elements.requestRows.append(row);
    });

    elements.emptyState.classList.toggle('is-hidden', requests.length !== 0);
    $('table', elements.requestsPage).classList.toggle('is-hidden', requests.length === 0);
    const shownFrom = requests.length ? start + 1 : 0;
    const shownTo = Math.min(start + PAGE_SIZE, requests.length);
    elements.tableSummary.textContent = `Exibindo ${shownFrom}–${shownTo} de ${requests.length} solicitaç${requests.length === 1 ? 'ão' : 'ões'}`;
    renderPagination(totalPages);
    renderNotificationCount();
    renderClientCards();
    renderRegisterSummary();
    updateFilterControls();
  }

  function renderPagination(totalPages) {
    elements.pagination.replaceChildren();
    if (totalPages <= 1) return;
    const addButton = (label, page, options = {}) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;
      if (options.label) button.setAttribute('aria-label', options.label);
      if (options.current) button.setAttribute('aria-current', 'page');
      button.disabled = options.disabled || false;
      button.addEventListener('click', () => { state.page = page; renderRequests(); elements.requestsPage.scrollIntoView({ behavior: 'smooth' }); });
      elements.pagination.append(button);
    };
    addButton('‹', Math.max(1, state.page - 1), { label: 'Página anterior', disabled: state.page === 1 });
    const visible = [...new Set([1, state.page - 1, state.page, state.page + 1, totalPages])].filter(page => page >= 1 && page <= totalPages).sort((a,b) => a-b);
    let previous = 0;
    visible.forEach(page => {
      if (previous && page - previous > 1) {
        const ellipsis = document.createElement('span'); ellipsis.textContent = '…'; ellipsis.setAttribute('aria-hidden', 'true'); elements.pagination.append(ellipsis);
      }
      addButton(String(page), page, { label: `Página ${page}`, current: page === state.page });
      previous = page;
    });
    addButton('›', Math.min(totalPages, state.page + 1), { label: 'Próxima página', disabled: state.page === totalPages });
  }

  function populateClientFilter() {
    const selected = elements.clientFilter.value;
    const clients = [...new Set(state.requests.map(item => item.client))].sort((a,b) => a.localeCompare(b, 'pt-BR'));
    elements.clientFilter.replaceChildren(new Option('Todos', ''));
    clients.forEach(client => elements.clientFilter.add(new Option(client, client)));
    elements.clientFilter.value = clients.includes(selected) ? selected : '';
  }

  function updateFilterControls() {
    const active = Boolean(elements.clientFilter.value || elements.statusFilter.value || elements.periodFilter.value || elements.searchFilter.value.trim());
    elements.clearFilters.classList.toggle('is-hidden', !active);
  }

  function clearFilters() {
    elements.filterForm.reset();
    state.page = 1;
    renderRequests();
  }

  function renderNotificationCount() {
    const count = state.requests.filter(item => item.status === 'Pendente').length;
    elements.notificationCount.textContent = String(count);
    elements.notificationButton.setAttribute('aria-label', `${count} solicitaç${count === 1 ? 'ão pendente' : 'ões pendentes'}`);
  }

  function showRequests(options = {}) {
    location.hash = 'solicitacoes';
    state.page = 1;
    if (options.success) {
      elements.successDetail.textContent = `Registro nº ${state.recentId} incluído com status Pendente.`;
      elements.successAlert.classList.remove('is-hidden');
      setTimeout(() => elements.successAlert.focus(), 0);
    }
    renderRequests();
  }

  function showRequestForm() {
    location.hash = 'nova-solicitacao';
  }

  function prepareRequestForm() {
    elements.requestForm.reset();
    clearFormErrors(elements.requestForm);
    elements.formErrorSummary.classList.add('is-hidden');
    elements.requestDate.value = formatDate(todayIso());
    elements.descriptionCount.textContent = '0/500';
    setTimeout(() => $('#clientName').focus(), 0);
  }

  function validateRequestForm() {
    clearFormErrors(elements.requestForm);
    const client = $('#clientName');
    const phone = $('#phone');
    const subject = $('#subject');
    const description = $('#description');
    let valid = true;
    if (client.value.trim().length < 2) { setFieldError(client, 'Informe o nome do cliente.'); valid = false; }
    if (subject.value.trim().length < 3) { setFieldError(subject, 'Informe o assunto da solicitação.'); valid = false; }
    if (description.value.trim().length < 10) { setFieldError(description, 'Descreva a solicitação com pelo menos 10 caracteres.'); valid = false; }
    const digits = phone.value.replace(/\D/g, '');
    if (phone.value.trim() && (digits.length < 10 || digits.length > 11)) { setFieldError(phone, 'Informe um telefone com DDD ou deixe o campo vazio.'); valid = false; }
    elements.formErrorSummary.classList.toggle('is-hidden', valid);
    if (!valid) {
      elements.formErrorSummary.focus();
      const firstInvalid = $('.invalid input, .invalid textarea', elements.requestForm);
      if (firstInvalid) firstInvalid.focus();
    }
    return valid;
  }

  function handleRequestSubmit(event) {
    event.preventDefault();
    if (!validateRequestForm()) return;
    const maxId = state.requests.reduce((max, item) => Math.max(max, Number(item.id)), 10229);
    const newRequest = {
      id: maxId + 1,
      client: $('#clientName').value.trim(),
      phone: $('#phone').value.trim(),
      subject: $('#subject').value.trim(),
      description: $('#description').value.trim(),
      date: todayIso(),
      status: 'Pendente',
      createdAt: new Date().toISOString()
    };
    state.requests.push(newRequest);
    state.recentId = newRequest.id;
    state.sort = { key: 'id', direction: 'desc' };
    saveRequests();
    location.hash = 'solicitacoes';
    renderRoute('solicitacoes', { success: true });
  }

  function formatPhone(value) {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (!digits) return '';
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`;
    return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
  }

  function openRequestModal(id, mode = 'view') {
    const item = state.requests.find(request => request.id === Number(id));
    if (!item) return;
    state.modalId = item.id;
    state.lastFocused = document.activeElement;
    elements.modalRequestId.textContent = `#${item.id}`;
    elements.modalTitle.textContent = mode === 'edit' ? 'Atualizar solicitação' : 'Detalhes da solicitação';
    elements.modalStatus.value = item.status;
    elements.modalContent.replaceChildren();
    const dl = document.createElement('dl');
    dl.className = 'detail-grid';
    const details = [
      ['Cliente', item.client, false], ['Telefone', item.phone || 'Não informado', false],
      ['Assunto', item.subject, true], ['Descrição', item.description, true],
      ['Data da solicitação', formatDate(item.date), false], ['Status atual', item.status, false]
    ];
    details.forEach(([label, value, wide]) => {
      const div = document.createElement('div');
      div.className = `detail-item${wide ? ' detail-wide' : ''}`;
      const dt = document.createElement('dt'); dt.textContent = label;
      const dd = document.createElement('dd');
      if (label === 'Status atual') dd.append(createStatusBadge(value)); else dd.textContent = value;
      div.append(dt, dd); dl.append(div);
    });
    elements.modalContent.append(dl);
    elements.modalBackdrop.classList.remove('is-hidden');
    document.body.style.overflow = 'hidden';
    setTimeout(() => (mode === 'edit' ? elements.modalStatus : elements.requestModal).focus(), 0);
  }

  function closeModal() {
    elements.modalBackdrop.classList.add('is-hidden');
    document.body.style.overflow = '';
    state.modalId = null;
    if (state.lastFocused && document.contains(state.lastFocused)) state.lastFocused.focus();
  }

  function handleStatusUpdate(event) {
    event.preventDefault();
    const item = state.requests.find(request => request.id === state.modalId);
    if (!item || !ALLOWED_STATUS.includes(elements.modalStatus.value)) return;
    const previous = item.status;
    item.status = elements.modalStatus.value;
    saveRequests();
    closeModal();
    renderRequests();
    showToast('Status atualizado', `Solicitação ${item.id}: ${previous} → ${item.status}.`);
  }

  function showToast(title, message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    const icon = document.createElement('span'); icon.setAttribute('aria-hidden', 'true'); icon.textContent = '✓';
    const copy = document.createElement('p');
    const strong = document.createElement('strong'); strong.textContent = title;
    copy.append(strong, document.createTextNode(message));
    toast.append(icon, copy);
    elements.toastRegion.append(toast);
    setTimeout(() => toast.remove(), 4200);
  }

  function renderClientCards() {
    const clients = new Map();
    state.requests.forEach(item => {
      const current = clients.get(item.client) || { phone: item.phone, count: 0, pending: 0 };
      current.count += 1;
      if (!current.phone && item.phone) current.phone = item.phone;
      if (item.status !== 'Concluído') current.pending += 1;
      clients.set(item.client, current);
    });
    elements.clientCards.replaceChildren();
    [...clients.entries()].sort((a,b) => a[0].localeCompare(b[0], 'pt-BR')).forEach(([name, data]) => {
      const card = document.createElement('article'); card.className = 'summary-card';
      const eyebrow = document.createElement('p'); eyebrow.className = 'eyebrow'; eyebrow.textContent = `${data.count} solicitaç${data.count === 1 ? 'ão' : 'ões'}`;
      const title = document.createElement('h2'); title.textContent = name;
      const copy = document.createElement('p'); copy.textContent = `${data.phone || 'Telefone não informado'} · ${data.pending} em aberto`;
      card.append(eyebrow, title, copy); elements.clientCards.append(card);
    });
  }

  function renderRegisterSummary() {
    const metrics = [
      ['Solicitações', state.requests.length, 'Total de registros no navegador'],
      ['Pendentes', state.requests.filter(item => item.status === 'Pendente').length, 'Demandas que aguardam atendimento'],
      ['Em andamento', state.requests.filter(item => item.status === 'Em andamento').length, 'Demandas em execução'],
      ['Concluídas', state.requests.filter(item => item.status === 'Concluído').length, 'Demandas finalizadas'],
      ['Clientes', new Set(state.requests.map(item => item.client)).size, 'Clientes distintos cadastrados']
    ];
    elements.registerSummary.replaceChildren();
    metrics.forEach(([label, value, description]) => {
      const card = document.createElement('article'); card.className = 'summary-card';
      const metric = document.createElement('span'); metric.className = 'metric'; metric.textContent = String(value);
      const title = document.createElement('h2'); title.textContent = label;
      const copy = document.createElement('p'); copy.textContent = description;
      card.append(metric, title, copy); elements.registerSummary.append(card);
    });
  }

  function route() {
    if (!isAuthenticated()) { showLogin(); return; }
    const requested = location.hash.replace(/^#/, '') || 'solicitacoes';
    const routeName = ['solicitacoes', 'nova-solicitacao', 'clientes', 'cadastros'].includes(requested) ? requested : 'solicitacoes';
    renderRoute(routeName);
  }

  function renderRoute(routeName, options = {}) {
    $$('.page').forEach(page => page.classList.add('is-hidden'));
    const mapping = { solicitacoes: elements.requestsPage, 'nova-solicitacao': elements.formPage, clientes: elements.clientsPage, cadastros: elements.registersPage };
    mapping[routeName].classList.remove('is-hidden');
    $$('.sidebar a[data-route]').forEach(link => link.classList.toggle('active', link.dataset.route === routeName || (routeName === 'nova-solicitacao' && link.dataset.route === 'solicitacoes')));
    const titles = { solicitacoes: 'Solicitações — SGS', 'nova-solicitacao': 'Nova Solicitação — SGS', clientes: 'Clientes — SGS', cadastros: 'Cadastros — SGS' };
    document.title = titles[routeName];
    closeSidebar();
    if (routeName === 'solicitacoes') {
      if (options.success) {
        elements.successDetail.textContent = `Registro nº ${state.recentId} incluído com status Pendente.`;
        elements.successAlert.classList.remove('is-hidden');
        setTimeout(() => elements.successAlert.focus(), 0);
      }
      renderRequests();
    }
    if (routeName === 'nova-solicitacao') prepareRequestForm();
    if (routeName === 'clientes') renderClientCards();
    if (routeName === 'cadastros') renderRegisterSummary();
    $('#conteudo').focus({ preventScroll: true });
  }

  function openSidebar() {
    elements.sidebar.classList.add('open');
    elements.sidebarBackdrop.classList.remove('is-hidden');
    elements.menuButton.setAttribute('aria-expanded', 'true');
  }
  function closeSidebar() {
    elements.sidebar.classList.remove('open');
    elements.sidebarBackdrop.classList.add('is-hidden');
    elements.menuButton.setAttribute('aria-expanded', 'false');
  }

  function bindEvents() {
    elements.loginForm.addEventListener('submit', handleLogin);
    elements.togglePassword.addEventListener('click', () => {
      const show = elements.loginPassword.type === 'password';
      elements.loginPassword.type = show ? 'text' : 'password';
      elements.togglePassword.textContent = show ? 'Ocultar' : 'Mostrar';
      elements.togglePassword.setAttribute('aria-label', show ? 'Ocultar senha' : 'Mostrar senha');
      elements.togglePassword.setAttribute('aria-pressed', String(show));
    });
    elements.newRequestButton.addEventListener('click', showRequestForm);
    elements.cancelRequest.addEventListener('click', () => { location.hash = 'solicitacoes'; });
    elements.requestForm.addEventListener('submit', handleRequestSubmit);
    $$('input, textarea', elements.requestForm).forEach(control => control.addEventListener('input', () => {
      setFieldError(control, '');
      if (!$('.field.invalid', elements.requestForm)) elements.formErrorSummary.classList.add('is-hidden');
    }));
    elements.description.addEventListener('input', () => { elements.descriptionCount.textContent = `${elements.description.value.length}/500`; });
    $('#phone').addEventListener('input', event => { event.target.value = formatPhone(event.target.value); });

    [elements.clientFilter, elements.statusFilter, elements.periodFilter].forEach(control => control.addEventListener('change', () => { state.page = 1; renderRequests(); }));
    elements.searchFilter.addEventListener('input', () => { state.page = 1; renderRequests(); });
    elements.clearFilters.addEventListener('click', clearFilters);
    $$('.sort-button').forEach(button => button.addEventListener('click', () => {
      const key = button.dataset.sort;
      state.sort.direction = state.sort.key === key && state.sort.direction === 'asc' ? 'desc' : 'asc';
      state.sort.key = key;
      state.page = 1;
      renderRequests();
    }));
    elements.closeSuccess.addEventListener('click', () => elements.successAlert.classList.add('is-hidden'));
    elements.notificationButton.addEventListener('click', () => {
      location.hash = 'solicitacoes';
      elements.statusFilter.value = 'Pendente';
      state.page = 1;
      renderRequests();
      showToast('Filtro aplicado', 'Exibindo somente solicitações pendentes.');
    });

    elements.menuButton.addEventListener('click', () => elements.sidebar.classList.contains('open') ? closeSidebar() : openSidebar());
    elements.sidebarBackdrop.addEventListener('click', closeSidebar);
    $$('[data-placeholder]').forEach(button => button.addEventListener('click', () => showToast(`${button.dataset.placeholder} — fora do escopo`, 'Este item é apenas uma referência visual no MVP acadêmico.')));
    elements.userMenuButton.addEventListener('click', () => {
      const open = !elements.userMenu.classList.contains('is-hidden');
      elements.userMenu.classList.toggle('is-hidden', open);
      elements.userMenuButton.setAttribute('aria-expanded', String(!open));
    });
    elements.logoutButton.addEventListener('click', logout);
    document.addEventListener('click', event => {
      if (!event.target.closest('.user-menu-wrap')) {
        elements.userMenu.classList.add('is-hidden');
        elements.userMenuButton.setAttribute('aria-expanded', 'false');
      }
    });

    elements.modalClose.addEventListener('click', closeModal);
    elements.modalBackdrop.addEventListener('mousedown', event => { if (event.target === elements.modalBackdrop) closeModal(); });
    elements.statusForm.addEventListener('submit', handleStatusUpdate);
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        if (!elements.modalBackdrop.classList.contains('is-hidden')) closeModal();
        else closeSidebar();
      }
      if (event.key === 'Tab' && !elements.modalBackdrop.classList.contains('is-hidden')) {
        const focusable = $$('button:not([disabled]), select:not([disabled]), input:not([disabled]), [tabindex="0"]', elements.requestModal);
        if (!focusable.length) return;
        const first = focusable[0]; const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
    window.addEventListener('hashchange', route);
  }

  function init() {
    bindEvents();
    elements.requestDate.value = formatDate(todayIso());
    renderNotificationCount();
    if (isAuthenticated()) showApp(); else showLogin();
  }

  init();
})();
