/**
 * Seed de produção — cria apenas a base necessária:
 * cargos, permissões, ministérios, seções do app, configurações e o admin.
 * Não cria pessoas demo, escalas, avisos, eventos, produtos ou pedidos.
 *
 * Uso:
 *   SEED_ADMIN_PASSWORD='...' node prisma/seed-prod.js
 */
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

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'pastor@ibscn.org';
const ADMIN_NAME = process.env.SEED_ADMIN_NAME || 'Administrador';
const ADMIN_PHONE = process.env.SEED_ADMIN_PHONE || '';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD;

const roles = [
  { name: 'SUPER_ADMIN', label: 'Super Admin', level: 100, color: '#DC2626' },
  { name: 'PASTOR', label: 'Pastor', level: 80, color: '#003C64' },
  { name: 'PRESBITERO', label: 'Presbítero', level: 70, color: '#003C64' },
  { name: 'LIDER', label: 'Líder', level: 60, color: '#3CBEC8' },
  { name: 'COORDENADOR', label: 'Coordenador', level: 50, color: '#059669' },
  { name: 'MEMBRO', label: 'Membro', level: 20, color: '#6B7280' },
];

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

const appSections = [
  { key: 'NEXT_CULTO', title: 'Próximo Culto', order: 1, isVisible: true },
  { key: 'WELCOME_BANNER', title: 'Boas-Vindas', order: 2, isVisible: true },
  { key: 'THIS_WEEK', title: 'Esta Semana', order: 3, isVisible: true },
  { key: 'ANNOUNCEMENTS', title: 'Avisos da Comunidade', order: 4, isVisible: true },
  { key: 'LOCATION', title: 'Sobre & Localização', order: 5, isVisible: true },
  { key: 'PRAYER_BANNER', title: 'Oração', order: 6, isVisible: true },
];

async function main() {
  console.log('Seeding production base...');

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }
  console.log('Roles OK');

  for (const [roleName, actions] of Object.entries(defaultPerms)) {
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) continue;
    for (const action of actions) {
      const existing = await prisma.permission.findFirst({
        where: { sectorId: null, roleId: role.id, action },
      });
      if (existing) {
        await prisma.permission.update({ where: { id: existing.id }, data: { granted: true } });
      } else {
        await prisma.permission.create({ data: { roleId: role.id, action, granted: true } });
      }
    }
  }
  console.log('Permissions OK');

  for (const sector of sectors) {
    await prisma.sector.upsert({
      where: { name: sector.name },
      update: sector,
      create: sector,
    });
  }
  console.log('Sectors OK');

  for (const section of appSections) {
    await prisma.appSection.upsert({
      where: { key: section.key },
      update: {},
      create: section,
    });
  }
  console.log('App sections OK');

  await prisma.churchSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      name: 'Igreja Batista Shallom Cidade Nobre',
      shortName: 'IBSCN',
    },
  });

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
  console.log('Settings OK');

  const existingUser = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (existingUser) {
    console.log(`Admin ${ADMIN_EMAIL} already exists; password unchanged`);
  } else {
    if (!ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12) {
      throw new Error('SEED_ADMIN_PASSWORD is required (min 12 chars) to create the admin');
    }

    const person = await prisma.person.create({
      data: {
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        phone: ADMIN_PHONE,
        status: 'ACTIVE',
        createdAt: now(),
        updatedAt: now(),
      },
    });

    const user = await prisma.user.create({
      data: {
        personId: person.id,
        email: ADMIN_EMAIL,
        passwordHash: bcrypt.hashSync(ADMIN_PASSWORD, 12),
        status: 'ACTIVE',
        memberCode: 'IBS0001',
        createdAt: now(),
        updatedAt: now(),
      },
    });

    for (const roleName of ['SUPER_ADMIN', 'PASTOR']) {
      const role = await prisma.role.findUnique({ where: { name: roleName } });
      if (!role) continue;
      const exists = await prisma.userRole.findFirst({
        where: { userId: user.id, roleId: role.id },
      });
      if (!exists) {
        await prisma.userRole.create({
          data: { userId: user.id, roleId: role.id, grantedAt: now() },
        });
      }
    }

    const pastoral = await prisma.sector.findUnique({ where: { name: 'pastoral' } });
    const pastorRole = await prisma.role.findUnique({ where: { name: 'PASTOR' } });
    if (pastoral && pastorRole) {
      await prisma.sectorMember.create({
        data: {
          userId: user.id,
          personId: person.id,
          sectorId: pastoral.id,
          roleId: pastorRole.id,
          status: 'ACTIVE',
          joinedAt: now(),
          addedById: 'system',
        },
      });
    }

    console.log(`Admin ${ADMIN_EMAIL} created`);
  }

  console.log('Production base seed complete');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
