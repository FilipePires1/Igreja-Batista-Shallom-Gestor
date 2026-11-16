import {
  Body,
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

// Limpa dependentes de um setor antes do hard delete (FK RESTRICT)
async function prismaDepCleanup(prisma: PrismaService, sectorId: string) {
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

  @Get('health')
  health() {
    return { ok: true, app: 'ibscn-api', time: now() };
  }

  // ===== AUTH =====
  @Post('auth/login')
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: (body.email || '').toLowerCase().trim() },
      include: { person: true, roles: { include: { role: true } } },
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    const ok = await bcrypt.compare(body.password || '', user.passwordHash);
    if (!ok) throw new ForbiddenException('Senha incorreta');
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
        user: { include: { roles: { include: { role: true } } } },
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
        user: true,
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

  // ===== SETORES =====
  @Get('sectors')
  sectors() {
    return this.prisma.sector.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { members: true, schedules: true } },
        leader: { include: { person: true } },
        members: { include: { user: { include: { person: true } } }, where: { status: 'ACTIVE' } },
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
      orderBy: { date: 'asc' },
    });
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
    // Só admin master ou pastor pode criar quem tem cargo de pastor/super admin
    const targetRole = (body.roleName || 'MEMBRO').toUpperCase();
    if (['PASTOR', 'SUPER_ADMIN'].includes(targetRole)) {
      const by = (body.createdByRole || '').toUpperCase();
      if (!['PASTOR', 'SUPER_ADMIN'].includes(by)) {
        throw new ForbiddenException('Apenas o admin master ou um pastor pode cadastrar pastores');
      }
    }
    const person = await this.prisma.person.create({
      data: {
        name: body.name,
        email: body.email || null,
        phone: body.phone || '',
        status: body.status || 'ACTIVE',
        memberSince: body.memberSince || nowIso.slice(0, 10),
        baptismDate: body.baptismDate || null,
        pastoralNotes: body.pastoralNotes || null,
        createdAt: nowIso,
        updatedAt: nowIso,
      },
    });
    if (body.email && body.createLogin) {
      const hash = bcrypt.hashSync(body.password || 'membro123', 10);
      const user = await this.prisma.user.create({
        data: { personId: person.id, email: body.email, passwordHash: hash, status: 'PENDING', createdAt: nowIso, updatedAt: nowIso },
      });
      const role = await this.prisma.role.findUnique({ where: { name: body.roleName || 'MEMBRO' } });
      if (role) await this.prisma.userRole.create({ data: { userId: user.id, roleId: role.id, grantedAt: nowIso } });
      if (body.sectorName) {
        const sector = await this.prisma.sector.findUnique({ where: { name: body.sectorName } });
        if (sector && role) await this.prisma.sectorMember.create({ data: { userId: user.id, personId: person.id, sectorId: sector.id, roleId: role.id, status: 'ACTIVE', joinedAt: nowIso.slice(0, 10), addedById: 'admin' } });
      }
    }
    return person;
  }

  @Post('people/:id/update')
  async updatePerson(@Param('id') id: string, @Body() body: any) {
    const person = await this.prisma.person.findUnique({ where: { id }, include: { user: true } });
    if (!person) throw new NotFoundException('Pessoa não encontrada');
    const data: any = { updatedAt: now() };
    if (body.name !== undefined) data.name = body.name;
    if (body.email !== undefined) data.email = body.email || null;
    if (body.phone !== undefined) data.phone = body.phone;
    if (body.status !== undefined) data.status = body.status;
    if (body.baptismDate !== undefined) data.baptismDate = body.baptismDate || null;
    if (body.pastoralNotes !== undefined) data.pastoralNotes = body.pastoralNotes;
    if (body.memberSince !== undefined) data.memberSince = body.memberSince;
    const updated = await this.prisma.person.update({ where: { id }, data });
    // Troca de cargo eclesiástico (ex.: promover a pastor)
    if (body.roleName && person.user) {
      const targetRole = String(body.roleName).toUpperCase();
      const by = (body.createdByRole || '').toUpperCase();
      if (['PASTOR', 'SUPER_ADMIN'].includes(targetRole) && !['PASTOR', 'SUPER_ADMIN'].includes(by)) {
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
    if (body.sectorName && person.user) {
      const sector = await this.prisma.sector.findUnique({ where: { name: body.sectorName } });
      const ur = await this.prisma.userRole.findFirst({ where: { userId: person.user.id } });
      if (sector && ur) {
        const existing = await this.prisma.sectorMember.findFirst({ where: { userId: person.user.id } });
        if (existing) await this.prisma.sectorMember.update({ where: { id: existing.id }, data: { sectorId: sector.id } });
        else await this.prisma.sectorMember.create({ data: { userId: person.user.id, personId: person.id, sectorId: sector.id, roleId: ur.roleId, status: 'ACTIVE', joinedAt: now().slice(0, 10), addedById: 'admin' } });
      }
    }
    return updated;
  }

  @Post('people/:id/delete')
  async deletePerson(@Param('id') id: string) {
    const person = await this.prisma.person.findUnique({ where: { id }, include: { user: true } });
    if (!person) throw new NotFoundException('Pessoa não encontrada');
    if (person.user) {
      await this.prisma.userRole.deleteMany({ where: { userId: person.user.id } });
      await this.prisma.sectorMember.deleteMany({ where: { userId: person.user.id } });
      await this.prisma.scheduleMember.deleteMany({ where: { userId: person.user.id } });
      await this.prisma.user.delete({ where: { id: person.user.id } });
    }
    await this.prisma.person.delete({ where: { id } });
    return { ok: true };
  }

  // ===== CRUD SETORES =====
  @Post('sectors')
  async createSector(@Body() body: any) {
    const maxOrder = await this.prisma.sector.aggregate({ _max: { order: true } });
    let leaderName = body.leaderName || null;
    if (body.leaderUserId) {
      const lu = await this.prisma.user.findUnique({ where: { id: body.leaderUserId }, include: { person: true } });
      if (lu?.person?.name) leaderName = lu.person.name;
    }
    return this.prisma.sector.create({
      data: {
        name: body.name,
        label: body.label || body.name,
        icon: body.icon || 'building-2',
        color: body.color || '#103B5F',
        description: body.description || null,
        order: (maxOrder._max.order || 0) + 1,
        leaderName,
        leaderUserId: body.leaderUserId || null,
        templateKey: body.templateKey || 'base',
        capacity: body.capacity || 0,
        scheduleText: body.scheduleText || null,
        highlightText: body.highlightText || null,
        readiness: body.readiness ?? 100,
        groupTag: body.groupTag || 'operacoes',
        isLive: body.isLive || false,
      },
    });
  }

  @Post('sectors/:id/update')
  async updateSector(@Param('id') id: string, @Body() body: any) {
    const sector = await this.prisma.sector.findUnique({ where: { id } });
    if (!sector) throw new NotFoundException('Setor não encontrado');
    const data: any = {};
    for (const k of ['label', 'icon', 'color', 'description', 'leaderName', 'leaderUserId', 'templateKey', 'capacity', 'scheduleText', 'highlightText', 'readiness', 'groupTag', 'isLive', 'isActive']) {
      if (body[k] !== undefined) data[k] = body[k];
    }
    if (body.leaderUserId !== undefined && body.leaderUserId) {
      const lu = await this.prisma.user.findUnique({ where: { id: body.leaderUserId }, include: { person: true } });
      if (lu?.person?.name) data.leaderName = lu.person.name;
    }
    return this.prisma.sector.update({ where: { id }, data });
  }

  @Post('sectors/:id/delete')
  async deleteSector(@Param('id') id: string) {
    const sector = await this.prisma.sector.findUnique({ where: { id } });
    if (!sector) throw new NotFoundException('Setor não encontrado');
    // Hard delete com limpeza de dependentes (o usuário pode recriar/ministério fixo)
    await prismaDepCleanup(this.prisma, id);
    return this.prisma.sector.delete({ where: { id } });
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
