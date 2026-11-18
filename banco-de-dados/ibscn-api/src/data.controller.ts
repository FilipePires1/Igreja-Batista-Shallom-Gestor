import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { PrismaService } from './prisma.service';
import * as bcrypt from 'bcryptjs';

const now = () => new Date().toISOString();

function normalizeCargos(value: any): string[] {
  if (!value) return [];
  let list: any = value;
  if (typeof list === 'string') {
    try { list = JSON.parse(list); } catch { list = String(value).split(','); }
  }
  if (!Array.isArray(list)) return [];
  return [...new Set(list.map((c) => String(c || '').trim()).filter(Boolean))];
}

function resolveSectorPositions(sectorCargos: any, requested: string[]): string[] {
  const allowed = normalizeCargos(sectorCargos);
  if (!allowed.length) {
    if (requested.length) throw new BadRequestException('Cadastre os cargos do ministério antes de vincular cargos aos membros');
    return [];
  }
  const invalid = requested.filter((p) => !allowed.includes(p));
  if (invalid.length) {
    throw new BadRequestException(`Cargo não disponível neste ministério: ${invalid.join(', ')}. Disponíveis: ${allowed.join(', ')}`);
  }
  return [...new Set(requested)];
}

const BAPTISM_FIELDS = [
  'motherName', 'fatherName', 'birthdate', 'maritalStatus', 'cpf', 'rg', 'birthplace',
  'email', 'profession', 'education', 'address', 'zipCode', 'neighborhood', 'city',
  'state', 'residencePhone', 'cellPhone', 'conversionDate', 'baptismDate', 'spouseName',
  'previouslyMarried', 'civilMarriageDate', 'religiousMarriageDate', 'children',
  'notes', 'signature', 'photoUrl',
];

const PERSON_FORM_FIELDS = [
  'preferredName', 'photoUrl', 'whatsapp', 'cpf', 'birthdate', 'address', 'city', 'state',
  'motherName', 'fatherName', 'sex', 'maritalStatus', 'rg', 'birthplace', 'profession',
  'education', 'zipCode', 'neighborhood', 'residencePhone', 'conversionDate', 'spouseName',
  'previouslyMarried', 'civilMarriageDate', 'religiousMarriageDate', 'children',
  'previousChurches', 'lastChurch', 'previousPastorContact', 'previousChurchAddress',
  'ministryInterest', 'interviewedBy', 'homeVisitDate', 'membershipNotes',
  'membershipRecordNumber', 'membershipRequestStatus', 'membershipRequestDate',
  'baptismDate', 'baptismWaters', 'baptismPlace', 'baptismPastor', 'howFound', 'pastoralNotes',
];

// Limpa dependentes de um setor antes do hard delete (FK RESTRICT)
async function prismaDepCleanup(prisma: PrismaService, sectorId: string) {
  await prisma.sectorLeader.deleteMany({ where: { sectorId } });
  await prisma.sectorIndication.deleteMany({ where: { sectorId } });
  await prisma.scheduleMember.deleteMany({ where: { schedule: { sectorId } } });
  await prisma.schedule.deleteMany({ where: { sectorId } });
  await prisma.task.deleteMany({ where: { sectorId } });
  await prisma.sectorMember.deleteMany({ where: { sectorId } });
  await prisma.announcement.updateMany({ where: { sectorId }, data: { sectorId: null } });
  await prisma.permission.deleteMany({ where: { sectorId } });
}

@Controller('api')
export class DataController {
  constructor(private prisma: PrismaService) {}

  // ===== AUDITORIA MINISTERIAL =====
  private async resolveActorId(preferred?: string): Promise<string | null> {
    if (preferred) {
      const actor = await this.prisma.user.findUnique({ where: { id: preferred }, select: { id: true } });
      if (actor) return actor.id;
    }
    const admin = await this.prisma.user.findFirst({
      where: { roles: { some: { role: { name: 'SUPER_ADMIN' } } } },
      select: { id: true },
      orderBy: { createdAt: 'asc' },
    });
    if (admin) return admin.id;
    const first = await this.prisma.user.findFirst({ select: { id: true }, orderBy: { createdAt: 'asc' } });
    return first?.id || null;
  }

  private async writeMinistryAudit(actorId: string | undefined, action: string, sectorId: string, detail: any) {
    const userId = await this.resolveActorId(actorId);
    if (!userId) return;
    await this.prisma.auditLog.create({
      data: {
        userId,
        action,
        module: 'ministries',
        recordType: 'Sector',
        recordId: sectorId,
        afterData: JSON.stringify(detail || {}),
        createdAt: now(),
      },
    });
  }

  private normalizeLeaderIds(body: any): string[] | null {
    if (body.leaderUserIds !== undefined) {
      const list = Array.isArray(body.leaderUserIds) ? body.leaderUserIds : [body.leaderUserIds];
      const ids: string[] = list.map((v: any) => String(v || '').trim()).filter((v: string) => !!v);
      return [...new Set<string>(ids)];
    }
    if (body.leaderUserId !== undefined) {
      const id = String(body.leaderUserId || '').trim();
      return id ? [id] : [];
    }
    return null;
  }

  private async fetchLeaderUsers(ids: string[]) {
    if (!ids.length) return [];
    const users = await this.prisma.user.findMany({ where: { id: { in: ids } }, include: { person: true } });
    const missing = ids.filter((id) => !users.some((u) => u.id === id));
    if (missing.length) throw new NotFoundException('Usuário do líder não encontrado');
    return ids.map((id) => users.find((u) => u.id === id)).filter(Boolean) as any[];
  }

  private leaderDisplayName(user: any): string {
    return user?.person?.name || user?.email || 'Líder';
  }

  private async replaceSectorLeaders(sectorId: string, users: any[]) {
    await this.prisma.sectorLeader.deleteMany({ where: { sectorId } });
    if (users.length) {
      await this.prisma.sectorLeader.createMany({
        data: users.map((u) => ({ sectorId, userId: u.id, createdAt: now() })),
      });
    }
  }

  private async ensureLeadersAsMembers(sectorId: string, users: any[], actorId?: string): Promise<number> {
    if (!users.length) return 0;
    const role = await this.prisma.role.findUnique({ where: { name: 'MEMBRO' } });
    if (!role) return 0;
    let added = 0;
    for (const u of users) {
      if (!u.person) continue;
      const existing = await this.prisma.sectorMember.findFirst({
        where: { sectorId, OR: [{ personId: u.person.id }, { userId: u.id }] },
      });
      if (!existing) {
        await this.prisma.sectorMember.create({
          data: {
            sectorId,
            personId: u.person.id,
            userId: u.id,
            roleId: role.id,
            positions: JSON.stringify([]),
            status: 'ACTIVE',
            joinedAt: now().slice(0, 10),
            addedById: actorId || 'system',
          },
        });
        added += 1;
      }
    }
    return added;
  }

  @Get('health')
  health() {
    return { ok: true, app: 'ibscn-api', time: now() };
  }

