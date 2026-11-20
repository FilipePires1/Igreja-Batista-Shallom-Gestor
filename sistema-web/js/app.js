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
// Login unico via API (admin@nextep.com). Novos acessos sao criados em Pessoas.
const USERS = [];

const ALL_MODULES = ['dashboard', 'pessoas', 'batismos', 'setores', 'escalas', 'agenda', 'atas', 'avisos', 'app-publico', 'cantina', 'tesouraria', 'relatorios', 'configuracoes'];

// Papéis do sistema: admin master, pastor e membro.
// Membro só entra se tiver acesso liberado (líder de ministério ou autorizado pelo pastor).
const ROLE_ACCESS = {
  admin: [...ALL_MODULES],
  pastor: [...ALL_MODULES],
  membro: ['dashboard', 'escalas', 'agenda', 'avisos', 'configuracoes'],
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
  if (localStorage.getItem('loggedIn') === 'true') return USERS[0] || null; // compatibilidade com sessões antigas
  return null;
}

function canAccess(section) {
  if (!currentUser) return false;
  if (section === 'setores') {
    if (isFullAccess()) return true;
    return currentUserLedSectors().length > 0;
  }
  if (section === 'ministerio') {
    if (['admin', 'pastor'].includes(currentUser.role)) return true;
    const sector = (window.apiSectors || []).find(s => s.id === ministryPageId);
    return !!(sector && currentUser.id && ((sector.leaderUserIds || []).includes(currentUser.id) || sector.leaderUserId === currentUser.id));
  }
  const keyMap = { 'novo-membro': 'pessoas', 'batismo-form': 'batismos', 'ata-form': 'atas', 'ata-view': 'atas' };
  const key = keyMap[section] || section;
  const allowed = ROLE_ACCESS[currentUser.role] || [];
  return allowed.includes(key);
}

function currentUserLedSectors() {
  const uid = currentUser && currentUser.id;
  if (!uid) return [];
  return (window.apiSectors || []).filter(s =>
    (s.leaderUserIds || []).includes(uid) || s.leaderUserId === uid
  );
}

// Papel do usuário logado no formato aceito pela API.
function apiActorRole() {
  if (!currentUser) return '';
  if (currentUser.role === 'admin') return 'SUPER_ADMIN';
  if (currentUser.role === 'pastor') return 'PASTOR';
  const names = currentUser.apiRoles || [];
  if (names.includes('SUPER_ADMIN')) return 'SUPER_ADMIN';
  if (names.includes('PASTOR')) return 'PASTOR';
  return '';
}

// Somente admin master e pastor podem conceder/revogar acesso.
function canManageAccess() {
  return !!currentUser && ['admin', 'pastor'].includes(currentUser.role);
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
    batismos: 'Batismos',
    'batismo-form': 'Ficha de Batismo',
    setores: 'Setores & Ministérios',
    ministerio: 'Gerenciar Ministério',
    escalas: 'Escalas de Serviço',
    'novo-membro': 'Cadastro de Membro',
    agenda: 'Agenda & Cultos',
    atas: 'Atas & Assembleias',
    'ata-form': 'Registro de Ata',
    'ata-view': 'Visualizar Ata',
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
  if (section === 'novo-membro' || section === 'ministerio' || section === 'batismo-form' || section === 'ata-form' || section === 'ata-view') { _doRenderSection(section); return; }
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
    case 'batismos': renderBaptisms(); break;
    case 'batismo-form': renderBaptismFormPage(); break;
    case 'atas': renderMinutes(); break;
    case 'ata-form': renderMinuteFormPage(); break;
    case 'ata-view': renderMinuteViewPage(); break;
    case 'novo-membro': renderMemberFormPage(); break;
    case 'setores': renderSetores(); break;
    case 'ministerio': renderMinistryPage(); break;
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
  fetch('/api/auth/logout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }).catch(() => {});
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
  const pct = total ? Math.round((conf / total) * 100) : 0;
  const ev = nextEvent();
  const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  setText('kpiShifts', pct + '%');
  if (ev) {
    const dia = DIAS[new Date(`${ev.date}T12:00:00`).getDay()] || '';
    setText('kpiShiftsHint', `${dia} ${ev.time.replace(':00', 'h').replace(':', 'h')}`);
  } else {
    setText('kpiShiftsHint', 'Sem cultos agendados');
  }
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
  const grid = document.getElementById('squadGrid');
  if (!ev) {
    setText('nextCultoTitle', 'Nenhum culto agendado');
    setText('nextCultoChip', 'Agenda vazia');
    setText('nextCultoSub', 'Cadastre um evento na Agenda para ver a escala');
    if (grid) grid.innerHTML = '';
    return;
  }
  setText('nextCultoTitle', `Próximo ${ev.name}`);
  setText('nextCultoChip', `${shortDate(ev.date)} · ${ev.time.replace(':', 'h')}`);
  setText('nextCultoSub', 'App de Membros & Escalas · Monitoramento de presença');

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
  if (!ev) {
    card.style.display = 'none';
    return;
  }
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

// ===== AGENDA & CULTOS =====
const AGENDA_TYPE_META = {
  CULTO: { label: 'Culto', icon: 'church', color: '#103B5F' },
  CONFERENCIA: { label: 'Conferência', icon: 'mic-vocal', color: '#7C3AED' },
  ENSAIO: { label: 'Ensaio', icon: 'music', color: '#16A2AD' },
  REUNIAO: { label: 'Reunião', icon: 'users', color: '#D97706' },
  ESCALA: { label: 'Escala', icon: 'clipboard-check', color: '#059669' },
  RESERVA: { label: 'Reserva', icon: 'door-open', color: '#64748B' },
  EVENTO: { label: 'Evento', icon: 'calendar-days', color: '#2C7FBF' },
};

const AGENDA_DEFAULT_SPACES = ['Auditório Principal', 'Sala Multiuso', 'Estúdio de Gravação'];
let agendaView = 'month';
let agendaCursor = new Date();
let agendaSpaceFilter = 'all';

function agendaPad(n) { return String(n).padStart(2, '0'); }
function agendaIso(date) {
  return `${date.getFullYear()}-${agendaPad(date.getMonth() + 1)}-${agendaPad(date.getDate())}`;
}
function agendaTodayISO() { return agendaIso(new Date()); }
function agendaParseDate(iso) {
  const p = String(iso || '').split('-').map(Number);
  return new Date(p[0] || 2000, (p[1] || 1) - 1, p[2] || 1);
}
function agendaStartOfWeek(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - d.getDay());
}
function agendaAddDays(date, days) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}
function agendaTagList() {
  const tags = (window.apiEventTags || []).filter(t => t && t.isActive !== false);
  if (tags.length) {
    return tags.map(t => ({ key: t.key, label: t.label, color: t.color || '#2C7FBF', icon: t.icon || 'tag' }));
  }
  return Object.keys(AGENDA_TYPE_META).map(key => ({ key, ...AGENDA_TYPE_META[key] }));
}

function agendaTypeMeta(type) {
  const key = String(type || 'EVENTO').toUpperCase();
  const tag = agendaTagList().find(t => String(t.key).toUpperCase() === key || normHeader(t.label) === normHeader(type));
  if (tag) return tag;
  return AGENDA_TYPE_META[key] || AGENDA_TYPE_META.EVENTO;
}
function agendaCap(s) { return String(s || '').charAt(0).toUpperCase() + String(s || '').slice(1); }
function agendaMonthName(date) {
  return agendaCap(date.toLocaleDateString('pt-BR', { month: 'long' }));
}
function agendaWeekday(date) {
  return agendaCap(date.toLocaleDateString('pt-BR', { weekday: 'long' }));
}
function agendaLongDate(iso) {
  const d = agendaParseDate(iso);
  return `${agendaWeekday(d)}, ${d.getDate()} de ${agendaMonthName(d).toLowerCase()} de ${d.getFullYear()}`;
}
function agendaSeason(date) {
  const m = date.getMonth();
  if (m >= 2 && m <= 4) return 'Outono';
  if (m >= 5 && m <= 7) return 'Inverno';
  if (m >= 8 && m <= 10) return 'Primavera';
  return 'Verão';
}
function agendaShortLocation(location) {
  const value = String(location || '');
  return value.length > 24 ? value.slice(0, 23) + '…' : value;
}

function agendaEventItems() {
  return (mockEvents || [])
    .filter(e => e && e.date)
    .map(e => ({
      key: 'e:' + e.id,
      source: 'event',
      id: e.id,
      title: e.name,
      date: e.date,
      timeStart: e.time || '',
      timeEnd: e.timeEnd || '',
      location: e.location || 'Templo Principal',
      type: e.type || 'EVENTO',
      status: e.apiStatus || (e.status === 'past' ? 'DONE' : 'SCHEDULED'),
      description: e.description || '',
      isPublic: !!e.isPublic,
      capacity: e.capacity || null,
      liveUrl: e.liveUrl || '',
      sectorLabel: e.sectorLabel || '',
      rsvps: e.rsvps || 0,
      raw: e,
    }));
}

function agendaScheduleItems() {
  return (window.apiSchedules || [])
    .filter(s => s && s.date)
    .map(s => {
      const title = String(s.title || 'Escala');
      let type = 'ESCALA';
      if (/ensaio/i.test(title)) type = 'ENSAIO';
      else if (/reuni/i.test(title)) type = 'REUNIAO';
      return {
        key: 's:' + s.id,
        source: 'schedule',
        id: s.id,
        title,
        date: String(s.date).slice(0, 10),
        timeStart: s.timeStart || '',
        timeEnd: s.timeEnd || '',
        location: s.location || 'Templo Principal',
        type,
        status: s.status || 'DRAFT',
        sectorLabel: (s.sector && s.sector.label) || '',
        sectorName: (s.sector && s.sector.name) || '',
        raw: s,
      };
    });
}

function agendaAllItems() {
  return [...agendaEventItems(), ...agendaScheduleItems()];
}

function agendaFilteredItems() {
  const q = (eventSearch || '').trim().toLowerCase();
  return agendaAllItems().filter(item => {
    if (agendaSpaceFilter !== 'all' && (item.location || '') !== agendaSpaceFilter) return false;
    if (!q) return true;
    return `${item.title} ${item.location || ''} ${item.sectorLabel || ''}`.toLowerCase().includes(q);
  });
}

function agendaItemsInMonth(items, date) {
  const prefix = `${date.getFullYear()}-${agendaPad(date.getMonth() + 1)}`;
  return items.filter(i => String(i.date).startsWith(prefix));
}

function agendaItemsInRange(items, start, end) {
  const a = agendaIso(start);
  const b = agendaIso(end);
  return items.filter(i => i.date >= a && i.date <= b);
}

function agendaItemsOnDay(items, iso) {
  return items.filter(i => i.date === iso).sort((a, b) => String(a.timeStart).localeCompare(String(b.timeStart)));
}

function agendaSpaceRecords() {
  const list = (window.apiSpaces || []).filter(s => s && s.isActive !== false);
  if (list.length) return list;
  return AGENDA_DEFAULT_SPACES.map((name, i) => ({ id: '', name, description: '', order: i }));
}

function agendaSpaces() {
  const set = new Set(agendaSpaceRecords().map(s => s.name));
  agendaAllItems().forEach(item => { if (item.location) set.add(item.location); });
  return [...set].sort((a, b) => String(a).localeCompare(String(b), 'pt-BR'));
}

function agendaSpaceMenuLabel() {
  return agendaSpaceFilter === 'all' ? 'Filtrar Espaço' : agendaShortLocation(agendaSpaceFilter);
}

function renderAgendaSpaceMenu() {
  const menu = document.getElementById('agendaSpaceMenu');
  if (!menu) return;
  const spaces = agendaSpaces();
  menu.innerHTML = `
    <div class="dropdown-label">Espaços</div>
    <div class="dropdown-item ${agendaSpaceFilter === 'all' ? 'active' : ''}" onclick="setAgendaSpaceFilter('all')">
      <i data-lucide="layers"></i> Todos os espaços
    </div>
    ${spaces.map(space => `
      <div class="dropdown-item ${agendaSpaceFilter === space ? 'active' : ''}" onclick="setAgendaSpaceFilter('${encodeURIComponent(space)}')">
        <i data-lucide="map-pin"></i> ${escHtml(space)}
      </div>`).join('')}`;
}

function toggleAgendaSpaceMenu(event) {
  if (event) event.stopPropagation();
  const menu = document.getElementById('agendaSpaceMenu');
  if (!menu) return;
  const wasOpen = menu.classList.contains('open');
  closeDropdowns();
  if (!wasOpen) {
    renderAgendaSpaceMenu();
    menu.classList.add('open');
  }
}

function setAgendaSpaceFilter(value) {
  agendaSpaceFilter = value === 'all' ? 'all' : decodeURIComponent(value);
  closeDropdowns();
  renderEvents();
}

function agendaNavigate(direction) {
  if (agendaView === 'week') agendaCursor = agendaAddDays(agendaCursor, direction * 7);
  else if (agendaView === 'day') agendaCursor = agendaAddDays(agendaCursor, direction);
  else agendaCursor = new Date(agendaCursor.getFullYear(), agendaCursor.getMonth() + direction, 1);
  renderEvents();
}

function agendaGoToday() {
  agendaCursor = new Date();
  renderEvents();
}

function setAgendaView(view) {
  agendaView = view;
  renderEvents();
}

function agendaOpenDay(iso) {
  agendaCursor = agendaParseDate(iso);
  agendaView = 'day';
  renderEvents();
}

function renderAgendaChrome(items, rangeItems) {
  const cursor = agendaCursor;
  let label = `${agendaMonthName(cursor)} ${cursor.getFullYear()}`;
  if (agendaView === 'week') {
    const start = agendaStartOfWeek(cursor);
    const end = agendaAddDays(start, 6);
    label = `${start.getDate()} ${agendaMonthName(start).slice(0, 3)} – ${end.getDate()} ${agendaMonthName(end).slice(0, 3)} ${end.getFullYear()}`;
  } else if (agendaView === 'day') {
    label = `${agendaWeekday(cursor)}, ${cursor.getDate()} de ${agendaMonthName(cursor)}`;
  }
  setText('agendaMonthLabel', label);
  setText('agendaSpaceLabel', agendaSpaceMenuLabel());
  const events = rangeItems.filter(i => i.source === 'event').length;
  const schedules = rangeItems.filter(i => i.source === 'schedule').length;
  const filterNote = agendaSpaceFilter !== 'all' ? ` · ${agendaShortLocation(agendaSpaceFilter)}` : '';
  setText('agendaSummary', `${rangeItems.length} compromisso${rangeItems.length === 1 ? '' : 's'} no período · ${events} evento${events === 1 ? '' : 's'} · ${schedules} escala${schedules === 1 ? '' : 's'}${filterNote}`);
  document.querySelectorAll('#agendaViewSwitch button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === agendaView);
  });
}

function renderAgendaLegend() {
  const box = document.getElementById('agendaLegend');
  if (!box) return;
  const tags = agendaTagList().filter(t => t.key !== 'ESCALA');
  box.innerHTML = tags.map(tag => {
    return `<span class="agenda-legend-item"><span class="agenda-dot" style="background:${tag.color}"></span>${escHtml(tag.label)}</span>`;
  }).join('');
}

function agendaChipHTML(item) {
  const meta = agendaTypeMeta(item.type);
  const time = item.timeStart ? String(item.timeStart).slice(0, 5).replace(':', 'h') : '';
  return `<button type="button" class="agenda-ev" style="border-left-color:${meta.color};background:${meta.color}14" onclick="event.stopPropagation();openAgendaItem('${item.key}')" title="${escHtml(item.title)} — ${escHtml(item.location || '')}">
    <span class="agenda-ev-time">${escHtml(time)}</span>
    <span class="agenda-ev-title">${escHtml(item.title)}</span>
  </button>`;
}

function agendaEmptyHTML(icon, title, text, ctaLabel, ctaAction) {
  return `<div class="agenda-empty">
    <i data-lucide="${icon}"></i>
    <strong>${escHtml(title)}</strong>
    <p>${escHtml(text)}</p>
    ${ctaLabel ? `<button class="btn-secondary" onclick="${ctaAction}">${escHtml(ctaLabel)}</button>` : ''}
  </div>`;
}

function renderAgendaMonth(items) {
  const body = document.getElementById('agendaCalendarBody');
  if (!body) return;
  const year = agendaCursor.getFullYear();
  const month = agendaCursor.getMonth();
  const first = new Date(year, month, 1);
  const start = agendaStartOfWeek(first);
  const last = new Date(year, month + 1, 0);
  const totalDays = Math.ceil((last.getDate() + first.getDay()) / 7) * 7;
  const today = agendaTodayISO();
  const weekdays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
  let html = `<div class="agenda-weekdays">${weekdays.map(d => `<span>${d}</span>`).join('')}</div>`;
  html += `<div class="agenda-month-grid">`;
  for (let i = 0; i < totalDays; i++) {
    const day = agendaAddDays(start, i);
    const iso = agendaIso(day);
    const dayItems = agendaItemsOnDay(items, iso);
    const other = day.getMonth() !== month;
    const chips = dayItems.slice(0, 3).map(agendaChipHTML).join('');
    const more = dayItems.length > 3 ? `<button class="agenda-more" onclick="event.stopPropagation();agendaOpenDay('${iso}')">+${dayItems.length - 3} mais</button>` : '';
    html += `<div class="agenda-day ${other ? 'is-other-month' : ''} ${iso === today ? 'is-today' : ''}" onclick="openEventModal(null,'${iso}')">
      <div class="agenda-day-head">
        <span class="agenda-day-num">${day.getDate()}</span>
        ${iso === today ? '<span class="agenda-today-tag">Hoje</span>' : ''}
        <span class="agenda-day-add" title="Novo evento"><i data-lucide="plus"></i></span>
      </div>
      <div class="agenda-day-events">${chips}${more}</div>
    </div>`;
  }
  html += `</div>`;
  body.innerHTML = html;
}

function renderAgendaWeek(items) {
  const body = document.getElementById('agendaCalendarBody');
  if (!body) return;
  const start = agendaStartOfWeek(agendaCursor);
  const today = agendaTodayISO();
  let html = `<div class="agenda-week-grid">`;
  for (let i = 0; i < 7; i++) {
    const day = agendaAddDays(start, i);
    const iso = agendaIso(day);
    const dayItems = agendaItemsOnDay(items, iso);
    html += `<div class="agenda-week-col ${iso === today ? 'is-today' : ''}">
      <button type="button" class="agenda-week-dayhead" onclick="agendaOpenDay('${iso}')">
        <span class="agenda-week-dow">${['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'][i]}</span>
        <strong>${day.getDate()}</strong>
        <small>${agendaMonthName(day).slice(0, 3)}</small>
      </button>
      <div class="agenda-week-events">
        ${dayItems.map(agendaChipHTML).join('') || '<span class="agenda-week-empty">Sem compromissos</span>'}
      </div>
      <button type="button" class="agenda-week-add" onclick="openEventModal(null,'${iso}')"><i data-lucide="plus"></i></button>
    </div>`;
  }
  html += `</div>`;
  body.innerHTML = html;
}

function renderAgendaDay(items) {
  const body = document.getElementById('agendaCalendarBody');
  if (!body) return;
  const iso = agendaIso(agendaCursor);
  const dayItems = agendaItemsOnDay(items, iso);
  body.innerHTML = `
    <div class="agenda-day-view">
      <div class="agenda-day-view-head">
        <div>
          <strong>${escHtml(agendaLongDate(iso))}</strong>
          <small>${dayItems.length} compromisso${dayItems.length === 1 ? '' : 's'}</small>
        </div>
        <button class="btn-primary btn-sm" onclick="openEventModal(null,'${iso}')"><i data-lucide="plus"></i> Novo evento</button>
      </div>
      ${dayItems.length ? dayItems.map(item => agendaRowHTML(item, true)).join('') : agendaEmptyHTML('calendar-x', 'Nenhum compromisso neste dia', 'Crie um evento ou escolha outra data no calendário.', 'Novo evento neste dia', `openEventModal(null,'${iso}')`)}
    </div>`;
}

