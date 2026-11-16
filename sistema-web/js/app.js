// ===== MOCK DATA =====
// Membros/visitantes: adicionados manualmente via API (Pessoas). Mocks vazios.
const mockMembers = [];

const mockEvents = [
  { id: 1, name: 'Culto de Domingo', date: '2026-10-04', time: '18:00', location: 'Templo Principal', status: 'upcoming' },
  { id: 2, name: 'Reuniao de Oração', date: '2026-10-07', time: '19:30', location: 'Sala de Oração', status: 'upcoming' },
  { id: 3, name: 'Encontro de Jovens', date: '2026-10-09', time: '20:00', location: 'Auditório', status: 'upcoming' },
  { id: 4, name: 'Retiro Espiritual', date: '2026-10-10', time: '08:00', location: 'Sítio Recanto', status: 'upcoming' },
  { id: 5, name: 'Culto Especial', date: '2026-09-27', time: '19:00', location: 'Templo Principal', status: 'past' },
];

const mockProducts = [
  { id: 1, name: 'Cafe', price: 3.00, category: 'Bebidas', active: true, sold: 42 },
  { id: 2, name: 'Suco Natural', price: 5.00, category: 'Bebidas', active: true, sold: 38 },
  { id: 3, name: 'Pao de Queijo', price: 4.00, category: 'Salgados', active: true, sold: 55 },
  { id: 4, name: 'Coxinha', price: 5.00, category: 'Salgados', active: true, sold: 61 },
  { id: 5, name: 'Bolo de Cenoura', price: 6.00, category: 'Doces', active: true, sold: 24 },
  { id: 6, name: 'Sanduiche', price: 7.00, category: 'Lanches', active: true, sold: 30 },
  { id: 7, name: 'Agua Mineral', price: 2.00, category: 'Bebidas', active: true, sold: 47 },
  { id: 8, name: 'Pastel', price: 6.00, category: 'Salgados', active: true, sold: 36 },
];

const mockAnnouncements = [
  { id: 1, title: 'Retiro Espiritual 2026', text: 'Inscrições abertas para o retiro espiritual de outubro. Vagas limitadas!', date: '2026-09-15', color: '#103B5F', audience: 'App Público & Membros', tone: 'blue', reads: 842, readsPct: 101, author: 'Pr. Thiago Martins' },
  { id: 2, title: 'Nova Serie: Fundamentos da Fe', text: 'Começa na próxima segunda-feira as 19h. Venha participar!', date: '2026-09-18', color: '#16A2AD', audience: 'Apenas Voluntários do Ministério', tone: 'orange', reads: 38, readsPct: 95, author: 'Coord. Camila Pires' },
  { id: 3, title: 'Campanha de Doacoes', text: 'Ajude a reforma do templo. Toda contribuição faz diferença.', date: '2026-09-20', color: '#059669', audience: 'App Público & Cantina', tone: 'green', reads: 412, readsPct: 130, author: 'Equipe Cantina' },
];

// Escalas do proximo culto (confirmacoes por ministerio)
const mockShifts = [
  { ministry: 'Louvor & Adoração', icon: 'music', sector: 'Louvor', confirmed: 8, total: 8 },
  { ministry: 'Mídia & Transmissão', icon: 'video', sector: 'Midia', confirmed: 4, total: 5 },
  { ministry: 'Recepção & Portaria', icon: 'door-open', sector: 'Recepcao', confirmed: 8, total: 8 },
  { ministry: 'Ministério Infantil', icon: 'baby', sector: 'Infantil', confirmed: 4, total: 6 },
];

// Solicitacoes de troca pendentes (hidratadas da API)
const mockTrocas = [];

const mockVisitors = [];

const mockOrders = [
  { id: 142, item: '2x Suco Natural - Sol', price: 24.00, customer: 'Matheus Dias', time: '11:30', status: 'Pronto' },
  { id: 143, item: '1x Café Expresso', price: 6.00, customer: 'Juliana Alves', time: '11:44', status: 'Em Preparo' },
  { id: 141, item: '1x Açaí na Tigela 300ml', price: 18.90, customer: 'Rafael Souza', time: '11:52', status: 'Retirada' },
];

const ORDER_STATUSES = ['Pronto', 'Em Preparo', 'Retirada'];

let currentId = 100;

// ===== USERS, ROLES & PERMISSIONS =====
const USERS = [
  { email: 'admin@batistashallom.com', pass: 'admin123', name: 'Pr. Thiago Martins', role: 'pastor', roleLabel: 'Pastor', initials: 'TM' },
  { email: 'tesoureiro@batistashallom.com', pass: 'admin123', name: 'Ana Ribeiro', role: 'tesoureiro', roleLabel: 'Tesoureira', initials: 'AR' },
  { email: 'lider@batistashallom.com', pass: 'admin123', name: 'Joao Almeida', role: 'lider', roleLabel: 'Lider de Louvor', initials: 'JA' },
];

const ALL_MODULES = ['dashboard', 'pessoas', 'setores', 'escalas', 'agenda', 'avisos', 'app-publico', 'cantina', 'tesouraria', 'relatorios', 'configuracoes'];

// Tesouraria: SOMENTE pastor ou tesoureiro
const ROLE_ACCESS = {
  pastor: [...ALL_MODULES],
  tesoureiro: [...ALL_MODULES],
  lider: ALL_MODULES.filter(m => m !== 'tesouraria'),
  voluntario: ['dashboard', 'escalas', 'agenda', 'avisos', 'app-publico', 'cantina', 'configuracoes'],
};

let currentUser = null;
let cantinaAberta = true;
let eventSearch = '';
let annSearch = '';

function getSessionUser() {
  try {
    const raw = localStorage.getItem('adminUser');
    if (raw) return JSON.parse(raw);
  } catch (e) { }
  if (localStorage.getItem('loggedIn') === 'true') return USERS[0]; // compat: antigo login = pastor
  return null;
}

function canAccess(section) {
  if (!currentUser) return false;
  const allowed = ROLE_ACCESS[currentUser.role] || [];
  return allowed.includes(section);
}

function applyPermissions() {
  document.querySelectorAll('.nav-item').forEach(item => {
    const sec = item.dataset.section;
    item.style.display = canAccess(sec) ? '' : 'none';
  });
  document.querySelectorAll('#novaAcaoMenu .dropdown-item[data-section]').forEach(item => {
    item.style.display = canAccess(item.dataset.section) ? '' : 'none';
  });
  document.querySelectorAll('#novaAcaoMenu .dropdown-item[data-roles]').forEach(item => {
    const roles = (item.dataset.roles || '').split(',');
    item.style.display = roles.includes(currentUser.role) ? '' : 'none';
  });
}

function showUser() {
  if (!currentUser) return;
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('sideUserName', currentUser.name);
  set('sideUserRole', currentUser.roleLabel);
  set('menuName', currentUser.name);
  set('menuRole', currentUser.roleLabel);
  set('menuAvatar', currentUser.initials);
}

