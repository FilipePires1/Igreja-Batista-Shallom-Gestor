// ===== API TEMPORÁRIA (banco SQLite local) =====
// Hidrata os mocks com dados reais quando a API está disponível.
// Se a API estiver offline, os mocks originais continuam valendo.

const API_BASES = ['/api'];

let API_BASE = null;

async function apiGet(path) {
  let lastErr;
  for (const base of API_BASES) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 2500);
      const r = await fetch(base + path, { signal: ctrl.signal });
      clearTimeout(timer);
      if (!r.ok) continue;
      API_BASE = base;
      return await r.json();
    } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error('API offline');
}

async function apiPost(path, body) {
  for (const base of API_BASES) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 4000);
      const r = await fetch(base + path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      if (!r.ok) continue;
      API_BASE = base;
      return await r.json();
    } catch (e) { /* tenta próximo base */ }
  }
  throw new Error('API offline');
}

function apiOnline() { return !!API_BASE; }

function sectorLabel(name) {
  const map = { louvor: 'Louvor', midia: 'Midia', portaria: 'Recepcao', infantil: 'Infantil', intercessao: 'Intercessao', cantina: 'Cantina', acao_social: 'Acao Social', jovens: 'Jovens', tesouraria: 'Tesouraria', diaconato: 'Diaconato', celulas: 'Celulas', eventos: 'Eventos', pastoral: 'Pastoral', comunicacao: 'Comunicacao' };
  return map[name] || name || 'Sem Setor';
}

function personToMember(p) {
  const sm = (p.sectorMembers || [])[0];
  const roleLabel = sm?.role?.label || 'Membro';
  const sectorNm = sm?.sector?.name || '';
  const isActive = p.status === 'ACTIVE';
  const roleMap = { 'Lider': 'Lider', 'Pastor': 'Pastor', 'Coordenador': 'Coordenador', 'Presbitero': 'Presbitero', 'Membro': 'Membro' };
  const gender = /a$|ia$|ela$|ana$|santos$|ferreira$|duarte$|silva$|souza$|ribeiro$|alves$/i.test(p.name) ? 'f' : 'm';
  return {
    id: p.id,
    name: p.name,
    email: p.email || '—',
    phone: p.phone || '—',
    sector: sectorLabel(sectorNm),
    role: roleMap[roleLabel] || roleLabel,
    status: isActive ? 'ativo' : 'inativo',
    gender,
    voluntario: !!sm,
    lider: ['Lider', 'Pastor', 'Coordenador', 'Presbitero'].includes(roleLabel),
    pastoral: roleLabel === 'Pastor',
    login: !!p.user && p.user.status === 'ACTIVE',
    joined: (p.memberSince || p.createdAt || '').slice(0, 10),
    tags: sm ? [sm.sector?.label || sectorLabel(sectorNm), roleLabel] : ['Sem Setor'],
    cell: null,
    attendance: isActive ? 85 : 40,
    baptism: p.baptismDate || '—',
    churchTime: '',
    note: p.pastoralNotes || '',
    _apiId: p.id,
  };
}