function agendaRowHTML(item, showDate) {
  const meta = agendaTypeMeta(item.type);
  const date = agendaParseDate(item.date);
  const status = agendaStatusLabel(item);
  return `<button type="button" class="agenda-row" onclick="openAgendaItem('${item.key}')">
    <span class="agenda-row-date">
      <strong>${date.getDate()}</strong>
      <small>${agendaMonthName(date).slice(0, 3)}</small>
    </span>
    <span class="agenda-row-time">${escHtml(item.timeStart || '—')}${item.timeEnd ? ' – ' + escHtml(item.timeEnd) : ''}</span>
    <span class="agenda-row-dot" style="background:${meta.color}"></span>
    <span class="agenda-row-info">
      <strong>${escHtml(item.title)}</strong>
      <small>${escHtml(item.location || 'Sem local')}${item.sectorLabel ? ' · ' + escHtml(item.sectorLabel) : ''}</small>
    </span>
    <span class="pill ${status.cls}">${status.label}</span>
    <i data-lucide="chevron-right" class="agenda-row-chev"></i>
  </button>`;
}

function agendaStatusLabel(item) {
  if (item.source === 'event') {
    const s = String(item.status || '').toUpperCase();
    if (s === 'CANCELED' || s === 'CANCELLED') return { label: 'Cancelado', cls: 'pill-red' };
    if (s === 'DONE' || s === 'FINISHED') return { label: 'Realizado', cls: 'pill-gray' };
    if (item.date < agendaTodayISO()) return { label: 'Realizado', cls: 'pill-gray' };
    return { label: 'Confirmado', cls: 'pill-green' };
  }
  const s = String(item.status || '').toUpperCase();
  if (s === 'PUBLISHED') return { label: 'Publicada', cls: 'pill-green' };
  if (s === 'CONFIRMED') return { label: 'Confirmada', cls: 'pill-blue' };
  return { label: 'Rascunho', cls: 'pill-orange' };
}

function renderAgendaList(items) {
  const body = document.getElementById('agendaCalendarBody');
  if (!body) return;
  const monthItems = agendaItemsInMonth(items, agendaCursor).sort((a, b) =>
    String(a.date + (a.timeStart || '')).localeCompare(String(b.date + (b.timeStart || ''))));
  if (!monthItems.length) {
    body.innerHTML = agendaEmptyHTML('calendar-x', 'Nenhum compromisso neste mês', 'Cadastre um culto, evento ou ensaio para começar.', 'Novo evento ou culto', 'openEventModal()');
    return;
  }
  body.innerHTML = `<div class="agenda-list">${monthItems.map(item => agendaRowHTML(item, true)).join('')}</div>`;
}

function renderEvents() {
  const items = agendaFilteredItems();
  let rangeItems = items;
  if (agendaView === 'week') {
    const start = agendaStartOfWeek(agendaCursor);
    rangeItems = agendaItemsInRange(items, start, agendaAddDays(start, 6));
  } else if (agendaView === 'day') {
    rangeItems = agendaItemsOnDay(items, agendaIso(agendaCursor));
  } else {
    rangeItems = agendaItemsInMonth(items, agendaCursor);
  }
  renderAgendaChrome(items, rangeItems);
  if (agendaView === 'month') renderAgendaMonth(items);
  else if (agendaView === 'week') renderAgendaWeek(items);
  else if (agendaView === 'day') renderAgendaDay(items);
  else renderAgendaList(items);
  renderAgendaLegend();
  renderAgendaSide();
  if (window.lucide) lucide.createIcons();
}

function openAgendaItem(key) {
  const item = agendaAllItems().find(i => i.key === key);
  if (!item) return;
  if (item.source === 'schedule') openAgendaScheduleDetail(item);
  else openAgendaEventDetail(item);
}

function openAgendaEventDetail(item) {
  const meta = agendaTypeMeta(item.type);
  const date = agendaParseDate(item.date);
  const status = agendaStatusLabel(item);
  document.getElementById('modalTitle').textContent = item.title;
  document.getElementById('modalBody').innerHTML = `
    <div class="agenda-detail">
      <div class="agenda-detail-top">
        <span class="pill" style="background:${meta.color}18;color:${meta.color}"><i data-lucide="${meta.icon}" style="width:13px;height:13px"></i> ${meta.label}</span>
        <span class="pill ${status.cls}">${status.label}</span>
        ${item.isPublic ? '<span class="pill pill-blue">Público</span>' : '<span class="pill pill-gray">Interno</span>'}
      </div>
      <div class="agenda-detail-meta">
        <span><i data-lucide="calendar-days"></i>${escHtml(agendaLongDate(item.date))}</span>
        <span><i data-lucide="clock-3"></i>${escHtml(item.timeStart || '—')}${item.timeEnd ? ' às ' + escHtml(item.timeEnd) : ''}</span>
        <span><i data-lucide="map-pin"></i>${escHtml(item.location || 'Local não informado')}</span>
        ${item.sectorLabel ? `<span><i data-lucide="network"></i>${escHtml(item.sectorLabel)}</span>` : ''}
        ${item.capacity ? `<span><i data-lucide="users"></i>Capacidade: ${item.capacity}</span>` : ''}
      </div>
      ${item.description ? `<p class="agenda-detail-desc">${escHtml(item.description)}</p>` : ''}
      ${item.liveUrl ? `<a class="agenda-live-link" href="${escHtml(item.liveUrl)}" target="_blank" rel="noopener"><i data-lucide="radio"></i> Abrir transmissão</a>` : ''}
      <div class="agenda-detail-actions">
        <button class="btn-danger" onclick="deleteEvent('${item.id}')"><i data-lucide="trash-2"></i> Excluir</button>
        <button class="btn-primary" onclick="editEvent('${item.id}')"><i data-lucide="pencil"></i> Editar evento</button>
      </div>
    </div>`;
  openModal();
}

function openAgendaScheduleDetail(item) {
  const status = agendaStatusLabel(item);
  document.getElementById('modalTitle').textContent = item.title;
  document.getElementById('modalBody').innerHTML = `
    <div class="agenda-detail">
      <div class="agenda-detail-top">
        <span class="pill" style="background:${agendaTypeMeta(item.type).color}18;color:${agendaTypeMeta(item.type).color}">${agendaTypeMeta(item.type).label}</span>
        <span class="pill ${status.cls}">${status.label}</span>
      </div>
      <div class="agenda-detail-meta">
        <span><i data-lucide="calendar-days"></i>${escHtml(agendaLongDate(item.date))}</span>
        <span><i data-lucide="clock-3"></i>${escHtml(item.timeStart || '—')}${item.timeEnd ? ' às ' + escHtml(item.timeEnd) : ''}</span>
        <span><i data-lucide="map-pin"></i>${escHtml(item.location || 'Templo Principal')}</span>
        ${item.sectorLabel ? `<span><i data-lucide="network"></i>${escHtml(item.sectorLabel)}</span>` : ''}
      </div>
      <div class="agenda-detail-actions">
        <button class="btn-primary" onclick="openAgendaScheduleInEscalas('${item.id}','${encodeURIComponent(item.sectorName || '')}')"><i data-lucide="calendar-check"></i> Abrir escala</button>
      </div>
    </div>`;
  openModal();
}

function openAgendaScheduleInEscalas(scheduleId, sectorName) {
  closeModal();
  escMinistryName = sectorName ? decodeURIComponent(sectorName) : null;
  escActiveId = scheduleId;
  navigateTo('escalas');
}

function agendaTypeOptions(selected) {
  return Object.keys(AGENDA_TYPE_META)
    .filter(type => type !== 'ESCALA')
    .map(type => `<option value="${type}" ${selected === type ? 'selected' : ''}>${AGENDA_TYPE_META[type].label}</option>`).join('');
}

function agendaTagChipsHTML(selected) {
  return agendaTagList()
    .filter(t => t.key !== 'ESCALA')
    .map(t => `<button type="button" class="agenda-tag-option ${t.key === selected ? 'selected' : ''}" style="--tag-color:${t.color}" onclick="selectAgendaTag('${t.key}')">
      <span class="agenda-tag-check"><i data-lucide="check"></i></span>
      <span>${escHtml(t.label)}</span>
    </button>`).join('');
}

function selectAgendaTag(key) {
  const input = document.getElementById('eventType');
  if (input) input.value = key;
  document.querySelectorAll('#eventTagPicker .agenda-tag-option').forEach(btn => {
    btn.classList.toggle('selected', btn.textContent.trim() === (agendaTypeMeta(key).label || '').trim() || btn.getAttribute('onclick').includes(`'${key}'`));
  });
}

async function createEventTagInline() {
  const labelEl = document.getElementById('newTagLabel');
  const colorEl = document.getElementById('newTagColor');
  const label = labelEl ? labelEl.value.trim() : '';
  if (!label) { showToast('Informe o nome da etiqueta', 'error'); return; }
  try {
    const created = await apiPost('/event-tags', { label, color: colorEl ? colorEl.value : '#2C7FBF' });
    const tags = await apiGet('/event-tags');
    window.apiEventTags = Array.isArray(tags) ? tags : [];
    const picker = document.getElementById('eventTagPicker');
    if (picker) {
      picker.innerHTML = agendaTagChipsHTML(created.key);
      const hidden = document.getElementById('eventType');
      if (hidden) hidden.value = created.key;
      if (window.lucide) lucide.createIcons();
    }
    if (labelEl) labelEl.value = '';
    renderAgendaLegend();
    showToast('Etiqueta criada e selecionada', 'success');
  } catch (e) {
    showToast((e && e.message) || 'Não foi possível criar a etiqueta', 'error');
  }
}

function openEventModal(id, presetDate, presetType, presetLocation) {
  const event = id ? mockEvents.find(e => String(e.id) === String(id)) : null;
  const date = presetDate || (event ? event.date : agendaTodayISO());
  const type = presetType || (event ? event.type : 'CULTO');
  const location = presetLocation ? decodeURIComponent(presetLocation) : (event ? event.location : '');
  const title = event ? event.name : '';
  const start = event ? event.time : '18:00';
  const end = event ? (event.timeEnd || '') : '20:00';
  const sectorOptions = ['<option value="">Sem ministério específico</option>']
    .concat((mockDepartments || []).map(d => `<option value="${d._apiId || d.id}" ${event && event.sectorId === (d._apiId || d.id) ? 'selected' : ''}>${escHtml(d.name)}</option>`))
    .join('');
  document.getElementById('modalTitle').textContent = event ? 'Editar evento' : 'Novo evento ou culto';
  document.getElementById('modalBody').innerHTML = `
    <div class="agenda-form">
      <div class="form-group nm-full">
        <label>Nome do evento *</label>
        <input type="text" id="eventName" value="${escHtml(title)}" placeholder="Ex.: Culto de Celebração">
      </div>
      <div class="form-group nm-full">
        <label>Etiqueta do evento *</label>
        <input type="hidden" id="eventType" value="${escHtml(type)}">
        <div class="agenda-tag-picker" id="eventTagPicker">${agendaTagChipsHTML(type)}</div>
        <div class="agenda-tag-create">
          <input type="text" id="newTagLabel" placeholder="Nova etiqueta (ex.: Vigília)">
          <input type="color" id="newTagColor" value="#2C7FBF">
          <button type="button" class="btn-ghost btn-sm" onclick="createEventTagInline()"><i data-lucide="plus"></i> Criar etiqueta</button>
        </div>
        <span class="nm-hint">Clique na etiqueta para selecionar. Você pode criar novas etiquetas.</span>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Ministério responsável</label>
          <select id="eventSector">${sectorOptions}</select>
        </div>
        <div class="form-group">
          <label>Status</label>
          <select id="eventStatus">
            <option value="SCHEDULED" ${!event || event.apiStatus === 'SCHEDULED' ? 'selected' : ''}>Agendado</option>
            <option value="CONFIRMED" ${event && event.apiStatus === 'CONFIRMED' ? 'selected' : ''}>Confirmado</option>
            <option value="CANCELED" ${event && event.apiStatus === 'CANCELED' ? 'selected' : ''}>Cancelado</option>
            <option value="DONE" ${event && event.apiStatus === 'DONE' ? 'selected' : ''}>Realizado</option>
          </select>
        </div>
      </div>
      <div class="form-row agenda-form-row-3">
        <div class="form-group">
          <label>Data *</label>
          <input type="date" id="eventDate" value="${escHtml(date)}">
        </div>
        <div class="form-group">
          <label>Início *</label>
          <input type="time" id="eventTime" value="${escHtml(start)}">
        </div>
        <div class="form-group">
          <label>Término</label>
          <input type="time" id="eventTimeEnd" value="${escHtml(end)}">
        </div>
      </div>
      <div class="form-group">
        <label>Local</label>
        <input type="text" id="eventLocation" list="agendaLocationList" value="${escHtml(location)}" placeholder="Ex.: Auditório Principal">
        <datalist id="agendaLocationList">${agendaSpaces().map(s => `<option value="${escHtml(s)}"></option>`).join('')}</datalist>
      </div>
      <div class="form-group">
        <label>Descrição</label>
        <textarea id="eventDescription" rows="2" placeholder="Detalhes do evento ou culto">${escHtml(event ? event.description : '')}</textarea>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Capacidade</label>
          <input type="number" min="0" id="eventCapacity" value="${event && event.capacity ? event.capacity : ''}" placeholder="Opcional">
        </div>
        <div class="form-group">
          <label>Link da transmissão</label>
          <input type="url" id="eventLiveUrl" value="${escHtml(event ? event.liveUrl : '')}" placeholder="https://youtube.com/...">
        </div>
      </div>
      <div class="form-group agenda-switch-group">
        <label class="agenda-switch">
          <input type="checkbox" id="eventPublic" ${event && event.isPublic ? 'checked' : ''}>
          <span class="agenda-switch-track"><span></span></span>
          <span class="agenda-switch-copy"><b>Evento público</b><small>Aparece no app público da igreja.</small></span>
        </label>
      </div>
      <div class="modal-footer" style="padding:16px 0 0;border-top:1px solid var(--border);margin-top:8px">
        <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
        <button class="btn-primary" onclick="saveEvent(${event ? `'${event.id}'` : 'null'})"><i data-lucide="save"></i> ${event ? 'Salvar alterações' : 'Criar evento'}</button>
      </div>
    </div>`;
  openModal();
  const modalEl = document.querySelector('#modalOverlay .modal');
  if (modalEl) modalEl.classList.add('modal-lg');
  if (window.lucide) lucide.createIcons();
}

function editEvent(id) { openEventModal(id); }

async function saveEvent(id) {
  const title = (document.getElementById('eventName') || {}).value || '';
  const type = (document.getElementById('eventType') || {}).value || 'EVENTO';
  const sectorId = (document.getElementById('eventSector') || {}).value || '';
  const date = (document.getElementById('eventDate') || {}).value || '';
  const timeStart = (document.getElementById('eventTime') || {}).value || '';
  const timeEnd = (document.getElementById('eventTimeEnd') || {}).value || '';
  const location = (document.getElementById('eventLocation') || {}).value || '';
  const description = (document.getElementById('eventDescription') || {}).value || '';
  const capacity = (document.getElementById('eventCapacity') || {}).value || '';
  const liveUrl = (document.getElementById('eventLiveUrl') || {}).value || '';
  const status = (document.getElementById('eventStatus') || {}).value || 'SCHEDULED';
  const isPublic = !!(document.getElementById('eventPublic') || {}).checked;
  if (!title.trim()) { showToast('Informe o nome do evento', 'error'); return; }
  if (!date) { showToast('Informe a data do evento', 'error'); return; }
  if (!timeStart) { showToast('Informe o horário de início', 'error'); return; }
  const payload = {
    title: title.trim(), type, sectorId, date, timeStart, timeEnd,
    location: location.trim(), description: description.trim(),
    capacity: capacity || null, liveUrl: liveUrl.trim(), status, isPublic,
    actorId: currentUser ? currentUser.id : undefined,
  };
  try {
    if (id) await apiPost(`/events/${id}/update`, payload);
    else await apiPost('/events', payload);
    await hydrateFromApi();
    closeModal();
    agendaCursor = agendaParseDate(date);
    renderEvents();
    showToast(id ? 'Evento atualizado!' : 'Evento criado!', 'success');
  } catch (e) {
    showToast((e && e.message) || 'Não foi possível salvar o evento', 'error');
  }
}

async function deleteEvent(id) {
  const event = mockEvents.find(e => String(e.id) === String(id));
  if (!event) return;
  if (!(await appConfirm(`Excluir o evento "${event.name}"? Esta ação não pode ser desfeita.`, { title: 'Excluir evento', confirmLabel: 'Excluir', icon: 'event_busy', tone: 'danger' }))) return;
  try {
    await apiPost(`/events/${id}/delete`, {});
    await hydrateFromApi();
    closeModal();
    renderEvents();
    showToast('Evento excluído', 'success');
  } catch (e) {
    showToast((e && e.message) || 'Não foi possível excluir o evento', 'error');
  }
}

function agendaSchedulesForDate(date) {
  return (window.apiSchedules || []).filter(s => String(s.date || '').slice(0, 10) === date);
}

function agendaNextCulto() {
  const today = agendaTodayISO();
  return agendaEventItems()
    .filter(i => i.type === 'CULTO' && i.date >= today)
    .sort((a, b) => String(a.date + (a.timeStart || '')).localeCompare(String(b.date + (b.timeStart || ''))))[0] || null;
}

function renderAgendaNextPanel(next) {
  const box = document.getElementById('agendaNextPanel');
  if (!box) return;
  if (!next) {
    box.innerHTML = `
      <div class="agenda-side-head"><div><span class="agenda-side-eyebrow">Próximo culto</span><h3>Nenhum culto futuro</h3></div></div>
      <div class="agenda-side-empty">
        <i data-lucide="calendar-plus"></i>
        <p>Nenhum culto agendado a partir de hoje. Cadastre o próximo para acompanhar as escalas.</p>
        <button class="btn-primary btn-block" onclick="openEventModal(null, agendaTodayISO(), 'CULTO')"><i data-lucide="plus"></i> Agendar culto</button>
      </div>`;
    if (window.lucide) lucide.createIcons();
    return;
  }
  const date = agendaParseDate(next.date);
  const schedules = agendaSchedulesForDate(next.date);
  const confirmed = schedules.reduce((sum, s) => sum + (s.confirmedCount || 0), 0);
  const total = schedules.reduce((sum, s) => sum + (s.totalPositions || (s.members || []).length || 0), 0);
  const pct = total ? Math.min(100, Math.round((confirmed / total) * 100)) : 0;
  const groups = {};
  schedules.forEach(s => {
    const label = (s.sector && s.sector.label) || 'Ministério';
    const g = groups[label] || { confirmed: 0, total: 0 };
    g.confirmed += s.confirmedCount || 0;
    g.total += s.totalPositions || (s.members || []).length || 0;
    groups[label] = g;
  });
  const scaleCards = Object.keys(groups).slice(0, 6).map(label => {
    const g = groups[label];
    const done = g.total > 0 && g.confirmed >= g.total;
    const remaining = Math.max(0, g.total - g.confirmed);
    return `<div class="agenda-scale-card">
      <span>${escHtml(label)}</span>
      <strong>${g.confirmed}/${g.total}</strong>
      <small class="${done ? 'ok' : 'pending'}">${done ? 'Completo' : (g.total ? remaining + ' pendente' + (remaining === 1 ? '' : 's') : 'Sem vagas')}</small>
    </div>`;
  }).join('');
  const meta = agendaTypeMeta(next.type);
  box.innerHTML = `
    <div class="agenda-side-head">
      <div>
        <span class="agenda-side-eyebrow">Próximo culto em</span>
        <h3>${escHtml(next.title)}</h3>
      </div>
      <span class="agenda-date-badge"><strong>${date.getDate()}</strong><small>${agendaMonthName(date).slice(0, 3).toUpperCase()}</small></span>
    </div>
    <div class="agenda-next-visual" style="background:linear-gradient(135deg,${meta.color} 0%,#16A2AD 100%)">
      <i data-lucide="${meta.icon}"></i>
      <span>${escHtml(next.location || 'Templo Principal')}</span>
    </div>
    <div class="agenda-next-meta">
      <span><i data-lucide="calendar-days"></i>${escHtml(agendaLongDate(next.date))}</span>
      <span><i data-lucide="clock-3"></i>${escHtml(next.timeStart || '—')}${next.timeEnd ? ' às ' + escHtml(next.timeEnd) : ''}</span>
      <span><i data-lucide="map-pin"></i>${escHtml(next.location || 'Templo Principal')}</span>
    </div>
    <div class="agenda-live-row ${next.liveUrl ? 'is-live' : ''}">
      <span class="agenda-live-ico"><i data-lucide="radio"></i></span>
      <div>
        <strong>${next.liveUrl ? 'Transmissão configurada' : 'Transmissão não configurada'}</strong>
        <small>${next.liveUrl ? 'Link disponível para o culto' : 'Adicione o link ao editar o evento'}</small>
      </div>
      ${next.liveUrl
        ? `<a class="btn-ghost btn-sm" href="${escHtml(next.liveUrl)}" target="_blank" rel="noopener">Abrir</a>`
        : `<button class="btn-ghost btn-sm" onclick="editEvent('${next.id}')">Configurar</button>`}
    </div>
    <div class="agenda-attendance">
      <div class="agenda-attendance-head">
        <div><span class="agenda-side-eyebrow">Equipe confirmada</span><strong>${confirmed}<small>/${total}</small></strong></div>
        <span class="pill ${total && confirmed >= total ? 'pill-green' : 'pill-orange'}">${total ? pct + '%' : 'Sem escala'}</span>
      </div>
      <div class="agenda-progress"><span style="width:${pct}%"></span></div>
      <small>${total ? `${total - confirmed} posição${total - confirmed === 1 ? '' : 'ões'} em aberto · ${schedules.length} escala${schedules.length === 1 ? '' : 's'}` : 'Nenhuma escala vinculada a este culto.'}</small>
    </div>
    ${scaleCards ? `<div class="agenda-scales-block"><span class="agenda-side-eyebrow">Escalas de voluntários</span><div class="agenda-scale-grid">${scaleCards}</div></div>` : ''}
    <button class="btn-secondary btn-block agenda-open-scales" onclick="navigateTo('escalas')"><i data-lucide="calendar-check"></i> Abrir matriz de escalas</button>`;
  if (window.lucide) lucide.createIcons();
}

