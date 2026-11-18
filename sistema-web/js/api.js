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
  let lastErr;
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
      if (!r.ok) {
        let msg = '';
        try {
          const data = await r.json();
          msg = Array.isArray(data.message) ? data.message.join(' ') : data.message;
        } catch (e) { /* sem corpo JSON */ }
        // Erros de validação/permissão são respostas definitivas da API.
        if ([400, 401, 403, 404, 409, 422].includes(r.status)) {
          const err = new Error(msg || 'Não foi possível concluir a operação');
          err.isApiError = true;
          throw err;
        }
        lastErr = new Error(msg || `Erro ${r.status}`);
        continue;
      }
      API_BASE = base;
      return await r.json();
    } catch (e) {
      if (e && e.isApiError) throw e;
      lastErr = e;
    }
  }
  throw lastErr || new Error('API offline');
}

function apiOnline() { return !!API_BASE; }

function sectorLabel(name) {
  const map = { louvor: 'Louvor', midia: 'Midia', portaria: 'Recepcao', recepcao: 'Recepcao', infantil: 'Infantil', intercessao: 'Intercessao', cantina: 'Cantina', acao_social: 'Acao Social', jovens: 'Jovens', tesouraria: 'Tesouraria', diaconato: 'Diaconato', eventos: 'Eventos', pastoral: 'Pastoral', comunicacao: 'Comunicacao' };
  return map[name] || name || 'Sem Setor';
}

function parseJsonList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.filter(Boolean);
  } catch (e) { /* lista simples separada por vírgula */ }
  return String(value).split(',').map(v => v.trim()).filter(Boolean);
}

function personToMember(p) {
  const sm = (p.sectorMembers || [])[0];
  const userRoleNames = (p.user?.roles || []).map(r => r.role?.name).filter(Boolean);
  const isPastor = userRoleNames.includes('PASTOR');
  const isAdminMaster = userRoleNames.includes('SUPER_ADMIN');
  const isLeader = !!p.user && ((p.user.ledSectors || []).length > 0 || (p.user.leaderLinks || []).length > 0);
  const webAccess = !!p.user && (!!p.user.webAccess || isPastor || isAdminMaster || isLeader);
  const positions = parseJsonList(sm?.positions || sm?.position);
  const roleLabel = isAdminMaster ? 'Admin Master'
    : isPastor ? 'Pastor'
      : (sm?.role?.label || 'Membro');
  const sectorNm = sm?.sector?.name || '';
  const isActive = p.status === 'ACTIVE';
  const roleMap = { 'Admin Master': 'Admin Master', 'Pastor': 'Pastor', 'Membro': 'Membro' };
  const gender = /a$|ia$|ela$|ana$|santos$|ferreira$|duarte$|silva$|souza$|ribeiro$|alves$/i.test(p.name) ? 'f' : 'm';
  return {
    id: p.id,
    name: p.name,
    email: p.email || '—',
    phone: p.phone || '—',
    sector: sectorLabel(sectorNm),
    sectorKey: sectorNm,
    position: positions.join(', '),
    positions,
    role: roleMap[roleLabel] || roleLabel,
    status: isActive ? 'ativo' : 'inativo',
    gender,
    voluntario: !!sm,
    lider: isPastor || isLeader,
    pastoral: isPastor,
    hasUser: !!p.user,
    webAccess,
    login: webAccess,
    joined: (p.memberSince || p.createdAt || '').slice(0, 10),
    tags: sm ? [sm.sector?.label || sectorLabel(sectorNm), ...(positions.length ? positions : ['Membro'])] : ['Sem ministério'],
    attendance: 0,
    baptism: p.baptismDate || '—',
    churchTime: '',
    note: p.pastoralNotes || '',
    _apiId: p.id,
    birthdate: p.birthdate || '',
    motherName: p.motherName || '',
    fatherName: p.fatherName || '',
    sex: p.sex || '',
    maritalStatus: p.maritalStatus || '',
    rg: p.rg || '',
    birthplace: p.birthplace || '',
    profession: p.profession || '',
    education: p.education || '',
    address: p.address || '',
    city: p.city || '',
    state: p.state || '',
    zipCode: p.zipCode || '',
    neighborhood: p.neighborhood || '',
    residencePhone: p.residencePhone || '',
    conversionDate: p.conversionDate || '',
    spouseName: p.spouseName || '',
    previouslyMarried: p.previouslyMarried || '',
    civilMarriageDate: p.civilMarriageDate || '',
    religiousMarriageDate: p.religiousMarriageDate || '',
    children: p.children || '',
    previousChurches: p.previousChurches || '',
    lastChurch: p.lastChurch || '',
    previousPastorContact: p.previousPastorContact || '',
    previousChurchAddress: p.previousChurchAddress || '',
    ministryInterest: p.ministryInterest || '',
    interviewedBy: p.interviewedBy || '',
    homeVisitDate: p.homeVisitDate || '',
    membershipNotes: p.membershipNotes || '',
    membershipRecordNumber: p.membershipRecordNumber || '',
    baptismPlace: p.baptismPlace || '',
    cpf: p.cpf || '',
  };
}

