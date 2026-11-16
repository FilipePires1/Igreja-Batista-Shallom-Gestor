const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = process.env.DATABASE_PATH
  ? path.resolve(process.env.DATABASE_PATH)
  : path.join(__dirname, '..', 'dev.db');
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });
const now = () => new Date().toISOString();

async function main() {
  console.log('Seeding database...');

  // Roles
  const roles = [
    { name: 'SUPER_ADMIN', label: 'Super Admin', level: 100, color: '#DC2626' },
    { name: 'PASTOR', label: 'Pastor', level: 80, color: '#003C64' },
    { name: 'PRESBITERO', label: 'Presbítero', level: 70, color: '#003C64' },
    { name: 'LIDER', label: 'Líder', level: 60, color: '#3CBEC8' },
    { name: 'COORDENADOR', label: 'Coordenador', level: 50, color: '#059669' },
    { name: 'MEMBRO', label: 'Membro', level: 20, color: '#6B7280' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }
  console.log('Roles seeded');

  // ===== PERMISSÕES PADRÃO POR CARGO =====
  // PASTOR e SUPER_ADMIN têm acesso total (implícito, sem linhas).
  // Demais cargos: módulos (mod:*) + ações específicas — o pastor pode ajustar
  // depois na tela de Configurações > Permissões.
  const defaultPerms = {
    PRESBITERO: [
      'mod:dashboard', 'mod:pessoas', 'mod:setores', 'mod:escalas', 'mod:agenda', 'mod:avisos',
      'mod:app-publico', 'mod:cantina', 'mod:relatorios',
      'pessoas:criar', 'pessoas:editar', 'setores:gerenciar', 'avisos:criar', 'avisos:editar',
      'escalas:editar', 'agenda:editar', 'cantina:gerenciar',
    ],
    LIDER: [
      'mod:dashboard', 'mod:pessoas', 'mod:setores', 'mod:escalas', 'mod:agenda', 'mod:avisos',
      'mod:app-publico', 'mod:cantina',
      'pessoas:editar', 'avisos:criar', 'escalas:editar', 'cantina:gerenciar',
    ],
    COORDENADOR: [
      'mod:dashboard', 'mod:pessoas', 'mod:setores', 'mod:escalas', 'mod:agenda', 'mod:avisos',
      'mod:app-publico', 'mod:cantina',
      'pessoas:criar', 'pessoas:editar', 'avisos:criar', 'escalas:editar',
    ],
    MEMBRO: [
      'mod:dashboard', 'mod:escalas', 'mod:agenda', 'mod:avisos', 'mod:app-publico',
    ],
  };
  for (const [roleName, actions] of Object.entries(defaultPerms)) {
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) continue;
    await prisma.permission.deleteMany({ where: { roleId: role.id } });
    await prisma.permission.createMany({
      data: actions.map((action) => ({ roleId: role.id, action, granted: true })),
    });
  }
  console.log('Default permissions seeded');

  // ===== MINISTÉRIOS FIXOS (17) =====
  // Limpa dados demo antigos (escalas, membros de setor, tarefas) e recria os ministérios fixos.
  await prisma.scheduleMember.deleteMany({});
  await prisma.schedule.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.sectorMember.deleteMany({});
  await prisma.announcement.updateMany({ where: { sectorId: { not: null } }, data: { sectorId: null } });
  await prisma.permission.deleteMany({ where: { sectorId: { not: null } } });
  await prisma.sector.deleteMany({});

  const sectors = [
    { name: 'pastoral', label: 'Ministério Pastoral', icon: 'crown', color: '#003C64', order: 1, isRestricted: true, groupTag: 'pastoral', templateKey: 'base', capacity: 12, scheduleText: 'Diário', description: 'Pastores e presbíteros' },
    { name: 'homens_nobres', label: 'Ministério dos Homens Nobres', icon: 'user', color: '#103B5F', order: 2, groupTag: 'pastoral', templateKey: 'base', capacity: 40, scheduleText: 'Sáb 09h', description: 'Homens da igreja' },
    { name: 'mulheres_nobres', label: 'Ministério Mulheres Nobres', icon: 'heart', color: '#DC648C', order: 3, groupTag: 'pastoral', templateKey: 'base', capacity: 45, scheduleText: 'Sáb 09h', description: 'Mulheres da igreja' },
    { name: 'melhor_idade', label: 'Ministério com Melhor Idade', icon: 'accessibility', color: '#D97706', order: 4, groupTag: 'pastoral', templateKey: 'base', capacity: 30, scheduleText: 'Ter 15h', description: 'Terceira idade' },
    { name: 'strong', label: 'Ministério Strong', icon: 'zap', color: '#16A2AD', order: 5, groupTag: 'pastoral', templateKey: 'base', capacity: 30, scheduleText: 'Sex 20h', description: 'Jovens universitários' },
    { name: 'adolescentes', label: 'Ministério Adolescentes', icon: 'gamepad-2', color: '#EA580C', order: 6, groupTag: 'pastoral', templateKey: 'base', capacity: 35, scheduleText: 'Sáb 17h', description: 'Adolescentes 12 a 15 anos' },
    { name: 'juniores', label: 'Ministério Juniores', icon: 'users', color: '#16A34A', order: 7, groupTag: 'pastoral', templateKey: 'base', capacity: 35, scheduleText: 'Dom 09h & 18h', description: 'Kids 8 a 11 anos' },
    { name: 'criancas', label: 'Ministério Crianças', icon: 'baby', color: '#DC648C', order: 8, groupTag: 'pastoral', templateKey: 'base', capacity: 40, scheduleText: 'Dom 09h & 18h', description: 'Berçário e Kids 4 a 7 anos' },
    { name: 'ensino_ebd', label: 'Ministério Ensino, EBD e Culto Infantil', icon: 'book-open', color: '#3CBEC8', order: 9, groupTag: 'pastoral', templateKey: 'ensino', capacity: 60, scheduleText: 'Dom 09h (EBD) & Qua 19h30', description: 'Escola Bíblica Dominical e ensino infantil' },
    { name: 'louvor', label: 'Ministério de Louvor', icon: 'music', color: '#103B5F', order: 10, groupTag: 'cultos', templateKey: 'louvor', capacity: 32, scheduleText: 'Dom 09h & 18h', highlightText: 'Ensaio geral quarta 20h', description: 'Louvor e adoração' },
    { name: 'midia', label: 'Ministério de Mídia', icon: 'video', color: '#16A2AD', order: 11, groupTag: 'cultos', templateKey: 'base', capacity: 20, scheduleText: 'Dom 17h às 20h', description: 'Áudio, câmera e streaming' },
    { name: 'familia', label: 'Ministério de Família', icon: 'home', color: '#059669', order: 12, groupTag: 'pastoral', templateKey: 'base', capacity: 50, scheduleText: 'Qui 19h30', description: 'Casais e famílias' },
    { name: 'missionario', label: 'Ministério Missionário', icon: 'globe', color: '#003C64', order: 13, groupTag: 'pastoral', templateKey: 'base', capacity: 25, scheduleText: 'Sáb 14h', description: 'Missões e evangelismo' },
    { name: 'recepcao', label: 'Ministério de Recepção', icon: 'door-open', color: '#059669', order: 14, groupTag: 'cultos', templateKey: 'base', capacity: 30, scheduleText: 'Dom 08h30 & 17h30', description: 'Portaria e acolhimento' },
    { name: 'diaconal', label: 'Ministério Diaconal', icon: 'hand-heart', color: '#059669', order: 15, groupTag: 'pastoral', templateKey: 'base', capacity: 28, scheduleText: 'Sáb 10h', description: 'Assistência e cuidado' },
    { name: 'secretaria', label: 'Secretaria', icon: 'briefcase', color: '#103B5F', order: 16, groupTag: 'operacoes', templateKey: 'base', capacity: 10, scheduleText: 'Seg a Sex', description: 'Administração e atendimento' },
    { name: 'tesouraria', label: 'Tesouraria', icon: 'shield-check', color: '#DC2626', order: 17, isRestricted: true, groupTag: 'operacoes', templateKey: 'base', capacity: 10, scheduleText: 'Seg a Sex', description: 'Finanças e dízimos' },
  ];

  for (const sector of sectors) {
    await prisma.sector.upsert({
      where: { name: sector.name },
      update: sector,
      create: sector,
    });
  }
  console.log('Ministérios fixos seeded (17)');

  // App Sections
  const appSections = [
    { key: 'NEXT_CULTO', title: 'Próximo Culto', order: 1, isVisible: true },
    { key: 'WELCOME_BANNER', title: 'Boas-Vindas', order: 2, isVisible: true },
    { key: 'THIS_WEEK', title: 'Esta Semana', order: 3, isVisible: true },
    { key: 'ANNOUNCEMENTS', title: 'Avisos da Comunidade', order: 4, isVisible: true },
    { key: 'LOCATION', title: 'Sobre & Localização', order: 5, isVisible: true },
    { key: 'PRAYER_BANNER', title: 'Oração', order: 6, isVisible: true },
  ];

  for (const section of appSections) {
    await prisma.appSection.upsert({
      where: { key: section.key },
      update: {},
      create: section,
    });
  }
  console.log('App sections seeded');

  // Church Settings
  await prisma.churchSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      name: 'Igreja Batista Shallom Cidade Nobre',
      shortName: 'IBSCN',
      address: 'Av. Paulista, 1200 - Bela Vista, SP',
      phone: '(11) 99999-0000',
      whatsapp: '(11) 99999-0000',
      email: 'contato@ibscn.com.br',
      instagram: '@ibscn',
      youtube: '@ibscn',
      pixKey: '12.345.678/0001-90',
      pixCnpj: '12.345.678/0001-90',
      pixBankName: 'Banco Shallom',
      scheduleJson: JSON.stringify({
        domingo: { horarios: ['10:00', '18:00'], label: 'Cultos de Celebração' },
        quarta: { horarios: ['20:00'], label: 'Oração & Palavra' },
      }),
      aboutText: 'Somos uma comunidade que conecta vidas ao propósito de Deus.',
      missionText: 'Levar o amor de Cristo a cada pessoa, formando discípulos que transformam o mundo.',
    },
  });
  console.log('Church settings seeded');

  // Canteen Settings
  await prisma.canteenSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      isOpen: true,
      openTime: '09:00',
      closeTime: '21:30',
    },
  });
  console.log('Canteen settings seeded');

  // Sample Canteen Products
  const products = [
    { name: 'Pão de Queijo Artesanal (3 un)', price: 9.0, category: 'LANCHES', isFeatured: true, order: 1 },
    { name: 'Torta Salgada de Frango Cremoso', price: 14.0, category: 'LANCHES', isFeatured: true, order: 2 },
    { name: 'Espresso Duplo Gourmet', price: 8.0, category: 'BEBIDAS', order: 3 },
    { name: 'Suco Natural de Laranja 400ml', price: 10.0, category: 'BEBIDAS', order: 4 },
    { name: 'Bolo Caseiro de Cenoura', price: 11.0, category: 'SOBREMESAS', order: 5 },
    { name: 'Combo Café + Torta Especial', price: 19.9, category: 'COMBOS', order: 6 },
  ];

  for (const product of products) {
    const existing = await prisma.canteenProduct.findFirst({ where: { name: product.name } });
    if (!existing) {
      await prisma.canteenProduct.create({ data: product });
    }
  }
  console.log('Canteen products seeded');

  // Sample Events
  const events = [
    {
      title: 'Culto de Celebração & Santa Ceia',
      description: 'Uma noite especial de louvor, palavra inspiradora e comunhão com toda a igreja reunida ao redor da mesa.',
      type: 'CULTO',
      isPublic: true,
      date: '2026-09-27',
      timeStart: '18:00',
      timeEnd: '20:00',
      location: 'Auditório Principal — Campus Central',
      address: 'Av. Paulista, 1200 - Bela Vista, SP',
      status: 'SCHEDULED',
      capacity: 500,
      tags: '["louvor","palavra","comunhao"]',
      createdById: 'system',
    },
    {
      title: 'Noite de Louvor & Clamor',
      description: 'Uma noite de adoração e intercessão pela cidade e nação.',
      type: 'CULTO',
      isPublic: true,
      date: '2026-10-17',
      timeStart: '20:00',
      timeEnd: '22:00',
      location: 'Espaço Comunidade',
      status: 'SCHEDULED',
      capacity: 300,
      tags: '["louvor","especial","jovens"]',
      createdById: 'system',
    },
    {
      title: 'Conferência Águas Profundas 2025',
      description: 'Três dias de comunhão, descanso e renovação na Serra da Mantiqueira.',
      type: 'CONFERENCIA',
      isPublic: true,
      date: '2026-10-24',
      timeStart: '19:30',
      timeEnd: '22:00',
      location: 'Auditório Principal (Presencial e Online)',
      status: 'SCHEDULED',
      capacity: 90,
      tags: '["conferencia","especial"]',
      createdById: 'system',
    },
    {
      title: 'Culto Kids Especial: A Grande Aventura',
      description: 'Teatro interativo, fantoches e lanche para crianças de 0 a 11 anos.',
      type: 'CULTO',
      isPublic: true,
      date: '2026-10-19',
      timeStart: '10:00',
      timeEnd: '11:30',
      location: 'Pavilhão Infantil',
      status: 'SCHEDULED',
      capacity: 100,
      tags: '["infantil","kids","familia"]',
      createdById: 'system',
    },
  ];

  for (const event of events) {
    const existing = await prisma.event.findFirst({ where: { title: event.title } });
    if (!existing) {
      await prisma.event.create({ data: event });
    }
  }
  console.log('Events seeded');

  // ===== PESSOAS + USUÁRIOS =====
  // Membros serão adicionados manualmente pela interface — o seed mantém apenas o login do pastor/admin.
  const hashAdmin = bcrypt.hashSync('admin123', 10);

  // Limpa todas as pessoas/usuários demo e dependentes (FK-safe)
  await prisma.auditLog.deleteMany({});
  await prisma.pushToken.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.announcementRead.deleteMany({});
  await prisma.announcement.deleteMany({});
  await prisma.savedFile.deleteMany({});
  await prisma.availability.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.prayerRequest.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.groupMember.deleteMany({});
  await prisma.visitor.deleteMany({});
  await prisma.eventRsvp.deleteMany({});
  await prisma.sector.updateMany({ data: { leaderUserId: null, leaderName: null } });
  await prisma.userRole.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.person.deleteMany({});

  const peopleSeed = [
    { name: 'Pr. Thiago Martins', email: 'pastor@ibscn.org', phone: '(11) 98111-0001', role: 'PASTOR', sector: 'pastoral', pass: hashAdmin, status: 'ACTIVE', baptismDate: '12/03/2010', memberSince: '2010-03-12', pastoralNotes: 'Pastor principal. Acompanha discipulado e formação de líderes.' },
  ];

  const usersBySector = {};
  let adminUserId = null;
  for (const p of peopleSeed) {
    let person = await prisma.person.findFirst({ where: { email: p.email } });
    if (!person) {
      person = await prisma.person.create({
        data: {
          name: p.name,
          email: p.email,
          phone: p.phone,
          status: p.status,
          baptismDate: p.baptismDate || null,
          memberSince: p.memberSince || null,
          pastoralNotes: p.pastoralNotes || null,
          createdAt: now(),
          updatedAt: now(),
        },
      });
    }
    let user = await prisma.user.findFirst({ where: { email: p.email } });
    if (!user) {
      // memberCode estável derivado do email (evita colisão de índice em re-seeds)
      let code = 'IBS' + String(2000 + (await prisma.user.count()));
      while (await prisma.user.findFirst({ where: { memberCode: code } })) {
        code = 'IBS' + String(parseInt(code.slice(3), 10) + 1);
      }
      user = await prisma.user.create({
        data: {
          personId: person.id,
          email: p.email,
          passwordHash: p.pass,
          status: 'ACTIVE',
          memberCode: code,
          createdAt: now(),
          updatedAt: now(),
        },
      });
    }
    if (p.email === 'pastor@ibscn.org') adminUserId = user.id;
    const role = await prisma.role.findUnique({ where: { name: p.role } });
    const existingRole = await prisma.userRole.findFirst({ where: { userId: user.id, roleId: role.id } });
    if (!existingRole) {
      await prisma.userRole.create({ data: { userId: user.id, roleId: role.id, grantedAt: now() } });
    }
    // Admin master (pastor principal) também é SUPER_ADMIN — pode criar pastores
    if (p.email === 'pastor@ibscn.org') {
      const superRole = await prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } });
      const hasSuper = await prisma.userRole.findFirst({ where: { userId: user.id, roleId: superRole.id } });
      if (!hasSuper) {
        await prisma.userRole.create({ data: { userId: user.id, roleId: superRole.id, grantedAt: now() } });
      }
    }
    const sector = await prisma.sector.findUnique({ where: { name: p.sector } });
    const existingSm = await prisma.sectorMember.findFirst({ where: { userId: user.id, sectorId: sector.id } });
    if (!existingSm) {
      await prisma.sectorMember.create({
        data: { userId: user.id, personId: person.id, sectorId: sector.id, roleId: role.id, status: 'ACTIVE', joinedAt: p.memberSince || now(), addedById: 'system' },
      });
    }
    usersBySector[p.sector] = usersBySector[p.sector] || [];
    usersBySector[p.sector].push({ userId: user.id, personId: person.id, name: p.name });
  }
  console.log('People & users seeded');

  // ===== ESCALAS =====
  const schedulesSeed = [
    { title: 'Culto de Celebração — Manhã', sector: 'louvor', date: '2026-10-18', timeStart: '10:00', timeEnd: '12:00', status: 'PUBLISHED' },
    { title: 'Culto de Celebração — Noite', sector: 'louvor', date: '2026-10-18', timeStart: '18:00', timeEnd: '20:00', status: 'PUBLISHED' },
    { title: 'Culto de Celebração — Noite (Mídia)', sector: 'midia', date: '2026-10-18', timeStart: '17:00', timeEnd: '20:30', status: 'PUBLISHED' },
    { title: 'Recepção & Boas-Vindas — Noite', sector: 'recepcao', date: '2026-10-18', timeStart: '17:30', timeEnd: '20:00', status: 'PUBLISHED' },
    { title: 'Culto Infantil — Noite', sector: 'ensino_ebd', date: '2026-10-18', timeStart: '17:30', timeEnd: '20:00', status: 'PUBLISHED' },
    { title: 'EBD — Adults', sector: 'ensino_ebd', date: '2026-10-18', timeStart: '09:00', timeEnd: '10:00', status: 'PUBLISHED' },
    { title: 'Ensaio do Louvor', sector: 'louvor', date: '2026-10-14', timeStart: '20:00', timeEnd: '22:00', status: 'PUBLISHED' },
    { title: 'Reunião de Mulheres Nobres', sector: 'mulheres_nobres', date: '2026-10-17', timeStart: '09:00', timeEnd: '11:00', status: 'DRAFT' },
  ];

  for (let i = 0; i < schedulesSeed.length; i++) {
    const s = schedulesSeed[i];
    const sector = await prisma.sector.findUnique({ where: { name: s.sector } });
    let sched = await prisma.schedule.findFirst({ where: { title: s.title, date: s.date } });
    if (!sched) {
      const pool = usersBySector[s.sector] || [];
      // Funções por ministério (template da tela de escalas)
      const roleBySector = {
        louvor: ['Vocal Principal (Líder)', 'Guitarra Solo', 'Baixo Elétrico', 'Teclado & Arranjador', 'Bateria & Percussão', 'Vocal de Apoio'],
        midia: ['Operador de Áudio', 'Câmera / Vídeo', 'Transmissão (Stream)', 'Fotografia'],
        ensino_ebd: ['Professor (Adultos)', 'Professor (Kids)', 'Apoio de Sala', 'Recepção Infantil'],
        recepcao: ['Recepção Principal', 'Acolhimento', 'Usher (Galeria)'],
        criancas: ['Professor(a)', 'Apoio', 'Berçário'],
        mulheres_nobres: ['Coordenação', 'Ministração', 'Apoio'],
        default: ['Líder', 'Voluntário'],
      };
      const roles = roleBySector[s.sector] || roleBySector.default;
      sched = await prisma.schedule.create({
        data: {
          title: s.title,
          sectorId: sector.id,
          date: s.date,
          timeStart: s.timeStart,
          timeEnd: s.timeEnd,
          status: s.status,
          location: 'Templo Principal',
          totalPositions: Math.max(pool.length, 2),
          confirmedCount: 0,
          pendingCount: 0,
          createdById: 'system',
          createdAt: now(),
          updatedAt: now(),
        },
      });
      let confirmed = 0;
      let pending = 0;
      for (let m = 0; m < pool.length; m++) {
        // Padrão: 1º confirmado, 2º pendente, 3º confirmado... último da noite do louvor = troca solicitada
        let status = m % 3 !== 1 ? 'CONFIRMED' : 'PENDING';
        if (s.sector === 'louvor' && s.title.includes('Noite') && m === 3) status = 'TRADE_REQUESTED';
        if (status === 'CONFIRMED') confirmed++; else pending++;
        await prisma.scheduleMember.create({
          data: {
            scheduleId: sched.id,
            userId: pool[m].userId,
            personId: pool[m].personId,
            roleInSchedule: roles[m % roles.length],
            status,
            monthlyCount: (m % 4) + 1,
            tradeReason: status === 'TRADE_REQUESTED' ? 'Imprevisto Familiar' : null,
            respondedAt: status === 'CONFIRMED' ? now() : null,
            createdAt: now(),
          },
        });
      }
      await prisma.schedule.update({ where: { id: sched.id }, data: { confirmedCount: confirmed, pendingCount: pending } });
    }
  }
  console.log('Schedules seeded');

  // ===== AVISOS =====
  const announcementsSeed = [
    { title: 'Inscrições abertas: Retiro Espiritual 2026', body: 'Garanta sua vaga no retiro de outubro. Vagas limitadas!', type: 'GERAL', isUrgent: false },
    { title: 'Nova Série: Fundamentos da Fé', body: 'Começa na próxima segunda-feira às 19h. Venha participar!', type: 'ENSINO', isUrgent: false },
    { title: 'Campanha de Doações — Reforma do Templo', body: 'Ajude a reforma do templo. Toda contribuição faz diferença.', type: 'FINANCEIRO', isUrgent: true },
    { title: 'Cantina Shallom aberta após o culto da noite', body: 'Sucos, cafés e lanches artesanais. Pix e cartão aceitos.', type: 'GERAL', isUrgent: false },
  ];
  for (const a of announcementsSeed) {
    const existing = await prisma.announcement.findFirst({ where: { title: a.title } });
    if (!existing) {
      await prisma.announcement.create({
        data: { ...a, isPinned: false, publishedAt: now(), createdById: adminUserId, createdAt: now() },
      });
    }
  }
  console.log('Announcements seeded');

  // ===== PEDIDOS DA CANTINA =====
  const orderProducts = await prisma.canteenProduct.findMany();
  if (orderProducts.length > 0) {
    const orderCount = await prisma.order.count();
    if (orderCount === 0) {
      const mk = async (n, pi, qty, status) => {
        const prod = orderProducts[pi % orderProducts.length];
        const total = prod.price * qty;
        const o = await prisma.order.create({
          data: {
            orderNumber: n,
            customerName: ['Matheus Dias', 'Juliana Alves', 'Rafael Souza'][n % 3],
            total,
            status,
            paymentMethod: 'PIX',
            paymentStatus: 'PAID',
            createdAt: now(),
            updatedAt: now(),
          },
        });
        await prisma.orderItem.create({
          data: { orderId: o.id, productId: prod.id, quantity: qty, unitPrice: prod.price, subtotal: total },
        });
      };
      await mk(141, 0, 2, 'READY');
      await mk(142, 3, 1, 'PREPARING');
      await mk(143, 2, 1, 'DELIVERED');
      console.log('Orders seeded');
    }
  }

  // ===== TRANSAÇÕES =====
  const txCount = await prisma.transaction.count();
  if (txCount === 0) {
    const txs = [
      { txCode: 'TX-DIZ-001', type: 'INCOME', category: 'Dízimos', amount: 4820.0, description: 'Dízimos da semana', referenceDate: '2026-10-05', paymentMethod: 'PIX' },
      { txCode: 'TX-OFE-001', type: 'INCOME', category: 'Ofertas', amount: 1350.5, description: 'Ofertas dos cultos', referenceDate: '2026-10-05', paymentMethod: 'Dinheiro' },
      { txCode: 'TX-CAN-001', type: 'INCOME', category: 'Cantina', amount: 480.0, description: 'Faturamento da cantina', referenceDate: '2026-10-05', paymentMethod: 'PIX' },
      { txCode: 'TX-EVT-001', type: 'EXPENSE', category: 'Eventos', amount: 950.0, description: 'Material para o Retiro Espiritual', referenceDate: '2026-10-08', paymentMethod: 'Cartão' },
    ];
    for (const t of txs) {
      await prisma.transaction.create({ data: { ...t, registeredById: 'system', createdAt: now() } });
    }
    console.log('Transactions seeded');
  }

  // Visitantes: adicionados manualmente pela interface (seed de demo removido)

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