function renderAgendaSpacesPanel() {
  const box = document.getElementById('agendaSpacesPanel');
  if (!box) return;
  const today = agendaTodayISO();
  const spaceRecords = agendaSpaceRecords().slice(0, 5);
  const rows = spaceRecords.map(space => {
    const name = space.name;
    const todays = agendaEventItems().filter(e => e.date === today && (e.location || '').includes(name));
    const event = todays[0];
    return `<button type="button" class="agenda-space-row ${event ? 'is-busy' : 'is-free'}" onclick="openEventModal(null,'${today}','RESERVA','${encodeURIComponent(name)}')">
      <span class="agenda-space-ico"><i data-lucide="${event ? 'door-closed' : 'door-open'}"></i></span>
      <span class="agenda-space-info">
        <strong>${escHtml(name)}</strong>
        <small>${event ? escHtml(event.title) + ' · ' + escHtml(event.timeStart || '') : escHtml(space.description || 'Disponível para reservas')}</small>
      </span>
      <span class="agenda-space-status">${event ? 'Ocupado hoje' : 'Livre hoje'}</span>
    </button>`;
  }).join('');
  box.innerHTML = `
    <div class="agenda-side-head">
      <div><span class="agenda-side-eyebrow">Instalações do campus</span><h3>Reservas de espaços</h3></div>
      <div class="agenda-side-head-actions">
        <button class="btn-icon" onclick="openSpacesManager()" title="Gerenciar espaços"><i data-lucide="settings"></i></button>
        <button class="btn-icon" onclick="openEventModal(null, agendaTodayISO(), 'RESERVA')" title="Nova reserva"><i data-lucide="plus"></i></button>
      </div>
    </div>
    <div class="agenda-space-list">${rows || '<div class="agenda-side-empty"><p>Nenhum espaço cadastrado.</p></div>'}</div>
    <button class="btn-secondary btn-block" onclick="openEventModal(null, agendaTodayISO(), 'RESERVA')"><i data-lucide="calendar-plus"></i> Solicitar reserva de sala</button>`;
  if (window.lucide) lucide.createIcons();
}

let spaceRemovedIds = [];

function spaceManagerRowHTML(space) {
  return `<div class="space-manager-row" data-id="${space.id || ''}">
    <input type="text" class="space-name" value="${escHtml(space.name || '')}" placeholder="Nome do espaço">
    <input type="text" class="space-desc" value="${escHtml(space.description || '')}" placeholder="Descrição / uso">
    <button type="button" class="btn-icon danger" onclick="removeSpaceDraft(this)" title="Remover espaço"><i data-lucide="trash-2"></i></button>
  </div>`;
}

async function openSpacesManager() {
  spaceRemovedIds = [];
  try {
    const spaces = await apiGet('/spaces');
    window.apiSpaces = Array.isArray(spaces) ? spaces : [];
  } catch (e) { window.apiSpaces = window.apiSpaces || []; }
  const list = (window.apiSpaces || []).map(spaceManagerRowHTML).join('');
  document.getElementById('modalTitle').textContent = 'Espaços reserváveis';
  document.getElementById('modalBody').innerHTML = `
    <div class="space-manager">
      <p class="space-manager-hint">Edite os nomes, descrições ou remova espaços. Os eventos já criados mantêm o local registrado.</p>
      <div id="spaceManagerList" class="space-manager-list">${list || '<div class="min-muted" style="padding:10px 0">Nenhum espaço cadastrado.</div>'}</div>
      <button type="button" class="btn-ghost btn-sm" onclick="addSpaceDraftRow()"><i data-lucide="plus"></i> Adicionar espaço</button>
      <div class="modal-footer" style="padding:16px 0 0;border-top:1px solid var(--border);margin-top:14px">
        <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
        <button class="btn-primary" onclick="saveSpacesManager()"><i data-lucide="save"></i> Salvar espaços</button>
      </div>
    </div>`;
  openModal();
  const modalEl = document.querySelector('#modalOverlay .modal');
  if (modalEl) modalEl.classList.add('modal-lg');
  if (window.lucide) lucide.createIcons();
}

function addSpaceDraftRow() {
  const list = document.getElementById('spaceManagerList');
  if (!list) return;
  if (list.querySelector('.min-muted')) list.innerHTML = '';
  list.insertAdjacentHTML('beforeend', spaceManagerRowHTML({ name: '', description: '', id: '' }));
  if (window.lucide) lucide.createIcons();
}

async function removeSpaceDraft(btn) {
  const row = btn.closest('.space-manager-row');
  if (!row) return;
  const id = row.dataset.id;
  const name = (row.querySelector('.space-name') || {}).value || 'este espaço';
  if (id) {
    if (!(await appConfirm(`Remover o espaço "${name}"?`, { title: 'Remover espaço', confirmLabel: 'Remover', icon: 'door-open', tone: 'danger' }))) return;
    spaceRemovedIds.push(id);
  }
  row.remove();
}

async function saveSpacesManager() {
  const list = document.getElementById('spaceManagerList');
  if (!list) return;
  const rows = [...list.querySelectorAll('.space-manager-row')];
  try {
    for (const row of rows) {
      const id = row.dataset.id;
      const name = (row.querySelector('.space-name') || {}).value.trim();
      const description = (row.querySelector('.space-desc') || {}).value.trim();
      if (!name) continue;
      if (id) await apiPost(`/spaces/${id}/update`, { name, description });
      else await apiPost('/spaces', { name, description });
    }
    for (const id of spaceRemovedIds) await apiPost(`/spaces/${id}/delete`, {});
    const spaces = await apiGet('/spaces');
    window.apiSpaces = Array.isArray(spaces) ? spaces : [];
    spaceRemovedIds = [];
    closeModal();
    renderEvents();
    showToast('Espaços atualizados', 'success');
  } catch (e) {
    showToast((e && e.message) || 'Não foi possível salvar os espaços', 'error');
  }
}

function renderAgendaSide() {
  renderAgendaNextPanel(agendaNextCulto());
  renderAgendaSpacesPanel();
}

function icalEscape(value) {
  return String(value || '').replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

function exportAgendaICS() {
  const items = agendaFilteredItems();
  if (!items.length) { showToast('Nenhum compromisso para exportar', 'warning'); return; }
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Igreja Shallom//Agenda//PT-BR',
    'CALSCALE:GREGORIAN',
  ];
  items.forEach(item => {
    const d = String(item.date || '').replace(/-/g, '');
    if (!d) return;
    const start = String(item.timeStart || '00:00').replace(':', '').slice(0, 4);
    let end = String(item.timeEnd || '').replace(':', '').slice(0, 4);
    if (!end) {
      const dt = new Date(agendaParseDate(item.date));
      const parts = String(item.timeStart || '00:00').split(':').map(Number);
      dt.setHours(parts[0] || 0, (parts[1] || 0) + 90, 0, 0);
      end = agendaPad(dt.getHours()) + agendaPad(dt.getMinutes());
    }
    lines.push(
      'BEGIN:VEVENT',
      `UID:${item.source}-${item.id}@igrejashallom`,
      `DTSTART:${d}T${start}00`,
      `DTEND:${d}T${end}00`,
      `SUMMARY:${icalEscape(item.title)}`,
      `LOCATION:${icalEscape(item.location || '')}`,
      `DESCRIPTION:${icalEscape(item.sectorLabel || '')}`,
      'END:VEVENT'
    );
  });
  lines.push('END:VCALENDAR');
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'agenda-igreja-shallom.ics';
  a.click();
  URL.revokeObjectURL(a.href);
  showToast('Agenda exportada para o Google Agenda', 'success');
}

// ===== BATISMOS =====
let baptismRecords = [];
let baptismEditId = null;
let baptismPrefillPersonId = null;

async function loadBaptisms(force) {
  if (baptismRecords.length && !force) return;
  try {
    const rows = await apiGet('/baptisms');
    baptismRecords = Array.isArray(rows) ? rows : [];
  } catch (e) { baptismRecords = []; }
}

async function renderBaptisms() {
  await loadBaptisms(true);
  const search = (document.getElementById('baptismSearch') || {}).value || '';
  const q = search.trim().toLowerCase();
  const list = baptismRecords.filter(b => {
    if (!q) return true;
    return `${b.name || ''} ${b.email || ''} ${b.cellPhone || ''} ${b.residencePhone || ''}`.toLowerCase().includes(q);
  });
  const year = String(new Date().getFullYear());
  setText('baptismKpiTotal', baptismRecords.length);
  setText('baptismKpiYear', baptismRecords.filter(b => String(b.baptismDate || '').startsWith(year)).length);
  setText('baptismKpiLinked', baptismRecords.filter(b => !!b.personId).length);
  setText('baptismCount', `${list.length} ficha${list.length === 1 ? '' : 's'}`);
  const tbody = document.getElementById('baptismsTableBody');
  if (!tbody) return;
  if (!list.length) {
    tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><i data-lucide="droplets"></i><p>Nenhuma ficha de batismo encontrada.</p></div></td></tr>';
  } else {
    tbody.innerHTML = list.map(b => {
      const status = b.status === 'ACTIVE' ? '<span class="pill pill-green">Ativa</span>' : '<span class="pill pill-gray">Arquivada</span>';
      return `<tr>
        <td><div class="min-member"><span class="min-member-av">${escHtml(initials(b.name))}</span><div><strong>${escHtml(b.name)}</strong><small>${escHtml(b.profession || 'Ficha de batismo')}</small></div></div></td>
        <td>${b.baptismDate ? escHtml(formatDate(b.baptismDate)) : '—'}</td>
        <td><div class="min-contact">${escHtml(b.email || '—')}<br><small>${escHtml(b.cellPhone || b.residencePhone || '—')}</small></div></td>
        <td>${b.person ? `<span class="pill pill-blue">${escHtml(b.person.name)}</span>` : '<span class="pill pill-gray">Sem vínculo</span>'}</td>
        <td>${status}</td>
        <td class="pactions">
          <button class="btn-icon" onclick="openBaptismForm('${b.id}')" title="Editar ficha"><i data-lucide="pencil"></i></button>
          <button class="btn-icon danger" onclick="deleteBaptismRecord('${b.id}')" title="Excluir ficha"><i data-lucide="trash-2"></i></button>
        </td>
      </tr>`;
    }).join('');
  }
  if (window.lucide) lucide.createIcons();
}

function openBaptismForm(id, personId) {
  baptismEditId = id || null;
  baptismPrefillPersonId = personId || null;
  navigateTo('batismo-form');
}

async function openBaptismFormForMember(personId) {
  await loadBaptisms(true);
  const existing = baptismRecords.find(b => b.personId === personId);
  if (existing) openBaptismForm(existing.id);
  else openBaptismForm(null, personId);
}

function renderBaptismFormPage() {
  const record = baptismEditId ? baptismRecords.find(b => b.id === baptismEditId) : null;
  const prefill = !record && baptismPrefillPersonId ? (mockMembers || []).find(p => p.id === baptismPrefillPersonId) : null;
  setText('bmTitle', record ? 'Editar ficha de batismo' : 'Nova ficha de batismo');
  setText('bmEyebrow', record ? 'Edição de registro' : 'Novo registro');
  setText('bmSaveLabel', record ? 'Salvar alterações' : 'Salvar ficha');
  const select = document.getElementById('bmPerson');
  if (select) {
    const options = (mockMembers || []).slice().sort((a, b) => String(a.name).localeCompare(String(b.name), 'pt-BR'))
      .map(p => `<option value="${p.id}">${escHtml(p.name)}</option>`).join('');
    select.innerHTML = '<option value="">Sem vínculo / pessoa não cadastrada</option>' + options;
    select.value = record ? (record.personId || '') : (prefill ? prefill.id : '');
  }
  const values = record || prefill || {};
  const get = (key) => {
    if (record) {
      const map = { name: 'name', motherName: 'motherName', fatherName: 'fatherName', birthdate: 'birthdate', maritalStatus: 'maritalStatus', cpf: 'cpf', rg: 'rg', birthplace: 'birthplace', email: 'email', profession: 'profession', education: 'education', address: 'address', zipCode: 'zipCode', neighborhood: 'neighborhood', city: 'city', state: 'state', residencePhone: 'residencePhone', cellPhone: 'cellPhone', conversionDate: 'conversionDate', baptismDate: 'baptismDate', spouseName: 'spouseName', previouslyMarried: 'previouslyMarried', civilMarriageDate: 'civilMarriageDate', religiousMarriageDate: 'religiousMarriageDate', children: 'children', notes: 'notes', signature: 'signature' };
      return record[map[key]] || '';
    }
    const memberMap = {
      name: 'name', motherName: 'motherName', fatherName: 'fatherName', birthdate: 'birthdate',
      maritalStatus: 'maritalStatus', cpf: 'cpf', rg: 'rg', birthplace: 'birthplace', email: 'email',
      profession: 'profession', education: 'education', address: 'address', zipCode: 'zipCode',
      neighborhood: 'neighborhood', city: 'city', state: 'state', residencePhone: 'residencePhone',
      cellPhone: 'phone', conversionDate: 'conversionDate', baptismDate: 'baptismDate',
      spouseName: 'spouseName', previouslyMarried: 'previouslyMarried', civilMarriageDate: 'civilMarriageDate',
      religiousMarriageDate: 'religiousMarriageDate', children: 'children', notes: 'membershipNotes',
    };
    return memberMap[key] ? (values[memberMap[key]] || '') : '';
  };
  const ids = {
    name: 'bmName', motherName: 'bmMotherName', fatherName: 'bmFatherName', birthdate: 'bmBirthdate',
    maritalStatus: 'bmMaritalStatus', cpf: 'bmCpf', rg: 'bmRg', birthplace: 'bmBirthplace',
    email: 'bmEmail', profession: 'bmProfession', education: 'bmEducation', address: 'bmAddress',
    zipCode: 'bmZipCode', neighborhood: 'bmNeighborhood', city: 'bmCity', state: 'bmState',
    residencePhone: 'bmResidencePhone', cellPhone: 'bmCellPhone', conversionDate: 'bmConversionDate',
    baptismDate: 'bmBaptismDate', spouseName: 'bmSpouseName', previouslyMarried: 'bmPreviouslyMarried',
    civilMarriageDate: 'bmCivilMarriageDate', religiousMarriageDate: 'bmReligiousMarriageDate',
    children: 'bmChildren', notes: 'bmNotes', signature: 'bmSignature',
  };
  Object.keys(ids).forEach(key => {
    const el = document.getElementById(ids[key]);
    if (el) el.value = get(key);
  });
  refreshIcons();
}

function prefillBaptismFromMember(personId) {
  if (!personId) return;
  const p = (mockMembers || []).find(m => m.id === personId);
  if (!p) return;
  const map = {
    bmName: p.name, bmMotherName: p.motherName, bmFatherName: p.fatherName, bmBirthdate: p.birthdate,
    bmMaritalStatus: p.maritalStatus, bmCpf: p.cpf, bmRg: p.rg, bmBirthplace: p.birthplace,
    bmEmail: p.email && p.email !== '—' ? p.email : '', bmProfession: p.profession, bmEducation: p.education,
    bmAddress: p.address, bmZipCode: p.zipCode, bmNeighborhood: p.neighborhood, bmCity: p.city, bmState: p.state,
    bmResidencePhone: p.residencePhone, bmCellPhone: p.phone && p.phone !== '—' ? p.phone : '',
    bmConversionDate: p.conversionDate, bmBaptismDate: p.baptismDate && p.baptismDate !== '—' ? p.baptismDate : '',
    bmSpouseName: p.spouseName, bmPreviouslyMarried: p.previouslyMarried,
    bmCivilMarriageDate: p.civilMarriageDate, bmReligiousMarriageDate: p.religiousMarriageDate,
    bmChildren: p.children, bmNotes: p.membershipNotes,
  };
  Object.keys(map).forEach(id => {
    const el = document.getElementById(id);
    if (el && !el.value) el.value = map[id] || '';
  });
}

async function saveBaptismForm() {
  const getVal = id => (document.getElementById(id) || {}).value || '';
  const name = getVal('bmName').trim();
  if (!name) { showToast('Informe o nome completo', 'error'); document.getElementById('bmName')?.focus(); return; }
  const payload = {
    name,
    personId: getVal('bmPerson') || '',
    motherName: getVal('bmMotherName'), fatherName: getVal('bmFatherName'), birthdate: getVal('bmBirthdate'),
    maritalStatus: getVal('bmMaritalStatus'), cpf: getVal('bmCpf'), rg: getVal('bmRg'), birthplace: getVal('bmBirthplace'),
    email: getVal('bmEmail'), profession: getVal('bmProfession'), education: getVal('bmEducation'),
    address: getVal('bmAddress'), zipCode: getVal('bmZipCode'), neighborhood: getVal('bmNeighborhood'),
    city: getVal('bmCity'), state: getVal('bmState'), residencePhone: getVal('bmResidencePhone'), cellPhone: getVal('bmCellPhone'),
    conversionDate: getVal('bmConversionDate'), baptismDate: getVal('bmBaptismDate'), spouseName: getVal('bmSpouseName'),
    previouslyMarried: getVal('bmPreviouslyMarried'), civilMarriageDate: getVal('bmCivilMarriageDate'),
    religiousMarriageDate: getVal('bmReligiousMarriageDate'), children: getVal('bmChildren'), notes: getVal('bmNotes'),
    signature: getVal('bmSignature'), actorId: currentUser ? currentUser.id : undefined,
  };
  try {
    if (baptismEditId) await apiPost(`/baptisms/${baptismEditId}/update`, payload);
    else await apiPost('/baptisms', payload);
    await hydrateFromApi();
    await loadBaptisms(true);
    navigateTo('batismos');
    showToast(baptismEditId ? 'Ficha de batismo atualizada!' : 'Ficha de batismo criada!', 'success');
  } catch (e) {
    showToast((e && e.message) || 'Não foi possível salvar a ficha', 'error');
  }
}

async function deleteBaptismRecord(id) {
  const record = baptismRecords.find(b => b.id === id);
  if (!record) return;
  if (!(await appConfirm(`Excluir a ficha de batismo de "${record.name}"?`, { title: 'Excluir ficha', confirmLabel: 'Excluir', icon: 'delete', tone: 'danger' }))) return;
  try {
    await apiPost(`/baptisms/${id}/delete`, {});
    await loadBaptisms(true);
    renderBaptisms();
    showToast('Ficha excluída', 'success');
  } catch (e) {
    showToast((e && e.message) || 'Não foi possível excluir a ficha', 'error');
  }
}

// ===== ATAS =====
let minutes = [];
let minuteEditId = null;
let ataViewId = null;

async function loadMinutes(force) {
  if (minutes.length && !force) return;
  try {
    const rows = await apiGet('/minutes');
    minutes = Array.isArray(rows) ? rows : [];
  } catch (e) { minutes = []; }
}

function minuteTypeLabel(type) {
  const map = { AGO: 'Assembleia Geral Ordinária', AGE: 'Assembleia Geral Extraordinária', DIRETORIA: 'Reunião de Diretoria', CONSELHO: 'Reunião de Conselho', OUTRA: 'Outra' };
  return map[String(type || '').toUpperCase()] || type || 'Ata';
}

function minuteStatusLabel(status) {
  const s = String(status || '').toUpperCase();
  if (s === 'APPROVED') return { label: 'Aprovada', cls: 'pill-green' };
  if (s === 'CANCELED') return { label: 'Cancelada', cls: 'pill-red' };
  return { label: 'Rascunho', cls: 'pill-orange' };
}