  // ===== AUTH =====
  @Post('auth/login')
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: (body.email || '').toLowerCase().trim() },
      include: {
        person: true,
        roles: { include: { role: true } },
        ledSectors: { select: { id: true } },
        leaderLinks: { select: { sector: { select: { id: true } } } },
      },
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    const ok = await bcrypt.compare(body.password || '', user.passwordHash);
    if (!ok) throw new ForbiddenException('Senha incorreta');

    const roleNames = user.roles.map((r) => r.role.name);
    const isPastorOrAdmin = roleNames.some((name) => ['SUPER_ADMIN', 'PASTOR'].includes(name));
    const isMinistryLeader = user.ledSectors.length > 0 || user.leaderLinks.length > 0;
    // Acesso ao sistema web: admin master, pastor, líder de ministério
    // ou membro com acesso explicitamente concedido.
    if (!isPastorOrAdmin && !isMinistryLeader && !user.webAccess) {
      throw new ForbiddenException(
        'Seu acesso ao sistema web ainda não foi liberado. Procure o pastor ou o admin master.',
      );
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: now(), failedLoginCount: 0 },
    });
    return {
      token: `temp-${user.id}`,
      user: {
        id: user.id,
        email: user.email,
        name: user.person?.name || user.email,
        memberCode: user.memberCode,
        webAccess: isPastorOrAdmin || isMinistryLeader || user.webAccess,
        isMinistryLeader,
        roles: user.roles.map((r) => ({ name: r.role.name, label: r.role.label, level: r.role.level })),
      },
    };
  }

  // ===== PESSOAS =====
  @Get('people')
  people(@Query('search') search?: string, @Query('status') status?: string) {
    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }
    return this.prisma.person.findMany({
      where,
      include: {
        sectorMembers: { include: { sector: true, role: true } },
        user: { include: { roles: { include: { role: true } }, ledSectors: { select: { id: true } }, leaderLinks: { select: { sectorId: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('people/:id')
  async person(@Param('id') id: string) {
    const p = await this.prisma.person.findUnique({
      where: { id },
      include: {
        sectorMembers: { include: { sector: true, role: true } },
        scheduleMembers: { include: { schedule: { include: { sector: true } } }, take: 10 },
        user: { include: { roles: { include: { role: true } }, ledSectors: { select: { id: true } }, leaderLinks: { select: { sectorId: true } } } },
      },
    });
    if (!p) throw new NotFoundException('Pessoa não encontrada');
    return p;
  }

  // ===== CARGOS & PERMISSOES =====
  @Get('roles')
  roles() {
    return this.prisma.role.findMany({ orderBy: { level: 'desc' } });
  }

  @Get('permissions')
  async permissions() {
    const rows = await this.prisma.permission.findMany({ include: { role: true } });
    const map: Record<string, string[]> = {};
    for (const r of rows) {
      if (!r.granted) continue;
      (map[r.role.name] = map[r.role.name] || []).push(r.action);
    }
    return map;
  }

  @Post('permissions/save')
  async savePermissions(@Body() body: any) {
    const role = await this.prisma.role.findUnique({ where: { name: body.roleName } });
    if (!role) throw new NotFoundException('Cargo não encontrado');
    await this.prisma.permission.deleteMany({ where: { roleId: role.id } });
    const actions: string[] = Array.isArray(body.actions) ? body.actions : [];
    if (actions.length) {
      await this.prisma.permission.createMany({
        data: actions.map((a) => ({ roleId: role.id, action: a, granted: true })),
      });
    }
    return { ok: true, roleName: role.name, count: actions.length };
  }

  // ===== USUÁRIOS (SELEÇÃO DE LIDERANÇA) =====
  @Get('users')
  users() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        status: true,
        webAccess: true,
        person: { select: { id: true, name: true, email: true, phone: true } },
        roles: { select: { role: { select: { name: true } } } },
        ledSectors: { select: { id: true, label: true } },
        leaderLinks: { select: { sector: { select: { id: true, label: true } } } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  // ===== SETORES =====
  @Get('sectors')
  sectors() {
    return this.prisma.sector.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { members: true, schedules: true } },
        leader: { include: { person: true } },
        leaderLinks: { include: { user: { include: { person: true } } } },
        indications: { include: { person: { select: { id: true, name: true, email: true, phone: true } } }, orderBy: { name: 'asc' } },
        members: {
          where: { status: 'ACTIVE', OR: [{ personId: { not: null } }, { userId: { not: null } }] },
          include: { person: true, user: { include: { person: true } }, role: true },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  // ===== ESCALAS =====
  @Get('schedules')
  schedules(@Query('dateFrom') dateFrom?: string, @Query('sectorName') sectorName?: string, @Query('sectorId') sectorId?: string) {
    const where: any = {};
    if (dateFrom) where.date = { gte: dateFrom };
    if (sectorId) where.sectorId = sectorId;
    if (sectorName) where.sector = { name: sectorName };
    return this.prisma.schedule.findMany({
      where,
      include: {
        sector: true,
        members: { include: { person: true, user: { include: { person: true } } } },
      },
      orderBy: [{ date: 'asc' }, { timeStart: 'asc' }],
    });
  }

  @Get('schedules/:id')
  async schedule(@Param('id') id: string) {
    const s = await this.prisma.schedule.findUnique({
      where: { id },
      include: { sector: true, members: { include: { person: true, user: { include: { person: true } } } } },
    });
    if (!s) throw new NotFoundException('Escala não encontrada');
    return s;
  }

  @Post('schedules')
  async createSchedule(@Body() body: any) {
    const nowIso = now();
    const sector = await this.prisma.sector.findUnique({ where: { name: body.sectorName } });
    if (!sector) throw new NotFoundException('Setor não encontrado');
    const memberIds: string[] = Array.isArray(body.memberIds) ? body.memberIds : [];
    const total = memberIds.length || (body.totalPositions || 0);
    const schedule = await this.prisma.schedule.create({
      data: {
        title: body.title,
        sectorId: sector.id,
        date: body.date,
        timeStart: body.timeStart || '00:00',
        timeEnd: body.timeEnd || null,
        location: body.location || null,
        notes: body.notes || null,
        status: body.status || 'DRAFT',
        totalPositions: total,
        createdById: body.createdById || 'admin',
        createdAt: nowIso,
        updatedAt: nowIso,
      },
    });
    for (const userId of memberIds) {
      const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { person: true } });
      if (!user) continue;
      await this.prisma.scheduleMember.create({
        data: {
          scheduleId: schedule.id,
          userId: user.id,
          personId: user.personId,
          roleInSchedule: body.roleInSchedule || 'Membro',
          status: 'PENDING',
          createdAt: nowIso,
        },
      });
    }
    await this.prisma.schedule.update({
      where: { id: schedule.id },
      data: {
        totalPositions: total,
        confirmedCount: 0,
        pendingCount: total,
      },
    });
    return this.prisma.schedule.findUnique({
      where: { id: schedule.id },
      include: { sector: true, members: { include: { person: true } } },
    });
  }

  @Post('schedules/:id/update')
  async updateSchedule(@Param('id') id: string, @Body() body: any) {
    const schedule = await this.prisma.schedule.findUnique({ where: { id } });
    if (!schedule) throw new NotFoundException('Escala não encontrada');
    const data: any = { updatedAt: now() };
    for (const k of ['title', 'date', 'timeStart', 'timeEnd', 'location', 'notes', 'status', 'cycleLabel']) {
      if (body[k] !== undefined) data[k] = body[k];
    }
    if (body.sectorName) {
      const sector = await this.prisma.sector.findUnique({ where: { name: body.sectorName } });
      if (sector) data.sectorId = sector.id;
    }
    return this.prisma.schedule.update({ where: { id }, data });
  }

  @Post('schedules/:id/delete')
  async deleteSchedule(@Param('id') id: string) {
    const schedule = await this.prisma.schedule.findUnique({ where: { id } });
    if (!schedule) throw new NotFoundException('Escala não encontrada');
    await this.prisma.scheduleMember.deleteMany({ where: { scheduleId: id } });
    await this.prisma.schedule.delete({ where: { id } });
    return { ok: true };
  }

  @Post('schedules/:id/confirm')
  async confirmScheduleMember(@Param('id') id: string, @Body() body: any) {
    const schedule = await this.prisma.schedule.findUnique({ where: { id } });
    if (!schedule) throw new NotFoundException('Escala não encontrada');
    const where: any = { scheduleId: id };
    if (body.personId) where.personId = body.personId;
    else if (body.userId) where.userId = body.userId;
    const sm = await this.prisma.scheduleMember.findFirst({ where });
    if (!sm) throw new NotFoundException('Voluntário não encontrado nesta escala');
    const allowed = ['CONFIRMED', 'PENDING', 'TRADE_REQUESTED', 'TRADE_SELECTED'];
    const status = allowed.includes(body.status) ? body.status : 'CONFIRMED';
    const data: any = { status, respondedAt: now() };
    if (body.tradeReason !== undefined) data.tradeReason = body.tradeReason;
    await this.prisma.scheduleMember.update({ where: { id: sm.id }, data });
    const counts = await this.prisma.scheduleMember.groupBy({
      by: ['status'],
      where: { scheduleId: id },
      _count: true,
    });
    let confirmed = 0;
    let pending = 0;
    for (const c of counts) {
      if (c.status === 'CONFIRMED') confirmed += c._count;
      else pending += c._count;
    }
    return this.prisma.schedule.update({
      where: { id },
      data: { confirmedCount: confirmed, pendingCount: pending, totalPositions: confirmed + pending },
    });
  }

  // ===== EVENTOS =====
  @Get('events')
  events(@Query('publicOnly') publicOnly?: string) {
    const where: any = {};
    if (publicOnly === '1') where.isPublic = true;
    return this.prisma.event.findMany({
      where,
      include: {
        sector: { select: { id: true, name: true, label: true } },
        _count: { select: { rsvps: true, schedules: true } },
      },
      orderBy: [{ date: 'asc' }, { timeStart: 'asc' }],
    });
  }

  @Post('events')
  async createEvent(@Body() body: any) {
    const title = String(body.title || '').trim();
    const date = String(body.date || '').trim();
    const timeStart = String(body.timeStart || '').trim();
    if (!title) throw new BadRequestException('Informe o nome do evento');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new BadRequestException('Data inválida');
    if (!/^\d{2}:\d{2}/.test(timeStart)) throw new BadRequestException('Horário inicial inválido');
    let sectorId: string | null = body.sectorId || null;
    if (sectorId) {
      const sector = await this.prisma.sector.findUnique({ where: { id: sectorId }, select: { id: true } });
      if (!sector) sectorId = null;
    }
    const createdById = body.createdById || (await this.resolveActorId(body.actorId)) || 'system';
    return this.prisma.event.create({
      data: {
        title,
        description: body.description || null,
        type: String(body.type || 'EVENTO').toUpperCase(),
        subtype: body.subtype || null,
        isPublic: !!body.isPublic,
        bannerUrl: body.bannerUrl || null,
        date,
        timeStart,
        timeEnd: body.timeEnd || null,
        location: body.location || null,
        address: body.address || null,
        mapsUrl: body.mapsUrl || null,
        liveUrl: body.liveUrl || null,
        capacity: body.capacity ? parseInt(body.capacity, 10) : null,
        sectorId,
        responsibleId: body.responsibleId || null,
        liturgicCycle: body.liturgicCycle || null,
        status: String(body.status || 'SCHEDULED').toUpperCase(),
        tags: JSON.stringify(normalizeCargos(body.tags)),
        createdById,
        createdAt: now(),
        updatedAt: now(),
      },
    });
  }

  @Post('events/:id/update')
  async updateEvent(@Param('id') id: string, @Body() body: any) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Evento não encontrado');
    const data: any = { updatedAt: now() };
    for (const key of ['title', 'description', 'subtype', 'bannerUrl', 'date', 'timeStart', 'timeEnd', 'location', 'address', 'mapsUrl', 'liveUrl', 'responsibleId', 'liturgicCycle']) {
      if (body[key] !== undefined) data[key] = body[key] === '' ? null : body[key];
    }
    if (body.type !== undefined) data.type = String(body.type).toUpperCase();
    if (body.status !== undefined) data.status = String(body.status).toUpperCase();
    if (body.isPublic !== undefined) data.isPublic = !!body.isPublic;
    if (body.capacity !== undefined) data.capacity = body.capacity ? parseInt(body.capacity, 10) : null;
    if (body.tags !== undefined) data.tags = JSON.stringify(normalizeCargos(body.tags));
    if (body.sectorId !== undefined) {
      data.sectorId = body.sectorId || null;
      if (data.sectorId) {
        const sector = await this.prisma.sector.findUnique({ where: { id: data.sectorId }, select: { id: true } });
        if (!sector) data.sectorId = null;
      }
    }
    return this.prisma.event.update({ where: { id }, data });
  }

  @Post('events/:id/delete')
  async deleteEvent(@Param('id') id: string) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Evento não encontrado');
    await this.prisma.schedule.updateMany({ where: { eventId: id }, data: { eventId: null } });
    await this.prisma.eventRsvp.deleteMany({ where: { eventId: id } });
    await this.prisma.attendance.deleteMany({ where: { eventId: id } });
    await this.prisma.event.delete({ where: { id } });
    return { ok: true };
  }

  // ===== BATISMOS =====
  @Get('baptisms')
  baptisms() {
    return this.prisma.baptismRecord.findMany({
      include: { person: { select: { id: true, name: true, email: true, phone: true, photoUrl: true } } },
      orderBy: [{ baptismDate: 'desc' }, { createdAt: 'desc' }],
    });
  }

  @Post('baptisms')
  async createBaptism(@Body() body: any) {
    const name = String(body.name || '').trim();
    if (!name) throw new BadRequestException('O nome é obrigatório');
    let personId: string | null = body.personId || null;
    if (personId) {
      const person = await this.prisma.person.findUnique({ where: { id: personId }, select: { id: true } });
      if (!person) personId = null;
      else {
        const existing = await this.prisma.baptismRecord.findUnique({ where: { personId } });
        if (existing) throw new ConflictException('Esta pessoa já possui uma ficha de batismo');
      }
    }
    const data: any = { name, personId, status: 'ACTIVE', createdById: body.createdById || (await this.resolveActorId(body.actorId)) || null, createdAt: now(), updatedAt: now() };
    for (const key of BAPTISM_FIELDS) {
      if (body[key] !== undefined) data[key] = body[key] === '' ? null : body[key];
    }
    const record = await this.prisma.baptismRecord.create({ data });
    if (personId) await this.syncBaptismToPerson(personId, data);
    return record;
  }

  @Post('baptisms/:id/update')
  async updateBaptism(@Param('id') id: string, @Body() body: any) {
    const record = await this.prisma.baptismRecord.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Ficha de batismo não encontrada');
    const data: any = { updatedAt: now() };
    if (body.name !== undefined) {
      const name = String(body.name || '').trim();
      if (!name) throw new BadRequestException('O nome é obrigatório');
      data.name = name;
    }
    if (body.personId !== undefined) {
      const personId = body.personId || null;
      if (personId) {
        const person = await this.prisma.person.findUnique({ where: { id: personId }, select: { id: true } });
        if (!person) throw new NotFoundException('Pessoa não encontrada');
        const conflict = await this.prisma.baptismRecord.findUnique({ where: { personId } });
        if (conflict && conflict.id !== id) throw new ConflictException('Esta pessoa já possui uma ficha de batismo');
      }
      data.personId = personId;
    }
    for (const key of BAPTISM_FIELDS) {
      if (body[key] !== undefined) data[key] = body[key] === '' ? null : body[key];
    }
    const updated = await this.prisma.baptismRecord.update({ where: { id }, data });
    if (updated.personId) await this.syncBaptismToPerson(updated.personId, data);
    return updated;
  }

  @Post('baptisms/:id/delete')
  async deleteBaptism(@Param('id') id: string) {
    const record = await this.prisma.baptismRecord.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Ficha de batismo não encontrada');
    await this.prisma.baptismRecord.delete({ where: { id } });
    return { ok: true };
  }

  // ===== ATAS =====
  @Get('minutes')
  minutes() {
    return this.prisma.meetingMinute.findMany({ orderBy: [{ date: 'desc' }, { number: 'desc' }] });
  }

  @Post('minutes')
  async createMinute(@Body() body: any) {
    const number = String(body.number || '').trim();
    const title = String(body.title || '').trim();
    const date = String(body.date || '').trim();
    const minuteBody = String(body.body || '').trim();
    if (!number) throw new BadRequestException('Informe o número da ata');
    if (!title) throw new BadRequestException('Informe o título da ata');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new BadRequestException('Data inválida');
    if (!minuteBody) throw new BadRequestException('Informe o texto da ata');
    return this.prisma.meetingMinute.create({
      data: {
        number,
        title,
        type: String(body.type || 'ASSEMBLEIA').toUpperCase(),
        date,
        timeStart: body.timeStart || null,
        location: body.location || null,
        president: body.president || null,
        secretary: body.secretary || null,
        attendees: body.attendees ? parseInt(body.attendees, 10) : null,
        agenda: body.agenda || null,
        body: minuteBody,
        decisions: body.decisions || null,
        status: String(body.status || 'DRAFT').toUpperCase(),
        createdAt: now(),
        updatedAt: now(),
        createdById: body.createdById || (await this.resolveActorId(body.actorId)) || null,
      },
    });
  }

  @Post('minutes/:id/update')
  async updateMinute(@Param('id') id: string, @Body() body: any) {
    const minute = await this.prisma.meetingMinute.findUnique({ where: { id } });
    if (!minute) throw new NotFoundException('Ata não encontrada');
    const data: any = { updatedAt: now() };
    for (const key of ['number', 'title', 'date', 'timeStart', 'location', 'president', 'secretary', 'agenda', 'body', 'decisions']) {
      if (body[key] !== undefined) data[key] = body[key] === '' ? null : body[key];
    }
    if (body.type !== undefined) data.type = String(body.type).toUpperCase();
    if (body.status !== undefined) data.status = String(body.status).toUpperCase();
    if (body.attendees !== undefined) data.attendees = body.attendees ? parseInt(body.attendees, 10) : null;
    return this.prisma.meetingMinute.update({ where: { id }, data });
  }

  @Post('minutes/:id/delete')
  async deleteMinute(@Param('id') id: string) {
    const minute = await this.prisma.meetingMinute.findUnique({ where: { id } });
    if (!minute) throw new NotFoundException('Ata não encontrada');
    await this.prisma.meetingMinute.delete({ where: { id } });
    return { ok: true };
  }

  private async syncBaptismToPerson(personId: string, data: any) {
    const personData: any = { updatedAt: now() };
    if (data.baptismDate !== undefined) personData.baptismDate = data.baptismDate;
    await this.prisma.person.update({ where: { id: personId }, data: personData });
  }

  // ===== ETIQUETAS DE EVENTOS =====
  @Get('event-tags')
  eventTags() {
    return this.prisma.eventTag.findMany({ where: { isActive: true }, orderBy: [{ order: 'asc' }, { label: 'asc' }] });
  }

  @Post('event-tags')
  async createEventTag(@Body() body: any) {
    const label = String(body.label || '').trim();
    if (!label) throw new BadRequestException('Informe o nome da etiqueta');
    const key = String(body.key || label).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').toUpperCase();
    const existing = await this.prisma.eventTag.findFirst({ where: { OR: [{ key }, { label }] } });
    if (existing) throw new ConflictException('Já existe uma etiqueta com esse nome');
    const maxOrder = await this.prisma.eventTag.aggregate({ _max: { order: true } });
    return this.prisma.eventTag.create({
      data: {
        key,
        label,
        color: body.color || '#2C7FBF',
        icon: body.icon || 'tag',
        order: (maxOrder._max.order || 0) + 1,
        isActive: true,
      },
    });
  }

  @Post('event-tags/:id/update')
  async updateEventTag(@Param('id') id: string, @Body() body: any) {
    const tag = await this.prisma.eventTag.findUnique({ where: { id } });
    if (!tag) throw new NotFoundException('Etiqueta não encontrada');
    const data: any = {};
    if (body.label !== undefined) data.label = String(body.label).trim();
    if (body.color !== undefined) data.color = body.color;
    if (body.icon !== undefined) data.icon = body.icon;
    return this.prisma.eventTag.update({ where: { id }, data });
  }

  @Post('event-tags/:id/delete')
  async deleteEventTag(@Param('id') id: string) {
    const tag = await this.prisma.eventTag.findUnique({ where: { id } });
    if (!tag) throw new NotFoundException('Etiqueta não encontrada');
    await this.prisma.eventTag.update({ where: { id }, data: { isActive: false } });
    return { ok: true };
  }

  // ===== ESPAÇOS RESERVÁVEIS =====
  @Get('spaces')
  spaces() {
    return this.prisma.campusSpace.findMany({ where: { isActive: true }, orderBy: [{ order: 'asc' }, { name: 'asc' }] });
  }

  @Post('spaces')
  async createSpace(@Body() body: any) {
    const name = String(body.name || '').trim();
    if (!name) throw new BadRequestException('Informe o nome do espaço');
    const existing = await this.prisma.campusSpace.findUnique({ where: { name } });
    if (existing) throw new ConflictException('Já existe um espaço com esse nome');
    const maxOrder = await this.prisma.campusSpace.aggregate({ _max: { order: true } });
    return this.prisma.campusSpace.create({
      data: {
        name,
        description: body.description || null,
        capacity: body.capacity ? parseInt(body.capacity, 10) : null,
        color: body.color || '#2C7FBF',
        icon: body.icon || 'door-open',
        order: (maxOrder._max.order || 0) + 1,
        isActive: true,
      },
    });
  }

  @Post('spaces/:id/update')
  async updateSpace(@Param('id') id: string, @Body() body: any) {
    const space = await this.prisma.campusSpace.findUnique({ where: { id } });
    if (!space) throw new NotFoundException('Espaço não encontrado');
    const data: any = {};
    for (const key of ['name', 'description', 'color', 'icon']) {
      if (body[key] !== undefined) data[key] = body[key] === '' ? null : body[key];
    }
    if (body.capacity !== undefined) data.capacity = body.capacity ? parseInt(body.capacity, 10) : null;
    return this.prisma.campusSpace.update({ where: { id }, data });
  }

  @Post('spaces/:id/delete')
  async deleteSpace(@Param('id') id: string) {
    const space = await this.prisma.campusSpace.findUnique({ where: { id } });
    if (!space) throw new NotFoundException('Espaço não encontrado');
    await this.prisma.campusSpace.update({ where: { id }, data: { isActive: false } });
    return { ok: true };
  }

  // ===== AVISOS =====
  @Get('announcements')
  announcements(@Query('limit') limit?: string) {
    return this.prisma.announcement.findMany({
      take: limit ? parseInt(limit, 10) : 20,
      orderBy: { createdAt: 'desc' },
    });
  }

  // ===== CANTINA =====
  @Get('canteen/products')
  products() {
    return this.prisma.canteenProduct.findMany({ orderBy: { order: 'asc' } });
  }

  @Get('canteen/settings')
  canteenSettings() {
    return this.prisma.canteenSettings.findUnique({ where: { id: 'default' } });
  }

  @Get('canteen/orders')
  orders() {
    return this.prisma.order.findMany({
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  // ===== TESOURARIA =====
  @Get('transactions')
  transactions() {
    return this.prisma.transaction.findMany({
      orderBy: { referenceDate: 'desc' },
      take: 50,
    });
  }

  @Post('transactions')
  async createTransaction(@Body() body: any) {
    const count = await this.prisma.transaction.count();
    const txCode = 'TX' + String(Date.now()).slice(-8) + String(count).padStart(2, '0');
    return this.prisma.transaction.create({
      data: {
        txCode,
        type: body.type || 'OUT',
        category: body.category || 'Geral',
        amount: Number(body.amount) || 0,
        description: body.description || '',
        referenceDate: body.referenceDate || now().slice(0, 10),
        paymentMethod: body.paymentMethod || 'Dinheiro',
        personName: body.personName || null,
        registeredById: body.registeredById || 'admin',
        createdAt: now(),
      },
    });
  }

  @Post('transactions/:id/delete')
  async deleteTransaction(@Param('id') id: string) {
    const tx = await this.prisma.transaction.findUnique({ where: { id } });
    if (!tx) throw new NotFoundException('Lançamento não encontrado');
    await this.prisma.transaction.delete({ where: { id } });
    return { ok: true };
  }

  // ===== IGREJA =====
  @Get('church')
  church() {
    return this.prisma.churchSettings.findUnique({ where: { id: 'default' } });
  }

  // ===== CRUD PESSOAS =====
  @Post('people')
  async createPerson(@Body() body: any) {
    const nowIso = now();
    const name = String(body.name || '').trim();
    if (!name) throw new BadRequestException('O nome completo é obrigatório');

    const email = body.email ? String(body.email).trim().toLowerCase() : null;
    const phone = body.phone ? String(body.phone).trim() : null;
    const sectorName = body.sectorName ? String(body.sectorName).trim() : '';
    const requestedPositions = normalizeCargos(body.positions ?? body.position);
    const wantsLogin = !!body.createLogin;
    const roleName = String(body.roleName || 'MEMBRO').toUpperCase() === 'PASTOR' ? 'PASTOR' : 'MEMBRO';
    const byRole = String(body.createdByRole || '').toUpperCase();
    const canGrantAccess = ['PASTOR', 'SUPER_ADMIN'].includes(byRole);

    if (wantsLogin && !canGrantAccess) {
      throw new ForbiddenException('Apenas o pastor ou o admin master pode liberar acesso ao sistema');
    }
    if (wantsLogin && !email) {
      throw new BadRequestException('Informe o e-mail para liberar o acesso ao sistema');
    }
    if (roleName === 'PASTOR' && !canGrantAccess) {
      throw new ForbiddenException('Apenas o admin master ou um pastor pode cadastrar pastores');
    }
    if (wantsLogin && email) {
      const existingUser = await this.prisma.user.findUnique({ where: { email } });
      if (existingUser) throw new ConflictException('Já existe um usuário com este e-mail');
    }
    if (body.cpf) {
      const cpf = String(body.cpf).trim();
      const existingCpf = await this.prisma.person.findUnique({ where: { cpf } });
      if (existingCpf) throw new ConflictException('Já existe uma pessoa com este CPF');
    }

    const sector = sectorName
      ? await this.prisma.sector.findUnique({ where: { name: sectorName } })
      : null;
    if (sectorName && !sector) throw new NotFoundException('Ministério não encontrado');
    if (!sector && requestedPositions.length) {
      throw new BadRequestException('Escolha um ministério antes de informar cargos');
    }
    const positions = sector ? resolveSectorPositions(sector.cargos, requestedPositions) : [];
    const position = positions[0] || null;

    const personData: any = {
      name,
      email,
      phone,
      status: 'ACTIVE',
      memberSince: body.memberSince || nowIso.slice(0, 10),
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    for (const key of PERSON_FORM_FIELDS) {
      if (body[key] !== undefined) personData[key] = body[key] === '' ? null : body[key];
    }
    if (body.wantsContact !== undefined) personData.wantsContact = !!body.wantsContact;
    if (body.acceptsNews !== undefined) personData.acceptsNews = !!body.acceptsNews;
    const person = await this.prisma.person.create({ data: personData });

    if (wantsLogin && email) {
      const hash = bcrypt.hashSync(body.password || 'membro123', 10);
      const user = await this.prisma.user.create({
        data: {
          personId: person.id,
          email,
          passwordHash: hash,
          status: 'ACTIVE',
          webAccess: true,
          createdAt: nowIso,
          updatedAt: nowIso,
        },
      });
      const role =
        (await this.prisma.role.findUnique({ where: { name: roleName } })) ||
        (await this.prisma.role.findUnique({ where: { name: 'MEMBRO' } }));
      if (role) {
        await this.prisma.userRole.create({ data: { userId: user.id, roleId: role.id, grantedAt: nowIso } });
        if (sector) {
          await this.prisma.sectorMember.create({
            data: {
              userId: user.id,
              personId: person.id,
              sectorId: sector.id,
              roleId: role.id,
              position,
              positions: JSON.stringify(positions),
              status: 'ACTIVE',
              joinedAt: nowIso.slice(0, 10),
              addedById: byRole || 'admin',
            },
          });
        }
      }
    } else if (sector) {
      // Membro comum com ministério, mas sem acesso ao sistema.
      const memberRole = await this.prisma.role.findUnique({ where: { name: 'MEMBRO' } });
      if (memberRole) {
        await this.prisma.sectorMember.create({
          data: {
            userId: null,
            personId: person.id,
            sectorId: sector.id,
            roleId: memberRole.id,
            position,
            positions: JSON.stringify(positions),
            status: 'ACTIVE',
            joinedAt: nowIso.slice(0, 10),
            addedById: byRole || 'admin',
          },
        });
      }
    }

    return this.prisma.person.findUnique({
      where: { id: person.id },
      include: {
        sectorMembers: { include: { sector: true, role: true } },
        user: { include: { roles: { include: { role: true } } } },
      },
    });
  }

  @Post('people/:id/access')
  async setPersonAccess(@Param('id') id: string, @Body() body: any) {
    const byRole = String(body.createdByRole || '').toUpperCase();
    if (!['PASTOR', 'SUPER_ADMIN'].includes(byRole)) {
      throw new ForbiddenException('Apenas o pastor ou o admin master pode conceder ou revogar acesso');
    }
    const person = await this.prisma.person.findUnique({ where: { id }, include: { user: true } });
    if (!person) throw new NotFoundException('Pessoa não encontrada');

    const enabled = !!body.enabled;
    const roleName = String(body.roleName || 'MEMBRO').toUpperCase() === 'PASTOR' ? 'PASTOR' : 'MEMBRO';
    if (enabled && roleName === 'PASTOR' && !['PASTOR', 'SUPER_ADMIN'].includes(byRole)) {
      throw new ForbiddenException('Apenas o admin master ou um pastor pode promover a pastor');
    }

    if (person.user) {
      await this.prisma.user.update({
        where: { id: person.user.id },
        data: { webAccess: enabled, status: enabled ? 'ACTIVE' : person.user.status, updatedAt: now() },
      });
      if (enabled) {
        const role = await this.prisma.role.findUnique({ where: { name: roleName } });
        if (role) {
          const existing = await this.prisma.userRole.findFirst({ where: { userId: person.user.id } });
          if (existing) await this.prisma.userRole.update({ where: { id: existing.id }, data: { roleId: role.id } });
          else await this.prisma.userRole.create({ data: { userId: person.user.id, roleId: role.id, grantedAt: now() } });
        }
      }
      return { ok: true, webAccess: enabled, hadUser: true };
    }

    if (!enabled) return { ok: true, webAccess: false, hadUser: false };
    if (!person.email) throw new BadRequestException('Cadastre um e-mail antes de liberar o acesso');
    const existingUser = await this.prisma.user.findUnique({ where: { email: person.email.toLowerCase() } });
    if (existingUser) throw new ConflictException('Já existe um usuário com este e-mail');

    const hash = bcrypt.hashSync(body.password || 'membro123', 10);
    const user = await this.prisma.user.create({
      data: {
        personId: person.id,
        email: person.email.toLowerCase(),
        passwordHash: hash,
        status: 'ACTIVE',
        webAccess: true,
        createdAt: now(),
        updatedAt: now(),
      },
    });
    const role = await this.prisma.role.findUnique({ where: { name: roleName } });
    if (role) await this.prisma.userRole.create({ data: { userId: user.id, roleId: role.id, grantedAt: now() } });
    // Vincula ministérios já cadastrados para esta pessoa ao novo usuário.
    await this.prisma.sectorMember.updateMany({
      where: { personId: person.id, userId: null },
      data: { userId: user.id },
    });
    return { ok: true, webAccess: true, hadUser: false };
  }

  @Post('people/:id/update')
  async updatePerson(@Param('id') id: string, @Body() body: any) {
    const person = await this.prisma.person.findUnique({ where: { id }, include: { user: true } });
    if (!person) throw new NotFoundException('Pessoa não encontrada');
    const byRole = String(body.createdByRole || '').toUpperCase();
    let newEmail: string | null = null;
    if (body.email !== undefined) {
      newEmail = body.email ? String(body.email).trim().toLowerCase() : null;
      if (person.user) {
        if (!newEmail) throw new BadRequestException('Um usuário com acesso precisa manter um e-mail');
        const conflict = await this.prisma.user.findUnique({ where: { email: newEmail } });
        if (conflict && conflict.id !== person.user.id) {
          throw new ConflictException('Já existe outro usuário com este e-mail');
        }
      }
    }
    if (body.cpf !== undefined && body.cpf) {
      const cpf = String(body.cpf).trim();
      const conflictCpf = await this.prisma.person.findUnique({ where: { cpf } });
      if (conflictCpf && conflictCpf.id !== id) throw new ConflictException('Já existe uma pessoa com este CPF');
    }
    const data: any = { updatedAt: now() };
    if (body.name !== undefined) data.name = body.name;
    if (body.email !== undefined) data.email = newEmail;
    if (body.phone !== undefined) data.phone = body.phone || null;
    if (body.status !== undefined) data.status = body.status;
    if (body.memberSince !== undefined) data.memberSince = body.memberSince;
    for (const key of PERSON_FORM_FIELDS) {
      if (body[key] !== undefined) data[key] = body[key] === '' ? null : body[key];
    }
    if (body.wantsContact !== undefined) data.wantsContact = !!body.wantsContact;
    if (body.acceptsNews !== undefined) data.acceptsNews = !!body.acceptsNews;
    const updated = await this.prisma.person.update({ where: { id }, data });
    if (person.user && newEmail && newEmail !== person.user.email) {
      await this.prisma.user.update({ where: { id: person.user.id }, data: { email: newEmail, updatedAt: now() } });
    }
    // Troca de cargo eclesiástico (ex.: promover a pastor)
    if (body.roleName && person.user) {
      const targetRole = String(body.roleName).toUpperCase();
      if (targetRole === 'SUPER_ADMIN' && byRole !== 'SUPER_ADMIN') {
        throw new ForbiddenException('Apenas o admin master pode conceder o papel de admin master');
      }
      if (!['MEMBRO', 'PASTOR', 'SUPER_ADMIN'].includes(targetRole)) {
        throw new BadRequestException('Papel inválido. Use membro ou pastor.');
      }
      if (['PASTOR', 'SUPER_ADMIN'].includes(targetRole) && !['PASTOR', 'SUPER_ADMIN'].includes(byRole)) {
        throw new ForbiddenException('Apenas o admin master ou um pastor pode promover a pastor');
      }
      const role = await this.prisma.role.findUnique({ where: { name: targetRole } });
      if (role) {
        const existing = await this.prisma.userRole.findFirst({ where: { userId: person.user.id } });
        if (existing) await this.prisma.userRole.update({ where: { id: existing.id }, data: { roleId: role.id } });
        else await this.prisma.userRole.create({ data: { userId: person.user.id, roleId: role.id, grantedAt: now() } });
        const sm = await this.prisma.sectorMember.findFirst({ where: { userId: person.user.id } });
        if (sm) await this.prisma.sectorMember.update({ where: { id: sm.id }, data: { roleId: role.id } });
      }
    }
    if (body.sectorName !== undefined) {
      const sectorName = body.sectorName ? String(body.sectorName) : '';
      const existing = await this.prisma.sectorMember.findFirst({ where: { personId: person.id } });
      if (!sectorName) {
        if (existing) await this.prisma.sectorMember.delete({ where: { id: existing.id } });
      } else {
        const sector = await this.prisma.sector.findUnique({ where: { name: sectorName } });
        if (!sector) throw new NotFoundException('Ministério não encontrado');
        const requested = normalizeCargos(body.positions ?? body.position ?? existing?.positions);
        const positions = resolveSectorPositions(sector.cargos, requested);
        const ur = person.user
          ? await this.prisma.userRole.findFirst({ where: { userId: person.user.id } })
          : null;
        const roleId = ur?.roleId || (await this.prisma.role.findUnique({ where: { name: 'MEMBRO' } }))?.id;
        if (roleId) {
          if (existing) {
            await this.prisma.sectorMember.update({
              where: { id: existing.id },
              data: {
                sectorId: sector.id,
                roleId,
                position: positions[0] || null,
                positions: JSON.stringify(positions),
                userId: person.user?.id || null,
              },
            });
          } else {
            await this.prisma.sectorMember.create({
              data: {
                userId: person.user?.id || null,
                personId: person.id,
                sectorId: sector.id,
                roleId,
                position: positions[0] || null,
                positions: JSON.stringify(positions),
                status: 'ACTIVE',
                joinedAt: now().slice(0, 10),
                addedById: byRole || 'admin',
              },
            });
          }
        }
      }
    } else if (body.positions !== undefined || body.position !== undefined) {
      const sm = await this.prisma.sectorMember.findFirst({ where: { personId: person.id }, include: { sector: true } });
      if (sm) {
        const requested = normalizeCargos(body.positions ?? body.position);
        const positions = resolveSectorPositions(sm.sector.cargos, requested);
        await this.prisma.sectorMember.update({
          where: { id: sm.id },
          data: { position: positions[0] || null, positions: JSON.stringify(positions) },
        });
      }
    }
    return this.prisma.person.findUnique({
      where: { id },
      include: {
        sectorMembers: { include: { sector: true, role: true } },
        user: { include: { roles: { include: { role: true } } } },
      },
    });
  }

  @Post('people/:id/delete')
  async deletePerson(@Param('id') id: string) {
    const person = await this.prisma.person.findUnique({ where: { id }, include: { user: true } });
    if (!person) throw new NotFoundException('Pessoa não encontrada');
    if (person.user) {
      await this.prisma.auditLog.deleteMany({ where: { userId: person.user.id } });
      await this.prisma.sectorLeader.deleteMany({ where: { userId: person.user.id } });
      await this.prisma.sector.updateMany({ where: { leaderUserId: person.user.id }, data: { leaderName: null } });
      await this.prisma.userRole.deleteMany({ where: { userId: person.user.id } });
      await this.prisma.sectorMember.deleteMany({ where: { userId: person.user.id } });
      await this.prisma.scheduleMember.deleteMany({ where: { userId: person.user.id } });
      await this.prisma.user.delete({ where: { id: person.user.id } });
    }
    await this.prisma.sectorMember.deleteMany({ where: { personId: id } });
    await this.prisma.person.delete({ where: { id } });
    return { ok: true };
  }

  // ===== CRUD SETORES =====
  @Post('sectors')
  async createSector(@Body() body: any) {
    const existing = await this.prisma.sector.findUnique({ where: { name: body.name } });
    if (existing) throw new ConflictException('Já existe um ministério com esse nome');
    const maxOrder = await this.prisma.sector.aggregate({ _max: { order: true } });
    const leaderIds = this.normalizeLeaderIds(body) || [];
    const leaderUsers = await this.fetchLeaderUsers(leaderIds);
    const leaderNames = leaderUsers.map((u) => this.leaderDisplayName(u));
    const leaderName = leaderNames.join(' & ') || body.leaderName || null;
    const leaderUserId = leaderUsers[0]?.id || null;
    const created = await this.prisma.sector.create({
      data: {
        name: body.name,
        label: body.label || body.name,
        icon: body.icon || 'building-2',
        color: body.color || '#103B5F',
        description: body.description || null,
        mission: body.mission || null,
        vision: body.vision || null,
        foundedAt: body.foundedAt || null,
        notes: body.notes || null,
        whatsappLink: body.whatsappLink || null,
        contactEmail: body.contactEmail || null,
        cargos: JSON.stringify(normalizeCargos(body.cargos)),
        order: (maxOrder._max.order || 0) + 1,
        leaderName,
        leaderUserId,
        templateKey: body.templateKey || 'base',
        groupTag: body.groupTag || 'operacoes',
        isLive: body.isLive || false,
        isActive: body.isActive !== false,
      },
    });
    await this.replaceSectorLeaders(created.id, leaderUsers);
    const leadersAddedAsMembers = await this.ensureLeadersAsMembers(created.id, leaderUsers, body.actorId);
    await this.writeMinistryAudit(body.actorId, 'MINISTRY_CREATED', created.id, {
      label: created.label,
      name: created.name,
      leaders: leaderNames,
      leader: leaderName,
      leadersAddedAsMembers,
      cargos: normalizeCargos(created.cargos),
    });
    return created;
  }

  @Post('sectors/:id/update')
  async updateSector(@Param('id') id: string, @Body() body: any) {
    const sector = await this.prisma.sector.findUnique({ where: { id } });
    if (!sector) throw new NotFoundException('Setor não encontrado');
    const data: any = {};
    const changed: string[] = [];
    for (const k of ['label', 'description', 'mission', 'vision', 'foundedAt', 'color', 'icon', 'notes', 'whatsappLink', 'contactEmail']) {
      if (body[k] === undefined) continue;
      let next = body[k] === '' ? null : body[k];
      let current = (sector as any)[k];
      if (k === 'color') {
        if (typeof next === 'string' && next) next = next.toLowerCase();
        if (typeof current === 'string' && current) current = current.toLowerCase();
      }
      if (current !== next) { data[k] = next; changed.push(k); }
    }
    if (body.isActive !== undefined && !!body.isActive !== sector.isActive) {
      data.isActive = !!body.isActive;
      changed.push('isActive');
    }
    if (body.cargos !== undefined) {
      const cargos = normalizeCargos(body.cargos);
      if (JSON.stringify(cargos) !== JSON.stringify(normalizeCargos(sector.cargos))) {
        data.cargos = JSON.stringify(cargos);
        changed.push('cargos');
      }
    }
    let leaderFrom: string[] = sector.leaderName ? [sector.leaderName] : [];
    let leaderTo: string[] = sector.leaderName ? [sector.leaderName] : [];
    let leaderChanged = false;
    let pendingLeaderUsers: any[] = [];
    const requestedLeaderIds = this.normalizeLeaderIds(body);
    if (requestedLeaderIds !== null) {
      const currentLinks = await this.prisma.sectorLeader.findMany({
        where: { sectorId: id },
        include: { user: { include: { person: true } } },
        orderBy: { createdAt: 'asc' },
      });
      const currentIds = currentLinks.length
        ? currentLinks.map(l => l.userId)
        : (sector.leaderUserId ? [sector.leaderUserId] : []);
      if (JSON.stringify(currentIds) !== JSON.stringify(requestedLeaderIds)) {
        const users = await this.fetchLeaderUsers(requestedLeaderIds);
        leaderChanged = true;
        pendingLeaderUsers = users;
        leaderFrom = currentLinks.length
          ? currentLinks.map(l => this.leaderDisplayName(l.user))
          : (sector.leaderName ? [sector.leaderName] : []);
        leaderTo = users.map(u => this.leaderDisplayName(u));
        data.leaderUserId = users[0]?.id || null;
        data.leaderName = leaderTo.length ? leaderTo.join(' & ') : null;
      }
    }
    const updated = Object.keys(data).length
      ? await this.prisma.sector.update({ where: { id }, data })
      : sector;

    let leadersAddedAsMembers = 0;
    if (leaderChanged) {
      await this.replaceSectorLeaders(id, pendingLeaderUsers);
      leadersAddedAsMembers = await this.ensureLeadersAsMembers(id, pendingLeaderUsers, body.actorId);
    }

    let prunedPositions = 0;
    if (changed.includes('cargos')) {
      const allowed = normalizeCargos(updated.cargos);
      const members = await this.prisma.sectorMember.findMany({ where: { sectorId: id } });
      for (const m of members) {
        const current = normalizeCargos(m.positions || m.position);
        const kept = current.filter(p => allowed.includes(p));
        if (JSON.stringify(kept) !== JSON.stringify(current)) {
          await this.prisma.sectorMember.update({
            where: { id: m.id },
            data: { positions: JSON.stringify(kept), position: kept[0] || null },
          });
          prunedPositions += 1;
        }
      }
    }

    if (changed.length || leaderChanged) {
      const action = leaderChanged ? 'LEADER_CHANGED'
        : changed.length === 1 && changed[0] === 'cargos' ? 'CARGOS_UPDATED'
          : changed.length === 1 && changed[0] === 'isActive' ? 'ACTIVE_CHANGED'
            : 'MINISTRY_UPDATED';
      const detail: any = { changes: changed };
      if (leaderChanged) {
        detail.leaderFrom = leaderFrom;
        detail.leaderTo = leaderTo;
        detail.leadersAddedAsMembers = leadersAddedAsMembers;
      }
      if (changed.includes('cargos')) { detail.cargos = normalizeCargos(updated.cargos); detail.prunedPositions = prunedPositions; }
      if (changed.includes('isActive')) detail.active = !!updated.isActive;
      await this.writeMinistryAudit(body.actorId, action, id, detail);
    }
    return updated;
  }

  @Post('sectors/:id/delete')
  async deleteSector(@Param('id') id: string, @Body() body: any) {
    const sector = await this.prisma.sector.findUnique({ where: { id } });
    if (!sector) throw new NotFoundException('Setor não encontrado');
    await this.writeMinistryAudit(body?.actorId, 'MINISTRY_DELETED', id, { label: sector.label, name: sector.name });
    // Hard delete com limpeza de dependentes (o usuário pode recriar/ministério fixo)
    await prismaDepCleanup(this.prisma, id);
    return this.prisma.sector.delete({ where: { id } });
  }

  // ===== MEMBROS DO MINISTÉRIO =====
  @Post('sectors/:id/members')
  async addSectorMember(@Param('id') id: string, @Body() body: any) {
    const sector = await this.prisma.sector.findUnique({ where: { id } });
    if (!sector) throw new NotFoundException('Setor não encontrado');
    if (!body.personId) throw new BadRequestException('Informe a pessoa que será vinculada');
    const person = await this.prisma.person.findUnique({ where: { id: body.personId }, include: { user: true } });
    if (!person) throw new NotFoundException('Pessoa não encontrada');
    const role = await this.prisma.role.findUnique({ where: { name: 'MEMBRO' } });
    if (!role) throw new NotFoundException('Papel MEMBRO não encontrado');
    const userId = person.user?.id || null;
    const hasRequestedPositions = body.positions !== undefined || body.position !== undefined;
    const requestedPositions = hasRequestedPositions ? normalizeCargos(body.positions ?? body.position) : [];
    const positions = hasRequestedPositions ? resolveSectorPositions(sector.cargos, requestedPositions) : null;
    const existing = await this.prisma.sectorMember.findFirst({
      where: {
        sectorId: id,
        OR: [
          { personId: person.id },
          ...(userId ? [{ userId }] : []),
        ],
      },
      include: { person: true, user: { include: { person: true } }, role: true },
    });
    if (existing) {
      const updated = await this.prisma.sectorMember.update({
        where: { id: existing.id },
        data: {
          status: 'ACTIVE',
          position: positions ? (positions[0] || null) : existing.position,
          positions: positions ? JSON.stringify(positions) : existing.positions,
          personId: person.id,
          userId: userId || existing.userId || null,
        },
        include: { person: true, user: { include: { person: true } }, role: true },
      });
      await this.writeMinistryAudit(body.actorId, 'MEMBER_ADDED', id, {
        personId: person.id,
        personName: person.name,
        positions: normalizeCargos(updated.positions || updated.position),
        reactivated: true,
      });
      return updated;
    }
    const created = await this.prisma.sectorMember.create({
      data: {
        sectorId: id,
        personId: person.id,
        userId,
        roleId: role.id,
        position: positions ? (positions[0] || null) : null,
        positions: JSON.stringify(positions || []),
        status: 'ACTIVE',
        joinedAt: now().slice(0, 10),
        addedById: body.actorId || 'system',
      },
      include: { person: true, user: { include: { person: true } }, role: true },
    });
    await this.writeMinistryAudit(body.actorId, 'MEMBER_ADDED', id, {
      personId: person.id,
      personName: person.name,
      positions: positions || [],
    });
    return created;
  }

  @Post('sectors/:id/members/:memberId/update')
  async updateSectorMember(@Param('id') id: string, @Param('memberId') memberId: string, @Body() body: any) {
    const member = await this.prisma.sectorMember.findUnique({
      where: { id: memberId },
      include: { person: true, user: { include: { person: true } }, sector: true },
    });
    if (!member || member.sectorId !== id) throw new NotFoundException('Vínculo com o ministério não encontrado');
    const data: any = {};
    const changes: string[] = [];
    if (body.positions !== undefined || body.position !== undefined) {
      const requested = normalizeCargos(body.positions ?? body.position);
      const positions = resolveSectorPositions(member.sector.cargos, requested);
      const current = normalizeCargos(member.positions || member.position);
      if (JSON.stringify(positions) !== JSON.stringify(current)) {
        data.positions = JSON.stringify(positions);
        data.position = positions[0] || null;
        changes.push('positions');
      }
    }
    if (body.status !== undefined && body.status !== member.status) {
      data.status = body.status;
      changes.push('status');
    }
    if (body.roleName) {
      const role = await this.prisma.role.findUnique({ where: { name: String(body.roleName).toUpperCase() } });
      if (!role) throw new NotFoundException('Papel não encontrado');
      if (role.id !== member.roleId) { data.roleId = role.id; changes.push('role'); }
    }
    if (!Object.keys(data).length) return member;
    const updated = await this.prisma.sectorMember.update({
      where: { id: memberId },
      data,
      include: { person: true, user: { include: { person: true } }, role: true },
    });
    await this.writeMinistryAudit(body.actorId, 'MEMBER_UPDATED', id, {
      personId: member.personId,
      personName: member.person?.name || member.user?.person?.name || 'Membro',
      changes,
      positions: normalizeCargos(updated.positions || updated.position),
      status: updated.status,
    });
    return updated;
  }

  @Post('sectors/:id/members/:memberId/remove')
  async removeSectorMember(@Param('id') id: string, @Param('memberId') memberId: string, @Body() body: any) {
    const member = await this.prisma.sectorMember.findUnique({
      where: { id: memberId },
      include: { person: true, user: { include: { person: true } } },
    });
    if (!member || member.sectorId !== id) throw new NotFoundException('Vínculo com o ministério não encontrado');
    await this.prisma.sectorMember.delete({ where: { id: memberId } });
    await this.writeMinistryAudit(body?.actorId, 'MEMBER_REMOVED', id, {
      personId: member.personId,
      personName: member.person?.name || member.user?.person?.name || 'Membro',
      positions: normalizeCargos(member.positions || member.position),
    });
    return { ok: true };
  }

  // ===== AUDITORIA DO MINISTÉRIO =====
  @Get('sectors/:id/audit')
  async sectorAudit(@Param('id') id: string) {
    const sector = await this.prisma.sector.findUnique({ where: { id }, select: { id: true } });
    if (!sector) throw new NotFoundException('Setor não encontrado');
    return this.prisma.auditLog.findMany({
      where: { module: 'ministries', recordId: id },
      include: { user: { include: { person: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' },
      take: 60,
    });
  }

  @Post('sectors/:id/indications')
  async addIndication(@Param('id') id: string, @Body() body: any) {
    const sector = await this.prisma.sector.findUnique({ where: { id }, select: { id: true, label: true } });
    if (!sector) throw new NotFoundException('Setor não encontrado');
    let personId = body.personId || null;
    let name = String(body.name || '').trim();
    if (personId) {
      const person = await this.prisma.person.findUnique({ where: { id: personId }, select: { id: true, name: true } });
      if (!person) throw new NotFoundException('Pessoa não encontrada');
      if (!name) name = person.name;
    }
    if (!name) throw new BadRequestException('Informe o nome indicado');
    const created = await this.prisma.sectorIndication.create({
      data: {
        sectorId: id,
        personId,
        name,
        role: body.role || null,
        year: body.year || null,
        status: String(body.status || 'INDICADO').toUpperCase(),
        notes: body.notes || null,
        createdAt: now(),
        updatedAt: now(),
      },
      include: { person: { select: { id: true, name: true, email: true, phone: true } } },
    });
    await this.writeMinistryAudit(body.actorId, 'INDICATION_ADDED', id, { name: created.name, role: created.role });
    return created;
  }

  @Post('sectors/:id/indications/:indicationId/update')
  async updateIndication(@Param('id') id: string, @Param('indicationId') indicationId: string, @Body() body: any) {
    const indication = await this.prisma.sectorIndication.findUnique({ where: { id: indicationId } });
    if (!indication || indication.sectorId !== id) throw new NotFoundException('Indicação não encontrada');
    const data: any = { updatedAt: now() };
    for (const key of ['name', 'role', 'year', 'status', 'notes']) {
      if (body[key] !== undefined) data[key] = body[key] === '' ? null : body[key];
    }
    if (body.status !== undefined) data.status = String(body.status).toUpperCase();
    if (body.personId !== undefined) data.personId = body.personId || null;
    const updated = await this.prisma.sectorIndication.update({ where: { id: indicationId }, data });
    await this.writeMinistryAudit(body.actorId, 'INDICATION_UPDATED', id, { name: updated.name, status: updated.status });
    return updated;
  }

  @Post('sectors/:id/indications/:indicationId/remove')
  async removeIndication(@Param('id') id: string, @Param('indicationId') indicationId: string, @Body() body: any) {
    const indication = await this.prisma.sectorIndication.findUnique({ where: { id: indicationId } });
    if (!indication || indication.sectorId !== id) throw new NotFoundException('Indicação não encontrada');
    await this.prisma.sectorIndication.delete({ where: { id: indicationId } });
    await this.writeMinistryAudit(body?.actorId, 'INDICATION_REMOVED', id, { name: indication.name });
    return { ok: true };
  }

  @Post('schedules/:id/add-member')
  async addScheduleMember(@Param('id') id: string, @Body() body: any) {
    const schedule = await this.prisma.schedule.findUnique({ where: { id } });
    if (!schedule) throw new NotFoundException('Escala não encontrada');
    const where: any = { scheduleId: id };
    if (body.personId) where.personId = body.personId;
    else if (body.userId) where.userId = body.userId;
    else throw new NotFoundException('Informe userId ou personId');
    const existing = await this.prisma.scheduleMember.findFirst({ where });
    if (existing) return existing;
    const sm = await this.prisma.scheduleMember.create({
      data: {
        scheduleId: id,
        userId: body.userId || null,
        personId: body.personId || null,
        roleInSchedule: body.roleInSchedule || 'Voluntário',
        status: 'PENDING',
        createdAt: now(),
      },
    });
    const counts = await this.prisma.scheduleMember.groupBy({ by: ['status'], where: { scheduleId: id }, _count: true });
    let confirmed = 0; let pending = 0;
    for (const c of counts) { if (c.status === 'CONFIRMED') confirmed += c._count; else pending += c._count; }
    await this.prisma.schedule.update({ where: { id }, data: { confirmedCount: confirmed, pendingCount: pending, totalPositions: confirmed + pending } });
    return sm;
  }

  @Post('schedules/:id/remove-member')
  async removeScheduleMember(@Param('id') id: string, @Body() body: any) {
    const where: any = { scheduleId: id };
    if (body.personId) where.personId = body.personId;
    else if (body.userId) where.userId = body.userId;
    else throw new NotFoundException('Informe userId ou personId');
    const sm = await this.prisma.scheduleMember.findFirst({ where });
    if (!sm) throw new NotFoundException('Voluntário não encontrado nesta escala');
    await this.prisma.scheduleMember.delete({ where: { id: sm.id } });
    const counts = await this.prisma.scheduleMember.groupBy({ by: ['status'], where: { scheduleId: id }, _count: true });
    let confirmed = 0; let pending = 0;
    for (const c of counts) { if (c.status === 'CONFIRMED') confirmed += c._count; else pending += c._count; }
    await this.prisma.schedule.update({ where: { id }, data: { confirmedCount: confirmed, pendingCount: pending, totalPositions: confirmed + pending } });
    return { ok: true };
  }

  // ===== STATS (dashboard) =====
  @Get('stats')
  async stats() {
    const [members, visitors, schedules, confirmed, pending, announcements, revenue, orders] =
      await Promise.all([
        this.prisma.person.count({ where: { status: 'ACTIVE' } }),
        this.prisma.visitor.count(),
        this.prisma.schedule.count(),
        this.prisma.scheduleMember.count({ where: { status: 'CONFIRMED' } }),
        this.prisma.scheduleMember.count({ where: { status: 'PENDING' } }),
        this.prisma.announcement.count(),
        this.prisma.order.aggregate({ _sum: { total: true } }),
        this.prisma.order.count(),
      ]);
    return {
      members,
      visitors,
      schedules,
      confirmRate: confirmed + pending > 0 ? Math.round((confirmed / (confirmed + pending)) * 100) : 0,
      announcements,
      canteenRevenue: revenue._sum.total || 0,
      canteenOrders: orders,
    };
  }
}