async function hydrateFromApi() {
  try {
    const [people, events, schedules, anns, orders] = await Promise.all([
      apiGet('/people'),
      apiGet('/events'),
      apiGet('/schedules'),
      apiGet('/announcements'),
      apiGet('/canteen/orders'),
    ]);

    // Pessoas → mockMembers (muta in-place, preserva referências; sempre sincroniza)
    const members = people.filter(p => p.status !== 'VISITOR').map(personToMember);
    mockMembers.length = 0;
    members.forEach(m => mockMembers.push(m));

    // Visitantes → mockVisitors (sempre sincroniza)
    const visitors = people.filter(p => p.status === 'VISITOR');
    mockVisitors.length = 0;
    visitors.forEach((v, i) => {
      mockVisitors.push({
        id: i + 1,
        name: v.name,
        time: (v.createdAt || '').slice(11, 16) || '—',
        source: v.howFound || 'Cartão de boas-vindas',
        tag: v.wantsContact ? 'Quer Contato' : 'Primeira visita',
        icon: 'hand-heart',
        phone: v.phone || '—',
        contacted: false,
      });
    });

    // Trocas pendentes → mockTrocas (sempre sincroniza)
    mockTrocas.length = 0;
    (schedules || []).forEach(s => {
      (s.members || []).forEach(m => {
        if (m.status === 'TRADE_REQUESTED' || m.status === 'TRADE_SELECTED') {
          mockTrocas.push({
            person: m.user?.person?.name || m.person?.name || '—',
            shift: `${m.roleInSchedule || 'Voluntário'} — ${s.title}`,
            hours: 48,
          });
        }
      });
    });

    // Eventos → mockEvents
    if (events.length) {
      mockEvents.length = 0;
      events.forEach((e, i) => {
        mockEvents.push({
          id: i + 1,
          name: e.title,
          date: (e.date || '').slice(0, 10),
          time: e.timeStart || '19:00',
          location: e.location || 'Templo Principal',
          status: (e.date && e.date < new Date().toISOString().slice(0, 10)) ? 'past' : 'upcoming',
        });
      });
    }

    // Escalas → mockShifts (agrupa por setor, próximo culto)
    if (schedules.length) {
      const nextDate = schedules.filter(s => s.date >= new Date().toISOString().slice(0, 10))[0]?.date;
      const nextSchedules = schedules.filter(s => s.date === nextDate);
      mockShifts.length = 0;
      nextSchedules.forEach(s => {
        const sector = s.sector?.label || sectorLabel(s.sector?.name);
        const total = s.totalPositions || s.members.length || 1;
        mockShifts.push({
          ministry: sector,
          icon: 'users',
          sector: sectorLabel(s.sector?.name),
          confirmed: s.confirmedCount || 0,
          total,
        });
      });
    }

    // Avisos → mockAnnouncements
    if (anns.length) {
      mockAnnouncements.length = 0;
      const tones = ['blue', 'orange', 'green'];
      const colors = ['#103B5F', '#16A2AD', '#059669'];
      anns.forEach((a, i) => {
        mockAnnouncements.push({
          id: i + 1,
          title: a.title,
          text: a.body || '',
          date: (a.createdAt || '').slice(0, 10),
          color: a.isUrgent ? '#DC2626' : colors[i % 3],
          audience: a.isUrgent ? 'Urgente — Todos' : 'App Público & Membros',
          tone: a.isUrgent ? 'orange' : tones[i % 3],
          reads: 120 + i * 37,
          readsPct: 80 + i * 7,
          author: 'Pr. Thiago Martins',
        });
      });
    }

    // Pedidos → mockOrders
    if (orders.length) {
      mockOrders.length = 0;
      const statusMap = { READY: 'Pronto', PREPARING: 'Em Preparo', DELIVERED: 'Retirada', PENDING: 'Em Preparo' };
      orders.forEach(o => {
        const item = o.items?.[0];
        mockOrders.push({
          id: o.orderNumber || o.id,
          item: item ? `${item.quantity}x ${item.product?.name || 'Item'}` : 'Pedido',
          price: o.total || 0,
          customer: o.customerName || '—',
          time: (o.createdAt || '').slice(11, 16),
          status: statusMap[o.status] || 'Em Preparo',
        });
      });
    }

    // Setores → mockDepartments
    try {
      const sectors = await apiGet('/sectors');
      if (sectors && sectors.length) {
        window.apiSectors = sectors; // brutos: leaderUserId, members, templateKey (escopo de líder)
        mockDepartments.length = 0;
        sectors.forEach((s) => {
          mockDepartments.push({
            id: s.id,
            name: s.label,
            icon: s.icon || 'building-2',
            group: s.groupTag || 'operacoes',
            sub: s.description || '',
            leader: s.leaderName || '—',
            volunteers: s._count ? s._count.members : 0,
            capacity: s.capacity || 0,
            schedule: s.scheduleText || '—',
            highlight: s.highlightText || '—',
            readiness: s.readiness ?? 100,
            status: (s.readiness ?? 100) >= 90 ? 'Pronto' : (s.readiness ?? 100) >= 70 ? 'Atenção' : 'Crítico',
            tone: (s.readiness ?? 100) >= 90 ? 'green' : (s.readiness ?? 100) >= 70 ? 'orange' : 'red',
            live: !!s.isLive,
            _apiId: s.id,
            _active: s.isActive !== false,
          });
        });
      }
    } catch (e) { /* setores offline */ }

    console.info('[api] Dados hidrados da API:', API_BASE);
    return true;
  } catch (e) {
    console.info('[api] API offline — usando mocks locais');
    return false;
  }
}