async function renderMinutes() {
  await loadMinutes(true);
  const q = String((document.getElementById('minutesSearch') || {}).value || '').trim().toLowerCase();
  const list = minutes.filter(m => !q || `${m.number} ${m.title} ${m.agenda || ''} ${m.body || ''}`.toLowerCase().includes(q));
  setText('minutesCount', `${list.length} ata${list.length === 1 ? '' : 's'}`);
  const box = document.getElementById('minutesList');
  if (!box) return;
  if (!list.length) {
    box.innerHTML = '<div class="empty-state"><i data-lucide="scroll-text"></i><p>Nenhuma ata registrada.</p></div>';
  } else {
    box.innerHTML = list.map(m => {
      const st = minuteStatusLabel(m.status);
      const date = m.date ? formatDate(m.date) : '—';
      return `<div class="minute-card">
        <span class="minute-number">${escHtml(m.number)}</span>
        <div class="minute-main">
          <div class="minute-title">${escHtml(m.title)}</div>
          <div class="minute-meta">
            <span><i data-lucide="calendar-days"></i>${escHtml(date)}${m.timeStart ? ' · ' + escHtml(m.timeStart) : ''}</span>
            <span><i data-lucide="file-text"></i>${escHtml(minuteTypeLabel(m.type))}</span>
            ${m.attendees ? `<span><i data-lucide="users"></i>${m.attendees} presentes</span>` : ''}
          </div>
        </div>
        <span class="pill ${st.cls}">${st.label}</span>
        <div class="minute-actions">
          <button class="btn-icon" onclick="openMinuteDetail('${m.id}')" title="Visualizar"><i data-lucide="eye"></i></button>
          <button class="btn-icon" onclick="openMinuteForm('${m.id}')" title="Editar"><i data-lucide="pencil"></i></button>
          <button class="btn-icon danger" onclick="deleteMinute('${m.id}')" title="Excluir"><i data-lucide="trash-2"></i></button>
        </div>
      </div>`;
    }).join('');
  }
  if (window.lucide) lucide.createIcons();
}

function openMinuteForm(id) {
  minuteEditId = id || null;
  navigateTo('ata-form');
}

function renderMinuteFormPage() {
  const m = minuteEditId ? minutes.find(x => x.id === minuteEditId) : null;
  setText('ataTitle', m ? 'Editar ata' : 'Nova ata');
  setText('ataEyebrow', m ? 'Edição de registro' : 'Novo registro');
  setText('ataSaveLabel', m ? 'Salvar alterações' : 'Salvar ata');
  const values = {
    ataNumber: m ? m.number : '',
    ataType: m ? m.type : 'AGO',
    ataMeetingTitle: m ? m.title : '',
    ataDate: m ? m.date : agendaTodayISO(),
    ataTime: m ? (m.timeStart || '') : '19:00',
    ataLocation: m ? (m.location || '') : 'Avenida Carlos Chagas, 577, Cidade Nobre, Ipatinga-MG',
    ataPresident: m ? (m.president || '') : '',
    ataSecretary: m ? (m.secretary || '') : '',
    ataAttendees: m && m.attendees != null ? m.attendees : '',
    ataStatus: m ? (m.status || 'DRAFT') : 'DRAFT',
    ataAgenda: m ? (m.agenda || '') : '',
    ataBody: m ? (m.body || '') : '',
    ataDecisions: m ? (m.decisions || '') : '',
  };
  Object.keys(values).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = values[id];
  });
  refreshIcons();
}

async function saveMinuteForm() {
  const getVal = id => (document.getElementById(id) || {}).value || '';
  const payload = {
    number: getVal('ataNumber').trim(),
    type: getVal('ataType'),
    title: getVal('ataMeetingTitle').trim(),
    date: getVal('ataDate'),
    timeStart: getVal('ataTime'),
    location: getVal('ataLocation').trim(),
    president: getVal('ataPresident').trim(),
    secretary: getVal('ataSecretary').trim(),
    attendees: getVal('ataAttendees') || null,
    status: getVal('ataStatus'),
    agenda: getVal('ataAgenda').trim(),
    body: getVal('ataBody').trim(),
    decisions: getVal('ataDecisions').trim(),
    actorId: currentUser ? currentUser.id : undefined,
  };
  if (!payload.number) { showToast('Informe o número da ata', 'error'); return; }
  if (!payload.title) { showToast('Informe o título da ata', 'error'); return; }
  if (!payload.date) { showToast('Informe a data da ata', 'error'); return; }
  if (!payload.body) { showToast('Informe o texto da ata', 'error'); return; }
  try {
    if (minuteEditId) await apiPost(`/minutes/${minuteEditId}/update`, payload);
    else await apiPost('/minutes', payload);
    await loadMinutes(true);
    navigateTo('atas');
    showToast(minuteEditId ? 'Ata atualizada!' : 'Ata registrada!', 'success');
  } catch (e) {
    showToast((e && e.message) || 'Não foi possível salvar a ata', 'error');
  }
}

function openMinuteDetail(id) {
  ataViewId = id;
  navigateTo('ata-view');
}

function renderMinuteViewPage() {
  const m = minutes.find(x => x.id === ataViewId);
  if (!m) { navigateTo('atas'); return; }
  const st = minuteStatusLabel(m.status);
  setText('ataViewTitle', m.title);
  setText('ataViewEyebrow', minuteTypeLabel(m.type));
  setText('ataViewSub', `${formatDate(m.date)}${m.timeStart ? ' · ' + m.timeStart : ''}${m.location ? ' · ' + m.location : ''}`);
  const box = document.getElementById('ataViewContent');
  if (!box) return;
  box.innerHTML = `
    <div class="ata-sheet">
      <div class="ata-sheet-head">
        <div>
          <span class="ata-sheet-number">Ata ${escHtml(m.number)}</span>
          <strong>${escHtml(m.title)}</strong>
          <small>${escHtml(minuteTypeLabel(m.type))}</small>
        </div>
        <span class="pill ${st.cls}">${st.label}</span>
      </div>
      <div class="ata-sheet-meta">
        <div><span>Data</span><strong>${escHtml(formatDate(m.date))}</strong></div>
        <div><span>Horário</span><strong>${escHtml(m.timeStart || '—')}</strong></div>
        <div><span>Local</span><strong>${escHtml(m.location || '—')}</strong></div>
        <div><span>Presidente</span><strong>${escHtml(m.president || '—')}</strong></div>
        <div><span>Secretário(a)</span><strong>${escHtml(m.secretary || '—')}</strong></div>
        <div><span>Presentes</span><strong>${m.attendees || '—'}</strong></div>
      </div>
      ${m.agenda ? `<div class="ata-sheet-section"><h3>Ordem do dia</h3><p>${escHtml(m.agenda)}</p></div>` : ''}
      <div class="ata-sheet-section"><h3>Texto da ata</h3><div class="ata-sheet-body">${escHtml(m.body)}</div></div>
      ${m.decisions ? `<div class="ata-sheet-section"><h3>Decisões e deliberações</h3><p>${escHtml(m.decisions)}</p></div>` : ''}
      <div class="ata-sheet-signatures">
        <div><span>Secretário(a)</span><strong>${escHtml(m.secretary || '')}</strong></div>
        <div><span>Presidente</span><strong>${escHtml(m.president || '')}</strong></div>
      </div>
      <div class="ata-sheet-footer">
        <button class="btn-danger" onclick="deleteMinute('${m.id}')"><i data-lucide="trash-2"></i> Excluir ata</button>
        <span>Registro interno — Igreja Batista Nacional Shallom Cidade Nobre</span>
      </div>
    </div>`;
  if (window.lucide) lucide.createIcons();
}

async function deleteMinute(id) {
  const m = minutes.find(x => x.id === id);
  if (!m) return;
  if (!(await appConfirm(`Excluir a ata ${m.number} — "${m.title}"?`, { title: 'Excluir ata', confirmLabel: 'Excluir', icon: 'delete', tone: 'danger' }))) return;
  try {
    await apiPost(`/minutes/${id}/delete`, {});
    await loadMinutes(true);
    closeModal();
    const viewActive = document.getElementById('section-ata-view') && document.getElementById('section-ata-view').classList.contains('active');
    if (viewActive) navigateTo('atas');
    else renderMinutes();
    showToast('Ata excluída', 'success');
  } catch (e) {
    showToast((e && e.message) || 'Não foi possível excluir a ata', 'error');
  }
}

function printMinute(id) {
  const m = minutes.find(x => x.id === id);
  if (!m) return;
  const w = window.open('', '_blank', 'width=800,height=900');
  if (!w) { showToast('Permita pop-ups para imprimir', 'warning'); return; }
  w.document.write(`<html><head><title>Ata ${escHtml(m.number)}</title><style>body{font-family:Arial,sans-serif;margin:40px;line-height:1.6;color:#111}h1{font-size:18px}h2{font-size:16px}small{color:#555}.meta{margin:16px 0;font-size:13px}.body{white-space:pre-wrap;margin-top:20px;font-size:13px}</style></head><body>
    <h1>Igreja Batista Nacional Shallom Cidade Nobre</h1>
    <h2>Ata ${escHtml(m.number)} — ${escHtml(m.title)}</h2>
    <div class="meta">${escHtml(minuteTypeLabel(m.type))} · ${escHtml(formatDate(m.date))}${m.timeStart ? ' · ' + escHtml(m.timeStart) : ''}<br>${escHtml(m.location || '')}<br>${m.president ? 'Presidente: ' + escHtml(m.president) : ''}${m.secretary ? ' · Secretário(a): ' + escHtml(m.secretary) : ''}</div>
    <div class="body">${escHtml(m.body)}</div>
    ${m.decisions ? '<h3>Decisões</h3><div class="body">' + escHtml(m.decisions) + '</div>' : ''}
  </body></html>`);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 300);
}

// ===== IMPORTAR / EXPORTAR PLANILHAS =====
function agendaRowGet(row, names) {
  const keys = Object.keys(row || {});
  for (const name of names) {
    const target = normHeader(name);
    const key = keys.find(k => normHeader(k) === target || normHeader(k).includes(target));
    if (key && row[key] !== '' && row[key] != null) return row[key];
  }
  return '';
}

function normHeader(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function sheetDate(value) {
  if (!value) return '';
  if (value instanceof Date && !isNaN(value)) {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
  }
  const s = String(value).trim();
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return `${m[3]}-${String(m[2]).padStart(2, '0')}-${String(m[1]).padStart(2, '0')}`;
  return '';
}

function sheetPhone(value) {
  const raw = String(value || '').trim();
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  if (digits.length === 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return raw;
}

function maritalFromCode(code) {
  const c = String(code || '').trim().toUpperCase();
  if (c === 'C') return 'Casado(a)';
  if (c === 'S') return 'Solteiro(a)';
  if (c === 'V') return 'Viúvo(a)';
  if (c === 'D') return 'Divorciado(a)';
  return '';
}

function readSheetFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) { reject(new Error('Nenhum arquivo selecionado')); return; }
    if (typeof XLSX === 'undefined') { reject(new Error('Leitor de planilhas não carregado')); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array', cellDates: true });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const matrix = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', raw: false, blankrows: false });
        const knownHeaders = new Set([
          'nome', 'nomecompleto', 'numero', 'n', 'no', 'titulo', 'data', 'texto', 'textodaata',
          'datadobatismo', 'datadenascimento', 'email', 'telefone', 'endereco', 'nomecomae',
        ]);
        let headerIndex = matrix.findIndex((row, idx) => idx < 20 && row.some(cell => knownHeaders.has(normHeader(cell))));
        if (headerIndex < 0) headerIndex = 0;
        const headerRow = matrix[headerIndex] || [];
        const headers = headerRow.map((h, i) => String(h || '').trim() || `Coluna ${i + 1}`);
        const rows = matrix.slice(headerIndex + 1).map((row) => {
          const item = {};
          headers.forEach((header, i) => { item[header] = row[i] == null ? '' : row[i]; });
          return item;
        });
        resolve(rows);
      } catch (err) { reject(err); }
    };
    reader.onerror = () => reject(new Error('Não foi possível ler o arquivo'));
    reader.readAsArrayBuffer(file);
  });
}

function downloadSheet(rows, sheetName, fileName) {
  if (typeof XLSX === 'undefined') { showToast('Biblioteca de planilhas não carregada', 'error'); return; }
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, fileName);
}

async function importPeopleFile(input) {
  const file = input && input.files ? input.files[0] : null;
  if (!file) return;
  try {
    const rows = await readSheetFile(file);
    const existing = new Set((mockMembers || []).map(m => normHeader(m.name)));
    let created = 0, skipped = 0, errors = 0;
    for (const row of rows) {
      const name = String(agendaRowGet(row, ['Nome', 'Nome completo', 'Membro']) || '').trim();
      if (!name) { skipped++; continue; }
      const numberKey = Object.keys(row).find(k => ['n', 'no', 'numero', 'num'].includes(normHeader(k)));
      if (numberKey) {
        const numberValue = String(row[numberKey] || '').trim();
        if (numberValue && !/^\d+$/.test(numberValue)) { skipped++; continue; }
      }
      if (/^(chegaram|sa[ií]ram|ata\s+\d+)/i.test(name)) { skipped++; continue; }
      if (existing.has(normHeader(name))) { skipped++; continue; }
      const maritalRaw = String(agendaRowGet(row, ['Estado civil', 'Est.C.', 'Est C']) || '').trim();
      const payload = {
        name,
        email: String(agendaRowGet(row, ['E-mail', 'Email']) || '').trim(),
        phone: sheetPhone(agendaRowGet(row, ['Tel.Cel.', 'Telefone', 'Celular', 'Fone'])),
        birthdate: sheetDate(agendaRowGet(row, ['Dt.Nasc.', 'Data de nascimento', 'Nascimento'])),
        address: String(agendaRowGet(row, ['Endereço', 'Endereco']) || '').trim(),
        maritalStatus: maritalRaw.length <= 1 ? maritalFromCode(maritalRaw) : maritalRaw,
        membershipRecordNumber: String(agendaRowGet(row, ['Nº Ata', 'N Ata', 'Ata']) || '').trim(),
        membershipNotes: 'Importado de planilha em ' + new Date().toLocaleDateString('pt-BR') + '.',
        membershipRequestStatus: 'APROVADO',
        createdByRole: apiActorRole(),
      };
      try {
        await apiPost('/people', payload);
        existing.add(normHeader(name));
        created++;
      } catch (e) { errors++; }
    }
    await hydrateFromApi();
    renderMembers();
    showToast(`Importação concluída: ${created} membros criados, ${skipped} ignorados${errors ? ', ' + errors + ' erros' : ''}`, created ? 'success' : 'warning');
  } catch (e) {
    showToast(e.message || 'Não foi possível importar a planilha', 'error');
  } finally {
    if (input) input.value = '';
  }
}

function exportPeopleXLSX() {
  const rows = (mockMembers || []).map(m => ({
    'Nome': m.name,
    'E-mail': m.email && m.email !== '—' ? m.email : '',
    'Telefone': m.phone && m.phone !== '—' ? m.phone : '',
    'Dt.Nasc.': m.birthdate || '',
    'Estado Civil': m.maritalStatus || '',
    'Endereço': m.address || '',
    'Nº Ata': m.membershipRecordNumber || '',
    'Ministério': m.sector || '',
    'Cargos': m.positions && m.positions.length ? m.positions.join(', ') : '',
    'Acesso': m.webAccess ? 'Liberado' : 'Sem acesso',
    'Membro desde': m.joined || '',
  }));
  downloadSheet(rows, 'Membros', 'membros-igreja-shallom.xlsx');
  showToast(`Planilha exportada com ${rows.length} membros`, 'success');
}

async function importBaptismsFile(input) {
  const file = input && input.files ? input.files[0] : null;
  if (!file) return;
  try {
    const rows = await readSheetFile(file);
    let created = 0, skipped = 0, errors = 0;
    for (const row of rows) {
      const name = String(agendaRowGet(row, ['Nome', 'Nome completo']) || '').trim();
      if (!name) { skipped++; continue; }
      const baptismDate = sheetDate(agendaRowGet(row, ['Data do Batismo', 'Data batismo', 'Batismo']));
      if (baptismRecords.some(b => normHeader(b.name) === normHeader(name) && String(b.baptismDate || '') === baptismDate)) { skipped++; continue; }
      const payload = {
        name,
        birthdate: sheetDate(agendaRowGet(row, ['Data Nascimento', 'Dt.Nasc.', 'Nascimento'])),
        motherName: String(agendaRowGet(row, ['Nome da Mãe', 'Mãe']) || '').trim(),
        fatherName: String(agendaRowGet(row, ['Nome do Pai', 'Pai']) || '').trim(),
        maritalStatus: String(agendaRowGet(row, ['Estado Civil']) || '').trim(),
        cpf: String(agendaRowGet(row, ['CPF']) || '').trim(),
        rg: String(agendaRowGet(row, ['RG']) || '').trim(),
        birthplace: String(agendaRowGet(row, ['Naturalidade']) || '').trim(),
        email: String(agendaRowGet(row, ['E-mail', 'Email']) || '').trim(),
        profession: String(agendaRowGet(row, ['Profissão', 'Profissao']) || '').trim(),
        education: String(agendaRowGet(row, ['Escolaridade']) || '').trim(),
        address: String(agendaRowGet(row, ['Endereço', 'Endereco']) || '').trim(),
        zipCode: String(agendaRowGet(row, ['CEP', 'Cep']) || '').trim(),
        neighborhood: String(agendaRowGet(row, ['Bairro']) || '').trim(),
        city: String(agendaRowGet(row, ['Cidade']) || '').trim(),
        state: String(agendaRowGet(row, ['Estado']) || '').trim(),
        residencePhone: sheetPhone(agendaRowGet(row, ['Fone Residencial', 'Telefone residencial'])),
        cellPhone: sheetPhone(agendaRowGet(row, ['Fone Celular', 'Telefone celular', 'Celular'])),
        conversionDate: sheetDate(agendaRowGet(row, ['Data da conversão', 'Conversão'])),
        baptismDate,
        spouseName: String(agendaRowGet(row, ['Cônjuge', 'Conjuge']) || '').trim(),
        previouslyMarried: String(agendaRowGet(row, ['Já foi casado', 'Foi casado']) || '').trim(),
        civilMarriageDate: sheetDate(agendaRowGet(row, ['Data casamento Civil'])),
        religiousMarriageDate: sheetDate(agendaRowGet(row, ['Data casamento Religioso'])),
        children: String(agendaRowGet(row, ['Filhos']) || '').trim(),
        notes: String(agendaRowGet(row, ['Anotações', 'Anotacoes']) || '').trim(),
        signature: String(agendaRowGet(row, ['Assinatura do candidato', 'Assinatura']) || '').trim(),
      };
      try { await apiPost('/baptisms', payload); created++; } catch (e) { errors++; }
    }
    await loadBaptisms(true);
    renderBaptisms();
    showToast(`Importação concluída: ${created} fichas criadas, ${skipped} ignoradas${errors ? ', ' + errors + ' erros' : ''}`, created ? 'success' : 'warning');
  } catch (e) {
    showToast(e.message || 'Não foi possível importar a planilha', 'error');
  } finally { if (input) input.value = ''; }
}

function exportBaptismsXLSX() {
  const rows = baptismRecords.map(b => ({
    'Nome': b.name,
    'Nome da Mãe': b.motherName || '',
    'Nome do Pai': b.fatherName || '',
    'Data Nascimento': b.birthdate || '',
    'Estado Civil': b.maritalStatus || '',
    'CPF': b.cpf || '',
    'RG': b.rg || '',
    'Naturalidade': b.birthplace || '',
    'E-mail': b.email || '',
    'Profissão': b.profession || '',
    'Escolaridade': b.education || '',
    'Endereço': b.address || '',
    'CEP': b.zipCode || '',
    'Bairro': b.neighborhood || '',
    'Cidade': b.city || '',
    'Estado': b.state || '',
    'Fone Residencial': b.residencePhone || '',
    'Fone Celular': b.cellPhone || '',
    'Data da conversão': b.conversionDate || '',
    'Data do Batismo': b.baptismDate || '',
    'Cônjuge': b.spouseName || '',
    'Já foi casado(a) antes?': b.previouslyMarried || '',
    'Data casamento Civil': b.civilMarriageDate || '',
    'Data casamento Religioso': b.religiousMarriageDate || '',
    'Filhos': b.children || '',
    'Anotações': b.notes || '',
  }));
  downloadSheet(rows, 'Batismos', 'fichas-batismo-shallom.xlsx');
  showToast(`Planilha exportada com ${rows.length} fichas`, 'success');
}

