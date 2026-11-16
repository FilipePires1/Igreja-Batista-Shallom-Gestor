import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../constants/theme';
import { CommonStyles } from '../../constants/commonStyles';
import { Bell, User, Calendar, Clock, Music, Filter, Search, Info, Users, Map } from '../../components/Icons';
import { apiGet, ApiSchedule } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

function fmtDate(iso: string) {
  const d = new Date(iso + 'T12:00:00');
  return `${DIAS[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]}`;
}

function initials(name: string) {
  const parts = name.replace(/^(Pr\.|Pe\.|Líder)\s*/i, '').trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
}

function memberStatus(s: ApiSchedule, userName?: string) {
  const me = userName ? s.members.find((m) => m.person?.name === userName) : undefined;
  return me?.status || 'NONE';
}

export default function MinhasEscalas() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'proximas' | 'passadas' | 'historico'>('proximas');
  const [schedules, setSchedules] = useState<ApiSchedule[]>([]);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    apiGet<ApiSchedule[]>(`/schedules?dateFrom=${activeTab === 'passadas' ? '2000-01-01' : today}`).then((data) => {
      if (data) setSchedules(activeTab === 'passadas' ? [] : data);
    });
  }, [activeTab]);

  return (
    <View style={CommonStyles.root}>
      <View style={[CommonStyles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <View style={CommonStyles.headerLeft}>
          <View style={CommonStyles.headerLogo}><Text style={CommonStyles.headerLogoText}>A</Text></View>
          <View>
            <Text style={CommonStyles.headerSmall}>Igreja Shallom</Text>
            <Text style={CommonStyles.headerTitle}>Home Do Membro</Text>
          </View>
        </View>
        <View style={CommonStyles.headerRight}>
          <TouchableOpacity style={CommonStyles.headerIcon}>
            <Bell size={22} color={Colors.onSurface} />
            <View style={CommonStyles.notifBadge}><Text style={CommonStyles.notifText}>3</Text></View>
          </TouchableOpacity>
          <TouchableOpacity style={CommonStyles.avatarBtn}><User size={18} color={Colors.white} /></TouchableOpacity>
        </View>
      </View>

      <ScrollView style={CommonStyles.container} showsVerticalScrollIndicator={false} contentContainerStyle={CommonStyles.scrollContent}>
        <View style={{ paddingHorizontal: Spacing.lg, marginTop: Spacing.lg }}>
          <View style={styles.purpleLabel}>
            <Text style={styles.purpleLabelText}>VOLUNTARIADO & MINISTERIO</Text>
          </View>
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.title}>Minhas Escalas</Text>
          <View style={styles.titleActions}>
            <TouchableOpacity style={CommonStyles.iconCircleSmall}>
              <Search size={18} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={CommonStyles.iconCircleSmall}>
              <Filter size={18} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.filterTabs}>
          <TouchableOpacity
            style={[styles.filterTab, activeTab === 'proximas' && styles.filterTabActive]}
            onPress={() => setActiveTab('proximas')}
          >
            <Text style={[styles.filterTabText, activeTab === 'proximas' && styles.filterTabTextActive]}>
              Proximas 3
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, activeTab === 'passadas' && styles.filterTabActive]}
            onPress={() => setActiveTab('passadas')}
          >
            <Text style={[styles.filterTabText, activeTab === 'passadas' && styles.filterTabTextActive]}>
              Passadas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, activeTab === 'historico' && styles.filterTabActive]}
            onPress={() => setActiveTab('historico')}
          >
            <Text style={[styles.filterTabText, activeTab === 'historico' && styles.filterTabTextActive]}>
              Historico
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.bannerCard, Shadows.md]}>
          <View style={styles.bannerIconContainer}>
            <Calendar size={28} color={Colors.white} />
          </View>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>Ciclo de Novembro Aberto</Text>
            <Text style={styles.bannerDescription}>
              Mantenha sua disponibilidade atualizada para participar das escalas do mes.
            </Text>
            <TouchableOpacity style={styles.bannerLink}>
              <Text style={styles.bannerLinkText}>Atualizar Minha Disponibilidade →</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={CommonStyles.sectionHeader}>
          <Text style={CommonStyles.sectionTitle}>Escalas Programadas</Text>
          <Text style={styles.sectionRight}>Outubro / Nov</Text>
        </View>

        {schedules.length === 0 && (
          <View style={[styles.scheduleCard, Shadows.sm]}>
            <Text style={styles.eventName}>Nenhuma escala encontrada</Text>
            <Text style={styles.detailText}>Verifique sua conexão ou aguarde novas escalas.</Text>
          </View>
        )}

        {schedules.map((s) => {
          const st = memberStatus(s, user?.name);
          const isConfirmed = st === 'CONFIRMED';
          const isPending = st === 'PENDING';
          const teamSize = s.members.length;
          return (
            <View key={s.id} style={[styles.scheduleCard, Shadows.sm]}>
              <View style={styles.cardPillRow}>
                {isConfirmed ? (
                  <View style={[CommonStyles.pill, CommonStyles.pillSuccess]}>
                    <Text style={CommonStyles.pillSuccessText}>Presença Confirmada</Text>
                  </View>
                ) : isPending ? (
                  <View style={[CommonStyles.pill, CommonStyles.pillWarning]}>
                    <Text style={CommonStyles.pillWarningText}>Aguardando confirmação</Text>
                  </View>
                ) : (
                  <View style={[CommonStyles.pill, CommonStyles.pillPrimary]}>
                    <Text style={CommonStyles.pillPrimaryText}>{s.sector?.label || 'Escala'}</Text>
                  </View>
                )}
                {s.status === 'DRAFT' && (
                  <View style={[CommonStyles.pill, CommonStyles.pillSecondary]}>
                    <Text style={CommonStyles.pillSecondaryText}>Rascunho</Text>
                  </View>
                )}
              </View>
              <Text style={styles.eventName}>{s.title}</Text>
              <View style={styles.detailRow}>
                <Clock size={14} color={Colors.onSurfaceVariant} />
                <Text style={styles.detailText}>
                  {fmtDate(s.date)} · {s.timeStart} às {s.timeEnd}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Music size={14} color={Colors.onSurfaceVariant} />
                <Text style={styles.detailText}>{s.sector?.label || 'Setor'}</Text>
              </View>
              {teamSize > 0 && (
                <View style={styles.teamRow}>
                  <View style={styles.teamAvatars}>
                    {s.members.slice(0, 4).map((m, i) => (
                      <View
                        key={i}
                        style={[CommonStyles.miniAvatar, {
                          backgroundColor: [Colors.primary, Colors.success, '#2196F3', '#E91E63'][i % 4],
                          marginLeft: i === 0 ? 0 : -6,
                        }]}
                      >
                        <Text style={CommonStyles.miniAvatarText}>{initials(m.person?.name || '?')}</Text>
                      </View>
                    ))}
                    {teamSize > 4 && (
                      <View style={[styles.miniAvatarMore, { marginLeft: -6 }]}>
                        <Text style={styles.miniAvatarMoreText}>+{teamSize - 4}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.teamText}>Equipe: {teamSize} pessoa{teamSize > 1 ? 's' : ''}</Text>
                </View>
              )}
              {!isConfirmed && (
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.confirmButton}>
                    <Text style={styles.confirmButtonText}>Confirmar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.declineButton}>
                    <Text style={styles.declineButtonText}>Não posso</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}

        <View style={styles.swapHeader}>
          <Text style={CommonStyles.sectionTitle}>Solicitacoes de Troca em Aberto</Text>
          <View style={[CommonStyles.pill, CommonStyles.pillPrimary]}>
            <Text style={CommonStyles.pillPrimaryText}>1 disponivel</Text>
          </View>
        </View>

        <View style={[styles.swapCard, Shadows.sm]}>
          <View style={styles.swapUserRow}>
            <View style={[CommonStyles.miniAvatar, { backgroundColor: '#FF9800', width: 40, height: 40, borderRadius: 20, marginLeft: 0 }]}>
              <Text style={[CommonStyles.miniAvatarText, { fontSize: FontSize.labelSm }]}>RC</Text>
            </View>
            <View style={styles.swapUserInfo}>
              <Text style={styles.swapUserName}>Rafael Costa</Text>
              <Text style={styles.swapUserTime}>Ha 2 horas</Text>
            </View>
          </View>
          <Text style={styles.swapDescription}>
            Rafael nao podera comparecer ao Culto de Domingo Noite. Procura substituto para o posto de Contrabaixo Eletrico.
          </Text>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.confirmButton}>
              <Text style={styles.confirmButtonText}>Avaliar & Assumir</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.declineButton}>
              <Text style={styles.declineButtonText}>Dispensar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.policyCard, Shadows.sm]}>
          <View style={styles.policyHeader}>
            <View style={CommonStyles.iconCircleSmall}>
              <Info size={18} color={Colors.primary} />
            </View>
            <Text style={styles.policyTitle}>Politicas de Escalas & Trocas</Text>
          </View>
          <Text style={styles.policyText}>
            As trocas de escala devem ser solicitadas com no minimo 48 horas de antecedencia.
            Cancelamentos de ultima hora podem afetar sua classificacao como voluntario ativo.
            Em caso de emergencia, entre em contato diretamente com o lider da equipe.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  purpleLabel: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: Spacing.sm,
  },
  purpleLabelText: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    color: Colors.primary,
    letterSpacing: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '500',
    color: Colors.onSurface,
  },
  titleActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  filterTabs: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  filterTab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceContainerLow,
  },
  filterTabActive: {
    backgroundColor: Colors.primaryContainer,
  },
  filterTabText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: Colors.onSurfaceVariant,
  },
  filterTabTextActive: {
    color: Colors.white,
  },
  bannerCard: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  bannerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: FontSize.md,
    fontWeight: '500',
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  bannerDescription: {
    fontSize: FontSize.sm,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.85)',
    marginBottom: Spacing.sm,
    lineHeight: 18,
  },
  bannerLink: {
    alignSelf: 'flex-start',
  },
  bannerLinkText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: Colors.white,
    textDecorationLine: 'underline',
  },
  sectionRight: {
    fontSize: FontSize.sm,
    fontWeight: '400',
    color: Colors.onSurfaceVariant,
  },
  scheduleCard: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.md,
  },
  cardPillRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    flexWrap: 'wrap',
  },
  eventName: {
    fontSize: FontSize.md,
    fontWeight: '500',
    color: Colors.onSurface,
    marginBottom: Spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  detailText: {
    fontSize: FontSize.sm,
    fontWeight: '400',
    color: Colors.onSurfaceVariant,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  teamAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniAvatarMore: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceContainerHigh,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  miniAvatarMoreText: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.onSurfaceVariant,
  },
  teamText: {
    fontSize: FontSize.sm,
    fontWeight: '400',
    color: Colors.onSurfaceVariant,
  },
  viewTimeLink: {
    marginBottom: Spacing.md,
  },
  viewTimeLinkText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: Colors.primary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: Colors.primaryContainer,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: Colors.white,
  },
  declineButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  declineButtonText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: Colors.onSurfaceVariant,
  },
  swapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  swapCard: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.md,
  },
  swapUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  swapUserInfo: {
    flex: 1,
  },
  swapUserName: {
    fontSize: FontSize.md,
    fontWeight: '500',
    color: Colors.onSurface,
  },
  swapUserTime: {
    fontSize: FontSize.xs,
    fontWeight: '400',
    color: Colors.onSurfaceVariant,
  },
  swapDescription: {
    fontSize: FontSize.sm,
    fontWeight: '400',
    color: Colors.onSurfaceVariant,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  policyCard: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginTop: Spacing.sm,
  },
  policyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  policyTitle: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: Colors.onSurface,
  },
  policyText: {
    fontSize: FontSize.sm,
    fontWeight: '400',
    color: Colors.onSurfaceVariant,
    lineHeight: 20,
  },
});