// ===== NAVIGATION =====
function navigateTo(section, el) {
  if (!canAccess(section)) {
    showToast('Voce nao tem acesso a este modulo', 'error');
    return;
  }

  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const target = document.getElementById('section-' + section);
  if (!target) return;
  target.classList.add('active');
  // Reinicia a animação de subida do conteúdo
  target.style.animation = 'none';
  void target.offsetHeight;
  target.style.animation = '';

  const navItem = el || document.querySelector(`.nav-item[data-section="${section}"]`);
  if (navItem) {
    navItem.classList.add('active');
    // Animacao de rolagem ate o modulo ativo (quadrado destacado)
    navItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  updateSearchPlaceholder(section);
  closeDropdowns();

  const sidebar = document.getElementById('sidebar');
  if (window.innerWidth <= 768) sidebar.classList.remove('open');

  renderSection(section);
}

function getSectionTitle(section) {
  const titles = {
    dashboard: 'Início / Dashboard',
    pessoas: 'Pessoas & Membros',
    setores: 'Setores & Ministérios',
    escalas: 'Escalas de Serviço',
    agenda: 'Agenda & Cultos',
    avisos: 'Avisos & Comunicados',
    'app-publico': 'App Público',
    cantina: 'Cantina Shallom',
    tesouraria: 'Tesouraria & Dízimos',
    relatorios: 'Relatórios & Métricas',
    configuracoes: 'Configurações',
  };
  return titles[section] || 'Dashboard';
}

function skeletonHTML(type) {
  if (type === 'pessoas') return `
    <div class="skel-wrap">
      <div class="skel-row"><div class="skel skel-title"></div></div>
      <div class="skel-row">
        <div class="skel skel-kpi"></div><div class="skel skel-kpi"></div><div class="skel skel-kpi"></div><div class="skel skel-kpi"></div>
      </div>
      <div class="skel-row"><div class="skel skel-line w40"></div><div class="skel skel-badge"></div></div>
      <div class="skel skel-table"></div>
    </div>`;
  if (type === 'setores') return `
    <div class="skel-wrap">
      <div class="skel-row"><div class="skel skel-title"></div></div>
      <div class="skel-row">
        <div class="skel skel-kpi"></div><div class="skel skel-kpi"></div><div class="skel skel-kpi"></div><div class="skel skel-kpi"></div>
      </div>
      <div class="skel-row">
        <div class="skel skel-card"></div><div class="skel skel-card"></div><div class="skel skel-card"></div>
      </div>
      <div class="skel-row">
        <div class="skel skel-card"></div><div class="skel skel-card"></div><div class="skel skel-card"></div>
      </div>
    </div>`;
  return `
    <div class="skel-wrap">
      <div class="skel-row"><div class="skel skel-title"></div></div>
      <div class="skel-row">
        <div class="skel skel-kpi"></div><div class="skel skel-kpi"></div><div class="skel skel-kpi"></div><div class="skel skel-kpi"></div>
      </div>
      <div class="skel-row">
        <div class="skel skel-panel" style="flex:2"></div><div class="skel skel-panel" style="flex:1"></div>
      </div>
    </div>`;
}

let _renderSectionTimer = null;
let _skeletonActiveFor = null;
const _realSectionHTML = {};
function renderSection(section) {
  const secEl = document.getElementById('section-' + section);
  if (!secEl) { _doRenderSection(section); return; }
  if (_skeletonActiveFor === section) {
    clearTimeout(_renderSectionTimer);
  } else {
    _realSectionHTML[section] = secEl.innerHTML;
  }
  _skeletonActiveFor = section;
  secEl.innerHTML = skeletonHTML(section);
  if (window.lucide) lucide.createIcons();
  _renderSectionTimer = setTimeout(() => {
    _skeletonActiveFor = null;
    secEl.innerHTML = _realSectionHTML[section];
    _doRenderSection(section);
    secEl.style.animation = 'none';
    void secEl.offsetHeight;
    secEl.style.animation = '';
    if (window.lucide) lucide.createIcons();
  }, 450);
}

function refreshSection(section) {
  if (_skeletonActiveFor === section) return;
  _doRenderSection(section);
}

function _doRenderSection(section) {
  switch (section) {
    case 'dashboard': renderDashboard(); break;
    case 'agenda': renderEvents(); break;
    case 'pessoas': renderMembers(); break;
    case 'setores': renderSetores(); break;
    case 'escalas': renderEscalas(); break;
    case 'cantina': renderProducts(); break;
    case 'avisos': renderAnnouncements(); break;
  }
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// ===== SIDEBAR RECOLHIDA =====
function toggleSidebarCollapse() {
  const collapsed = document.body.classList.toggle('sidebar-collapsed');
  localStorage.setItem('adminSidebar', collapsed ? 'collapsed' : 'open');
  syncCollapseBtn();
  // Redesenha graficos apos a animacao de largura
  setTimeout(() => {
    const active = document.querySelector('.page-section.active');
    if (active && active.id === 'section-dashboard') {
      renderSectorChart();
      renderRevenueChart();
    }
  }, 300);
}

function syncCollapseBtn() {
  const btn = document.getElementById('collapseBtn');
  if (!btn) return;
  const collapsed = document.body.classList.contains('sidebar-collapsed');
  btn.innerHTML = collapsed ? '<i data-lucide="chevrons-right"></i>' : '<i data-lucide="chevrons-left"></i>';
  btn.title = collapsed ? 'Expandir menu' : 'Recolher menu';
  if (window.lucide) lucide.createIcons();
}

function initSidebar() {
  if (localStorage.getItem('adminSidebar') === 'collapsed') {
    document.body.classList.add('sidebar-collapsed');
  }
  // Tooltip com o nome do modulo (util quando recolhida)
  document.querySelectorAll('.nav-item').forEach(item => {
    const label = item.querySelector('span');
    if (label) item.title = label.textContent.trim();
  });
  syncCollapseBtn();
}

function logout() {
  localStorage.removeItem('loggedIn');
  localStorage.removeItem('adminUser');
  window.location.href = 'index.html';
}

// ===== DASHBOARD =====
function setText(id, v) {
  const el = document.getElementById(id);
  if (el) el.textContent = v;
}

function refreshIcons() {
  if (window.lucide) lucide.createIcons();
}

function fmtBRL(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function initials(name) {
  return name.split(' ').filter(Boolean).slice(0, 2).map(p => p.charAt(0)).join('').toUpperCase();
}

const MONTHS_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function shortDate(iso) {
  const p = String(iso).split('-');
  return `${p[2]} ${MONTHS_SHORT[parseInt(p[1], 10) - 1] || ''}`;
}

function nextEvent() {
  const today = new Date().toISOString().split('T')[0];
  const up = mockEvents
    .filter(e => e.status === 'upcoming' && e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
  return up[0] || mockEvents.find(e => e.status === 'upcoming') || mockEvents[0];
}

function renderDashboard() {
  renderKpis();
  renderNextCulto();
  renderCultoAlert();
  renderDashAvisos();
  renderVisitors();
  renderOrders();
}

function renderKpis() {
  // Membros nos apps
  const counts = peopleCounts();
  const members = counts.total;
  const novos = counts.novosSemana;
  const growPct = members ? ((novos / members) * 100).toFixed(1).replace('.', ',') : '0,0';
  setText('kpiMembers', members);
  setText('kpiMembersDelta', `+${growPct}%`);
  setText('kpiMembersSub', `+${novos} novos esta semana`);

  // Confirmacao de escalas
  const conf = mockShifts.reduce((a, s) => a + s.confirmed, 0);
  const total = mockShifts.reduce((a, s) => a + s.total, 0);
  const pct = Math.round((conf / total) * 100);
  const ev = nextEvent();
  const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const dia = DIAS[new Date(`${ev.date}T12:00:00`).getDay()] || '';
  setText('kpiShifts', pct + '%');
  setText('kpiShiftsHint', `${dia} ${ev.time.replace(':00', 'h').replace(':', 'h')}`);
  setText('kpiShiftsSub', `${conf} de ${total} confirmados`);
  setText('kpiShiftsPend', mockTrocas.length ? `${mockTrocas.length} troca pendente` : 'Tudo confirmado');
  const pendEl = document.getElementById('kpiShiftsPend');
  if (pendEl) pendEl.style.color = mockTrocas.length ? '#EA580C' : 'var(--success)';
  const bar = document.getElementById('kpiShiftsBar');
  if (bar) bar.style.width = pct + '%';

  // Visitantes (30 dias)
  const pend = mockVisitors.filter(v => !v.contacted).length;
  setText('kpiVisitors', mockVisitors.length);
  setText('kpiVisitorsDelta', pend ? `${pend} a contatar` : 'todos contatados');
  setText('kpiVisitorsFoot', 'Acompanhamento via WhatsApp ativo');

  // Cantina
  const revenue = mockProducts.reduce((a, p) => a + p.price * (p.sold || 0), 0);
  const pedidos = mockProducts.reduce((a, p) => a + (p.sold || 0), 0);
  const inteiro = Math.floor(revenue);
  setText('kpiCantina', `R$ ${inteiro.toLocaleString('pt-BR')}`);
  setText('kpiCantinaCents', `,${String(Math.round((revenue - inteiro) * 100)).padStart(2, '0')}`);
  setText('kpiCantinaFoot', `${pedidos} pedidos no fim da semana`);
  setText('kpiCantinaPill', cantinaAberta ? '100% PIX' : 'Fechada');
  const okEl = document.getElementById('kpiCantinaPill');
  if (okEl) okEl.style.color = cantinaAberta ? 'var(--secondary)' : 'var(--danger)';
}

function renderNextCulto() {
  const ev = nextEvent();
  setText('nextCultoTitle', `Próximo ${ev.name}`);
  setText('nextCultoChip', `${shortDate(ev.date)} · ${ev.time.replace(':', 'h')}`);
  setText('nextCultoSub', 'App de Membros & Escalas · Monitoramento de presença');

  const grid = document.getElementById('squadGrid');
  if (!grid) return;
  grid.innerHTML = mockShifts.map(s => {
    const pending = s.total - s.confirmed;
    const done = pending === 0;
    const members = mockMembers.filter(m => m.sector === s.sector);
    const avatars = members.slice(0, 3).map((m, i) =>
      `<span class="av-${i % 2 ? 'alt' : ''}" title="${m.name}">${initials(m.name)}</span>`
    ).join('');
    const extra = members.length > 3 ? `<span class="av-more">+${members.length - 3}</span>` : '';
    return `
      <div class="squad">
        <div class="squad-top">
          <div class="squad-name"><i data-lucide="${s.icon}"></i>${s.ministry}</div>
          <span class="squad-conf ${done ? 'sc-green' : 'sc-orange'}">${s.confirmed}/${s.total} Confirmados</span>
        </div>
        <div class="squad-bottom">
          <div class="squad-avatars">${avatars}${extra}</div>
          <div class="squad-note ${done ? '' : 'sc-orange'}">${done ? 'Equipe 100% pronta.' : `${pending} Pendente${pending > 1 ? 's' : ''}`}</div>
        </div>
      </div>`;
  }).join('');
  refreshIcons();
}

function renderCultoAlert() {
  const card = document.getElementById('cultoAlert');
  if (!card) return;
  const ev = nextEvent();
  const pending = mockShifts.filter(s => s.total > s.confirmed);
  if (!pending.length && !mockTrocas.length) {
    card.style.display = 'none';
    return;
  }
  card.style.display = '';

  const partes = [];
  if (mockTrocas.length) {
    const t = mockTrocas[0];
    partes.push(`<strong>${t.person}</strong> solicitou troca de escala (${t.shift}).`);
  }
  const n = pending.reduce((a, s) => a + (s.total - s.confirmed), 0);
  if (n > 0) {
    const h = Math.max(...pending.map(s => s.hours || 48));
    const prefixo = partes.length ? 'Além disso, ' : '';
    partes.push(`${prefixo}<strong>${n} pessoa(s)</strong> da escala de ${ev.name} não confirmaram há mais de ${h}h.`);
  }
  if (!partes.length) {
    card.style.display = 'none';
    return;
  }
  setText('alertTitle', 'Ação Necessária: Solicitação de Troca & Pendências');
  const body = document.getElementById('alertText');
  if (body) body.innerHTML = partes.join(' ');
}

function sendShiftReminder() {
  const n = mockShifts.reduce((a, s) => a + (s.total - s.confirmed), 0);
  showToast(`Lembrete enviado para ${n} voluntário(s) via Push e WhatsApp`, 'success');
}

function renderDashAvisos() {
  const body = document.getElementById('dashAvisosBody');
  if (!body) return;
  body.innerHTML = mockAnnouncements.map(a => `
    <tr>
      <td>
        <div class="avisos-title">
          <span class="avisos-ico" style="background:${a.color}1A;color:${a.color}"><i data-lucide="megaphone"></i></span>
          <div>
            <div class="avisos-name">${a.title}</div>
          </div>
        </div>
      </td>
      <td><span class="pill pill-${a.tone || 'blue'}">${a.audience || 'Todos'}</span></td>
      <td><strong>${a.reads || 0} leituras</strong> <span class="reads-pct">(${a.readsPct || 100}%)</span></td>
      <td>${a.author || '-'}</td>
      <td>
        <button class="btn-icon" onclick="editAnnouncement(${a.id})" title="Editar comunicado">
          <i data-lucide="more-vertical"></i>
        </button>
      </td>
    </tr>
  `).join('');
  refreshIcons();
}

function renderVisitors() {
  const list = document.getElementById('visitorsList');
  if (!list) return;
  setText('visitorsCount', `${mockVisitors.length} cadastrados`);
  list.innerHTML = mockVisitors.map(v => `
    <div class="visitor">
      <div class="visitor-row">
        <div class="visitor-av">${initials(v.name)}</div>
        <div class="visitor-info">
          <div class="visitor-name">${v.name}</div>
          <div class="visitor-sub">${v.phone || `${v.time} · ${v.source}`}</div>
        </div>
        <span class="pill pill-outline"><i data-lucide="${v.icon || 'heart'}"></i>${v.tag}</span>
      </div>
      <button class="visitor-btn ${v.contacted ? 'done' : ''}" onclick="toggleVisitor(${v.id})" title="${v.contacted ? 'Desfazer' : 'Marcar como acolhido'}">
        <i data-lucide="${v.contacted ? 'check' : 'message-circle'}"></i>
        ${v.contacted ? 'Acolhido' : 'Iniciar Acolhimento WhatsApp'}
      </button>
    </div>
  `).join('');
  refreshIcons();
}

function toggleVisitor(id) {
  const v = mockVisitors.find(x => x.id === id);
  if (!v) return;
  v.contacted = !v.contacted;
  renderVisitors();
  renderKpis();
  showToast(v.contacted ? `${v.name} marcado como acolhido` : `${v.name} voltou para a fila de contato`, v.contacted ? 'success' : 'warning');
}

function renderOrders() {
  const list = document.getElementById('ordersList');
  if (!list) return;
  list.innerHTML = mockOrders.map(o => `
    <div class="order">
      <div class="order-main">
        <div class="order-line">
          <span class="order-id">#${o.id}</span>
          <span class="order-name">${o.item}</span>
        </div>
        <div class="order-sub">${o.customer} · ${fmtBRL(o.price)} (PIX)</div>
      </div>
      <button class="pill status-btn pill-${orderTone(o.status)}" onclick="advanceOrder(${o.id})" title="Clique para avançar o status">${o.status}</button>
    </div>
  `).join('');
}

function orderTone(status) {
  if (status === 'Pronto') return 'green';
  if (status === 'Em Preparo') return 'orange';
  return 'outline';
}

function advanceOrder(id) {
  const o = mockOrders.find(x => x.id === id);
  if (!o) return;
  const i = ORDER_STATUSES.indexOf(o.status);
  o.status = ORDER_STATUSES[(i + 1) % ORDER_STATUSES.length];
  renderOrders();
}

function exportWeeklyReport() {
  const rows = [];
  rows.push(['Resumo Semanal - Igreja Shallom']);
  rows.push([]);
  rows.push(['Membros']);
  rows.push(['Nome', 'Email', 'Telefone', 'Setor', 'Função']);
  mockMembers.forEach(m => rows.push([m.name, m.email, m.phone, m.sector, m.role]));
  rows.push([]);
  rows.push(['Eventos']);
  rows.push(['Nome', 'Data', 'Hora', 'Local', 'Status']);
  mockEvents.forEach(e => rows.push([e.name, e.date, e.time, e.location, e.status]));
  rows.push([]);
  rows.push(['Escalas - Próximo Culto']);
  rows.push(['Ministério', 'Confirmados', 'Total']);
  mockShifts.forEach(s => rows.push([s.ministry, s.confirmed, s.total]));
  rows.push([]);
  rows.push(['Cantina']);
  rows.push(['Produto', 'Preco', 'Vendidos', 'Total']);
  mockProducts.forEach(p => rows.push([p.name, p.price.toFixed(2), p.sold || 0, (p.price * (p.sold || 0)).toFixed(2)]));
  rows.push([]);
  rows.push(['Comunicados']);
  rows.push(['Título', 'Público', 'Leituras', 'Autor']);
  mockAnnouncements.forEach(a => rows.push([a.title, a.audience || '', a.reads || 0, a.author || '']));

  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'resumo-semanal-igreja-shallom.csv';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast('Resumo semanal exportado (CSV)', 'success');
}

function themeColor(varName, fallback) {
  const v = getComputedStyle(document.body).getPropertyValue(varName).trim();
  return v || fallback;
}

function renderSectorChart() {
  const canvas = document.getElementById('sectorChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.parentElement.clientWidth - 48;
  canvas.height = 220;

  const sectors = ['Louvor', 'Midia', 'Recepcao', 'Infantil', 'Intercessao'];
  const values = sectors.map(s => mockMembers.filter(m => m.sector === s).length);
  const colors = [themeColor('--primary', '#103B5F'), themeColor('--secondary', '#16A2AD'), '#059669', '#D97706', '#DC2626'];
  const gridColor = themeColor('--border', '#E8EDF3');
  const labelColor = themeColor('--muted', '#777587');
  const valueColor = themeColor('--text', '#141B2B');
  const maxVal = Math.max(...values, 1);
  const barWidth = Math.floor((canvas.width - 40) / sectors.length) - 16;
  const startX = 40;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Grid lines
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = 20 + ((canvas.height - 50) / 4) * i;
    ctx.beginPath();
    ctx.moveTo(40, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  sectors.forEach((sector, i) => {
    const x = startX + i * (barWidth + 16);
    const barH = (values[i] / maxVal) * (canvas.height - 60);
    const y = canvas.height - 30 - barH;

    ctx.fillStyle = colors[i];
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, barH, 4);
    ctx.fill();

    // Value on top
    ctx.fillStyle = valueColor;
    ctx.font = '500 12px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(values[i], x + barWidth / 2, y - 6);

    // Label
    ctx.fillStyle = labelColor;
    ctx.font = '400 11px Inter';
    ctx.fillText(sector, x + barWidth / 2, canvas.height - 10);
  });
}

function renderRevenueChart() {
  const canvas = document.getElementById('revenueChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.parentElement.clientWidth - 48;
  canvas.height = 220;

  const primary = themeColor('--primary', '#103B5F');
  const gridColor = themeColor('--border', '#E8EDF3');
  const labelColor = themeColor('--muted', '#777587');
  const valueColor = themeColor('--text', '#141B2B');
  const pr = parseInt(primary.slice(1, 3), 16), pg = parseInt(primary.slice(3, 5), 16), pb = parseInt(primary.slice(5, 7), 16);

  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
  const values = [1200, 1800, 1500, 2200, 1900, 2400];
  const maxVal = Math.max(...values);
  const startX = 50;
  const endX = canvas.width - 20;
  const stepX = (endX - startX) / (months.length - 1);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Grid
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = 20 + ((canvas.height - 50) / 4) * i;
    ctx.beginPath();
    ctx.moveTo(startX, y);
    ctx.lineTo(endX, y);
    ctx.stroke();
  }

  // Area fill
  ctx.beginPath();
  values.forEach((v, i) => {
    const x = startX + i * stepX;
    const y = canvas.height - 30 - (v / maxVal) * (canvas.height - 60);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.lineTo(startX + (months.length - 1) * stepX, canvas.height - 30);
  ctx.lineTo(startX, canvas.height - 30);
  ctx.closePath();
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, `rgba(${pr},${pg},${pb},0.15)`);
  gradient.addColorStop(1, `rgba(${pr},${pg},${pb},0)`);
  ctx.fillStyle = gradient;
  ctx.fill();

  // Line
  ctx.beginPath();
  values.forEach((v, i) => {
    const x = startX + i * stepX;
    const y = canvas.height - 30 - (v / maxVal) * (canvas.height - 60);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = primary;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Points and labels
  values.forEach((v, i) => {
    const x = startX + i * stepX;
    const y = canvas.height - 30 - (v / maxVal) * (canvas.height - 60);

    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = primary;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();

    ctx.fillStyle = labelColor;
    ctx.font = '400 11px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(months[i], x, canvas.height - 10);

    ctx.fillStyle = valueColor;
    ctx.font = '500 11px Inter';
    ctx.fillText('R$' + v, x, y - 10);
  });
}

// ===== EVENTS =====
function renderEvents() {
  const tbody = document.getElementById('eventsTableBody');
  const q = (eventSearch || '').toLowerCase();
  const filtered = mockEvents.filter(e => !q || e.name.toLowerCase().includes(q) || e.location.toLowerCase().includes(q));
  tbody.innerHTML = filtered.map(e => `
    <tr>
      <td style="font-weight:500">${e.name}</td>
      <td>${formatDate(e.date)}</td>
      <td>${e.time}</td>
      <td>${e.location}</td>
      <td><span class="badge ${e.status === 'upcoming' ? 'badge-success' : 'badge-warning'}">${e.status === 'upcoming' ? 'Proximo' : 'Realizado'}</span></td>
      <td class="table-actions">
        <button class="btn-icon" onclick="editEvent(${e.id})" title="Editar"><span class="material-symbols-outlined" style="font-size:18px">edit</span></button>
        <button class="btn-icon" onclick="deleteEvent(${e.id})" title="Excluir"><span class="material-symbols-outlined" style="font-size:18px;color:#DC2626">delete</span></button>
      </td>
    </tr>
  `).join('');

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><span class="material-symbols-outlined">search_off</span><p>Nenhum evento encontrado</p></div></td></tr>';
  }
}

function openEventModal(id) {
  const event = id ? mockEvents.find(e => e.id === id) : null;
  document.getElementById('modalTitle').textContent = event ? 'Editar Evento' : 'Novo Evento';
  document.getElementById('modalBody').innerHTML = `
    <div class="form-group">
      <label>Nome do Evento</label>
      <input type="text" id="eventName" value="${event ? event.name : ''}" placeholder="Ex: Culto de Domingo">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Data</label>
        <input type="date" id="eventDate" value="${event ? event.date : ''}">
      </div>
      <div class="form-group">
        <label>Horario</label>
        <input type="time" id="eventTime" value="${event ? event.time : ''}">
      </div>
    </div>
    <div class="form-group">
      <label>Local</label>
      <input type="text" id="eventLocation" value="${event ? event.location : ''}" placeholder="Ex: Templo Principal">
    </div>
    <div class="form-group">
      <label>Status</label>
      <select id="eventStatus">
        <option value="upcoming" ${event && event.status === 'upcoming' ? 'selected' : ''}>Proximo</option>
        <option value="past" ${event && event.status === 'past' ? 'selected' : ''}>Realizado</option>
      </select>
    </div>
    <div class="modal-footer" style="padding:16px 0 0;border-top:1px solid #F3F4F6;margin-top:8px">
      <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn-primary" onclick="saveEvent(${id || 'null'})">
        <span class="material-symbols-outlined" style="font-size:18px">save</span> Salvar
      </button>
    </div>
  `;
  openModal();
}

function editEvent(id) { openEventModal(id); }

function saveEvent(id) {
  const name = document.getElementById('eventName').value.trim();
  const date = document.getElementById('eventDate').value;
  const time = document.getElementById('eventTime').value;
  const location = document.getElementById('eventLocation').value.trim();
  const status = document.getElementById('eventStatus').value;

  if (!name || !date || !time || !location) { showToast('Preencha todos os campos', 'error'); return; }

  if (id) {
    const ev = mockEvents.find(e => e.id === id);
    Object.assign(ev, { name, date, time, location, status });
    showToast('Evento atualizado com sucesso!');
  } else {
    mockEvents.push({ id: ++currentId, name, date, time, location, status });
    showToast('Evento criado com sucesso!');
  }
  closeModal();
  renderEvents();
}

function deleteEvent(id) {
  const ev = mockEvents.find(e => e.id === id);
  document.getElementById('modalTitle').textContent = 'Excluir Evento';
  document.getElementById('modalBody').innerHTML = `
    <p style="margin-bottom:20px;color:#464555">Tem certeza que deseja excluir o evento <strong>${ev.name}</strong>?</p>
    <div class="modal-footer" style="padding:16px 0 0;border-top:1px solid #F3F4F6;margin-top:8px">
      <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn-danger" onclick="confirmDeleteEvent(${id})">
        <span class="material-symbols-outlined" style="font-size:18px">delete</span> Excluir
      </button>
    </div>
  `;
  openModal();
}

function confirmDeleteEvent(id) {
  const idx = mockEvents.findIndex(e => e.id === id);
  if (idx > -1) mockEvents.splice(idx, 1);
  closeModal();
  renderEvents();
  showToast('Evento excluido');
}

// ===== PESSOAS & MEMBROS =====
let peopleTab = 'todos';
let peopleSort = 'recentes';
let peoplePage = 1;
let selectedMemberId = 8;
const PEOPLE_PAGE_SIZE = 5;

function memberStatusInfo(m) {
  if (m.pastoral) return { label: 'Corpo Pastoral', cls: 'pill-blue' };
  if (m.status === 'integracao') return { label: 'Em Integração', cls: 'pill-orange' };
  if (m.status === 'inativo') return { label: 'Inativo', cls: 'pill-red' };
  return { label: m.gender === 'f' ? 'Ativa' : 'Ativo', cls: 'pill-green' };
}

function peopleCounts() {
  const n = pred => mockMembers.filter(pred).length;
  const total = mockMembers.length;
  const week = '2026-09-24';
  return {
    total,
    ativos: n(m => m.status === 'ativo'),
    integracao: n(m => m.status === 'integracao'),
    voluntarios: n(m => m.voluntario),
    lideres: n(m => m.lider),
    inativos: n(m => m.status === 'inativo'),
    login: n(m => m.login),
    batizados: n(m => m.baptism && m.baptism !== '—'),
    novosSemana: n(m => String(m.joined || '') >= week),
    pct: v => Math.round((v / (total || 1)) * 100),
  };
}

function renderPeopleKpis() {
  const c = peopleCounts();
  const escalados = mockShifts.reduce((s, x) => s + (x.confirmed || 0), 0);
  const visit = mockVisitors.length;
  const contatados = mockVisitors.filter(v => v.contacted).length;
  setText('pKpiTotal', c.total);
  setText('pKpiTotalDelta', c.novosSemana ? `+${c.novosSemana} esta semana` : 'estável');
  setText('pKpiLogin', `${c.pct(c.login)}% com login`);
  setText('pKpiIntegr', c.integracao);
  const bar = document.getElementById('pKpiBatBar');
  if (bar) bar.style.width = c.pct(c.batizados) + '%';
  setText('pKpiBatizados', `${c.batizados} de ${c.total}`);
  setText('pKpiVol', c.voluntarios);
  setText('pKpiVolPct', `${c.pct(c.voluntarios)}% da igreja`);
  setText('pKpiEscalados', `${escalados} confirmados`);
  setText('pKpiVis', visit);
  setText('pKpiVisPill', `${contatados} contatados`);
  setText('pKpiContact', visit ? `${Math.round((contatados / visit) * 100)}%` : '—');
}

function renderPeopleTabs() {
  const c = peopleCounts();
  setText('tabTodos', c.total);
  setText('tabAtivos', c.ativos);
  setText('tabIntegr', c.integracao);
  setText('tabVol', c.voluntarios);
  setText('tabLideres', c.lideres);
  setText('tabInativos', c.inativos);
  document.querySelectorAll('#peopleTabs .ptab').forEach(b => b.classList.toggle('active', b.dataset.tab === peopleTab));
}

function setPeopleTab(tab) {
  peopleTab = tab;
  peoplePage = 1;
  renderPeople();
}

function setPeopleSort(v) {
  peopleSort = v;
  peoplePage = 1;
  renderPeople();
}

function toggleAdvFilters() {
  const el = document.getElementById('advFilters');
  if (el) el.classList.toggle('open');
}

function setPeoplePage(p) {
  peoplePage = p;
  renderPeopleTable();
  refreshIcons();
}

function toggleCheckAll(checked) {
  document.querySelectorAll('#membersTableBody .pcheck').forEach(cb => { cb.checked = checked; });
}

function filterPeople() {
  const q = (document.getElementById('memberSearch') ? document.getElementById('memberSearch').value : '').toLowerCase().trim();
  const sector = document.getElementById('sectorFilter') ? document.getElementById('sectorFilter').value : '';
  const statusF = document.getElementById('statusFilter') ? document.getElementById('statusFilter').value : '';
  const list = mockMembers.filter(m => {
    let ok = true;
    if (peopleTab === 'ativos') ok = m.status === 'ativo';
    else if (peopleTab === 'integracao') ok = m.status === 'integracao';
    else if (peopleTab === 'voluntarios') ok = !!m.voluntario;
    else if (peopleTab === 'lideres') ok = !!m.lider;
    else if (peopleTab === 'inativos') ok = m.status === 'inativo';
    if (!ok) return false;
    if (sector && m.sector !== sector) return false;
    if (statusF && (m.status || 'ativo') !== statusF) return false;
    if (q) {
      const hay = [m.name, m.email, m.phone, m.sector, m.role, (m.tags || []).join(' '), (m.cell && m.cell.name) || ''].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  if (peopleSort === 'nome') list.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  else if (peopleSort === 'assiduidade') list.sort((a, b) => (b.attendance || 0) - (a.attendance || 0));
  else list.sort((a, b) => String(b.joined || '').localeCompare(String(a.joined || '')));
  return list;
}

function renderPeople() {
  renderPeopleKpis();
  renderPeopleTabs();
  renderPeopleTable();
  renderMemberProfile();
  refreshIcons();
}

function renderPeopleTable() {
  const list = filterPeople();
  const total = list.length;
  const pages = Math.max(1, Math.ceil(total / PEOPLE_PAGE_SIZE));
  if (peoplePage > pages) peoplePage = pages;
  const start = (peoplePage - 1) * PEOPLE_PAGE_SIZE;
  const rows = list.slice(start, start + PEOPLE_PAGE_SIZE);
  const tbody = document.getElementById('membersTableBody');
  if (!tbody) return;

  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><span class="material-symbols-outlined">search_off</span><p>Nenhum membro encontrado</p></div></td></tr>';
  } else {
    tbody.innerHTML = rows.map(m => {
      const st = memberStatusInfo(m);
      const ativo = m.status === 'ativo';
      const att = m.attendance || 0;
      const attCls = att >= 85 ? 'att-hi' : att >= 60 ? 'att-md' : 'att-lo';
      const tags = (m.tags && m.tags.length ? m.tags : [m.sector]).map((t, i) =>
        `<span class="mtag ${i ? 'mtag-2' : ''}">${t}</span>`).join('');
      const sel = m.id === selectedMemberId;
      return `
        <tr class="prow ${sel ? 'selected' : ''}" onclick="selectMember('${m.id}')">
          <td class="col-check" onclick="event.stopPropagation()">
            <input type="checkbox" class="pcheck" ${sel ? 'checked' : ''} onchange="selectMember('${m.id}')">
          </td>
          <td>
            <div class="pmember">
              <span class="pm-av">${initials(m.name)}${ativo ? '<span class="pm-dot"></span>' : ''}</span>
              <div>
                <div class="pm-name">${m.name}${m.lider ? ' <span class="lider-tag">Líder</span>' : ''}</div>
                <div class="pm-sub">${m.email} · ${m.phone}</div>
              </div>
            </div>
          </td>
          <td><span class="pill ${st.cls}">${st.label}</span></td>
          <td><div class="mtags">${tags}</div></td>
          <td>
            <div class="cell-name">${(m.cell && m.cell.name) || 'Sem célula'}</div>
            <div class="cell-sub">${(m.cell && m.cell.leader) || '—'}</div>
          </td>
          <td><span class="att ${attCls}"><i data-lucide="trending-up"></i>${att}%</span></td>
          <td class="pactions" onclick="event.stopPropagation()">
            <button class="btn-icon" onclick="selectMember('${m.id}')" title="Ver ficha"><i data-lucide="eye"></i></button>
            <button class="btn-icon" onclick="editMember('${m.id}')" title="Editar"><i data-lucide="more-vertical"></i></button>
          </td>
        </tr>`;
    }).join('');
  }

  setText('peopleInfo', total
    ? `Mostrando ${start + 1} a ${Math.min(start + PEOPLE_PAGE_SIZE, total)} de ${total} membros registrados`
    : 'Nenhum membro registrado com esses filtros');

  const pager = document.getElementById('peoplePagination');
  if (pager) {
    let html = `<button ${peoplePage === 1 ? 'disabled' : ''} onclick="setPeoplePage(${peoplePage - 1})" title="Página anterior">&#8249;</button>`;
    for (let i = 1; i <= pages; i++) html += `<button class="${i === peoplePage ? 'active' : ''}" onclick="setPeoplePage(${i})">${i}</button>`;
    html += `<button ${peoplePage === pages ? 'disabled' : ''} onclick="setPeoplePage(${peoplePage + 1})" title="Próxima página">&#8250;</button>`;
    pager.innerHTML = html;
  }
}

function selectMember(id) {
  selectedMemberId = id;
  renderPeopleTable();
  renderMemberProfile();
  refreshIcons();
}

function memberTimeline(m) {
  const items = [];
  const ministry = (m.tags && m.tags[0]) || m.sector;
  if (m.voluntario) items.push({ tone: 'green', title: 'Escalado no Culto Domingo Noite', sub: `Ministério: ${ministry} · Equipe das 18h`, meta: 'Há 2 dias · 100% Confirmado', metaCls: '' });
  const attOk = (m.attendance || 0) >= 80;
  items.push({ tone: attOk ? 'green' : 'amber', title: 'Presença no Ensaio Geral', sub: `Ministério: ${ministry} · Ensaio de quarta`, meta: `Há 3 dias · ${attOk ? 'Presente' : 'Ausente'}`, metaCls: attOk ? '' : 'm-amber' });
  items.push({ tone: 'blue', title: 'Inscrição na Conferência Shallom 2026', sub: 'Rede de Membros · Inscrição #4892-A', meta: 'Há 12 dias', metaCls: 'm-blue' });
  return items;
}

function renderMemberProfile() {
  const box = document.getElementById('memberProfile');
  if (!box) return;
  const m = mockMembers.find(x => x.id === selectedMemberId) || filterPeople()[0];
  if (!m) {
    box.innerHTML = '<div class="pf-empty"><p>Nenhum membro selecionado.</p></div>';
    return;
  }
  selectedMemberId = m.id;
  const st = memberStatusInfo(m);
  const att = m.attendance || 0;
  const attCls = att >= 85 ? 'att-hi' : att >= 60 ? 'att-md' : 'att-lo';
  const statusLine = m.pastoral ? 'Membro Pastoral Cadastrado'
    : m.status === 'integracao' ? 'Em processo de integração'
      : m.status === 'inativo' ? 'Cadastro inativo / afastado'
        : `Membro ${m.gender === 'f' ? 'Ativa' : 'Ativo'} Cadastrado`;
  const statusColor = st.cls === 'pill-green' ? 'var(--success)'
    : st.cls === 'pill-orange' ? 'var(--warning)'
      : st.cls === 'pill-red' ? 'var(--danger)' : 'var(--primary)';
  const tl = memberTimeline(m).map(t => `
    <div class="tl-item tl-${t.tone}">
      <div class="tl-title">${t.title}</div>
      <div class="tl-sub">${t.sub}</div>
      <div class="tl-meta ${t.metaCls}">${t.meta}</div>
    </div>`).join('');

  box.innerHTML = `
    <div class="pf-top">
      <span class="pf-status" style="color:${statusColor}">
        <span class="dot" style="background:currentColor"></span> ${statusLine}
      </span>
      <span class="pf-actions">
        <button class="btn-icon" onclick="shareProfile('${m.id}')" title="Compartilhar ficha"><i data-lucide="share-2"></i></button>
        <button class="btn-icon" onclick="editMember('${m.id}')" title="Configurações do cadastro"><i data-lucide="settings"></i></button>
      </span>
    </div>
    <div class="pf-body">
      <div class="pf-id">
        <span class="pf-av">${initials(m.name)}</span>
        <div class="pf-name">${m.name}${m.lider ? ' <span class="lider-tag">Líder</span>' : ''}</div>
        <div class="pf-role">${m.role} · ${m.sector}</div>
      </div>
      <div class="pf-btns">
        <a class="pf-btn wa" href="https://wa.me/55${String(m.phone).replace(/\D/g, '')}" target="_blank" rel="noopener"><i data-lucide="message-circle"></i> WhatsApp Direto</a>
        <a class="pf-btn" href="mailto:${m.email}"><i data-lucide="mail"></i> E-mail</a>
      </div>
      <div class="pf-info">
        <div>
          <div class="pf-info-label">Batismo</div>
          <div class="pf-info-val">${m.baptism || '—'}</div>
        </div>
        <div>
          <div class="pf-info-label">Tempo de Igreja</div>
          <div class="pf-info-val">${m.churchTime || '—'}</div>
        </div>
        <div>
          <div class="pf-info-label">Célula</div>
          <div class="pf-info-val">${(m.cell && m.cell.name) || 'Sem célula'}</div>
        </div>
        <div>
          <div class="pf-info-label">Assiduidade</div>
          <div class="pf-info-val att ${attCls}" style="display:flex;gap:6px;align-items:center"><i data-lucide="trending-up"></i>${att}% (Ata)</div>
        </div>
      </div>
      <div class="pf-section-title">Linha do Tempo Pastoral <span>Últimos 30 dias</span></div>
      <div class="tl">${tl}</div>
      <div class="pf-note">
        <div class="pf-note-head">
          <span class="pf-note-title">Notas Pastorais Confidenciais</span>
          <span class="pf-note-badge">Reservado à Liderança</span>
        </div>
        <p>"${m.note || 'Sem anotações pastoral registradas para este membro.'}"</p>
        <div class="pf-note-foot"><span>Anotado por Pr. Thiago</span><span>Atualizado em 01/10/2026</span></div>
      </div>
      <button class="btn-primary pf-edit" onclick="editMember('${m.id}')"><i data-lucide="pencil"></i> Editar Ficha Cadastral</button>
      <button class="pf-remove" onclick="deleteMember('${m.id}')">Remover cadastro?</button>
    </div>`;
}

function shareProfile(id) {
  const m = mockMembers.find(x => x.id === id);
  const url = window.location.href.split('#')[0] + '#membro-' + id;
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).catch(() => { });
  showToast(`Link da ficha de ${m ? m.name : 'membro'} copiado`);
}

function exportPeopleCSV() {
  const list = filterPeople();
  const lines = ['Nome,Email,Telefone,Setor,Cargo,Status,Assiduidade,Celula'];
  list.forEach(m => {
    const st = memberStatusInfo(m);
    lines.push([m.name, m.email, m.phone, m.sector, m.role, st.label, (m.attendance || 0) + '%', (m.cell && m.cell.name) || '']
      .map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
  });
  const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'membros-igreja-shallom.csv';
  a.click();
  URL.revokeObjectURL(a.href);
  showToast(`CSV exportado com ${list.length} membros`);
}

function filterMembers() { peoplePage = 1; renderPeople(); }

function renderMembers() { renderPeople(); }

// ===== SETORES & MINISTÉRIOS =====
const mockDepartments = [
  { id: 1, name: 'Louvor & Adoração', icon: 'music', group: 'cultos', sub: 'Ministério de Louvor', leader: 'Pr. Thiago Martins & Sabrine', volunteers: 24, capacity: 32, schedule: 'Dom 09h & 18h', highlight: 'Ensaio geral quarta 20h', readiness: 100, status: 'Pronto', tone: 'green', live: false },
  { id: 2, name: 'Mídia & Transmissão', icon: 'video', group: 'cultos', sub: 'Áudio, câmera e streaming', leader: 'Lucas Silveira', volunteers: 16, capacity: 20, schedule: 'Dom 17h às 20h', highlight: '1 operador pendente para noite', readiness: 70, status: 'Atenção (1 operador pendente)', tone: 'orange', live: false },
  { id: 3, name: 'Ministério Infantil', icon: 'baby', group: 'pastoral', sub: 'Berçário & Kids', leader: 'Pedro Costa', volunteers: 38, capacity: 40, schedule: 'Dom 09h & 18h', highlight: 'Turmas completas neste domingo', readiness: 45, status: '2 vagas abertas', tone: 'red', live: false },
  { id: 4, name: 'Recepção & Boas-Vindas', icon: 'door-open', group: 'cultos', sub: 'Portaria e acolhimento', leader: 'Camila Duarte', volunteers: 28, capacity: 30, schedule: 'Dom 08h30 & 17h30', highlight: 'Equipe 100% confirmada', readiness: 100, status: 'Pronto', tone: 'green', live: false },
  { id: 5, name: 'Cantina Shallom', icon: 'sandwich', group: 'operacoes', sub: 'Alimentação & Campanhas', leader: 'Clara Souza', volunteers: 18, capacity: 20, schedule: 'Após cada culto', highlight: 'Aberta e operando', readiness: 100, status: 'Aberta e operando', tone: 'green', live: true },
  { id: 6, name: 'Ação Social', icon: 'heart-handshake', group: 'pastoral', sub: 'Diaconato & Assistência', leader: 'Diác. Roberto Alves', volunteers: 22, capacity: 28, schedule: 'Sáb 10h', highlight: 'Visitas agendadas', readiness: 85, status: 'Bom', tone: 'green', live: false },
  { id: 7, name: 'Intercessão', icon: 'flame', group: 'pastoral', sub: 'Oração & Vigílias', leader: 'Lucia Ferreira', volunteers: 30, capacity: 30, schedule: 'Qua & Sex 22h', highlight: 'Vigília sexta confirmada', readiness: 100, status: 'Pronto', tone: 'green', live: false },
  { id: 8, name: 'Escola Bíblica', icon: 'book-open', group: 'pastoral', sub: 'Ensino & Discipulado', leader: 'Pr. Marcos Vinícius', volunteers: 15, capacity: 20, schedule: 'Ter 19h30', highlight: 'Nova turma iniciando', readiness: 80, status: 'Bom', tone: 'green', live: false },
  { id: 9, name: 'Ministério Jovem', icon: 'globe', group: 'pastoral', sub: 'Teen & Universitários', leader: 'Rafael Costa', volunteers: 14, capacity: 22, schedule: 'Sex 20h', highlight: 'Aguardando 1 monitor', readiness: 65, status: 'Atenção (vagas em aberto)', tone: 'orange', live: false },
  { id: 10, name: 'Adoração & Dança', icon: 'activity', group: 'cultos', sub: 'Ballet & Adoração', leader: 'Sabrine Lopes', volunteers: 18, capacity: 24, schedule: 'Dom 18h', highlight: 'Ensaio sábado 15h', readiness: 90, status: 'Pronto', tone: 'green', live: false },
  { id: 11, name: 'Tesouraria', icon: 'shield-check', group: 'operacoes', sub: 'Finanças & Dízimos', leader: 'Ana Ribeiro', volunteers: 8, capacity: 10, schedule: 'Seg a Sex', highlight: 'Conciliação semanal ok', readiness: 100, status: 'Pronto', tone: 'green', live: false },
  { id: 12, name: 'Eventos & Comunicação', icon: 'calendar-check', group: 'operacoes', sub: 'Produção & Redes', leader: 'Camila Duarte', volunteers: 12, capacity: 18, schedule: 'Variável', highlight: 'Retiro espiritual em produção', readiness: 75, status: 'Atenção (produção ativa)', tone: 'orange', live: false },
];

const mockSobrecarga = [
  { name: 'Lucas Camargo', role: 'Mídia & Transmissão', shifts: 6, limit: 4, tone: 'red' },
  { name: 'Mariana Alves', role: 'Ministério Infantil', shifts: 5, limit: 4, tone: 'orange' },
  { name: 'Rodrigo Pinho', role: 'Louvor & Adoração', shifts: 5, limit: 4, tone: 'orange' },
];

let deptTab = 'todos';

function deptToneClass(tone) {
  return tone === 'green' ? 'pill-green' : tone === 'orange' ? 'pill-orange' : tone === 'red' ? 'pill-red' : '';
}

function renderSetorKpis() {
  const total = mockDepartments.length;
  const active = mockDepartments.filter(d => d.readiness >= 40).length;
  const vol = mockDepartments.reduce((s, d) => s + d.volunteers, 0);
  const capacity = mockDepartments.reduce((s, d) => s + d.capacity, 0);
  const cobertura = Math.round((vol / capacity) * 100);
  const lider = mockDepartments.length * 2 + 4;

  setText('sKpiTotal', total);
  setText('sKpiTotalPct', '100% ativos');
  document.getElementById('sKpiTotalBar').style.width = '100%';
  setText('sKpiAtivos', `${active} em operação`);

  setText('sKpiVol', vol);
  setText('sKpiVolPct', `${Math.round((vol / 1260) * 100)}% do corpo`);
  setText('sKpiVolNovos', '+18 este mês');

  setText('sKpiCobertura', cobertura + '%');
  setText('sKpiCoberturaDelta', '+4% no trimestre');
  document.getElementById('sKpiCoberturaBar').style.width = cobertura + '%';
  setText('sKpiCoberturaMeta', `${vol}/${capacity} vagas`);

  setText('sKpiLider', lider);
  setText('sKpiLiderPct', '100% com tutoria ativa');
  setText('sKpiLiderMeta', 'Líderes formados');
}

function renderDeptTabs() {
  const tabs = document.getElementById('deptTabs');
  if (!tabs) return;
  tabs.querySelectorAll('.dept-tab').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === deptTab);
  });
  setText('deptTabTodos', mockDepartments.length);
}

function setDeptTab(tab) {
  deptTab = tab;
  renderDeptTabs();
  renderDeptGrid();
}

function renderDeptGrid() {
  const grid = document.getElementById('deptGrid');
  if (!grid) return;
  const list = deptTab === 'todos' ? mockDepartments : mockDepartments.filter(d => d.group === deptTab);
  grid.innerHTML = list.map(d => `
    <div class="dept-card">
      <div class="dept-card-head">
        <span class="dept-ico" style="background:var(--primary-light);color:var(--primary)"><i data-lucide="${d.icon}"></i></span>
        <div class="dept-card-title">
          <strong>${d.name}</strong>
          ${d.live ? '<span class="dept-live">LIVE</span>' : ''}
          <small>${d.sub}</small>
        </div>
        <button class="icon-box dept-more" onclick="manageDept('${d.id}')" title="Gerenciar"><i data-lucide="more-horizontal"></i></button>
      </div>
      <div class="dept-leader"><i data-lucide="crown"></i> ${d.leader}</div>
      <div class="dept-meta">
        <span><i data-lucide="users"></i> ${d.volunteers}/${d.capacity} voluntários</span>
        <span><i data-lucide="clock"></i> ${d.schedule}</span>
      </div>
      <div class="dept-highlight">${d.highlight}</div>
      <div class="dept-ready-row">
        <span class="dept-ready-label">Status de prontidão:</span>
        <span class="pill ${deptToneClass(d.tone)}">${d.status}</span>
      </div>
      <div class="dept-bar"><span style="width:${d.readiness}%"></span></div>
      <button class="dept-manage" onclick="manageDept('${d.id}')">Gerenciar Setor</button>
    </div>
  `).join('');
  if (window.lucide) lucide.createIcons();
}

function renderSaudeMinisterial() {
  const list = document.getElementById('saudeList');
  if (!list) {
    // painel pode não existir em telas antigas
  }
  const top5 = [...mockDepartments].sort((a, b) => (b.volunteers / b.capacity) - (a.volunteers / a.capacity)).slice(0, 5);
  const rows = top5.map(d => {
    const pct = Math.round((d.volunteers / d.capacity) * 100);
    const barClass = pct >= 90 ? 'saude-bar-green' : 'saude-bar-gray';
    return `
      <div class="saude-row">
        <div class="saude-row-top">
          <span class="saude-name">${d.name}</span>
          <span class="saude-pct">${d.volunteers}/${d.capacity} · ${pct}%</span>
        </div>
        <div class="saude-bar ${barClass}"><span style="width:${pct}%"></span></div>
      </div>
    `;
  }).join('');
  const el = document.getElementById('saudeList');
  if (el) el.innerHTML = rows + '<div class="saude-meta">Meta: 80% – 95%</div>';

  const sob = document.getElementById('sobrecargaList');
  if (sob) {
    sob.innerHTML = mockSobrecarga.map(s => `
      <div class="sob-row">
        <div class="sob-info">
          <strong>${s.name}</strong>
          <small>${s.role}</small>
        </div>
        <span class="sob-count">${s.shifts} escalas / ${s.limit} máx</span>
        <span class="pill ${deptToneClass(s.tone)}">${s.shifts > s.limit ? 'Sobrecarga' : 'Atenção'}</span>
      </div>
    `).join('');
  }
  setText('alertaCount', `${mockSobrecarga.length} voluntários em risco de sobrecarga`);
}

function manageDept(id) {
  const d = id ? mockDepartments.find(x => x.id === id) : null;
  document.getElementById('modalTitle').textContent = d ? 'Gerenciar Setor' : 'Novo Setor ou Ministério';
  document.getElementById('modalBody').innerHTML = `
    <div class="form-group"><label>Nome</label><input type="text" id="deptName" value="${d ? d.name : ''}" placeholder="Ex: Ministério de Jovens"></div>
    <div class="form-row">
      <div class="form-group"><label>Líder Responsável</label><input type="text" id="deptLeader" value="${d ? d.leader : ''}" placeholder="Nome do líder"></div>
      <div class="form-group"><label>Capacidade</label><input type="number" id="deptCapacity" value="${d ? d.capacity : ''}" placeholder="0"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Horário Padrão</label><input type="text" id="deptSchedule" value="${d ? d.schedule : ''}" placeholder="Ex: Dom 18h"></div>
      <div class="form-group"><label>Prontidão (%)</label><input type="number" id="deptReadiness" min="0" max="100" value="${d ? d.readiness : 100}"></div>
    </div>
    <div class="form-group"><label>Observação</label><input type="text" id="deptHighlight" value="${d ? d.highlight : ''}" placeholder="Destaque do setor"></div>
    <div class="form-group"><label>Categoria</label>
      <select class="filter-select" id="deptGroup" style="width:100%">
        <option value="cultos" ${d && d.group === 'cultos' ? 'selected' : ''}>Cultos & Liturgia</option>
        <option value="pastoral" ${d && d.group === 'pastoral' ? 'selected' : ''}>Pastoral & Cuidado</option>
        <option value="operacoes" ${d && d.group === 'operacoes' ? 'selected' : ''}>Operações</option>
      </select>
    </div>
    <div class="modal-footer" style="padding:16px 0 0;border-top:1px solid #F3F4F6;margin-top:8px">
      ${d ? `<button class="btn-danger" onclick="deleteDept('${d.id}')"><i data-lucide="trash-2"></i> Desativar</button>` : ''}
      <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn-primary" onclick="saveDept(${d ? `'${d.id}'` : 'null'})">
        <span class="material-symbols-outlined" style="font-size:18px">save</span> ${d ? 'Salvar' : 'Criar Setor'}
      </button>
    </div>
  `;
  if (window.lucide) lucide.createIcons();
  openModal();
}

async function saveDept(id) {
  const name = document.getElementById('deptName').value.trim();
  const leader = document.getElementById('deptLeader').value.trim();
  const capacity = parseInt(document.getElementById('deptCapacity').value) || 0;
  const schedule = document.getElementById('deptSchedule').value.trim();
  const readiness = parseInt(document.getElementById('deptReadiness').value) || 0;
  const highlight = document.getElementById('deptHighlight').value.trim();
  const group = document.getElementById('deptGroup').value;
  if (!name) { showToast('Informe o nome do setor', 'error'); return; }
  const slug = name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  const payload = { name: slug, label: name, leaderName: leader, capacity, scheduleText: schedule, readiness, highlightText: highlight, groupTag: group, icon: 'building-2', color: '#103B5F' };
  try {
    if (typeof apiPost === 'function' && apiOnline()) {
      if (id) await apiPost(`/sectors/${id}/update`, payload);
      else await apiPost('/sectors', payload);
      await hydrateFromApi();
      showToast(id ? 'Setor atualizado no banco!' : 'Setor criado no banco!', 'success');
    } else {
      if (id) {
        const d = mockDepartments.find(x => x.id === id);
        Object.assign(d, { name, leader, capacity, schedule, readiness, highlight, group });
        showToast('Setor atualizado!');
      } else {
        mockDepartments.push({ id: 'local-' + Date.now(), name, icon: 'building-2', group, sub: '', leader, volunteers: 0, capacity, schedule, highlight, readiness, status: readiness >= 90 ? 'Pronto' : readiness >= 70 ? 'Atenção' : 'Crítico', tone: readiness >= 90 ? 'green' : readiness >= 70 ? 'orange' : 'red', live: false });
        showToast('Setor criado!');
      }
    }
  } catch (e) { showToast('Erro: API indisponível', 'error'); return; }
  closeModal();
  renderSetores();
}

async function deleteDept(id) {
  try {
    if (typeof apiPost === 'function' && apiOnline()) {
      await apiPost(`/sectors/${id}/delete`, {});
      await hydrateFromApi();
    } else {
      const idx = mockDepartments.findIndex(x => x.id === id);
      if (idx > -1) mockDepartments.splice(idx, 1);
    }
  } catch (e) { /* offline */ }
  closeModal();
  renderSetores();
  showToast('Setor desativado');
}

function renderSetores() {
  renderSetorKpis();
  renderDeptTabs();
  renderDeptGrid();
  renderSaudeMinisterial();
  if (window.lucide) lucide.createIcons();
}

// ===== ESCALAS DE SERVIÇO (POR MINISTÉRIO) =====
let escMinistryName = null; // sector.name do ministério aberto
let escSchedules = [];      // escalas do ministério
let escActiveId = null;     // escala ativa (schedule.id)

function isFullAccess() {
  if (!currentUser) return false;
  if (['admin', 'pastor'].includes(currentUser.role)) return true;
  const r = currentUser.apiRoles || [];
  return r.includes('SUPER_ADMIN') || r.includes('PASTOR');
}

// Ministérios acessíveis: admin/pastor veem todos; demais só os que lideram ou participam
function accessibleMinistries() {
  const sectors = window.apiSectors || [];
  if (!sectors.length) return [];
  if (isFullAccess()) return sectors;
  const uid = currentUser && currentUser.id;
  if (uid) {
    return sectors.filter(s =>
      s.leaderUserId === uid ||
      (s.members || []).some(m => m.userId === uid)
    );
  }
  // Demo local (sem id no banco): escopo por papel de teste
  const demo = { lider: ['louvor'], tesoureiro: ['tesouraria'], membro: ['louvor'], voluntario: ['louvor'] };
  const names = demo[currentUser && currentUser.role];
  return names ? sectors.filter(s => names.includes(s.name)) : sectors;
}

// Pode alterar: admin/pastor ou líder do ministério
function canEditMinistry(sector) {
  if (isFullAccess()) return true;
  const uid = currentUser && currentUser.id;
  return !!uid && !!sector && sector.leaderUserId === uid;
}

function currentMinistry() {
  const list = accessibleMinistries();
  return list.find(s => s.name === escMinistryName) || null;
}

function toggleMinistryPicker(e) {
  if (e) e.stopPropagation();
  const menu = document.getElementById('ministryPickerMenu');
  if (!menu) return;
  const open = menu.style.display !== 'none';
  if (open) { menu.style.display = 'none'; return; }
  renderMinistryPickerMenu();
  menu.style.display = 'block';
}

function renderMinistryPickerMenu() {
  const menu = document.getElementById('ministryPickerMenu');
  if (!menu) return;
  const list = accessibleMinistries();
  if (!list.length) {
    menu.innerHTML = '<div class="mp-empty">Nenhum ministério disponível para sua conta</div>';
    return;
  }
  menu.innerHTML = list.map(s => `
    <button class="mp-item ${s.name === escMinistryName ? 'active' : ''}" onclick="selectMinistry('${s.name}')">
      <span class="mp-item-ico" style="background:${s.color || '#103B5F'}18;color:${s.color || '#103B5F'}"><i data-lucide="${s.icon || 'building-2'}"></i></span>
      <span class="mp-item-txt">
        <strong>${s.label}</strong>
        <small>${s.leaderName ? 'Líder: ' + s.leaderName : 'Sem líder definido'}</small>
      </span>
      ${s.leaderUserId && currentUser && s.leaderUserId === currentUser.id ? '<span class="pill pill-blue mp-item-tag">Seu ministério</span>' : ''}
    </button>
  `).join('');
  if (window.lucide) lucide.createIcons();
}

function selectMinistry(name) {
  escMinistryName = name;
  escActiveId = null;
  const menu = document.getElementById('ministryPickerMenu');
  if (menu) menu.style.display = 'none';
  renderEscalas();
}

function updateMinistryPickerUI() {
  const s = currentMinistry();
  const lbl = document.getElementById('ministryPickerLabel');
  const ico = document.getElementById('ministryPickerIco');
  if (lbl) lbl.textContent = s ? s.label : 'Selecionar ministério';
  if (ico && s) {
    ico.style.background = (s.color || '#103B5F') + '18';
    ico.style.color = s.color || '#103B5F';
    ico.innerHTML = `<i data-lucide="${s.icon || 'building-2'}"></i>`;
  } else if (ico) {
    ico.innerHTML = '<i data-lucide="church"></i>';
  }
}

async function loadEscalasOf(sectorName) {
  try {
    if (typeof apiGet === 'function') {
      return await apiGet('/schedules?sectorName=' + encodeURIComponent(sectorName));
    }
  } catch (e) { /* offline */ }
  return [];
}

function escActiveSchedule() {
  return escSchedules.find(s => s.id === escActiveId) || escSchedules[0] || null;
}

function escMemberName(m) {
  return (m.person && m.person.name) || (m.user && m.user.person && m.user.person.name) || '—';
}
function escMemberEmail(m) {
  return (m.person && m.person.email) || (m.user && m.user.email) || '—';
}

function escDateLabel(iso) {
  if (!iso) return '';
  const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const d = new Date(iso + 'T12:00:00');
  if (isNaN(d)) return iso;
  return `${dias[d.getDay()]}, ${d.getDate()} de ${meses[d.getMonth()]}`;
}

function escStatusPill(status) {
  if (status === 'CONFIRMED') return '<span class="pill pill-green"><i data-lucide="check-circle-2"></i>Confirmado</span>';
  if (status === 'TRADE_REQUESTED') return '<span class="pill pill-orange">Troca Selecionada</span>';
  if (status === 'TRADE_SELECTED') return '<span class="pill pill-blue">Substituição Ativa</span>';
  return '<span class="pill pill-amber"><i data-lucide="clock-3"></i>Aguardando Confirmação</span>';
}

function escKpiCard(label, value, sub, tone) {
  return `<div class="esc-kpi ${tone || ''}">
    <span class="esc-kpi-label">${label}</span>
    <strong class="esc-kpi-value">${value}</strong>
    ${sub ? `<span class="esc-kpi-sub">${sub}</span>` : ''}
  </div>`;
}

async function renderEscalas() {
  const body = document.getElementById('escalasBody');
  if (!body) return;
  const list = accessibleMinistries();
  if (!list.length) {
    updateMinistryPickerUI();
    body.innerHTML = `<div class="empty-state"><i data-lucide="lock"></i><p>Nenhum ministério disponível para sua conta. Peça a um pastor para te vincular ao ministério.</p></div>`;
    if (window.lucide) lucide.createIcons();
    return;
  }
  if (!escMinistryName || !list.find(s => s.name === escMinistryName)) escMinistryName = list[0].name;
  const ministry = list.find(s => s.name === escMinistryName);

  body.innerHTML = '<div class="esc-loading">Carregando escalas do ministério…</div>';
  escSchedules = await loadEscalasOf(ministry.name);
  if (!escActiveId || !escSchedules.find(s => s.id === escActiveId)) {
    // Padrão: escala com troca solicitada (destaque), senão a mais próxima
    const withTrade = escSchedules.find(s => (s.members || []).some(m => m.status === 'TRADE_REQUESTED' || m.status === 'TRADE_SELECTED'));
    escActiveId = withTrade ? withTrade.id : (escSchedules.length ? escSchedules[0].id : null);
  }

  const tpl = ministry.templateKey || 'base';
  if (tpl === 'louvor') body.innerHTML = escLouvorTemplate(ministry);
  else if (tpl === 'ensino') body.innerHTML = escEnsinoTemplate(ministry);
  else body.innerHTML = escBaseTemplate(ministry);

  updateMinistryPickerUI();
  if (window.lucide) lucide.createIcons();
}

// ---- Helpers compartilhados das Escalas (layout Culto) ----
const ESC_ROLE_DESC = {
  'Vocal Principal (Líder)': 'Acompanha melodia principal e ofertório',
  'Guitarra Solo': 'Sólos, riffs & ambientes',
  'Baixo Elétrico': 'Sustentação e linha direta',
  'Teclado & Arranjador': 'Pads, piano contínuo e arranjos',
  'Teclado & Sintetizador': 'Pads, piano contínuo e arranjos',
  'Bateria & Percussão': 'Metrônomo / Click 120-138 BPM',
  'Vocal de Apoio': 'Harmonias e apoio vocal',
  'Operador de Áudio': 'Mesa, microfonia e in-ear',
  'Câmera / Vídeo': 'Captação e cortes de câmera',
  'Transmissão (Stream)': 'Encoder, YouTube e redes',
  'Fotografia': 'Registro do culto',
  'Professor (Adultos)': 'Turma adulto — EBD',
  'Professor (Kids)': 'Turma infantil — Kids',
  'Apoio de Sala': 'Apoio ao professor principal',
  'Recepção Infantil': 'Check-in e acolhimento',
};

function escHeadHTML(ministry, act, opts) {
  opts = opts || {};
  const edit = canEditMinistry(ministry);
  const total = act ? (act.totalPositions || (act.members || []).length || 0) : 0;
  const schedOptions = escSchedules.map(s =>
    `<option value="${s.id}" ${act && s.id === act.id ? 'selected' : ''}>${s.title} — ${shortDate(s.date)}</option>`
  ).join('');
  return `
  <div class="esc-crumb">Início › Escalas de Serviço › ${act ? act.title : ministry.label}</div>
  <div class="esc-head">
    <div class="esc-head-left">
      <h3>${opts.title || ('Gestão de Escalas — ' + ministry.label)}</h3>
      <span class="pill pill-green esc-editing"><i data-lucide="radio"></i>Em Edição Ativa</span>
      ${act ? `
      <div class="esc-meta">
        <div><i data-lucide="calendar-days"></i>${escDateLabel(act.date)} · ${act.timeStart || '—'}${act.timeEnd ? ' às ' + act.timeEnd : ''}</div>
        <div><i data-lucide="map-pin"></i>${act.location || 'Templo Principal'} · ${total} posições totais</div>
      </div>` : ''}
    </div>
    <div class="esc-head-actions">
      <div class="ministry-picker dropdown-anchor">
        <button class="ministry-picker-btn" id="ministryPickerBtn" onclick="toggleMinistryPicker(event)">
          <span class="mp-ico" id="ministryPickerIco"></span>
          <span id="ministryPickerLabel">${ministry.label}</span>
          <span class="mp-caret"><i data-lucide="chevron-down"></i></span>
        </button>
        <div class="ministry-picker-menu" id="ministryPickerMenu" style="display:none"></div>
      </div>
      ${act ? `<select class="esc-sched-select" onchange="escPickSchedule(this.value)">${schedOptions}</select>` : ''}
      <button class="btn-secondary" onclick="showToast('Preparando relatório para impressão…','info')"><i data-lucide="printer"></i> Exportar / Imprimir</button>
      ${edit ? `<button class="btn-secondary" onclick="escNotifyPending()"><i data-lucide="bell"></i> Notificar Pendentes</button>` : ''}
      ${edit ? `<button class="btn-primary" onclick="escOpenAddVolunteer()"><i data-lucide="user-plus"></i> Adicionar Voluntário</button>` : ''}
      ${edit ? `<button class="esc-icon-btn" onclick="openEscalaModal()" title="Nova Escala"><i data-lucide="plus"></i></button>` : ''}
    </div>
  </div>`;
}

function escKpiCard(label, value, sub, tone, barPct) {
  const kb = tone ? ' esc-kb-' + tone : '';
  return `<div class="esc-kpi ${tone ? 'esc-kpi-' + tone : ''}">
    <span class="esc-kpi-label">${label}</span>
    <div class="esc-kpi-main">
      <strong class="esc-kpi-value">${value}</strong>
      ${sub ? `<span class="esc-kpi-badge${kb}">${sub}</span>` : ''}
    </div>
    ${barPct != null ? `<div class="esc-kpi-bar"><span style="width:${Math.min(100, barPct)}%"></span></div>` : ''}
  </div>`;
}

function escKpisFor(act) {
  const total = act.totalPositions || act.members.length || 0;
  const confirmed = act.members.filter(m => m.status === 'CONFIRMED').length;
  const pending = act.members.filter(m => m.status === 'PENDING').length;
  const trades = act.members.filter(m => m.status === 'TRADE_REQUESTED' || m.status === 'TRADE_SELECTED').length;
  const vagas = Math.max(total - act.members.length, 0);
  const pct = total ? Math.round((confirmed / total) * 100) : 0;
  const pctP = total ? Math.round((pending / total) * 100) : 0;
  const pctT = total ? Math.round((trades / total) * 100) : 0;
  return `
    ${escKpiCard('Total Escalado', `${act.members.length} <span class="esc-kpi-unit">/ ${total} vagas</span>`, '', '', total ? (act.members.length / total) * 100 : 0)}
    ${escKpiCard('Confirmados', confirmed, pct + '%', 'green')}
    ${escKpiCard('Pendentes', pending, pctP + '%', 'amber')}
    ${escKpiCard('Troca Solicitada', trades, pctT + '%', trades ? 'teal' : '')}
    ${escKpiCard('Vagas Abertas', vagas, vagas ? 'Atenção' : 'Completo', vagas ? 'red' : 'green')}`;
}

function escProgressHTML(act) {
  const total = act.totalPositions || act.members.length || 1;
  const confirmed = act.members.filter(m => m.status === 'CONFIRMED').length;
  const pending = act.members.filter(m => m.status === 'PENDING').length;
  const trades = act.members.filter(m => m.status === 'TRADE_REQUESTED' || m.status === 'TRADE_SELECTED').length;
  const open = Math.max(total - act.members.length, 0);
  const readiness = ((confirmed + pending * 0.5) / total * 100).toFixed(1);
  return `
  <div class="esc-progress">
    <div class="esc-progress-head">
      <span>Taxa de Adesão / Cobertura do Culto</span>
      <strong>${readiness}% de prontidão operacional</strong>
    </div>
    <div class="esc-progress-bar">
      <span style="width:${(confirmed / total) * 100}%;background:#059669"></span>
      <span style="width:${(pending / total) * 100}%;background:#D97706"></span>
      <span style="width:${(trades / total) * 100}%;background:#16A2AD"></span>
      <span style="width:${(open / total) * 100}%;background:#94A3B8"></span>
    </div>
    <div class="esc-legend">
      <span class="lg lg-ok">Confirmados</span>
      <span class="lg lg-wait">Resposta Pendente</span>
      <span class="lg lg-trade">Troca Ativa</span>
      <span class="lg lg-open">Vagas Não Preenchidas</span>
    </div>
  </div>`;
}

function escBankItems(ministry, act, edit, bankTitle, bankIcon) {
  const inScheduleIds = new Set(act.members.filter(m => m.userId).map(m => m.userId));
  const bank = (ministry.members || []).filter(m => !inScheduleIds.has(m.userId));
  return `
  <div class="esc-bank">
    <div class="esc-bank-head">
      <span><i data-lucide="${bankIcon || 'users'}"></i> ${bankTitle || 'Banco de Voluntários'}</span>
      <span class="pill pill-blue">${bank.length} Livres</span>
    </div>
    <div class="esc-bank-tools">
      <input type="text" class="esc-bank-search" placeholder="Buscar por nome, dom ou setor..." oninput="escBankFilter(this.value)">
      <label class="esc-bank-check"><input type="checkbox" checked> Apenas disponíveis em ${shortDate(act.date)} (Sem chefe de horário!)</label>
    </div>
    <div class="esc-bank-list" id="escBankList">
      ${bank.length ? bank.map(m => {
        const nm = (m.user && m.user.person && m.user.person.name) || '—';
        const team = (m.role && m.role.label) || ministry.label;
        return `
        <div class="esc-bank-item" data-name="${nm.toLowerCase()}">
          <span class="esc-ava esc-ava-teal">${initials(nm)}</span>
          <span class="esc-bank-txt"><strong>${nm}</strong><small>${team}</small></span>
          ${edit ? `<button class="esc-icon-btn" onclick="escQuickAdd('${act.id}','${m.userId}')" title="Adicionar à escala"><i data-lucide="plus"></i></button>` : ''}
        </div>`;
      }).join('') : '<div class="mp-empty">Todos os membros já estão escalados</div>'}
    </div>
  </div>`;
}

function escNotifPreview(act, bodyHtml, edit) {
  return `
  <div class="esc-notif">
    <div class="esc-notif-head">
      <span><i data-lucide="bell"></i> Prévia da Notificação ao Voluntário</span>
      <span class="esc-notif-right">
        <span class="esc-notif-chan">Push | WhatsApp</span>
        <small>Agora</small>
      </span>
    </div>
    <div class="esc-notif-body">${bodyHtml}</div>
    ${edit ? `<button class="btn-primary btn-block" onclick="escPublish()"><i data-lucide="send"></i> Publicar Alterações &amp; Disparar Notificações</button>` : ''}
  </div>`;
}

function escRowActions(act, m, name, edit) {
  if (!edit) return '<span class="esc-carga">—</span>';
  if (m.status === 'PENDING') {
    return `
      <button class="btn-mini btn-amber" onclick="escRemind('${escAttr(name)}')"><i data-lucide="bell-ring"></i> Lembrar</button>
      <button class="esc-icon-btn" onclick="escRemoveMember('${act.id}','${m.userId || ''}','${m.personId || ''}')" title="Remover"><i data-lucide="x"></i></button>`;
  }
  if (m.status === 'TRADE_REQUESTED' || m.status === 'TRADE_SELECTED') {
    return `
      <button class="btn-mini btn-mini-primary" onclick="escOpenSubstitute('${act.id}','${m.id}')"><i data-lucide="repeat-2"></i> Substituir</button>
      <button class="esc-icon-btn" onclick="escRemoveMember('${act.id}','${m.userId || ''}','${m.personId || ''}')" title="Remover"><i data-lucide="x"></i></button>`;
  }
  return `
    <button class="esc-icon-btn" onclick="escRemind('${escAttr(name)}')" title="Mensagem"><i data-lucide="message-square"></i></button>
    <button class="esc-icon-btn" onclick="escOpenSubstitute('${act.id}','${m.id}')" title="Editar / Substituir"><i data-lucide="pencil"></i></button>`;
}

// ---- Template COMPLETO: LOUVOR ----
function escLouvorTemplate(ministry) {
  const edit = canEditMinistry(ministry);
  const act = escActiveSchedule();
  if (!act) return escNoScheduleHTML(ministry, edit);

  const total = act.totalPositions || act.members.length || 0;
  const rows = act.members.map(m => {
    const name = escMemberName(m);
    const role = m.roleInSchedule || 'Voluntário';
    const desc = ESC_ROLE_DESC[role] || '';
    const mc = m.monthlyCount || 0;
    const isTrade = m.status === 'TRADE_REQUESTED' || m.status === 'TRADE_SELECTED';
    const tradeNote = m.status === 'TRADE_REQUESTED' && m.tradeReason ? `<div class="esc-trade-note">Pediu troca: ${m.tradeReason}</div>` : '';
    return `
      <tr class="${isTrade ? 'esc-row-trade' : ''}">
        <td>
          <div class="esc-role">${role}</div>
          ${desc ? `<div class="esc-role-desc">${desc}</div>` : ''}
          ${tradeNote}
        </td>
        <td>
          <div class="esc-person">
            <span class="esc-ava">${initials(name)}</span>
            <span><strong class="${isTrade ? 'esc-name-trade' : ''}">${name}</strong><small>${escMemberEmail(m)}</small></span>
          </div>
        </td>
        <td>${escStatusPill(m.status)}</td>
        <td>
          <span class="esc-carga ${mc >= 3 ? 'esc-carga-warn' : ''}">${mc} de 4 domingos</span>
          ${mc >= 3 ? '<div class="esc-carga-tag">Atenção: Carga</div>' : ''}
        </td>
        <td class="table-actions">${escRowActions(act, m, name, edit)}</td>
      </tr>`;
  }).join('');

  const target = act.members.find(m => m.status === 'TRADE_REQUESTED') || act.members.find(m => m.status === 'PENDING') || act.members[0];
  const tFirst = target ? escMemberName(target).split(' ')[0] : 'Voluntário';
  const ddmm = (act.date || '').slice(8, 10) + '/' + (act.date || '').slice(5, 7);
  const notifBody = target
    ? `Olá, <strong>${tFirst}</strong>! Você foi escalado para servir em <b>${act.title}</b> (${ddmm}) como <b>${target.roleInSchedule || 'Voluntário'}</b> às ${act.timeStart || '18h00'}. Confirme sua presença com 1 clique.`
    : 'Nenhum voluntário escalado para prévia.';

  return `
  <div class="esc-wrap">
    ${escHeadHTML(ministry, act, { title: 'Gestão de Escalas — ' + (act.title || ministry.label) })}
    <div class="esc-kpis">${escKpisFor(act)}</div>
    ${escProgressHTML(act)}
    <div class="esc-grid">
      <div class="esc-main">
        <div class="esc-sched-card">
          <div class="esc-sched-head">
            <span class="dept-ico" style="background:${ministry.color || '#103B5F'}22;color:${ministry.color || '#103B5F'}"><i data-lucide="${ministry.icon || 'music'}"></i></span>
            <div class="esc-sched-title">
              <strong>${ministry.label}<span class="pill pill-blue">${act.members.length} de ${total} escalados</span></strong>
              <small>Líder Responsável: ${ministry.leaderName || '—'}${act.arrivalTime ? ' · Passagem de Som: ' + act.arrivalTime : (ministry.scheduleText ? ' · ' + ministry.scheduleText : '')}</small>
            </div>
            <button class="btn-secondary" onclick="showToast('Repertório: 5 músicas escaladas','info')"><i data-lucide="list-music"></i> Repertório (5)</button>
            <button class="esc-icon-btn" onclick="escMenuMore('${act.id}')" title="Mais opções"><i data-lucide="more-vertical"></i></button>
          </div>
          ${act.members.length ? `
          <div class="table-container">
            <table class="data-table esc-table">
              <thead>
                <tr>
                  <th>Função / Posição</th>
                  <th>Voluntário Designado</th>
                  <th>Status</th>
                  <th>Carga no Mês</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>` : `<div class="empty-state"><i data-lucide="music"></i><p>Nenhum voluntário escalado ainda.</p></div>`}
        </div>
      </div>
      <aside class="esc-side">
        ${escBankItems(ministry, act, edit)}
        ${escNotifPreview(act, notifBody, edit)}
      </aside>
    </div>
  </div>`;
}

// ---- Template COMPLETO: ENSINO / EBD / CULTO INFANTIL ----
function escEnsinoTemplate(ministry) {
  const edit = canEditMinistry(ministry);
  const act = escActiveSchedule();
  if (!act) return escNoScheduleHTML(ministry, edit);

  const total = act.totalPositions || act.members.length || 0;
  const confirmed = act.members.filter(m => m.status === 'CONFIRMED').length;
  const pending = act.members.filter(m => m.status === 'PENDING').length;

  const aulaCards = escSchedules.map(s => `
    <button class="esc-aula ${s.id === act.id ? 'active' : ''}" onclick="escPickSchedule('${s.id}')">
      <span class="esc-aula-date">${shortDate(s.date)}</span>
      <strong>${s.title}</strong>
      <small>${s.timeStart || '—'} • ${(s.members || []).length} escalados</small>
    </button>
  `).join('');

  const rows = act.members.map(m => {
    const name = escMemberName(m);
    const role = m.roleInSchedule || 'Professor(a)';
    const desc = ESC_ROLE_DESC[role] || '';
    return `
      <tr>
        <td>
          <div class="esc-role">${role}</div>
          ${desc ? `<div class="esc-role-desc">${desc}</div>` : ''}
        </td>
        <td>
          <div class="esc-person">
            <span class="esc-ava">${initials(name)}</span>
            <span><strong>${name}</strong><small>${escMemberEmail(m)}</small></span>
          </div>
        </td>
        <td>${escStatusPill(m.status)}</td>
        <td class="table-actions">${escRowActions(act, m, name, edit)}</td>
      </tr>`;
  }).join('');

  const ddmm = (act.date || '').slice(8, 10) + '/' + (act.date || '').slice(5, 7);
  const notifBody = `Aula de <b>${act.title}</b> em ${ddmm}, ${act.timeStart || '—'}. Professores, confirmem presença no app!`;

  return `
  <div class="esc-wrap">
    ${escHeadHTML(ministry, act, { title: 'Gestão de Aulas — ' + (act.title || ministry.label) })}
    <div class="esc-kpis">
      ${escKpiCard('Aulas na Semana', escSchedules.length, 'escalas')}
      ${escKpiCard('Professores Escalados', act.members.length, 'nesta aula')}
      ${escKpiCard('Confirmados', confirmed, total ? Math.round((confirmed / total) * 100) + '%' : '0%', 'green')}
      ${escKpiCard('Pendentes', pending, pending ? 'Atenção' : 'Tudo certo', pending ? 'amber' : 'green')}
    </div>
    <div class="esc-aulas-strip">
      <div class="esc-aulas-label">Aulas &amp; Turmas</div>
      <div class="esc-aulas-scroll">${aulaCards}</div>
    </div>
    <div class="esc-grid">
      <div class="esc-main">
        <div class="esc-sched-card">
          <div class="esc-sched-head">
            <span class="dept-ico" style="background:${ministry.color || '#16A2AD'}22;color:${ministry.color || '#16A2AD'}"><i data-lucide="${ministry.icon || 'book-open'}"></i></span>
            <div class="esc-sched-title">
              <strong>${act.title}<span class="pill pill-teal">${confirmed}/${act.members.length} confirmados</span></strong>
              <small>${escDateLabel(act.date)} • ${act.timeStart || '—'} • Líder: ${ministry.leaderName || '—'}</small>
            </div>
            <button class="esc-icon-btn" onclick="escMenuMore('${act.id}')" title="Mais opções"><i data-lucide="more-vertical"></i></button>
          </div>
          ${act.members.length ? `
          <div class="table-container">
            <table class="data-table esc-table">
              <thead>
                <tr>
                  <th>Turma / Função</th>
                  <th>Professor Designado</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>` : `<div class="empty-state"><i data-lucide="graduation-cap"></i><p>Nenhum professor escalado para esta aula.</p></div>`}
        </div>
      </div>
      <aside class="esc-side">
        ${escBankItems(ministry, act, edit, 'Banco de Professores', 'graduation-cap')}
        ${escNotifPreview(act, notifBody, edit)}
      </aside>
    </div>
  </div>`;
}

// ---- Template BASE: demais ministérios ----
function escBaseTemplate(ministry) {
  const edit = canEditMinistry(ministry);
  const act = escActiveSchedule();
  if (!act) return escNoScheduleHTML(ministry, edit);

  const total = act.totalPositions || act.members.length || 0;
  const rows = act.members.map(m => {
    const name = escMemberName(m);
    const role = m.roleInSchedule || 'Voluntário';
    const mc = m.monthlyCount || 0;
    return `
      <tr>
        <td><div class="esc-role">${role}</div></td>
        <td>
          <div class="esc-person">
            <span class="esc-ava">${initials(name)}</span>
            <span><strong>${name}</strong><small>${escMemberEmail(m)}</small></span>
          </div>
        </td>
        <td>${escStatusPill(m.status)}</td>
        <td><span class="esc-carga ${mc >= 3 ? 'esc-carga-warn' : ''}">${mc} de 4 domingos</span></td>
        <td class="table-actions">${escRowActions(act, m, name, edit)}</td>
      </tr>`;
  }).join('');

  const target = act.members.find(m => m.status === 'PENDING') || act.members[0];
  const tFirst = target ? escMemberName(target).split(' ')[0] : 'Voluntário';
  const ddmm = (act.date || '').slice(8, 10) + '/' + (act.date || '').slice(5, 7);
  const notifBody = target
    ? `Olá, <strong>${tFirst}</strong>! Você foi escalado para servir em <b>${act.title}</b> (${ddmm}) como <b>${target.roleInSchedule || 'Voluntário'}</b> às ${act.timeStart || '18h00'}. Confirme sua presença com 1 clique.`
    : 'Nenhum voluntário escalado para prévia.';

  return `
  <div class="esc-wrap">
    ${escHeadHTML(ministry, act, { title: 'Gestão de Escalas — ' + (act.title || ministry.label) })}
    <div class="esc-kpis">${escKpisFor(act)}</div>
    ${escProgressHTML(act)}
    <div class="esc-grid">
      <div class="esc-main">
        <div class="esc-sched-card">
          <div class="esc-sched-head">
            <span class="dept-ico" style="background:${ministry.color || '#103B5F'}22;color:${ministry.color || '#103B5F'}"><i data-lucide="${ministry.icon || 'clipboard-check'}"></i></span>
            <div class="esc-sched-title">
              <strong>${ministry.label}<span class="pill pill-blue">${act.members.length} de ${total} escalados</span></strong>
              <small>Líder: ${ministry.leaderName || '—'} • ${escDateLabel(act.date)} • ${act.timeStart || '—'}${act.timeEnd ? ' às ' + act.timeEnd : ''}</small>
            </div>
            <button class="esc-icon-btn" onclick="escMenuMore('${act.id}')" title="Mais opções"><i data-lucide="more-vertical"></i></button>
          </div>
          ${act.members.length ? `
          <div class="table-container">
            <table class="data-table esc-table">
              <thead>
                <tr>
                  <th>Função</th>
                  <th>Voluntário</th>
                  <th>Status</th>
                  <th>Carga no Mês</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>` : `<div class="empty-state"><i data-lucide="users"></i><p>Nenhum voluntário escalado. Use "Adicionar Voluntário" para escalar.</p></div>`}
        </div>
      </div>
      <aside class="esc-side">
        ${escBankItems(ministry, act, edit)}
        ${escNotifPreview(act, notifBody, edit)}
      </aside>
    </div>
  </div>`;
}

function escNoScheduleHTML(ministry, edit) {
  return `
  <div class="esc-wrap">
    ${escHeadHTML(ministry, null, { title: 'Gestão de Escalas — ' + ministry.label })}
    <div class="empty-state">
      <i data-lucide="clipboard-check"></i>
      <p>Nenhuma escala neste ministério ainda.</p>
      ${edit ? '<button class="btn-primary" onclick="openEscalaModal()"><span class="material-symbols-outlined">add</span> Criar primeira escala</button>' : ''}
    </div>
  </div>`;
}

function escBankFilter(q) {
  q = (q || '').toLowerCase();
  document.querySelectorAll('#escBankList .esc-bank-item').forEach(el => {
    el.style.display = !q || (el.getAttribute('data-name') || '').indexOf(q) !== -1 ? '' : 'none';
  });
}

function escMenuMore(id) {
  if (confirm('Excluir esta escala? Os voluntários escalados serão removidos.')) escDeleteSchedule(id);
}

function escAttr(s) { return String(s || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'"); }

// ---- Ações da tela de escalas ----
function escPickSchedule(id) {
  escActiveId = id;
  renderEscalas();
}

async function escSetStatus(scheduleId, memberId, userId, personId, status) {
  try {
    const body = { status };
    if (personId) body.personId = personId;
    else if (userId) body.userId = userId;
    await apiPost(`/schedules/${scheduleId}/confirm`, body);
    await renderEscalas();
    showToast(status === 'CONFIRMED' ? 'Voluntário confirmado!' : 'Status atualizado', 'success');
  } catch (e) { showToast('API indisponível', 'error'); }
}

async function escRemoveMember(scheduleId, userId, personId) {
  try {
    const body = {};
    if (personId) body.personId = personId;
    else if (userId) body.userId = userId;
    if (!body.personId && !body.userId) return;
    await apiPost(`/schedules/${scheduleId}/remove-member`, body);
    await renderEscalas();
    showToast('Voluntário removido da escala');
  } catch (e) { showToast('API indisponível', 'error'); }
}

async function escQuickAdd(scheduleId, userId) {
  try {
    await apiPost(`/schedules/${scheduleId}/add-member`, { userId, roleInSchedule: 'Voluntário' });
    await renderEscalas();
    showToast('Voluntário adicionado à escala!', 'success');
  } catch (e) { showToast('API indisponível', 'error'); }
}

function escRemind(name) { showToast(`Lembrete enviado para ${name}`, 'success'); }
function escNotifyPending() {
  const act = escActiveSchedule();
  const n = act ? (act.members || []).filter(m => m.status === 'PENDING').length : 0;
  showToast(n ? `Notificação enviada a ${n} pendente(s)` : 'Nenhum pendente para notificar', n ? 'success' : 'info');
}
function escPublish() {
  const act = escActiveSchedule();
  const n = act ? (act.members || []).length : 0;
  showToast(`Alterações publicadas — ${n} notificação(ões) disparada(s)`, 'success');
}

function escOpenAddVolunteer() {
  const act = escActiveSchedule();
  const ministry = currentMinistry();
  if (!act || !ministry) return;
  const inScheduleIds = new Set(act.members.filter(m => m.userId).map(m => m.userId));
  const bank = (ministry.members || []).filter(m => !inScheduleIds.has(m.userId));
  document.getElementById('modalTitle').textContent = 'Adicionar Voluntário';
  document.getElementById('modalBody').innerHTML = `
    <div class="form-group">
      <label>Voluntário (membros do ministério)</label>
      <select id="escAddPerson">
        ${bank.map(m => `<option value="${m.userId}">${(m.user && m.user.person && m.user.person.name) || m.userId}</option>`).join('') || '<option value="">Nenhum membro livre</option>'}
      </select>
    </div>
    <div class="form-group">
      <label>Função na Escala</label>
      <input type="text" id="escAddRole" placeholder="Ex: Vocal, Professor, Apoio…" value="">
    </div>
    <div class="modal-footer" style="padding:16px 0 0;border-top:1px solid #F3F4F6;margin-top:8px">
      <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn-primary" onclick="escConfirmAdd()"><span class="material-symbols-outlined" style="font-size:18px">person_add</span> Adicionar</button>
    </div>
  `;
  openModal();
}

async function escConfirmAdd() {
  const act = escActiveSchedule();
  const userId = document.getElementById('escAddPerson').value;
  const role = document.getElementById('escAddRole').value.trim() || 'Voluntário';
  if (!userId || !act) { showToast('Selecione um voluntário', 'error'); return; }
  try {
    await apiPost(`/schedules/${act.id}/add-member`, { userId, roleInSchedule: role });
    closeModal();
    await renderEscalas();
    showToast('Voluntário escalado!', 'success');
  } catch (e) { showToast('API indisponível', 'error'); }
}

function escOpenSubstitute(scheduleId, memberId) {
  const act = escActiveSchedule();
  const ministry = currentMinistry();
  if (!act || !ministry) return;
  const old = act.members.find(m => m.id === memberId);
  const inScheduleIds = new Set(act.members.filter(m => m.userId && m.id !== memberId).map(m => m.userId));
  const bank = (ministry.members || []).filter(m => !inScheduleIds.has(m.userId));
  document.getElementById('modalTitle').textContent = 'Substituir Voluntário';
  document.getElementById('modalBody').innerHTML = `
    <p style="font-size:13.5px;color:var(--muted);margin-bottom:14px">
      Substituir <b>${old ? escMemberName(old) : 'voluntário'}</b> (${old ? old.roleInSchedule : '—'}) por:
    </p>
    <div class="form-group">
      <select id="escSubPerson">
        ${bank.map(m => `<option value="${m.userId}">${(m.user && m.user.person && m.user.person.name) || m.userId}</option>`).join('') || '<option value="">Nenhum membro disponível</option>'}
      </select>
    </div>
    <div class="modal-footer" style="padding:16px 0 0;border-top:1px solid #F3F4F6;margin-top:8px">
      <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn-primary" onclick="escConfirmSubstitute('${scheduleId}','${memberId}')"><span class="material-symbols-outlined" style="font-size:18px">repeat_one</span> Substituir</button>
    </div>
  `;
  openModal();
}

async function escConfirmSubstitute(scheduleId, memberId) {
  const act = escActiveSchedule();
  const newUserId = document.getElementById('escSubPerson').value;
  if (!act || !newUserId) { showToast('Selecione o substituto', 'error'); return; }
  const old = act.members.find(m => m.id === memberId);
  try {
    await apiPost(`/schedules/${scheduleId}/add-member`, { userId: newUserId, roleInSchedule: old ? old.roleInSchedule : 'Voluntário' });
    if (old) {
      await apiPost(`/schedules/${scheduleId}/remove-member`, old.userId ? { userId: old.userId } : { personId: old.personId });
    }
    closeModal();
    await renderEscalas();
    showToast('Substituição realizada!', 'success');
  } catch (e) { showToast('API indisponível', 'error'); }
}

async function escDeleteSchedule(id) {
  try {
    await apiPost(`/schedules/${id}/delete`, {});
    escSchedules = escSchedules.filter(s => s.id !== id);
    if (escActiveId === id) escActiveId = null;
    await renderEscalas();
    showToast('Escala excluída');
  } catch (e) { showToast('API indisponível', 'error'); }
}

function openEscalaModal() {
  const ministry = currentMinistry();
  if (!ministry) { showToast('Selecione um ministério primeiro', 'error'); return; }
  document.getElementById('modalTitle').textContent = 'Nova Escala — ' + ministry.label;
  document.getElementById('modalBody').innerHTML = `
    <div class="form-group">
      <label>Título da Escala</label>
      <input type="text" id="escNewTitle" placeholder="Ex: Culto de Celebração — Noite">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Data</label>
        <input type="date" id="escNewDate">
      </div>
      <div class="form-group">
        <label>Início</label>
        <input type="time" id="escNewStart" value="18:00">
      </div>
      <div class="form-group">
        <label>Fim</label>
        <input type="time" id="escNewEnd" value="20:00">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Local</label>
        <input type="text" id="escNewLoc" placeholder="Templo Principal">
      </div>
      <div class="form-group">
        <label>Status</label>
        <select id="escNewStatus">
          <option value="DRAFT">Rascunho</option>
          <option value="PUBLISHED">Publicada</option>
        </select>
      </div>
    </div>
    <div class="modal-footer" style="padding:16px 0 0;border-top:1px solid #F3F4F6;margin-top:8px">
      <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn-primary" onclick="escSaveNew()"><span class="material-symbols-outlined" style="font-size:18px">save</span> Criar Escala</button>
    </div>
  `;
  openModal();
}

async function escSaveNew() {
  const ministry = currentMinistry();
  const title = document.getElementById('escNewTitle').value.trim();
  const date = document.getElementById('escNewDate').value;
  if (!title || !date) { showToast('Preencha título e data', 'error'); return; }
  try {
    const created = await apiPost('/schedules', {
      title,
      sectorName: ministry.name,
      date,
      timeStart: document.getElementById('escNewStart').value || '18:00',
      timeEnd: document.getElementById('escNewEnd').value || null,
      location: document.getElementById('escNewLoc').value.trim() || null,
      status: document.getElementById('escNewStatus').value,
      memberIds: [],
      createdById: (currentUser && currentUser.id) || 'admin',
    });
    closeModal();
    if (created && created.id) escActiveId = created.id;
    await renderEscalas();
    showToast('Escala criada!', 'success');
  } catch (e) { showToast('API indisponível', 'error'); }
}

function openMemberModal(id) {
  const member = id ? mockMembers.find(m => m.id === id) : null;
  document.getElementById('modalTitle').textContent = member ? 'Editar Membro' : 'Novo Membro';
  document.getElementById('modalBody').innerHTML = `
    <div class="form-group">
      <label>Nome Completo</label>
      <input type="text" id="memberName" value="${member ? member.name : ''}" placeholder="Ex: Joao da Silva">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Email</label>
        <input type="email" id="memberEmail" value="${member ? member.email : ''}" placeholder="email@exemplo.com">
      </div>
      <div class="form-group">
        <label>Telefone</label>
        <input type="tel" id="memberPhone" value="${member ? member.phone : ''}" placeholder="(00) 00000-0000">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Setor</label>
        <select id="memberSector">
          <option value="Louvor" ${member && member.sector === 'Louvor' ? 'selected' : ''}>Louvor</option>
          <option value="Midia" ${member && member.sector === 'Midia' ? 'selected' : ''}>Midia</option>
          <option value="Recepcao" ${member && member.sector === 'Recepcao' ? 'selected' : ''}>Recepcao</option>
          <option value="Infantil" ${member && member.sector === 'Infantil' ? 'selected' : ''}>Infantil</option>
          <option value="Intercessao" ${member && member.sector === 'Intercessao' ? 'selected' : ''}>Intercessao</option>
        </select>
      </div>
      <div class="form-group">
        <label>Cargo</label>
        <input type="text" id="memberRole" value="${member ? member.role : ''}" placeholder="Ex: Vocalista">
      </div>
    </div>
    <div class="modal-footer" style="padding:16px 0 0;border-top:1px solid #F3F4F6;margin-top:8px">
      <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn-primary" onclick="saveMember(${id ? `'${id}'` : 'null'})">
        <span class="material-symbols-outlined" style="font-size:18px">save</span> Salvar
      </button>
    </div>
  `;
  openModal();
}

function editMember(id) { openMemberModal(id); }

async function saveMember(id) {
  const name = document.getElementById('memberName').value.trim();
  const email = document.getElementById('memberEmail').value.trim();
  const phone = document.getElementById('memberPhone').value.trim();
  const sector = document.getElementById('memberSector').value;
  const role = document.getElementById('memberRole').value.trim();

  if (!name || !email || !phone || !role) { showToast('Preencha todos os campos', 'error'); return; }

  const sectorMap = { 'Louvor': 'louvor', 'Midia': 'midia', 'Recepcao': 'portaria', 'Infantil': 'infantil', 'Intercessao': 'intercessao' };
  const payload = { name, email, phone, sector, role, sectorName: sectorMap[sector] || 'louvor' };

  try {
    if (typeof apiPost === 'function' && apiOnline()) {
      if (id) await apiPost(`/people/${id}/update`, payload);
      else await apiPost('/people', { ...payload, createLogin: true, password: 'membro123', status: 'ACTIVE' });
      await hydrateFromApi();
      showToast(id ? 'Membro atualizado no banco!' : 'Membro cadastrado no banco!', 'success');
    } else {
      if (id) {
        const m = mockMembers.find(m => m.id === id);
        Object.assign(m, { name, email, phone, sector, role });
        showToast('Membro atualizado com sucesso!');
      } else {
        mockMembers.push({
          id: 'local-' + Date.now(), name, email, phone, sector, role,
          status: 'integracao', gender: 'm', voluntario: false, lider: false, pastoral: false,
          login: true, joined: new Date().toISOString().split('T')[0],
          tags: [sector], cell: null, attendance: 0, baptism: '—', churchTime: 'Novo membro', note: '',
        });
        showToast('Membro adicionado com sucesso!');
      }
    }
  } catch (e) {
    showToast('Erro ao salvar: API indisponível', 'error');
    return;
  }
  closeModal();
  renderMembers();
}

function deleteMember(id) {
  const m = mockMembers.find(m => m.id === id);
  document.getElementById('modalTitle').textContent = 'Excluir Membro';
  document.getElementById('modalBody').innerHTML = `
    <p style="margin-bottom:20px;color:#464555">Tem certeza que deseja excluir o membro <strong>${m ? m.name : ''}</strong>?</p>
    <div class="modal-footer" style="padding:16px 0 0;border-top:1px solid #F3F4F6;margin-top:8px">
      <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn-danger" onclick="confirmDeleteMember('${id}')">
        <span class="material-symbols-outlined" style="font-size:18px">delete</span> Excluir
      </button>
    </div>
  `;
  openModal();
}

async function confirmDeleteMember(id) {
  try {
    if (typeof apiPost === 'function' && apiOnline()) {
      await apiPost(`/people/${id}/delete`, {});
      await hydrateFromApi();
    } else {
      const idx = mockMembers.findIndex(m => m.id === id);
      if (idx > -1) mockMembers.splice(idx, 1);
    }
  } catch (e) { /* offline */ }
  if (selectedMemberId === id) selectedMemberId = null;
  closeModal();
  renderMembers();
  showToast('Membro excluido');
}

// ===== PRODUCTS =====
function renderProducts() {
  const search = document.getElementById('productSearch').value.toLowerCase();
  const category = document.getElementById('categoryFilter').value;
  const filtered = mockProducts.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search);
    const matchCat = !category || p.category === category;
    return matchSearch && matchCat;
  });

  const grid = document.getElementById('productsGrid');
  grid.innerHTML = filtered.map(p => `
    <div class="product-card">
      <div class="product-header">
        <div>
          <div class="product-name">${p.name}</div>
          <div class="product-category">${p.category}</div>
        </div>
        <div class="product-price">R$ ${p.price.toFixed(2)}</div>
      </div>
      <div class="product-actions">
        <button class="btn-secondary" onclick="editProduct(${p.id})">
          <span class="material-symbols-outlined" style="font-size:16px">edit</span> Editar
        </button>
        <button class="btn-danger" onclick="deleteProduct(${p.id})">
          <span class="material-symbols-outlined" style="font-size:16px">delete</span> Excluir
        </button>
      </div>
    </div>
  `).join('');

  if (filtered.length === 0) {
    grid.innerHTML = '<div class="empty-state"><span class="material-symbols-outlined">inventory_2</span><p>Nenhum produto encontrado</p></div>';
  }
}

function filterProducts() { renderProducts(); }

function openProductModal(id) {
  const product = id ? mockProducts.find(p => p.id === id) : null;
  document.getElementById('modalTitle').textContent = product ? 'Editar Produto' : 'Novo Produto';
  document.getElementById('modalBody').innerHTML = `
    <div class="form-group">
      <label>Nome do Produto</label>
      <input type="text" id="productName" value="${product ? product.name : ''}" placeholder="Ex: Cafe">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Preco (R$)</label>
        <input type="number" id="productPrice" value="${product ? product.price : ''}" step="0.50" min="0" placeholder="0.00">
      </div>
      <div class="form-group">
        <label>Categoria</label>
        <select id="productCategory">
          <option value="Bebidas" ${product && product.category === 'Bebidas' ? 'selected' : ''}>Bebidas</option>
          <option value="Lanches" ${product && product.category === 'Lanches' ? 'selected' : ''}>Lanches</option>
          <option value="Doces" ${product && product.category === 'Doces' ? 'selected' : ''}>Doces</option>
          <option value="Salgados" ${product && product.category === 'Salgados' ? 'selected' : ''}>Salgados</option>
        </select>
      </div>
    </div>
    <div class="modal-footer" style="padding:16px 0 0;border-top:1px solid #F3F4F6;margin-top:8px">
      <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn-primary" onclick="saveProduct(${id || 'null'})">
        <span class="material-symbols-outlined" style="font-size:18px">save</span> Salvar
      </button>
    </div>
  `;
  openModal();
}

function editProduct(id) { openProductModal(id); }

function saveProduct(id) {
  const name = document.getElementById('productName').value.trim();
  const price = parseFloat(document.getElementById('productPrice').value);
  const category = document.getElementById('productCategory').value;

  if (!name || isNaN(price) || price < 0) { showToast('Preencha todos os campos corretamente', 'error'); return; }

  if (id) {
    const p = mockProducts.find(p => p.id === id);
    Object.assign(p, { name, price, category });
    showToast('Produto atualizado com sucesso!');
  } else {
    mockProducts.push({ id: ++currentId, name, price, category, active: true });
    showToast('Produto adicionado com sucesso!');
  }
  closeModal();
  renderProducts();
}

function deleteProduct(id) {
  const p = mockProducts.find(p => p.id === id);
  document.getElementById('modalTitle').textContent = 'Excluir Produto';
  document.getElementById('modalBody').innerHTML = `
    <p style="margin-bottom:20px;color:#464555">Tem certeza que deseja excluir o produto <strong>${p.name}</strong>?</p>
    <div class="modal-footer" style="padding:16px 0 0;border-top:1px solid #F3F4F6;margin-top:8px">
      <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn-danger" onclick="confirmDeleteProduct(${id})">
        <span class="material-symbols-outlined" style="font-size:18px">delete</span> Excluir
      </button>
    </div>
  `;
  openModal();
}

function confirmDeleteProduct(id) {
  const idx = mockProducts.findIndex(p => p.id === id);
  if (idx > -1) mockProducts.splice(idx, 1);
  closeModal();
  renderProducts();
  showToast('Produto excluido');
}

// ===== ANNOUNCEMENTS =====
function renderAnnouncements() {
  const list = document.getElementById('announcementsList');
  const q = (annSearch || '').toLowerCase();
  const filtered = mockAnnouncements.filter(a => !q || a.title.toLowerCase().includes(q) || a.text.toLowerCase().includes(q));
  list.innerHTML = filtered.map(a => `
    <div class="announcement-card">
      <div class="announcement-icon" style="background:${a.color}20;color:${a.color}">
        <span class="material-symbols-outlined" style="font-size:22px">campaign</span>
      </div>
      <div class="announcement-content">
        <div class="announcement-title">${a.title}</div>
        <div class="announcement-text">${a.text}</div>
        <div class="announcement-date">${formatDate(a.date)}</div>
      </div>
      <div class="announcement-actions">
        <button class="btn-icon" onclick="editAnnouncement(${a.id})" title="Editar"><span class="material-symbols-outlined" style="font-size:18px">edit</span></button>
        <button class="btn-icon" onclick="deleteAnnouncement(${a.id})" title="Excluir"><span class="material-symbols-outlined" style="font-size:18px;color:#DC2626">delete</span></button>
      </div>
    </div>
  `).join('');

  if (filtered.length === 0) {
    list.innerHTML = '<div class="empty-state"><span class="material-symbols-outlined">campaign</span><p>Nenhum comunicado</p></div>';
  }
}

function openAnnouncementModal(id) {
  const ann = id ? mockAnnouncements.find(a => a.id === id) : null;
  document.getElementById('modalTitle').textContent = ann ? 'Editar Comunicado' : 'Novo Comunicado';
  document.getElementById('modalBody').innerHTML = `
    <div class="form-group">
      <label>Titulo</label>
      <input type="text" id="annTitle" value="${ann ? ann.title : ''}" placeholder="Ex: Aviso Importante">
    </div>
    <div class="form-group">
      <label>Texto</label>
      <textarea id="annText" rows="3" placeholder="Digite o comunicado...">${ann ? ann.text : ''}</textarea>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Data</label>
        <input type="date" id="annDate" value="${ann ? ann.date : new Date().toISOString().split('T')[0]}">
      </div>
      <div class="form-group">
        <label>Cor</label>
        <input type="color" id="annColor" value="${ann ? ann.color : '#103B5F'}">
      </div>
    </div>
    <div class="modal-footer" style="padding:16px 0 0;border-top:1px solid #F3F4F6;margin-top:8px">
      <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn-primary" onclick="saveAnnouncement(${id || 'null'})">
        <span class="material-symbols-outlined" style="font-size:18px">save</span> Salvar
      </button>
    </div>
  `;
  openModal();
}

function editAnnouncement(id) { openAnnouncementModal(id); }

function saveAnnouncement(id) {
  const title = document.getElementById('annTitle').value.trim();
  const text = document.getElementById('annText').value.trim();
  const date = document.getElementById('annDate').value;
  const color = document.getElementById('annColor').value;

  if (!title || !text || !date) { showToast('Preencha todos os campos', 'error'); return; }

  if (id) {
    const a = mockAnnouncements.find(a => a.id === id);
    Object.assign(a, { title, text, date, color });
    showToast('Comunicado atualizado com sucesso!');
  } else {
    mockAnnouncements.push({ id: ++currentId, title, text, date, color });
    showToast('Comunicado criado com sucesso!');
  }
  closeModal();
  renderAnnouncements();
}

function deleteAnnouncement(id) {
  const a = mockAnnouncements.find(a => a.id === id);
  document.getElementById('modalTitle').textContent = 'Excluir Comunicado';
  document.getElementById('modalBody').innerHTML = `
    <p style="margin-bottom:20px;color:#464555">Tem certeza que deseja excluir o comunicado <strong>${a.title}</strong>?</p>
    <div class="modal-footer" style="padding:16px 0 0;border-top:1px solid #F3F4F6;margin-top:8px">
      <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn-danger" onclick="confirmDeleteAnnouncement(${id})">
        <span class="material-symbols-outlined" style="font-size:18px">delete</span> Excluir
      </button>
    </div>
  `;
  openModal();
}

function confirmDeleteAnnouncement(id) {
  const idx = mockAnnouncements.findIndex(a => a.id === id);
  if (idx > -1) mockAnnouncements.splice(idx, 1);
  closeModal();
  renderAnnouncements();
  showToast('Comunicado excluido');
}

// ===== SETTINGS =====
function saveSettings() {
  showToast('Configuracoes salvas com sucesso!');
}

// Color inputs sync
document.addEventListener('DOMContentLoaded', function () {
  const pc = document.getElementById('appPrimaryColor');
  const ph = document.getElementById('appPrimaryHex');
  const sc = document.getElementById('appSecondaryColor');
  const sh = document.getElementById('appSecondaryHex');
  if (pc && ph) pc.addEventListener('input', () => ph.textContent = pc.value);
  if (sc && sh) sc.addEventListener('input', () => sh.textContent = sc.value);
});

// ===== MODAL =====
function openModal() { document.getElementById('modalOverlay').classList.add('open'); }
function closeModal() { document.getElementById('modalOverlay').classList.remove('open'); }

// ===== TOAST =====
function showToast(message, type) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast' + (type ? ' toast-' + type : '');
  toast.innerHTML = `
    <span class="material-symbols-outlined" style="font-size:18px">${type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'check_circle'}</span>
    ${message}
  `;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ===== HELPERS =====
function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ===== TEMA =====
function applyTheme(theme) {
  document.body.classList.toggle('theme-dark', theme === 'dark');
  localStorage.setItem('adminTheme', theme);
}

function toggleTheme() {
  const isDark = document.body.classList.contains('theme-dark');
  applyTheme(isDark ? 'light' : 'dark');
  showToast(isDark ? 'Tema claro ativado' : 'Tema escuro ativado');
  // Redesenha graficos com as cores do tema
  if (document.getElementById('section-dashboard').classList.contains('active')) {
    renderSectorChart();
    renderRevenueChart();
  }
}

// ===== DROPDOWNS =====
// Sob zoom CSS, valores px em elementos fixed sao multiplicados pelo zoom;
// converte posicoes visuais (clientX/rect) para unidades de layout.
function vzoom() {
  const z = parseFloat(getComputedStyle(document.documentElement).zoom);
  return (!isNaN(z) && z > 0) ? z : 1;
}

function closeDropdowns() {
  document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'));
}

function placeFloatingMenu(menu, event) {
  const z = vzoom();
  const wr = menu.getBoundingClientRect();
  const w = wr.width || menu.offsetWidth;
  const h = wr.height || menu.offsetHeight;
  const x = Math.max(12, Math.min(event.clientX - 40, window.innerWidth - w - 16));
  const y = Math.min(event.clientY + 10, window.innerHeight - h - 12);
  menu.style.left = (x / z) + 'px';
  menu.style.top = (y / z) + 'px';
  menu.style.right = 'auto';
}

function toggleAccountMenu(event) {
  event.stopPropagation();
  const menu = document.getElementById('accountMenu');
  const wasOpen = menu.classList.contains('open');
  closeDropdowns();
  if (!wasOpen) {
    menu.classList.add('open');
    placeFloatingMenu(menu, event);
  }
}

function accountGo(section) {
  closeDropdowns();
  navigateTo(section);
}

function toggleNotifications(event) {
  event.stopPropagation();
  const menu = document.getElementById('notifMenu');
  const wasOpen = menu.classList.contains('open');
  closeDropdowns();
  if (!wasOpen) {
    // alinha pelo botao da topbar
    const btn = event.currentTarget;
    const rect = btn.getBoundingClientRect();
    const z = vzoom();
    menu.style.position = 'fixed';
    menu.style.right = ((window.innerWidth - rect.right) / z) + 'px';
    menu.style.left = 'auto';
    menu.style.top = ((rect.bottom + 8) / z) + 'px';
    menu.classList.add('open');
  }
}

function toggleNovaAcao(event) {
  event.stopPropagation();
  const menu = document.getElementById('novaAcaoMenu');
  const wasOpen = menu.classList.contains('open');
  closeDropdowns();
  if (!wasOpen) menu.classList.add('open');
}

function markAllRead() {
  const badge = document.getElementById('notifBadge');
  if (badge) badge.style.display = 'none';
  document.querySelectorAll('.notif-dot').forEach(d => d.style.display = 'none');
  showToast('Notificacoes marcadas como lidas');
}

function runAction(section, fn) {
  closeDropdowns();
  navigateTo(section);
  setTimeout(() => { if (typeof fn === 'function') fn(); }, 60);
}

// ===== BUSCA POR MODULO =====
const MODULE_SEARCH = {
  dashboard: 'Buscar no Dashboard: membros, eventos e acoes...',
  pessoas: 'Buscar pessoas por nome, email ou telefone...',
  setores: 'Buscar setores e ministerios...',
  escalas: 'Buscar escalas de servico...',
  agenda: 'Buscar cultos e eventos por nome ou local...',
  avisos: 'Buscar comunicados...',
  'app-publico': 'Buscar no App Público...',
  cantina: 'Buscar produtos da cantina...',
  tesouraria: 'Buscar lancamentos financeiros...',
  relatorios: 'Buscar relatorios...',
  configuracoes: 'Buscar em configuracoes...',
};

function updateSearchPlaceholder(section) {
  const input = document.getElementById('topbarSearch');
  if (!input) return;
  input.placeholder = MODULE_SEARCH[section] || ('Buscar em ' + getSectionTitle(section) + '...');
  input.value = '';
  eventSearch = '';
  annSearch = '';
}

function handleModuleSearch(value) {
  const active = document.querySelector('.page-section.active');
  if (!active) return;
  const section = active.id.replace('section-', '');
  switch (section) {
    case 'pessoas': {
      const el = document.getElementById('memberSearch');
      if (el) { el.value = value; renderMembers(); }
      break;
    }
    case 'cantina': {
      const el = document.getElementById('productSearch');
      if (el) { el.value = value; renderProducts(); }
      break;
    }
    case 'agenda':
      eventSearch = value;
      renderEvents();
      break;
    case 'avisos':
      annSearch = value;
      renderAnnouncements();
      break;
    default:
      // demais modulos: busca ainda nao implementada
      break;
  }
}

function handleModuleSearchEnter() {
  const active = document.querySelector('.page-section.active');
  if (!active) return;
  const section = active.id.replace('section-', '');
  const handled = ['pessoas', 'cantina', 'agenda', 'avisos'];
  if (!handled.includes(section)) {
    showToast('Busca neste modulo em construcao', 'warning');
  }
}

// ===== CANTINA: ABERTA / FECHADA =====
function updateCantinaStatus() {
  const navStatus = document.getElementById('cantinaNavStatus');
  const pill = document.getElementById('cantinaStatusPill');
  const cls = cantinaAberta ? 'status-open' : 'status-closed';
  const txt = cantinaAberta ? 'Aberta' : 'Fechada';
  if (navStatus) {
    navStatus.className = 'nav-status ' + cls;
    navStatus.innerHTML = '<span class="status-dot"></span>' + txt;
  }
  if (pill) {
    pill.className = 'status-pill ' + cls;
    pill.innerHTML = '<span class="status-dot"></span>' + txt;
  }
}

function toggleCantinaStatus() {
  cantinaAberta = !cantinaAberta;
  updateCantinaStatus();
  showToast(cantinaAberta ? 'Cantina marcada como ABERTA' : 'Cantina marcada como FECHADA', cantinaAberta ? 'success' : 'warning');
}

// ===== PROXIMO CULTO (topbar) =====
function updateNextService() {
  const el = document.getElementById('nextServiceText');
  if (!el) return;
  const today = new Date().toISOString().split('T')[0];
  const upcoming = mockEvents
    .filter(e => e.status === 'upcoming' && e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
  const next = upcoming[0] || mockEvents.find(e => e.status === 'upcoming');
  if (!next) { el.textContent = 'Nenhum culto agendado'; return; }
  const d = new Date(next.date + 'T00:00:00');
  const weekday = d.toLocaleDateString('pt-BR', { weekday: 'long' });
  const hora = next.time.endsWith(':00') ? next.time.slice(0, 2) + 'h' : next.time;
  const confirmados = 85; // mock de confirmacao
  const dia = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  el.textContent = `Culto ${dia} ${hora}: ${confirmados}% Confirmados`;
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function () {
  currentUser = getSessionUser();
  if (!currentUser) {
    window.location.href = 'index.html';
    return;
  }

  // Tema
  applyTheme(localStorage.getItem('adminTheme') === 'dark' ? 'dark' : 'light');

  // Usuario + permissoes
  showUser();
  applyPermissions();
  initSidebar();

  // Cantina + proximo culto
  updateCantinaStatus();
  updateNextService();
  updateSearchPlaceholder('dashboard');

  // Icones lucide
  if (window.lucide) lucide.createIcons();

  renderDashboard();

  // Deep-link: dashboard.html#pessoas abre o modulo direto; #escalas/louvor abre o ministério
  const hashParts = (location.hash || '').replace('#', '').split('/');
  const deepLink = hashParts[0];
  if (deepLink && ALL_MODULES.includes(deepLink) && deepLink !== 'dashboard') {
    if (deepLink === 'escalas' && hashParts[1]) escMinistryName = hashParts[1];
    navigateTo(deepLink);
  }

  // Hidrata mocks com dados reais da API (banco local)
  if (typeof hydrateFromApi === 'function') {
    hydrateFromApi().then((ok) => {
      if (!ok) return;
      const activeSection = document.querySelector('.page-section.active');
      const activeId = activeSection ? activeSection.id.replace('section-', '') : 'dashboard';
      refreshSection(activeId);
      if (window.lucide) lucide.createIcons();
    });
  }

  // Fecha dropdowns ao clicar fora
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.dropdown') && !e.target.closest('.sidebar-user') && !e.target.closest('.topbar-right') && !e.target.closest('.dropdown-anchor')) {
      closeDropdowns();
    }
    if (!e.target.closest('.ministry-picker')) {
      const mpMenu = document.getElementById('ministryPickerMenu');
      if (mpMenu) mpMenu.style.display = 'none';
    }
  });

  // Ctrl/Cmd + K foca a busca
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      const input = document.getElementById('topbarSearch');
      if (input) input.focus();
    }
  });

  window.addEventListener('resize', () => {
    const active = document.querySelector('.nav-item.active');
    if (active && active.dataset.section === 'dashboard') {
      renderSectorChart();
      renderRevenueChart();
    }
  });
});

// Close modal on Escape
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') { closeModal(); closeDropdowns(); }
});