async function importMinutesFile(input) {
  const file = input && input.files ? input.files[0] : null;
  if (!file) return;
  try {
    const rows = await readSheetFile(file);
    let created = 0, skipped = 0, errors = 0;
    for (const row of rows) {
      const number = String(agendaRowGet(row, ['Número', 'Numero', 'Nº', 'N']) || '').trim();
      const title = String(agendaRowGet(row, ['Título', 'Titulo', 'Assunto']) || '').trim();
      const date = sheetDate(agendaRowGet(row, ['Data']));
      const body = String(agendaRowGet(row, ['Texto da ata', 'Texto', 'Ata', 'Conteúdo', 'Conteudo']) || '').trim();
      if (!number || !title || !date || !body) { skipped++; continue; }
      if (minutes.some(m => String(m.number) === number && m.date === date)) { skipped++; continue; }
      const payload = {
        number, title, date, body,
        type: String(agendaRowGet(row, ['Tipo']) || 'AGO').trim(),
        timeStart: String(agendaRowGet(row, ['Horário', 'Horario']) || '').trim(),
        location: String(agendaRowGet(row, ['Local']) || '').trim(),
        president: String(agendaRowGet(row, ['Presidente']) || '').trim(),
        secretary: String(agendaRowGet(row, ['Secretário', 'Secretario']) || '').trim(),
        attendees: String(agendaRowGet(row, ['Presentes', 'Nº de presentes']) || '').trim() || null,
        agenda: String(agendaRowGet(row, ['Ordem do dia']) || '').trim(),
        decisions: String(agendaRowGet(row, ['Decisões', 'Decisoes']) || '').trim(),
        status: String(agendaRowGet(row, ['Status']) || 'APPROVED').toUpperCase(),
      };
      try { await apiPost('/minutes', payload); created++; } catch (e) { errors++; }
    }
    await loadMinutes(true);
    renderMinutes();
    showToast(`Importação concluída: ${created} atas criadas, ${skipped} ignoradas${errors ? ', ' + errors + ' erros' : ''}`, created ? 'success' : 'warning');
  } catch (e) {
    showToast(e.message || 'Não foi possível importar a planilha', 'error');
  } finally { if (input) input.value = ''; }
}

function exportMinutesXLSX() {
  const rows = minutes.map(m => ({
    'Número': m.number,
    'Título': m.title,
    'Tipo': m.type,
    'Data': m.date,
    'Horário': m.timeStart || '',
    'Local': m.location || '',
    'Presidente': m.president || '',
    'Secretário': m.secretary || '',
    'Presentes': m.attendees || '',
    'Ordem do dia': m.agenda || '',
    'Texto da ata': m.body || '',
    'Decisões': m.decisions || '',
    'Status': m.status,
  }));
  downloadSheet(rows, 'Atas', 'atas-igreja-shallom.xlsx');
  showToast(`Planilha exportada com ${rows.length} atas`, 'success');
}

// ===== PESSOAS & MEMBROS =====
let peopleTab = 'todos';
let peoplePage = 1;
let selectedMemberId = 8;
const PEOPLE_PAGE_SIZE = 12;

function memberStatusInfo(m) {
  if (m.pastoral) return { label: 'Corpo Pastoral', cls: 'pill-blue' };
  if (m.status === 'integracao') return { label: 'Em Integração', cls: 'pill-orange' };
  if (m.status === 'inativo') return { label: 'Inativo', cls: 'pill-red' };
  return { label: m.gender === 'f' ? 'Ativa' : 'Ativo', cls: 'pill-green' };
}