async function hydrateFromApi() {
  try {
    const [people, events, schedules, anns, orders, tags, spaces] = await Promise.all([
      apiGet('/people'),
      apiGet('/events'),
      apiGet('/schedules'),
      apiGet('/announcements'),
      apiGet('/canteen/orders'),
      apiGet('/event-tags'),
      apiGet('/spaces'),
    ]);
    window.apiEventTags = Array.isArray(tags) ? tags : [];
    window.apiSpaces = Array.isArray(spaces) ? spaces : [];

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

    // Eventos → mockEvents / window.apiEvents
    window.apiEvents = events;
    mockEvents.length = 0;
    events.forEach((e) => {
      const iso = (e.date || '').slice(0, 10);
      const isPast = iso && iso < new Date().toISOString().slice(0, 10);
      mockEvents.push({
        id: e.id,
        _apiId: e.id,
        name: e.title,
        date: iso,
        time: e.timeStart || '19:00',
        timeEnd: e.timeEnd || '',
        location: e.location || 'Templo Principal',
        status: isPast ? 'past' : 'upcoming',
        apiStatus: e.status || 'SCHEDULED',
        type: e.type || 'EVENTO',
        subtype: e.subtype || '',
        description: e.description || '',
        isPublic: !!e.isPublic,
        capacity: e.capacity || null,
        liveUrl: e.liveUrl || '',
        sectorId: e.sectorId || null,
        sectorLabel: (e.sector && e.sector.label) || '',
        rsvps: (e._count && e._count.rsvps) || 0,
        schedulesCount: (e._count && e._count.schedules) || 0,
      });
    });

    // Escalas → mockShifts (agrupa por setor, próximo culto)
    window.apiSchedules = schedules;
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
        sectors.forEach((s) => {
          s.cargosList = parseJsonList(s.cargos);
          (s.members || []).forEach((m) => {
            m.positionsList = parseJsonList(m.positions || m.position);
          });
          const links = (s.leaderLinks || []).map(l => l.user).filter(Boolean);
          if (!links.length && s.leader) links.push(s.leader);
          s.leaders = links.map(u => ({
            id: u.id,
            name: (u.person && u.person.name) || u.email,
            email: u.email,
          }));
          s.leaderUserIds = s.leaders.map(l => l.id);
          s.leaderNames = s.leaders.map(l => l.name);
          s.leaderDisplay = s.leaderNames.join(' & ') || s.leaderName || '';
        });
        window.apiSectors = sectors; // brutos: leaderUserId, members, templateKey (escopo de líder)
        mockDepartments.length = 0;
        sectors.forEach((s) => {
          mockDepartments.push({
            id: s.id,
            name: s.label,
            icon: s.icon || 'building-2',
            color: s.color || '#103B5F',
            group: s.groupTag || 'operacoes',
            sub: s.description || '',
            description: s.description || '',
            leader: s.leaderDisplay || '—',
            leaderUserId: s.leaderUserIds[0] || s.leaderUserId || null,
            leaderUserIds: s.leaderUserIds || [],
            leaders: s.leaders || [],
            leaderEmail: (s.leaders[0] && s.leaders[0].email) || '',
            volunteers: (s.members || []).length,
            capacity: 0,
            schedule: '',
            highlight: s.highlightText || '',
            readiness: 0,
            status: '',
            tone: '',
            live: !!s.isLive,
            cargos: s.cargosList || [],
            mission: s.mission || '',
            vision: s.vision || '',
            foundedAt: s.foundedAt || '',
            notes: s.notes || '',
            whatsappLink: s.whatsappLink || '',
            contactEmail: s.contactEmail || '',
            members: s.members || [],
            schedulesCount: s._count ? s._count.schedules : 0,
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