function peopleCounts() {
  const n = pred => mockMembers.filter(pred).length;
  const total = mockMembers.length;
  const week = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
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
      const hay = [m.name, m.email, m.phone, m.sector, m.role, m.position, (m.tags || []).join(' ')].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  list.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
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
      const tags = (m.tags && m.tags.length ? m.tags : [m.sector || 'Sem ministério']).map((t, i) =>
        `<span class="mtag ${i ? 'mtag-2' : ''}">${t}</span>`).join('');
      const contact = [m.email, m.phone].filter(v => v && v !== '—').join(' · ') || 'Sem contato cadastrado';
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
                <div class="pm-sub">${contact}</div>
              </div>
            </div>
          </td>
          <td><span class="pill ${st.cls}">${st.label}</span></td>
          <td><div class="mtags">${tags}</div></td>
          <td>${m.webAccess
            ? '<span class="pill pill-green">Liberado</span>'
            : '<span class="pill pill-gray">Sem acesso</span>'}</td>
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
  if (m.joined) {
    items.push({ tone: 'blue', title: 'Cadastro na igreja', sub: m.sector || 'Membro comum', meta: `Desde ${formatDate(m.joined)}`, metaCls: 'm-blue' });
  }
  if (m.position && m.sector) {
    items.push({ tone: 'green', title: `Serve como ${m.position}`, sub: m.sector, meta: 'Ministério ativo', metaCls: '' });
  }
  if (m.webAccess) {
    items.push({ tone: 'green', title: 'Acesso ao sistema liberado', sub: 'Painel web', meta: 'Ativo', metaCls: '' });
  }
  if (!items.length) {
    items.push({ tone: 'blue', title: 'Sem histórico registrado', sub: 'Nenhuma atividade registrada até o momento', meta: '—', metaCls: '' });
  }
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
  const statusLine = m.pastoral ? 'Cadastro pastoral ativo'
    : m.status === 'integracao' ? 'Em processo de integração'
      : m.status === 'inativo' ? 'Cadastro inativo / afastado'
        : 'Cadastro ativo';
  const statusColor = st.cls === 'pill-green' ? 'var(--success)'
    : st.cls === 'pill-orange' ? 'var(--warning)'
      : st.cls === 'pill-red' ? 'var(--danger)' : 'var(--primary)';
  const tl = memberTimeline(m).map(t => `
    <div class="tl-item tl-${t.tone}">
      <div class="tl-title">${t.title}</div>
      <div class="tl-sub">${t.sub}</div>
      <div class="tl-meta ${t.metaCls}">${t.meta}</div>
    </div>`).join('');
  const hasPhone = m.phone && m.phone !== '—';
  const hasEmail = m.email && m.email !== '—';
  const contactBtns = [
    hasPhone ? `<a class="pf-btn wa" href="https://wa.me/55${String(m.phone).replace(/\D/g, '')}" target="_blank" rel="noopener"><i data-lucide="message-circle"></i> WhatsApp Direto</a>` : '',
    hasEmail ? `<a class="pf-btn" href="mailto:${m.email}"><i data-lucide="mail"></i> E-mail</a>` : '',
  ].filter(Boolean).join('');
  const accessAction = canManageAccess()
    ? (m.webAccess
      ? `<button class="pf-access-btn revoke" onclick="toggleMemberAccess('${m.id}', false)">Revogar acesso</button>`
      : (hasEmail
        ? `<button class="pf-access-btn grant" onclick="toggleMemberAccess('${m.id}', true)">Liberar acesso</button>`
        : `<span class="pf-info-label">Cadastre um e-mail para liberar</span>`))
    : '';

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
        <div class="pf-role">${m.role} · ${m.sector || 'Membro comum'}</div>
      </div>
      ${contactBtns ? `<div class="pf-btns">${contactBtns}</div>` : ''}
      <div class="pf-info">
        <div>
          <div class="pf-info-label">Batismo</div>
          <div class="pf-info-val">${m.baptism || '—'}</div>
        </div>
        <div>
          <div class="pf-info-label">Membro desde</div>
          <div class="pf-info-val">${m.joined ? formatDate(m.joined) : '—'}</div>
        </div>
        <div>
          <div class="pf-info-label">Ministério / Cargo</div>
          <div class="pf-info-val">${m.sector || 'Membro comum'}${m.position ? ' · ' + m.position : ''}</div>
        </div>
        <div>
          <div class="pf-info-label">Telefone</div>
          <div class="pf-info-val">${m.phone || '—'}</div>
        </div>
      </div>
      <div class="pf-access">
        <div>
          <div class="pf-info-label">Acesso ao sistema web</div>
          <div class="pf-info-val">${m.webAccess ? 'Liberado' : 'Não liberado'}</div>
          <small>${m.webAccess ? 'Pode entrar com o e-mail cadastrado.' : 'Somente líderes ou pessoas autorizadas pelo pastor.'}</small>
        </div>
        ${accessAction}
      </div>
      <div class="pf-section-title">Linha do Tempo do Cadastro <span>Dados reais</span></div>
      <div class="tl">${tl}</div>
      <div class="pf-note">
        <div class="pf-note-head">
          <span class="pf-note-title">Notas Pastorais Confidenciais</span>
          <span class="pf-note-badge">Reservado à Liderança</span>
        </div>
        <p>"${m.note || 'Sem anotações pastorais registradas para este membro.'}"</p>
        <div class="pf-note-foot"><span>Registro interno da igreja</span><span>Atualizado no cadastro</span></div>
      </div>
      <button class="btn-primary pf-edit" onclick="editMember('${m.id}')"><i data-lucide="pencil"></i> Editar Ficha Cadastral</button>
      <button class="btn-secondary pf-edit" onclick="openBaptismFormForMember('${m.id}')"><i data-lucide="droplets"></i> Ficha de Batismo</button>
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
  const lines = ['Nome,Email,Telefone,Ministerio,Cargo,Status,Acesso,Membro desde'];
  list.forEach(m => {
    const st = memberStatusInfo(m);
    lines.push([m.name, m.email, m.phone, m.sector, m.position || '', st.label, m.webAccess ? 'Liberado' : 'Sem acesso', m.joined || '']
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

function visibleDepartments() {
  const all = mockDepartments || [];
  if (isFullAccess()) return all;
  const uid = currentUser && currentUser.id;
  if (!uid) return [];
  return all.filter(d => (d.leaderUserIds || []).includes(uid) || d.leaderUserId === uid);
}

function renderSetorKpis() {
  const list = visibleDepartments();
  const total = list.length;
  const members = list.reduce((s, d) => s + (d.volunteers || 0), 0);
  const withLeader = list.filter(d => !!d.leaderUserId).length;
  const cargos = list.reduce((s, d) => s + ((d.cargos || []).length), 0);
  const pctLeader = total ? Math.round((withLeader / total) * 100) : 0;

  setText('sKpiTotal', total);
  setText('sKpiTotalPct', total ? 'todos ativos' : '—');
  const totalBar = document.getElementById('sKpiTotalBar');
  if (totalBar) totalBar.style.width = total ? '100%' : '0%';
  setText('sKpiAtivos', `${withLeader} com líder`);

  setText('sKpiVol', members);
  setText('sKpiVolPct', total ? `~${Math.round(members / total)} por ministério` : '—');
  setText('sKpiVolNovos', `${total} ministérios`);

  setText('sKpiCobertura', pctLeader + '%');
  setText('sKpiCoberturaDelta', `${withLeader}/${total}`);
  const cobBar = document.getElementById('sKpiCoberturaBar');
  if (cobBar) cobBar.style.width = pctLeader + '%';
  setText('sKpiCoberturaMeta', `${total - withLeader} sem líder`);

  setText('sKpiLider', cargos);
  setText('sKpiLiderPct', cargos ? 'funções ativas' : '—');
  setText('sKpiLiderMeta', `${total} ministérios`);
  setText('deptBadge', `${total} Ministérios`);
}

function renderDeptTabs() {
  const tabs = document.getElementById('deptTabs');
  if (!tabs) {
    setText('deptTabTodos', visibleDepartments().length);
    return;
  }
  tabs.querySelectorAll('.dept-tab').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === deptTab);
  });
  setText('deptTabTodos', visibleDepartments().length);
}

function setDeptTab(tab) {
  deptTab = tab;
  renderDeptTabs();
  renderDeptGrid();
}

function renderDeptGrid() {
  const grid = document.getElementById('deptGrid');
  if (!grid) return;
  const list = visibleDepartments();
  if (!list.length) {
    grid.innerHTML = isFullAccess()
      ? '<div class="empty-state"><i data-lucide="network"></i><p>Nenhum ministério cadastrado. Crie o primeiro em "Novo Ministério".</p></div>'
      : '<div class="empty-state"><i data-lucide="shield"></i><p>Você ainda não lidera nenhum ministério. Fale com o pastor ou admin master.</p></div>';
    if (window.lucide) lucide.createIcons();
    return;
  }
  grid.innerHTML = list.map(d => {
    const cargos = d.cargos || [];
    const color = d.color || '#103B5F';
    const cargoChips = cargos.slice(0, 3).map(c => `<span class="mtag">${c}</span>`).join('') +
      (cargos.length > 3 ? `<span class="mtag mtag-2">+${cargos.length - 3}</span>` : '');
    return `
    <div class="dept-card">
      <div class="dept-card-head">
        <span class="dept-ico" style="background:${color}18;color:${color}"><i data-lucide="${d.icon || 'users'}"></i></span>
        <div class="dept-card-title">
          <strong>${d.name}</strong>
          <small>${d.sub || 'Sem descrição cadastrada'}</small>
        </div>
        <div class="dept-menu dropdown-anchor">
          <button class="icon-box dept-more" onclick="toggleDeptMenu(event,'${d.id}')" title="Ações rápidas"><i data-lucide="more-horizontal"></i></button>
        </div>
      </div>
      <div class="dept-leader"><i data-lucide="crown"></i> ${d.leader && d.leader !== '—' ? d.leader : 'Sem líder definido'}</div>
      <div class="dept-meta">
        <span><i data-lucide="users"></i> ${d.volunteers || 0} membros</span>
        <span><i data-lucide="tags"></i> ${cargos.length} cargos</span>
      </div>
      <div class="mtags min-dept-tags">${cargoChips || '<span class="min-muted">Nenhum cargo cadastrado</span>'}</div>
      <button class="dept-manage" onclick="openMinistryPage('${d.id}')">Gerenciar Ministério</button>
    </div>`;
  }).join('');
  if (window.lucide) lucide.createIcons();
}

function renderSaudeMinisterial() {
  const list = visibleDepartments();
  const noLeader = list.filter(d => !d.leaderUserId);
  const noMembers = list.filter(d => (d.volunteers || 0) === 0);

  const saude = document.getElementById('saudeList');
  if (saude) {
    saude.innerHTML = noLeader.length
      ? noLeader.map(d => `
        <div class="sob-row">
          <div class="sob-info">
            <strong>${d.name}</strong>
            <small>${d.sub || 'Sem descrição cadastrada'}</small>
          </div>
          <button class="btn-ghost btn-sm" onclick="openMinistryPage('${d.id}')">Definir líder</button>
        </div>`).join('')
      : '<div class="min-empty-inline"><i data-lucide="check-circle-2"></i> Todos os ministérios têm líder definido.</div>';
  }
  setText('semLiderCount', String(noLeader.length));

  const sob = document.getElementById('sobrecargaList');
  if (sob) {
    sob.innerHTML = noMembers.length
      ? noMembers.map(d => `
        <div class="sob-row">
          <div class="sob-info">
            <strong>${d.name}</strong>
            <small>${(d.cargos || []).length} cargos cadastrados</small>
          </div>
          <button class="btn-ghost btn-sm" onclick="openMinistryPage('${d.id}')">Adicionar membros</button>
        </div>`).join('')
      : '<div class="min-empty-inline"><i data-lucide="check-circle-2"></i> Todos os ministérios têm membros vinculados.</div>';
  }
  setText('alertaCount', `${noMembers.length} ministério${noMembers.length === 1 ? '' : 's'}`);
}

// ===== GERENCIAR MINISTÉRIO (página inteira) =====
let ministryPageId = null;       // id do setor aberto (null = novo)
let ministryTargetSection = null; // rolagem/foco ao abrir via ação rápida
let ministryUsers = [];          // usuários disponíveis para liderança
let ministrySchedules = [];      // próximas escalas do ministério
let ministryCargosDraft = [];    // cargos em edição
let ministryPeopleOptions = [];  // pessoas que ainda podem ser vinculadas
let ministryLeaderIds = [];      // líderes selecionados
let ministrySelectedPersonId = null;
let ministryLeaderHideTimer = null;
let ministryPeopleHideTimer = null;
let ministryAuditLogs = [];

function escHtml(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function slugifyMinistry(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 60);
}

function currentMinistrySector() {
  return (window.apiSectors || []).find(s => s.id === ministryPageId) || null;
}

function canManageMinistryLeadership() {
  return isFullAccess();
}

function openMinistryPage(id) {
  ministryPageId = id || null;
  const navEl = document.querySelector('.nav-item[data-section="setores"]');
  navigateTo('ministerio', navEl);
}

function manageDept(id) { openMinistryPage(id); }

function minGuideGo(id, btn) {
  document.querySelectorAll('.min-guide-item').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeDeptMenu() {
  const menu = document.getElementById('deptActionMenu');
  if (menu) menu.remove();
}

function toggleDeptMenu(event, id) {
  if (event) event.stopPropagation();
  const sector = (window.apiSectors || []).find(s => s.id === id);
  if (!sector) return;
  const trigger = event.currentTarget;
  const alreadyOpen = document.getElementById('deptActionMenu');
  const sameSector = alreadyOpen && alreadyOpen.dataset.sector === id;
  closeDropdowns();
  closeDeptMenu();
  if (sameSector) return;

  const fullAccess = canManageMinistryLeadership();
  const menu = document.createElement('div');
  menu.id = 'deptActionMenu';
  menu.className = 'dropdown dept-actions open';
  menu.dataset.sector = id;
  menu.style.position = 'fixed';
  menu.style.right = 'auto';
  menu.style.zIndex = '9999';
  menu.innerHTML = `
    <div class="dropdown-label">Ações rápidas</div>
    <div class="dropdown-item" data-action="manage"><i data-lucide="settings"></i> Gerenciar ministério</div>
    <div class="dropdown-item" data-action="members"><i data-lucide="users"></i> Membros e cargos</div>
    <div class="dropdown-item" data-action="schedules"><i data-lucide="calendar-days"></i> Abrir escalas</div>
    ${fullAccess ? '<div class="dropdown-item" data-action="leader"><i data-lucide="crown"></i> Definir líder</div>' : ''}
    ${fullAccess ? '<div class="dropdown-item" data-action="cargos"><i data-lucide="tags"></i> Editar cargos</div>' : ''}
    ${fullAccess ? '<div class="dropdown-item item-danger" data-action="delete"><i data-lucide="trash-2"></i> Excluir ministério</div>' : ''}
  `;
  menu.style.visibility = 'hidden';
  document.body.appendChild(menu);
  const rect = trigger.getBoundingClientRect();
  const w = menu.offsetWidth || 220;
  const h = menu.offsetHeight || 0;
  menu.style.left = Math.max(8, Math.min(rect.right - w, window.innerWidth - w - 8)) + 'px';
  menu.style.top = Math.max(8, Math.min(rect.bottom + 8, window.innerHeight - h - 12)) + 'px';
  menu.style.visibility = '';
  menu.addEventListener('click', (ev) => {
    const item = ev.target.closest('.dropdown-item');
    if (!item) return;
    const action = item.dataset.action;
    closeDeptMenu();
    if (action === 'manage') openMinistryPage(id);
    else if (action === 'members') openMinistryPageSection(id, 'members');
    else if (action === 'schedules') openMinistrySchedulesById(id);
    else if (action === 'leader') openMinistryPageSection(id, 'leader');
    else if (action === 'cargos') openMinistryPageSection(id, 'cargos');
    else if (action === 'delete') quickDeleteMinistry(id);
  });
  if (window.lucide) lucide.createIcons();
}

function openMinistryPageSection(id, section) {
  closeDropdowns();
  ministryTargetSection = section || null;
  openMinistryPage(id);
}

function openMinistrySchedulesById(id) {
  closeDropdowns();
  const sector = (window.apiSectors || []).find(s => s.id === id);
  if (!sector) { showToast('Ministério não encontrado', 'error'); return; }
  escMinistryName = sector.name;
  escActiveId = null;
  navigateTo('escalas');
}

async function quickDeleteMinistry(id) {
  closeDropdowns();
  if (!canManageMinistryLeadership()) {
    showToast('Apenas pastor ou admin master pode excluir ministérios', 'error');
    return;
  }
  const sector = (window.apiSectors || []).find(s => s.id === id);
  if (!sector) return;
  if (!(await appConfirm(`Excluir o ministério "${sector.label}"? Escalas e vínculos deste ministério também serão removidos. Esta ação não pode ser desfeita.`, { title: 'Excluir ministério', confirmLabel: 'Excluir', icon: 'delete', tone: 'danger' }))) return;
  try {
    await apiPost(`/sectors/${id}/delete`, { actorId: currentUser ? currentUser.id : undefined });
    await hydrateFromApi();
    ministryPageId = null;
    renderSetores();
    showToast('Ministério excluído', 'success');
  } catch (e) {
    showToast((e && e.message) || 'Não foi possível excluir o ministério', 'error');
  }
}

function renderMinistryCargos() {
  const chips = document.getElementById('minCargosChips');
  if (chips) {
    chips.innerHTML = ministryCargosDraft.length
      ? ministryCargosDraft.map((c, i) => `
        <span class="min-chip">${escHtml(c)}
          <button type="button" onclick="removeMinistryCargo(${i})" title="Remover cargo"><i data-lucide="x"></i></button>
        </span>`).join('')
      : '<span class="min-muted">Nenhum cargo cadastrado ainda.</span>';
  }
  setText('minCargosCount', `${ministryCargosDraft.length} cargo${ministryCargosDraft.length === 1 ? '' : 's'}`);

  const datalist = document.getElementById('minCargosList');
  if (datalist) datalist.innerHTML = ministryCargosDraft.map(c => `<option value="${escHtml(c)}"></option>`).join('');

  const addMenu = document.getElementById('minAddCargosMenu');
  if (addMenu) {
    addMenu.innerHTML = ministryCargosDraft.length
      ? ministryCargosDraft.map(c => `<label><input type="checkbox" value="${escHtml(c)}" onchange="updateMinistryAddCargoLabel()"> ${escHtml(c)}</label>`).join('')
      : '<span class="min-muted">Cadastre cargos primeiro.</span>';
  }
  updateMinistryAddCargoLabel();
  renderMinistryMembers();
  if (window.lucide) lucide.createIcons();
}

function updateMinistryAddCargoLabel() {
  const menu = document.getElementById('minAddCargosMenu');
  const label = document.getElementById('minAddCargosLabel');
  if (!menu || !label) return;
  const selected = [...menu.querySelectorAll('input:checked')].map(i => i.value);
  label.textContent = selected.length ? selected.join(', ') : 'Selecionar cargos';
}

async function persistMinistryCargos() {
  if (!ministryPageId) return;
  const sector = currentMinistrySector();
  if (!sector) return;
  const current = JSON.stringify(sector.cargosList || []);
  if (JSON.stringify(ministryCargosDraft) === current) return;
  await apiPost(`/sectors/${ministryPageId}/update`, {
    cargos: ministryCargosDraft,
    actorId: currentUser ? currentUser.id : undefined,
  });
  await hydrateFromApi();
}

async function addMinistryCargo() {
  const input = document.getElementById('minCargoInput');
  if (!input) return;
  const value = input.value.trim();
  if (!value) { input.focus(); return; }
  if (ministryCargosDraft.some(c => c.toLowerCase() === value.toLowerCase())) {
    showToast('Este cargo já está cadastrado', 'warning');
    return;
  }
  ministryCargosDraft.push(value);
  input.value = '';
  renderMinistryCargos();
  if (ministryPageId) {
    try {
      await persistMinistryCargos();
      refreshMinistryMemberArea();
      showToast('Cargo adicionado', 'success');
    } catch (e) {
      showToast((e && e.message) || 'Não foi possível salvar o cargo', 'error');
    }
  }
}

async function removeMinistryCargo(index) {
  const cargo = ministryCargosDraft[index];
  if (!cargo) return;
  if (!(await appConfirm(`Remover o cargo "${cargo}"?`, { title: 'Remover cargo', confirmLabel: 'Remover', icon: 'label_off', tone: 'danger' }))) return;
  ministryCargosDraft.splice(index, 1);
  renderMinistryCargos();
  if (ministryPageId) {
    try {
      await persistMinistryCargos();
      refreshMinistryMemberArea();
      showToast('Cargo removido', 'success');
    } catch (e) {
      showToast((e && e.message) || 'Não foi possível salvar o cargo', 'error');
    }
  }
}

function ministryUserName(user) {
  if (!user) return 'Usuário';
  return (user.person && user.person.name) || user.email || 'Usuário';
}

function renderMinistryLeaderChips() {
  const box = document.getElementById('minLeaderChips');
  if (!box) return;
  if (!ministryLeaderIds.length) {
    box.innerHTML = '<span class="min-muted">Nenhum líder definido</span>';
  } else {
    const canEdit = canManageMinistryLeadership();
    box.innerHTML = ministryLeaderIds.map(id => {
      const user = ministryUsers.find(u => u.id === id);
      const name = ministryUserName(user);
      return `<span class="min-chip min-leader-chip">${escHtml(name)}
        ${canEdit ? `<button type="button" onclick="removeMinistryLeader('${id}')" title="Remover líder"><i data-lucide="x"></i></button>` : ''}
      </span>`;
    }).join('');
  }
  if (window.lucide) lucide.createIcons();
}

function filterMinistryLeaderSuggestions() {
  clearTimeout(ministryLeaderHideTimer);
  const input = document.getElementById('minLeaderSearch');
  const box = document.getElementById('minLeaderSuggestions');
  if (!input || !box) return;
  if (input.disabled) { box.classList.remove('open'); return; }
  const term = (input.value || '').trim().toLowerCase();
  const list = ministryUsers
    .filter(u => !ministryLeaderIds.includes(u.id))
    .filter(u => {
      if (!term) return true;
      const name = ministryUserName(u).toLowerCase();
      const email = String(u.email || '').toLowerCase();
      return name.includes(term) || email.includes(term);
    })
    .slice(0, 8);
  if (!list.length) {
    box.innerHTML = '<div class="min-suggestion-empty">Nenhum usuário encontrado</div>';
  } else {
    box.innerHTML = list.map(u => {
      const name = ministryUserName(u);
      const roles = (u.roles || []).map(r => r.role && r.role.name).filter(Boolean)
        .map(n => n === 'SUPER_ADMIN' ? 'Admin Master' : n === 'PASTOR' ? 'Pastor' : 'Membro');
      return `<button type="button" class="min-suggestion-item" onmousedown="event.preventDefault()" onclick="addMinistryLeader('${u.id}')">
        <span class="min-suggestion-avatar">${escHtml(initials(name))}</span>
        <span class="min-suggestion-text">
          <strong>${escHtml(name)}</strong>
          <small>${escHtml(u.email || '')}${roles.length ? ' · ' + escHtml([...new Set(roles)].join(', ')) : ''}</small>
        </span>
      </button>`;
    }).join('');
  }
  box.classList.add('open');
}

function showMinistryLeaderSuggestions() {
  filterMinistryLeaderSuggestions();
}

function hideMinistryLeaderSuggestions(force) {
  clearTimeout(ministryLeaderHideTimer);
  ministryLeaderHideTimer = setTimeout(() => {
    const input = document.getElementById('minLeaderSearch');
    if (!force && input && document.activeElement === input) return;
    const box = document.getElementById('minLeaderSuggestions');
    if (box) box.classList.remove('open');
  }, 160);
}

async function addMinistryLeader(id) {
  if (!canManageMinistryLeadership()) {
    showToast('Apenas pastor ou admin master pode alterar líderes', 'error');
    return;
  }
  if (!id || ministryLeaderIds.includes(id)) return;
  ministryLeaderIds.push(id);
  const input = document.getElementById('minLeaderSearch');
  if (input) input.value = '';
  hideMinistryLeaderSuggestions(true);
  renderMinistryLeaderChips();
  if (ministryPageId) {
    try {
      await persistMinistryLeaders();
      showToast('Líder adicionado', 'success');
    } catch (e) {
      showToast((e && e.message) || 'Não foi possível adicionar o líder', 'error');
      await renderMinistryPage();
    }
  }
}

async function removeMinistryLeader(id) {
  if (!canManageMinistryLeadership()) {
    showToast('Apenas pastor ou admin master pode alterar líderes', 'error');
    return;
  }
  ministryLeaderIds = ministryLeaderIds.filter(x => x !== id);
  renderMinistryLeaderChips();
  if (ministryPageId) {
    try {
      await persistMinistryLeaders();
      showToast('Líder removido', 'success');
    } catch (e) {
      showToast((e && e.message) || 'Não foi possível remover o líder', 'error');
      await renderMinistryPage();
    }
  }
}

async function persistMinistryLeaders() {
  if (!ministryPageId) return;
  await apiPost(`/sectors/${ministryPageId}/update`, {
    leaderUserIds: ministryLeaderIds.slice(),
    actorId: currentUser ? currentUser.id : undefined,
  });
  await hydrateFromApi();
  const sector = currentMinistrySector();
  if (sector) ministryLeaderIds = (sector.leaderUserIds || []).slice();
  renderMinistryLeaderChips();
  renderMinistryStats(sector);
  renderMinistryInfo(sector);
  loadMinistryAudit();
}

function renderMinistryStats(sector) {
  const box = document.getElementById('minStats');
  if (!box) return;
  const members = ((sector && sector.members) || []).filter(m => m.person || m.user || m.personId || m.userId);
  const withLogin = members.filter(m => m.user).length;
  const stats = [
    { label: 'Membros ativos', value: members.length },
    { label: 'Com acesso ao sistema', value: withLogin },
    { label: 'Cargos', value: ministryCargosDraft.length },
    { label: 'Escalas futuras', value: ministrySchedules.length },
  ];
  box.innerHTML = stats.map(s => `
    <div class="min-stat">
      <b>${s.value}</b>
      <span>${s.label}</span>
    </div>`).join('');
}

function renderMinistryInfo(sector) {
  const box = document.getElementById('minInfoList');
  if (!box) return;
  if (!sector) {
    box.innerHTML = '<div class="min-muted">As informações aparecem depois que o ministério for criado.</div>';
    return;
  }
  const rows = [
    ['Status', sector.isActive === false ? 'Inativo' : 'Ativo'],
    ['Líderes', sector.leaderDisplay || sector.leaderName || 'Sem líder'],
    ['Membros ativos', String((sector.members || []).length)],
    ['Cargos', String(ministryCargosDraft.length)],
    ['Escalas futuras', String(ministrySchedules.length)],
    ['E-mail de contato', sector.contactEmail || '—'],
    ['WhatsApp', sector.whatsappLink || '—'],
  ];
  box.innerHTML = rows.map(([label, value]) => `
    <div class="min-info-row">
      <span>${escHtml(label)}</span>
      <strong>${escHtml(value)}</strong>
    </div>`).join('');
}

async function loadMinistryAudit() {  const sector = currentMinistrySector();
  if (!sector) { ministryAuditLogs = []; renderMinistryAudit(); return; }
  try {
    const logs = await apiGet(`/sectors/${sector.id}/audit`);
    ministryAuditLogs = Array.isArray(logs) ? logs : [];
  } catch (e) { ministryAuditLogs = []; }
  renderMinistryAudit();
}

// Atualiza apenas as áreas de membros/estatísticas/auditoria,
// preservando o que o usuário digitou nos campos do ministério.
function renderMinistryIndications() {
  const box = document.getElementById('minIndicationsList');
  if (!box) return;
  const sector = currentMinistrySector();
  const list = (sector && sector.indications) || [];
  setText('minIndicationsCount', `${list.length} indica${list.length === 1 ? 'ção' : 'ões'}`);
  if (!list.length) {
    box.innerHTML = '<div class="min-muted" style="padding:8px 0">Nenhuma indicação registrada.</div>';
    return;
  }
  const statusMeta = {
    ATIVO: { label: 'Ativo', cls: 'pill-green' },
    APROVADO: { label: 'Aprovado', cls: 'pill-blue' },
    INDICADO: { label: 'Indicado', cls: 'pill-orange' },
    RECUSADO: { label: 'Recusado', cls: 'pill-red' },
  };
  box.innerHTML = list.map(ind => {
    const st = statusMeta[String(ind.status || 'INDICADO').toUpperCase()] || statusMeta.INDICADO;
    return `<div class="min-indication-row">
      <span class="min-member-av">${escHtml(initials(ind.name))}</span>
      <div class="min-indication-info">
        <strong>${escHtml(ind.name)}${ind.person ? ' <i data-lucide="link" title="Vinculado a membro"></i>' : ''}</strong>
        <small>${escHtml([ind.role, ind.year].filter(Boolean).join(' · ') || 'Sem função informada')}</small>
      </div>
      <span class="pill ${st.cls}">${st.label}</span>
      <div class="min-indication-actions">
        ${String(ind.status).toUpperCase() !== 'ATIVO' ? `<button class="btn-icon" onclick="updateMinistryIndicationStatus('${ind.id}','ATIVO')" title="Ativar indicação"><i data-lucide="check"></i></button>` : ''}
        <button class="btn-icon danger" onclick="removeMinistryIndication('${ind.id}')" title="Remover indicação"><i data-lucide="trash-2"></i></button>
      </div>
    </div>`;
  }).join('');
  if (window.lucide) lucide.createIcons();
}

async function addMinistryIndication() {
  const sector = currentMinistrySector();
  if (!sector) { showToast('Salve o ministério primeiro', 'warning'); return; }
  const name = ((document.getElementById('minIndicationName') || {}).value || '').trim();
  const role = ((document.getElementById('minIndicationRole') || {}).value || '').trim();
  const year = ((document.getElementById('minIndicationYear') || {}).value || '').trim();
  if (!name) { showToast('Informe o nome indicado', 'error'); return; }
  try {
    await apiPost(`/sectors/${sector.id}/indications`, { name, role, year, status: 'INDICADO', actorId: currentUser ? currentUser.id : undefined });
    await hydrateFromApi();
    const nameEl = document.getElementById('minIndicationName');
    const roleEl = document.getElementById('minIndicationRole');
    if (nameEl) nameEl.value = '';
    if (roleEl) roleEl.value = '';
    renderMinistryIndications();
    renderMinistryStats(currentMinistrySector());
    loadMinistryAudit();
    showToast('Indicação adicionada', 'success');
  } catch (e) {
    showToast((e && e.message) || 'Não foi possível adicionar a indicação', 'error');
  }
}

async function updateMinistryIndicationStatus(indicationId, status) {
  const sector = currentMinistrySector();
  if (!sector) return;
  try {
    await apiPost(`/sectors/${sector.id}/indications/${indicationId}/update`, { status, actorId: currentUser ? currentUser.id : undefined });
    await hydrateFromApi();
    renderMinistryIndications();
    loadMinistryAudit();
    showToast('Indicação atualizada', 'success');
  } catch (e) {
    showToast((e && e.message) || 'Não foi possível atualizar a indicação', 'error');
  }
}

async function removeMinistryIndication(indicationId) {
  const sector = currentMinistrySector();
  if (!sector) return;
  const indication = (sector.indications || []).find(i => i.id === indicationId);
  if (!indication) return;
  if (!(await appConfirm(`Remover a indicação de "${indication.name}"?`, { title: 'Remover indicação', confirmLabel: 'Remover', icon: 'user-x', tone: 'danger' }))) return;
  try {
    await apiPost(`/sectors/${sector.id}/indications/${indicationId}/remove`, { actorId: currentUser ? currentUser.id : undefined });
    await hydrateFromApi();
    renderMinistryIndications();
    renderMinistryStats(currentMinistrySector());
    loadMinistryAudit();
    showToast('Indicação removida', 'success');
  } catch (e) {
    showToast((e && e.message) || 'Não foi possível remover a indicação', 'error');
  }
}

function refreshMinistryMemberArea() {
  const sector = currentMinistrySector();
  renderMinistryCargos();
  renderMinistryIndications();
  renderMinistryStats(sector);
  renderMinistryInfo(sector);
  loadMinistryAudit();
  if (window.lucide) lucide.createIcons();
}

function renderMinistryMembers() {
  const body = document.getElementById('minMembersBody');
  if (!body) return;
  const sector = currentMinistrySector();
  if (!sector) {
    body.innerHTML = '<tr><td colspan="5"><div class="min-muted" style="padding:18px">Salve o ministério para adicionar membros.</div></td></tr>';
    ministryPeopleOptions = [];
    return;
  }
  const members = (sector.members || []).filter(m => m.person || m.user || m.personId || m.userId);
  setText('minMembersCount', `${members.length} membro${members.length === 1 ? '' : 's'}`);
  setText('minMembersSub', `${members.length} pessoa${members.length === 1 ? '' : 's'} vinculada${members.length === 1 ? '' : 's'} a este ministério`);

  const linkedIds = new Set();
  members.forEach(m => {
    if (m.personId) linkedIds.add(m.personId);
    if (m.person && m.person.id) linkedIds.add(m.person.id);
    if (m.user && m.user.person && m.user.person.id) linkedIds.add(m.user.person.id);
  });
  ministryPeopleOptions = (mockMembers || [])
    .filter(p => p && p.id && !linkedIds.has(p.id))
    .sort((a, b) => String(a.name).localeCompare(String(b.name), 'pt-BR'));
  if (ministrySelectedPersonId && !ministryPeopleOptions.some(p => p.id === ministrySelectedPersonId)) {
    ministrySelectedPersonId = null;
    const input = document.getElementById('minAddPersonSearch');
    if (input) input.value = '';
  }

  if (!members.length) {
    body.innerHTML = '<tr><td colspan="5"><div class="min-muted" style="padding:18px">Nenhum membro vinculado ainda. Use o campo acima para adicionar.</div></td></tr>';
    return;
  }

  body.innerHTML = members.map(m => {
    const person = m.person || (m.user && m.user.person) || {};
    const name = person.name || (m.user && m.user.email) || 'Membro';
    const email = person.email || (m.user && m.user.email) || '—';
    const phone = person.phone || '—';
    const positions = parseCargos(m.positions || m.position);
    const isLeader = !!(m.userId && ((sector.leaderUserIds || []).includes(m.userId) || sector.leaderUserId === m.userId));
    const access = !!m.user;
    const cargoMenu = ministryCargosDraft.length
      ? ministryCargosDraft.map(c => `
          <label><input type="checkbox" value="${escHtml(c)}" ${positions.includes(c) ? 'checked' : ''} onchange="saveMinistryMemberCargos('${m.id}')"> ${escHtml(c)}</label>`).join('')
      : '<span class="min-muted">Cadastre cargos primeiro.</span>';
    return `
      <tr>
        <td>
          <div class="min-member">
            <span class="min-member-av">${escHtml(initials(name))}</span>
            <div>
              <strong>${escHtml(name)}${isLeader ? ' <span class="lider-tag">Líder</span>' : ''}</strong>
              <small>${escHtml(m.role && m.role.label ? m.role.label : 'Membro')}${positions.length ? ' · ' + positions.length + ' cargo' + (positions.length === 1 ? '' : 's') : ''}</small>
            </div>
          </div>
        </td>
        <td>
          <div class="min-contact">${escHtml(email)}<br><small>${escHtml(phone)}</small></div>
        </td>
        <td>
          <details class="min-cargo-picker" data-member="${m.id}">
            <summary>
              ${positions.length
                ? positions.map(p => `<span class="min-chip-sm">${escHtml(p)}</span>`).join('')
                : '<span class="min-muted">Sem cargo</span>'}
            </summary>
            <div class="min-cargo-menu">${cargoMenu}</div>
          </details>
        </td>
        <td>${access
          ? '<span class="pill pill-green">Com login</span>'
          : '<span class="pill pill-gray">Sem login</span>'}</td>
        <td class="pactions">
          ${access && !isLeader && canManageMinistryLeadership()
            ? `<button class="btn-icon" onclick="promoteMinistryMember('${m.id}')" title="Definir como líder"><i data-lucide="crown"></i></button>`
            : ''}
          <button class="btn-icon danger" onclick="removeMinistryMember('${m.id}')" title="Remover do ministério"><i data-lucide="user-minus"></i></button>
        </td>
      </tr>`;
  }).join('');
  if (window.lucide) lucide.createIcons();
}

function filterMinistryPeopleSuggestions() {
  clearTimeout(ministryPeopleHideTimer);
  const input = document.getElementById('minAddPersonSearch');
  const box = document.getElementById('minPersonSuggestions');
  if (!input || !box) return;
  if (ministrySelectedPersonId) {
    const selected = ministryPeopleOptions.find(p => p.id === ministrySelectedPersonId);
    if (selected && input.value === selected.name) { box.classList.remove('open'); return; }
    ministrySelectedPersonId = null;
  }
  const term = (input.value || '').trim().toLowerCase();
  const list = ministryPeopleOptions.filter(p =>
    !term ||
    String(p.name || '').toLowerCase().includes(term) ||
    String(p.email || '').toLowerCase().includes(term) ||
    String(p.phone || '').toLowerCase().includes(term)
  ).slice(0, 8);
  if (!list.length) {
    box.innerHTML = '<div class="min-suggestion-empty">Nenhuma pessoa encontrada</div>';
  } else {
    box.innerHTML = list.map(p => `
      <button type="button" class="min-suggestion-item" onmousedown="event.preventDefault()" onclick="selectMinistryPerson('${p.id}')">
        <span class="min-suggestion-avatar">${escHtml(initials(p.name))}</span>
        <span class="min-suggestion-text"><strong>${escHtml(p.name)}</strong></span>
      </button>`).join('');
  }
  box.classList.add('open');
}

function showMinistryPeopleSuggestions() {
  filterMinistryPeopleSuggestions();
}

function hideMinistryPeopleSuggestions(force) {
  clearTimeout(ministryPeopleHideTimer);
  ministryPeopleHideTimer = setTimeout(() => {
    const input = document.getElementById('minAddPersonSearch');
    if (!force && input && document.activeElement === input) return;
    const box = document.getElementById('minPersonSuggestions');
    if (box) box.classList.remove('open');
  }, 160);
}

function selectMinistryPerson(id) {
  const person = ministryPeopleOptions.find(p => p.id === id);
  if (!person) return;
  ministrySelectedPersonId = id;
  const input = document.getElementById('minAddPersonSearch');
  if (input) input.value = person.name;
  hideMinistryPeopleSuggestions(true);
}

function handleMinistryPersonFieldClick(event) {
  if (event && (event.target.closest('input') || event.target.closest('button'))) return;
  openMinistryPersonPicker();
}

function renderMinistryPersonPickerList(term) {
  const listEl = document.getElementById('minPickerList');
  if (!listEl) return;
  const q = String(term || '').trim().toLowerCase();
  const list = ministryPeopleOptions.filter(p =>
    !q ||
    String(p.name || '').toLowerCase().includes(q) ||
    String(p.email || '').toLowerCase().includes(q) ||
    String(p.phone || '').toLowerCase().includes(q)
  );
  if (!list.length) {
    listEl.innerHTML = '<div class="min-picker-empty">Nenhuma pessoa disponível. Todas já estão no ministério ou não há pessoas cadastradas.</div>';
    return;
  }
  listEl.innerHTML = list.map(p => `
    <button type="button" class="min-picker-item" onclick="selectMinistryPersonFromPicker('${p.id}')">
      <span class="min-picker-avatar">${escHtml(initials(p.name))}</span>
      <span class="min-picker-info">
        <strong>${escHtml(p.name)}</strong>
        <small>${escHtml(p.email && p.email !== '—' ? p.email : 'Sem e-mail')}${p.phone && p.phone !== '—' ? ' · ' + escHtml(p.phone) : ''}</small>
      </span>
      ${p.webAccess ? '<span class="pill pill-green">Com acesso</span>' : '<span class="pill pill-gray">Sem acesso</span>'}
    </button>`).join('');
  if (window.lucide) lucide.createIcons();
}

function filterMinistryPersonPicker() {
  const search = document.getElementById('minPickerSearch');
  renderMinistryPersonPickerList(search ? search.value : '');
}

function openMinistryPersonPicker() {
  const title = document.getElementById('modalTitle');
  const body = document.getElementById('modalBody');
  if (!title || !body) return;
  title.textContent = 'Selecionar pessoa';
  body.innerHTML = `
    <div class="min-picker">
      <div class="form-group" style="margin-bottom:12px">
        <input type="text" id="minPickerSearch" placeholder="Buscar por nome, e-mail ou telefone..." autocomplete="off" oninput="filterMinistryPersonPicker()">
      </div>
      <div class="min-picker-list" id="minPickerList"></div>
      <div class="min-picker-footer">
        <button class="btn-secondary" onclick="closeModal()">Fechar</button>
      </div>
    </div>`;
  renderMinistryPersonPickerList('');
  openModal();
  setTimeout(() => {
    const search = document.getElementById('minPickerSearch');
    if (search) search.focus();
  }, 80);
}

function selectMinistryPersonFromPicker(id) {
  selectMinistryPerson(id);
  closeModal();
}

async function saveMinistry() {
  const labelEl = document.getElementById('minLabel');
  const activeEl = document.getElementById('minActive');
  if (!labelEl) return;
  const label = labelEl.value.trim();
  if (!label) {
    showToast('Informe o nome do ministério', 'error');
    labelEl.focus();
    return;
  }
  const isNew = !ministryPageId;
  const payload = {
    label,
    description: (document.getElementById('minDescription') || {}).value || '',
    whatsappLink: (document.getElementById('minWhatsapp') || {}).value || '',
    contactEmail: (document.getElementById('minContactEmail') || {}).value || '',
    notes: (document.getElementById('minNotes') || {}).value || '',
    cargos: ministryCargosDraft,
    leaderUserIds: ministryLeaderIds,
    isActive: activeEl ? !!activeEl.checked : true,
    actorId: currentUser ? currentUser.id : undefined,
  };
  if (isNew) {
    const name = slugifyMinistry(label);
    if (!name) {
      showToast('Informe um nome válido para o ministério', 'error');
      return;
    }
    payload.name = name;
  }
  try {
    let saved;
    if (isNew) {
      saved = await apiPost('/sectors', payload);
      ministryPageId = saved.id;
      showToast('Ministério criado com sucesso!', 'success');
    } else {
      saved = await apiPost(`/sectors/${ministryPageId}/update`, payload);
      showToast('Ministério atualizado com sucesso!', 'success');
    }
    await hydrateFromApi();
    if (saved && saved.id) ministryPageId = saved.id;
    await renderMinistryPage();
  } catch (e) {
    const msg = e && e.message && e.message !== 'API offline' ? e.message : 'Não foi possível salvar o ministério';
    showToast(msg, 'error');
  }
}

async function addMinistryMember() {
  const sector = currentMinistrySector();
  if (!sector) { showToast('Salve o ministério primeiro', 'warning'); return; }
  const personId = ministrySelectedPersonId;
  if (!personId) { showToast('Selecione uma pessoa', 'error'); return; }
  const menu = document.getElementById('minAddCargosMenu');
  const positions = menu ? [...menu.querySelectorAll('input:checked')].map(i => i.value) : [];
  try {
    await persistMinistryCargos();
    await apiPost(`/sectors/${sector.id}/members`, {
      personId,
      positions,
      actorId: currentUser ? currentUser.id : undefined,
    });
    await hydrateFromApi();
    ministrySelectedPersonId = null;
    const input = document.getElementById('minAddPersonSearch');
    if (input) input.value = '';
    hideMinistryPeopleSuggestions(true);
    refreshMinistryMemberArea();
    showToast('Membro vinculado ao ministério!', 'success');
  } catch (e) {
    showToast((e && e.message) || 'Não foi possível adicionar o membro', 'error');
  }
}

async function saveMinistryMemberCargos(memberId) {
  const sector = currentMinistrySector();
  if (!sector) return;
  const picker = document.querySelector(`.min-cargo-picker[data-member="${memberId}"]`);
  if (!picker) return;
  const positions = [...picker.querySelectorAll('input:checked')].map(i => i.value);
  try {
    await persistMinistryCargos();
    await apiPost(`/sectors/${sector.id}/members/${memberId}/update`, {
      positions,
      actorId: currentUser ? currentUser.id : undefined,
    });
    await hydrateFromApi();
    refreshMinistryMemberArea();
    showToast('Cargos do membro atualizados', 'success');
  } catch (e) {
    showToast((e && e.message) || 'Não foi possível atualizar os cargos', 'error');
    await renderMinistryPage();
  }
}

async function removeMinistryMember(memberId) {
  const sector = currentMinistrySector();
  if (!sector) return;
  const member = (sector.members || []).find(m => m.id === memberId);
  const person = member ? (member.person || (member.user && member.user.person) || {}) : {};
  const name = person.name || (member && member.user && member.user.email) || 'este membro';
  if (!(await appConfirm(`Remover ${name} do ministério? A pessoa continua cadastrada na igreja.`, { title: 'Remover membro', confirmLabel: 'Remover', icon: 'person_remove', tone: 'danger' }))) return;
  try {
    await apiPost(`/sectors/${sector.id}/members/${memberId}/remove`, {
      actorId: currentUser ? currentUser.id : undefined,
    });
    await hydrateFromApi();
    refreshMinistryMemberArea();
    showToast('Membro removido do ministério', 'success');
  } catch (e) {
    showToast((e && e.message) || 'Não foi possível remover o membro', 'error');
  }
}

async function promoteMinistryMember(memberId) {
  if (!canManageMinistryLeadership()) {
    showToast('Apenas pastor ou admin master pode definir líderes', 'error');
    return;
  }
  const sector = currentMinistrySector();
  if (!sector) return;
  const member = (sector.members || []).find(m => m.id === memberId);
  const userId = member && member.userId;
  if (!userId) { showToast('Este membro não possui acesso ao sistema', 'error'); return; }
  const person = member.person || (member.user && member.user.person) || {};
  if (!(await appConfirm(`Adicionar ${person.name || 'este membro'} como líder do ministério?`, { title: 'Adicionar líder', confirmLabel: 'Adicionar', icon: 'workspace_premium', tone: 'primary' }))) return;
  try {
    if (!ministryLeaderIds.includes(userId)) ministryLeaderIds.push(userId);
    await persistMinistryLeaders();
    renderMinistryMembers();
    showToast('Liderança atualizada!', 'success');
  } catch (e) {
    showToast((e && e.message) || 'Não foi possível definir o líder', 'error');
    await renderMinistryPage();
  }
}

async function deleteMinistry() {
  if (!canManageMinistryLeadership()) {
    showToast('Apenas pastor ou admin master pode excluir ministérios', 'error');
    return;
  }
  const sector = currentMinistrySector();
  if (!sector) return;
  if (!(await appConfirm(`Excluir o ministério "${sector.label}"? Escalas e vínculos deste ministério também serão removidos. Esta ação não pode ser desfeita.`, { title: 'Excluir ministério', confirmLabel: 'Excluir', icon: 'delete', tone: 'danger' }))) return;
  try {
    await apiPost(`/sectors/${sector.id}/delete`, { actorId: currentUser ? currentUser.id : undefined });
    await hydrateFromApi();
    ministryPageId = null;
    navigateTo('setores');
    showToast('Ministério excluído', 'success');
  } catch (e) {
    showToast((e && e.message) || 'Não foi possível excluir o ministério', 'error');
  }
}

async function loadMinistrySchedules(sector) {
  ministrySchedules = [];
  if (!sector) return;
  try {
    const list = await apiGet('/schedules?sectorName=' + encodeURIComponent(sector.name));
    const today = new Date().toISOString().slice(0, 10);
    ministrySchedules = (Array.isArray(list) ? list : [])
      .filter(s => s && s.date && s.date >= today)
      .sort((a, b) => String(a.date + (a.timeStart || '')).localeCompare(String(b.date + (b.timeStart || ''))))
      .slice(0, 6);
  } catch (e) { ministrySchedules = []; }
}

function renderMinistryScheduleList() {
  const box = document.getElementById('minSchedulesList');
  if (!box) return;
  if (!ministrySchedules.length) {
    box.innerHTML = '<div class="min-empty-inline">Nenhuma escala futura cadastrada para este ministério.</div>';
    return;
  }
  box.innerHTML = ministrySchedules.map(s => `
    <div class="min-sched-row">
      <div class="min-sched-date">
        <strong>${escHtml(shortDate(s.date))}</strong>
        <span>${escHtml(s.timeStart || '—')}${s.timeEnd ? ' - ' + escHtml(s.timeEnd) : ''}</span>
      </div>
      <div class="min-sched-info">
        <strong>${escHtml(s.title || 'Escala')}</strong>
        <small>${(s.members || []).length} pessoa${(s.members || []).length === 1 ? '' : 's'} escalada${(s.members || []).length === 1 ? '' : 's'} · ${escHtml(s.location || 'Templo Principal')}</small>
      </div>
      <span class="pill ${s.status === 'PUBLISHED' ? 'pill-green' : 'pill-orange'}">${s.status === 'PUBLISHED' ? 'Publicada' : 'Rascunho'}</span>
      <button class="btn-ghost btn-sm" onclick="openMinistrySchedule('${s.id}')">Abrir</button>
    </div>`).join('');
}

function openMinistrySchedules() {
  const sector = currentMinistrySector();
  if (!sector) { showToast('Salve o ministério primeiro', 'warning'); return; }
  escMinistryName = sector.name;
  escActiveId = null;
  navigateTo('escalas');
}

function openMinistrySchedule(scheduleId) {
  const sector = currentMinistrySector();
  if (!sector) return;
  escMinistryName = sector.name;
  escActiveId = scheduleId;
  navigateTo('escalas');
}

function ministryAuditActionLabel(action) {
  const map = {
    MINISTRY_CREATED: 'Ministério criado',
    MINISTRY_UPDATED: 'Dados do ministério atualizados',
    LEADER_CHANGED: 'Liderança alterada',
    CARGOS_UPDATED: 'Cargos atualizados',
    ACTIVE_CHANGED: 'Status de atividade alterado',
    MEMBER_ADDED: 'Membro adicionado',
    MEMBER_UPDATED: 'Membro atualizado',
    MEMBER_REMOVED: 'Membro removido',
    MINISTRY_DELETED: 'Ministério excluído',
    INDICATION_ADDED: 'Indicação adicionada',
    INDICATION_UPDATED: 'Indicação atualizada',
    INDICATION_REMOVED: 'Indicação removida',
  };
  return map[action] || action;
}

function ministryAuditMeta(log) {
  let detail = {};
  try { detail = JSON.parse(log.afterData || '{}') || {}; } catch (e) { detail = {}; }
  const positions = Array.isArray(detail.positions) ? detail.positions : [];
  const cargos = Array.isArray(detail.cargos) ? detail.cargos : [];
  const fieldLabels = {
    label: 'nome', description: 'descrição', mission: 'missão', vision: 'visão',
    foundedAt: 'fundação', color: 'cor', icon: 'ícone', notes: 'observações',
    whatsappLink: 'WhatsApp', contactEmail: 'e-mail', isActive: 'status', cargos: 'cargos',
  };
  let description = '';
  if (log.action === 'LEADER_CHANGED') {
    const fromArr = Array.isArray(detail.leaderFrom) ? detail.leaderFrom.filter(Boolean) : [];
    const toArr = Array.isArray(detail.leaderTo) ? detail.leaderTo.filter(Boolean) : [];
    const from = fromArr.length ? fromArr.join(', ') : (typeof detail.leaderFrom === 'string' && detail.leaderFrom ? detail.leaderFrom : 'Sem líder');
    const to = toArr.length ? toArr.join(', ') : (typeof detail.leaderTo === 'string' && detail.leaderTo ? detail.leaderTo : 'Sem líder');
    description = `${from} → ${to}`;
    const others = (Array.isArray(detail.changes) ? detail.changes : [])
      .map(c => fieldLabels[c] || c)
      .filter(label => label !== 'status');
    if (others.length) description += ' · Também: ' + others.join(', ');
  } else if (log.action === 'CARGOS_UPDATED') {
    description = cargos.length ? cargos.join(', ') : 'Nenhum cargo restante';
  } else if (log.action === 'ACTIVE_CHANGED') {
    description = detail.active ? 'Ministério reativado' : 'Ministério desativado';
  } else if (log.action === 'MINISTRY_CREATED') {
    const leaders = Array.isArray(detail.leaders) ? detail.leaders : (detail.leader ? [detail.leader] : []);
    description = `${detail.label || ''}${leaders.length ? ' · Líderes: ' + leaders.join(', ') : ''}`;
  } else if (log.action === 'MEMBER_ADDED' || log.action === 'MEMBER_REMOVED') {
    description = `${detail.personName || 'Membro'}${positions.length ? ' · ' + positions.join(', ') : ''}`;
  } else if (log.action === 'MEMBER_UPDATED') {
    description = `${detail.personName || 'Membro'}${positions.length ? ' · ' + positions.join(', ') : ''}`;
  } else if (log.action === 'MINISTRY_DELETED') {
    description = detail.label || '';
  } else if (log.action === 'INDICATION_ADDED' || log.action === 'INDICATION_UPDATED' || log.action === 'INDICATION_REMOVED') {
    description = `${detail.name || 'Indicação'}${detail.role ? ' · ' + detail.role : ''}`;
  } else if (Array.isArray(detail.changes)) {
    description = detail.changes.map(c => fieldLabels[c] || c).join(', ');
  }
  const actor = (log.user && log.user.person && log.user.person.name) || (log.user && log.user.email) || 'Sistema';
  let when = '';
  try {
    when = new Date(log.createdAt).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch (e) { when = log.createdAt || ''; }
  return { description, actor, when, detail };
}

function renderMinistryAudit() {
  const box = document.getElementById('minAuditList');
  if (!box) return;
  setText('minAuditCount', `${ministryAuditLogs.length} registro${ministryAuditLogs.length === 1 ? '' : 's'}`);
  if (!ministryAuditLogs.length) {
    box.innerHTML = '<div class="min-empty-inline">Nenhuma alteração registrada ainda. Liderança, cargos e membros passarão a aparecer aqui.</div>';
    return;
  }
  box.innerHTML = ministryAuditLogs.map(log => {
    const meta = ministryAuditMeta(log);
    const action = log.action || '';
    const icon = action === 'LEADER_CHANGED' ? 'crown'
      : action === 'CARGOS_UPDATED' ? 'tags'
        : action === 'MEMBER_ADDED' ? 'user-plus'
          : action === 'MEMBER_REMOVED' ? 'user-minus'
            : action === 'MEMBER_UPDATED' ? 'user-check'
              : action === 'ACTIVE_CHANGED' ? 'power'
                : action === 'MINISTRY_CREATED' ? 'sparkles'
                  : action === 'MINISTRY_DELETED' ? 'trash-2'
                    : 'pencil';
    const tone = action === 'MEMBER_REMOVED' || action === 'MINISTRY_DELETED' ? 'red'
      : action === 'LEADER_CHANGED' || action === 'ACTIVE_CHANGED' ? 'orange'
        : action === 'MEMBER_ADDED' || action === 'MINISTRY_CREATED' ? 'green' : 'blue';
    return `
      <div class="min-audit-item">
        <span class="min-audit-ico min-audit-${tone}"><i data-lucide="${icon}"></i></span>
        <div class="min-audit-body">
          <strong>${escHtml(ministryAuditActionLabel(action))}</strong>
          ${meta.description ? `<p>${escHtml(meta.description)}</p>` : ''}
          <small>${escHtml(meta.actor)} · ${escHtml(meta.when)}</small>
        </div>
      </div>`;
  }).join('');
  if (window.lucide) lucide.createIcons();
}

async function renderMinistryPage() {
  const isNew = !ministryPageId;
  let sector = ministryPageId ? currentMinistrySector() : null;
  if (!isNew && !sector) {
    await hydrateFromApi();
    sector = currentMinistrySector();
  }
  if (!isNew && !sector) {
    showToast('Ministério não encontrado', 'error');
    navigateTo('setores');
    return;
  }

  setText('minTitle', sector ? sector.label : 'Novo Ministério');
  setText('minSub', sector
    ? (sector.description || 'Todas as informações do ministério em um só lugar.')
    : 'Crie um novo ministério e depois vincule líder, cargos e membros.');
  setText('minEyebrow', sector ? 'Dados e equipe' : 'Novo ministério');
  setText('minSaveLabel', sector ? 'Salvar ministério' : 'Criar ministério');
  setText('minActivePill', sector ? (sector.isActive === false ? 'Inativo' : 'Ativo') : 'Novo');
  const pill = document.getElementById('minActivePill');
  if (pill) pill.className = 'pill ' + (sector ? (sector.isActive === false ? 'pill-red' : 'pill-green') : 'pill-blue');

  const setValue = (id, value) => { const el = document.getElementById(id); if (el) el.value = value == null ? '' : value; };
  setValue('minLabel', sector ? sector.label : '');
  setValue('minDescription', sector ? sector.description : '');
  setValue('minWhatsapp', sector ? sector.whatsappLink : '');
  setValue('minContactEmail', sector ? sector.contactEmail : '');
  setValue('minNotes', sector ? sector.notes : '');
  const activeEl = document.getElementById('minActive');
  if (activeEl) {
    activeEl.checked = sector ? sector.isActive !== false : true;
    activeEl.disabled = !canManageMinistryLeadership();
  }
  const activeWrap = document.getElementById('minActiveWrap');
  if (activeWrap) activeWrap.style.display = isNew ? 'none' : '';
  const deleteBtn = document.getElementById('minDeleteBtn');
  if (deleteBtn) deleteBtn.style.display = (isNew || !canManageMinistryLeadership()) ? 'none' : '';

  ministryCargosDraft = sector ? (sector.cargosList || parseCargos(sector.cargos)).slice() : [];

  try {
    const users = await apiGet('/users');
    ministryUsers = Array.isArray(users) ? users : [];
  } catch (e) { ministryUsers = []; }

  ministryLeaderIds = sector
    ? (sector.leaderUserIds && sector.leaderUserIds.length
      ? sector.leaderUserIds.slice()
      : (sector.leaderUserId ? [sector.leaderUserId] : []))
    : [];
  const leaderSearch = document.getElementById('minLeaderSearch');
  if (leaderSearch) {
    leaderSearch.value = '';
    leaderSearch.disabled = !canManageMinistryLeadership();
  }
  hideMinistryLeaderSuggestions(true);
  renderMinistryLeaderChips();

  ministrySelectedPersonId = null;
  const personSearch = document.getElementById('minAddPersonSearch');
  if (personSearch) personSearch.value = '';
  hideMinistryPeopleSuggestions(true);

  await loadMinistrySchedules(sector);

  const showExisting = !isNew;
  ['minMembersPanel', 'minSchedulesPanel', 'minAuditPanel'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = showExisting ? '' : 'none';
  });

  if (showExisting) {
    try {
      const logs = await apiGet(`/sectors/${sector.id}/audit`);
      ministryAuditLogs = Array.isArray(logs) ? logs : [];
    } catch (e) { ministryAuditLogs = []; }
  } else {
    ministryAuditLogs = [];
    ministrySchedules = [];
  }

  renderMinistryCargos();
  renderMinistryIndications();
  renderMinistryScheduleList();
  renderMinistryAudit();
  renderMinistryStats(sector);
  renderMinistryInfo(sector);
  if (window.lucide) lucide.createIcons();

  if (ministryTargetSection) {
    const targetMap = { members: 'minMembersPanel', leader: 'minLeaderBlock', cargos: 'minCargosBlock' };
    const targetId = targetMap[ministryTargetSection];
    ministryTargetSection = null;
    if (targetId) {
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (targetId === 'minLeaderBlock') {
          const sel = document.getElementById('minLeaderSearch');
          if (sel) sel.focus();
        }
      }, 140);
    }
  }
}

function renderSetores() {
  const full = isFullAccess();
  setText('setoresTitle', full ? 'Setores & Ministérios' : 'Meus Ministérios');
  setText('setoresSub', full
    ? 'Gerencie cada ministério: liderança, cargos, membros ativos, escalas e histórico de alterações.'
    : 'Você vê e configura apenas os ministérios que lidera.');
  const newBtn = document.getElementById('newMinistryBtn');
  if (newBtn) newBtn.style.display = full ? '' : 'none';
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
      (s.leaderUserIds || []).includes(uid) ||
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
  return !!uid && !!sector && ((sector.leaderUserIds || []).includes(uid) || sector.leaderUserId === uid);
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
      ${currentUser && ((s.leaderUserIds || []).includes(currentUser.id) || s.leaderUserId === currentUser.id) ? '<span class="pill pill-blue mp-item-tag">Seu ministério</span>' : ''}
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
      ${edit ? `<button class="btn-secondary" onclick="openMinistryPage('${ministry.id}')"><i data-lucide="settings"></i> Gerenciar Ministério</button>` : ''}
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

async function escMenuMore(id) {
  if (await appConfirm('Excluir esta escala? Os voluntários escalados serão removidos.', { title: 'Excluir escala', confirmLabel: 'Excluir', icon: 'event_busy', tone: 'danger' })) await escDeleteSchedule(id);
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

let memberFormEditId = null;
let memberFormSectors = [];
let memberFormPositions = [];

function openNewMemberPage(id) {
  memberFormEditId = id || null;
  const navEl = document.querySelector('.nav-item[data-section="pessoas"]');
  navigateTo('novo-membro', navEl);
}

function editMember(id) { openNewMemberPage(id); }

function parseCargos(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return String(value).split(',').map(v => v.trim()).filter(Boolean);
  }
}

async function populateMemberSectors(selectedKey) {
  const sel = document.getElementById('nmSector');
  if (!sel) return;
  if (!memberFormSectors.length) {
    try {
      const data = await apiGet('/sectors');
      memberFormSectors = (data || []).map(s => ({
        name: s.name,
        label: s.label,
        cargos: parseCargos(s.cargos),
      }));
    } catch (e) {
      memberFormSectors = [];
    }
  }
  const current = selectedKey !== undefined ? selectedKey : sel.value;
  sel.innerHTML = '<option value="">Sem ministério — membro comum</option>' +
    memberFormSectors.map(s => `<option value="${s.name}">${s.label}</option>`).join('');
  sel.value = current && memberFormSectors.some(s => s.name === current) ? current : '';
  updateMemberPositionOptions();
}

function updateMemberPositionOptions() {
  const sel = document.getElementById('nmSector');
  const menu = document.getElementById('nmCargoMenu');
  if (!sel || !menu) return;
  const sector = memberFormSectors.find(s => s.name === sel.value);
  const cargos = (sector && sector.cargos) ? sector.cargos : [];
  if (!sel.value) memberFormPositions = [];
  else memberFormPositions = memberFormPositions.filter(c => cargos.includes(c));
  menu.innerHTML = cargos.length
    ? cargos.map(c => {
      const safe = String(c).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      return `<label class="cargo-option">
        <input type="checkbox" value="${escHtml(c)}" ${memberFormPositions.includes(c) ? 'checked' : ''} onchange="toggleMemberCargo('${safe}', this.checked)">
        <span>${escHtml(c)}</span>
      </label>`;
    }).join('')
    : `<div class="cargo-empty">${sel.value ? 'Este ministério ainda não tem cargos cadastrados.' : 'Escolha um ministério para ver os cargos.'}</div>`;
  updateMemberCargoLabel();
}

function updateMemberCargoLabel() {
  const label = document.getElementById('nmCargoLabel');
  if (!label) return;
  label.textContent = memberFormPositions.length ? memberFormPositions.join(', ') : 'Selecione os cargos';
}

function toggleMemberCargo(cargo, checked) {
  if (checked) {
    if (!memberFormPositions.includes(cargo)) memberFormPositions.push(cargo);
  } else {
    memberFormPositions = memberFormPositions.filter(c => c !== cargo);
  }
  updateMemberCargoLabel();
}

function closeMemberCargoMenu() {
  const menu = document.getElementById('nmCargoMenu');
  if (menu) menu.style.display = 'none';
}

function toggleMemberCargoMenu(event) {
  if (event) event.stopPropagation();
  const menu = document.getElementById('nmCargoMenu');
  if (!menu) return;
  const isOpen = menu.style.display !== 'none';
  closeMemberCargoMenu();
  if (isOpen) return;
  updateMemberPositionOptions();
  menu.style.display = 'block';
}

function updateMemberAccessUI() {
  const checked = !!(document.getElementById('nmAccess') || {}).checked;
  const fields = document.getElementById('nmAccessFields');
  if (fields) fields.style.display = checked ? '' : 'none';
}

function renderMemberFormPage() {
  const member = memberFormEditId ? mockMembers.find(m => m.id === memberFormEditId) : null;
  setText('nmTitle', member ? 'Editar Membro' : 'Novo Membro');
  setText('nmSaveLabel', member ? 'Salvar alterações' : 'Cadastrar membro');

  const nameEl = document.getElementById('nmName');
  const emailEl = document.getElementById('nmEmail');
  const phoneEl = document.getElementById('nmPhone');
  const accessEl = document.getElementById('nmAccess');
  const roleEl = document.getElementById('nmRole');
  const passEl = document.getElementById('nmPassword');
  const accessBox = document.getElementById('nmAccessBox');
  const accessNote = document.getElementById('nmAccessNote');

  if (nameEl) nameEl.value = member ? member.name : '';
  if (emailEl) emailEl.value = member && member.email !== '—' ? member.email : '';
  if (phoneEl) phoneEl.value = member && member.phone !== '—' ? member.phone : '';
  memberFormPositions = member
    ? ((member.positions && member.positions.length) ? member.positions.slice() : parseCargos(member.position))
    : [];
  closeMemberCargoMenu();
  if (accessBox) accessBox.style.display = canManageAccess() ? '' : 'none';
  if (accessEl) accessEl.checked = !!(member && member.webAccess);
  if (roleEl) roleEl.value = member && member.role === 'Pastor' ? 'PASTOR' : 'MEMBRO';
  if (passEl) passEl.value = 'membro123';
  if (accessNote) {
    accessNote.textContent = member && member.hasUser
      ? 'Este membro já possui usuário. Desmarcar revoga o acesso; a senha não é alterada aqui.'
      : 'O acesso é opcional. Sem acesso, a pessoa continua cadastrada como membro.';
  }

  const extraFields = [
    ['nmMotherName', 'motherName'], ['nmFatherName', 'fatherName'], ['nmSex', 'sex'],
    ['nmMaritalStatus', 'maritalStatus'], ['nmBirthdate', 'birthdate'], ['nmCpf', 'cpf'],
    ['nmRg', 'rg'], ['nmBirthplace', 'birthplace'], ['nmProfession', 'profession'],
    ['nmEducation', 'education'], ['nmAddress', 'address'], ['nmZipCode', 'zipCode'],
    ['nmNeighborhood', 'neighborhood'], ['nmCity', 'city'], ['nmState', 'state'],
    ['nmResidencePhone', 'residencePhone'], ['nmSpouseName', 'spouseName'],
    ['nmPreviouslyMarried', 'previouslyMarried'], ['nmCivilMarriageDate', 'civilMarriageDate'],
    ['nmReligiousMarriageDate', 'religiousMarriageDate'], ['nmChildren', 'children'],
    ['nmConversionDate', 'conversionDate'], ['nmMembershipRecordNumber', 'membershipRecordNumber'],
    ['nmBaptismDate', 'baptismDate'], ['nmBaptismPlace', 'baptismPlace'],
    ['nmPreviousChurches', 'previousChurches'], ['nmLastChurch', 'lastChurch'],
    ['nmPreviousPastorContact', 'previousPastorContact'], ['nmPreviousChurchAddress', 'previousChurchAddress'],
    ['nmMinistryInterest', 'ministryInterest'], ['nmInterviewedBy', 'interviewedBy'],
    ['nmHomeVisitDate', 'homeVisitDate'], ['nmMembershipNotes', 'membershipNotes'],
  ];
  extraFields.forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (el) el.value = member ? (member[key] || '') : '';
  });

  updateMemberAccessUI();
  populateMemberSectors(member ? member.sectorKey : '');
  refreshIcons();
}

async function saveMemberPage() {
  if (!canAccess('novo-membro')) {
    showToast('Você não tem acesso a este módulo', 'error');
    return;
  }

  const nameEl = document.getElementById('nmName');
  const emailEl = document.getElementById('nmEmail');
  const phoneEl = document.getElementById('nmPhone');
  const sectorEl = document.getElementById('nmSector');
  const accessEl = document.getElementById('nmAccess');
  const roleEl = document.getElementById('nmRole');
  const passEl = document.getElementById('nmPassword');

  const name = (nameEl ? nameEl.value : '').trim();
  if (!name) {
    showToast('Informe o nome completo', 'error');
    if (nameEl) nameEl.focus();
    return;
  }
  const email = (emailEl ? emailEl.value : '').trim().toLowerCase();
  const phone = (phoneEl ? phoneEl.value : '').trim();
  const sectorName = sectorEl ? sectorEl.value : '';
  const positions = memberFormPositions.slice();
  const wantsAccess = !!(accessEl && accessEl.checked);
  const roleName = roleEl && roleEl.value === 'PASTOR' ? 'PASTOR' : 'MEMBRO';
  const password = (passEl && passEl.value.trim()) || 'membro123';

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast('Informe um e-mail válido', 'error');
    if (emailEl) emailEl.focus();
    return;
  }
  if (wantsAccess && !email) {
    showToast('Informe o e-mail para liberar o acesso ao sistema', 'error');
    if (emailEl) emailEl.focus();
    return;
  }
  if (wantsAccess && !canManageAccess()) {
    showToast('Apenas pastor ou admin master pode liberar acesso', 'error');
    return;
  }
  const sector = memberFormSectors.find(s => s.name === sectorName);
  if (!sectorName && positions.length) {
    showToast('Escolha um ministério antes de informar cargos', 'error');
    if (sectorEl) sectorEl.focus();
    return;
  }
  if (sector && (sector.cargos || []).length) {
    const invalid = positions.filter(p => !sector.cargos.includes(p));
    if (invalid.length) {
      showToast(`Cargo não disponível: ${invalid.join(', ')}. Disponíveis: ${sector.cargos.join(', ')}`, 'error');
      updateMemberPositionOptions();
      return;
    }
  }

  const payload = {
    name,
    email,
    phone,
    sectorName,
    positions,
    position: positions[0] || '',
    createdByRole: apiActorRole(),
  };
  const profileFieldMap = [
    ['nmMotherName', 'motherName'], ['nmFatherName', 'fatherName'], ['nmSex', 'sex'],
    ['nmMaritalStatus', 'maritalStatus'], ['nmBirthdate', 'birthdate'], ['nmCpf', 'cpf'],
    ['nmRg', 'rg'], ['nmBirthplace', 'birthplace'], ['nmProfession', 'profession'],
    ['nmEducation', 'education'], ['nmAddress', 'address'], ['nmZipCode', 'zipCode'],
    ['nmNeighborhood', 'neighborhood'], ['nmCity', 'city'], ['nmState', 'state'],
    ['nmResidencePhone', 'residencePhone'], ['nmSpouseName', 'spouseName'],
    ['nmPreviouslyMarried', 'previouslyMarried'], ['nmCivilMarriageDate', 'civilMarriageDate'],
    ['nmReligiousMarriageDate', 'religiousMarriageDate'], ['nmChildren', 'children'],
    ['nmConversionDate', 'conversionDate'], ['nmMembershipRecordNumber', 'membershipRecordNumber'],
    ['nmBaptismDate', 'baptismDate'], ['nmBaptismPlace', 'baptismPlace'],
    ['nmPreviousChurches', 'previousChurches'], ['nmLastChurch', 'lastChurch'],
    ['nmPreviousPastorContact', 'previousPastorContact'], ['nmPreviousChurchAddress', 'previousChurchAddress'],
    ['nmMinistryInterest', 'ministryInterest'], ['nmInterviewedBy', 'interviewedBy'],
    ['nmHomeVisitDate', 'homeVisitDate'], ['nmMembershipNotes', 'membershipNotes'],
  ];
  profileFieldMap.forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (el) payload[key] = el.value.trim();
  });

  try {
    if (typeof apiPost !== 'function' || !apiOnline()) {
      showToast('API offline. Inicie o servidor local para salvar.', 'error');
      return;
    }

    if (memberFormEditId) {
      const member = mockMembers.find(m => m.id === memberFormEditId);
      const hadAccess = !!(member && member.webAccess);
      const currentRole = member && member.role === 'Pastor' ? 'PASTOR' : 'MEMBRO';
      const saved = await apiPost(`/people/${memberFormEditId}/update`, payload);
      if (wantsAccess !== hadAccess || (wantsAccess && roleName !== currentRole)) {
        await apiPost(`/people/${memberFormEditId}/access`, {
          enabled: wantsAccess,
          roleName,
          password,
          createdByRole: apiActorRole(),
        });
      }
      if (saved && saved.id) selectedMemberId = saved.id;
      await hydrateFromApi();
      showToast('Membro atualizado com sucesso!', 'success');
    } else {
      const saved = await apiPost('/people', {
        ...payload,
        createLogin: wantsAccess,
        roleName,
        password,
      });
      if (saved && saved.id) selectedMemberId = saved.id;
      await hydrateFromApi();
      showToast('Membro cadastrado com sucesso!', 'success');
    }

    memberFormEditId = null;
    navigateTo('pessoas');
  } catch (e) {
    const msg = e && e.message && e.message !== 'API offline'
      ? e.message
      : 'Não foi possível salvar. Verifique se a API está online.';
    showToast(msg, 'error');
  }
}

async function toggleMemberAccess(id, enable) {
  if (!canManageAccess()) {
    showToast('Apenas pastor ou admin master pode alterar o acesso', 'error');
    return;
  }
  const member = mockMembers.find(m => m.id === id);
  if (!member) return;
  const label = enable ? 'liberar' : 'revogar';
  if (!(await appConfirm(`Deseja ${label} o acesso de ${member.name} ao sistema web?`, {
    title: enable ? 'Liberar acesso' : 'Revogar acesso',
    confirmLabel: enable ? 'Liberar' : 'Revogar',
    icon: enable ? 'lock_open' : 'lock',
    tone: enable ? 'primary' : 'danger',
  }))) return;
  try {
    await apiPost(`/people/${member._apiId || id}/access`, {
      enabled: !!enable,
      roleName: member.role === 'Pastor' ? 'PASTOR' : 'MEMBRO',
      password: 'membro123',
      createdByRole: apiActorRole(),
    });
    await hydrateFromApi();
    renderMembers();
    showToast(enable ? 'Acesso liberado!' : 'Acesso revogado!', 'success');
  } catch (e) {
    showToast((e && e.message) || 'Não foi possível alterar o acesso', 'error');
  }
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
function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  const modalEl = document.querySelector('#modalOverlay .modal');
  if (modalEl) modalEl.classList.remove('modal-lg');
}

// ===== CONFIRMACAO EM MODAL (substitui confirm() do navegador) =====
let _confirmResolver = null;

function appConfirm(message, options) {
  options = options || {};
  const overlay = document.getElementById('confirmOverlay');
  if (!overlay) return Promise.resolve(false);
  if (_confirmResolver) {
    const previous = _confirmResolver;
    _confirmResolver = null;
    previous(false);
  }
  const title = document.getElementById('confirmTitle');
  const messageEl = document.getElementById('confirmMessage');
  const ok = document.getElementById('confirmOkBtn');
  const icon = document.getElementById('confirmIcon');
  const tone = options.tone === 'primary' ? 'primary' : 'danger';
  if (title) title.textContent = options.title || 'Confirmar ação';
  if (messageEl) messageEl.textContent = message || 'Deseja continuar?';
  if (ok) {
    ok.textContent = options.confirmLabel || 'Confirmar';
    ok.className = tone === 'primary' ? 'btn-primary' : 'btn-danger';
  }
  if (icon) {
    icon.className = 'confirm-ico ' + tone;
    icon.innerHTML = `<span class="material-symbols-outlined">${options.icon || (tone === 'primary' ? 'help' : 'warning')}</span>`;
  }
  overlay.classList.add('open');
  setTimeout(() => { if (ok) ok.focus(); }, 60);
  return new Promise(resolve => { _confirmResolver = resolve; });
}

function resolveConfirm(result) {
  const overlay = document.getElementById('confirmOverlay');
  if (overlay) overlay.classList.remove('open');
  const resolver = _confirmResolver;
  _confirmResolver = null;
  if (resolver) resolver(!!result);
}

function closeConfirm() {
  resolveConfirm(false);
}

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
  closeDeptMenu();
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
  const next = agendaNextCulto();
  if (!next) { el.textContent = 'Nenhum culto agendado'; return; }
  const d = agendaParseDate(next.date);
  const weekday = agendaWeekday(d);
  const hora = next.timeStart ? next.timeStart.slice(0, 5).replace(':', 'h') : '';
  const schedules = agendaSchedulesForDate(next.date);
  const total = schedules.reduce((sum, s) => sum + (s.totalPositions || (s.members || []).length || 0), 0);
  const confirmed = schedules.reduce((sum, s) => sum + (s.confirmedCount || 0), 0);
  const pct = total ? Math.round((confirmed / total) * 100) : 0;
  el.textContent = total
    ? `Culto ${weekday} ${hora}: ${pct}% Confirmados`
    : `Culto ${weekday} ${hora}: ${next.title}`;
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
      updateNextService();
      applyPermissions();
      const activeSection = document.querySelector('.page-section.active');
      const activeId = activeSection ? activeSection.id.replace('section-', '') : 'dashboard';
      refreshSection(activeId);
      if (window.lucide) lucide.createIcons();
    });
  }

  // Fecha dropdowns ao clicar fora
  document.addEventListener('click', function (e) {
    if (!e.target.closest('#nmCargoSelect')) closeMemberCargoMenu();
    if (!e.target.closest('#deptActionMenu') && !e.target.closest('.dept-more')) closeDeptMenu();
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
  if (e.key === 'Escape') { closeModal(); closeDropdowns(); closeConfirm(); }
});
