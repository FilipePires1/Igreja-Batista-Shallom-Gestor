import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Bell, User, Calendar, ChevronRight, ChevronLeft, Clock, AlertCircle, Plus, Info, Edit, TrashCan } from '../components/Icons';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../constants/theme';
import { CommonStyles } from '../constants/commonStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const CALENDAR_DAYS = [
  null, null, null, 1, 2, 3, 4,
  5, 6, 7, 8, 9, 10, 11,
  12, 13, 14, 15, 16, 17, 18,
  19, 20, 21, 22, 23, 24, 25,
  26, 27, 28, 29, 30, null, null,
];

const UNAVAILABLE_DAYS = [8, 9, 22];
const SCHEDULED_DAYS = [15];

interface BlockItem {
  dates: string;
  label: string;
  description: string;
  affected: string;
}

const BLOCKS: BlockItem[] = [
  {
    dates: '08 e 09 Nov',
    label: 'Fim de Semana',
    description: 'Viagem corporativa fora do estado',
    affected: 'Equipe de Midia & Recepcao',
  },
  {
    dates: '22 Nov',
    label: 'Sabado Noite',
    description: 'Aniversario familiar (Bodas de Ouro)',
    affected: 'Ministerio de Louvor (Vocal)',
  },
];

export default function DisponibilidadeScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'actual' | 'next'>('actual');

  return (
    <View style={CommonStyles.root}>
      <View style={[CommonStyles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <View style={CommonStyles.headerLeft}>
          <View style={CommonStyles.headerLogo}><Text style={CommonStyles.headerLogoText}>A</Text></View>
          <View>
            <Text style={CommonStyles.headerSmall}>Igreja Shallom</Text>
            <Text style={CommonStyles.headerTitle}>Area de Membros</Text>
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
        <View style={styles.titleRow}>
          <Text style={styles.screenTitle}>Minha Disponibilidade</Text>
          <View style={CommonStyles.pillSecondary}><Text style={CommonStyles.pillSecondaryText}>Voluntario</Text></View>
        </View>

        <Text style={styles.description}>
          Informe as datas em que voce nao podera servir nas escalas de louvor e recepcao.
        </Text>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'actual' && styles.tabActive]}
            onPress={() => setActiveTab('actual')}
          >
            {activeTab === 'actual' && <View style={styles.tabDot} />}
            <Text style={[styles.tabText, activeTab === 'actual' && styles.tabTextActive]}>
              Ciclo Actual (Out/Nov)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'next' && styles.tabActive]}
            onPress={() => setActiveTab('next')}
          >
            {activeTab === 'next' && <View style={styles.tabDot} />}
            <Text style={[styles.tabText, activeTab === 'next' && styles.tabTextActive]}>
              Proximos Meses
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.bannerCard, Shadows.md]}>
          <View style={styles.bannerIconWrap}>
            <Calendar size={22} color={Colors.white} />
          </View>
          <View style={styles.bannerContent}>
            <View style={styles.bannerTopRow}>
              <Text style={styles.bannerTitle}>Ciclo de Novembro Aberto</Text>
              <View style={CommonStyles.pillDanger}><Text style={CommonStyles.pillDangerText}>Restam 4 dias</Text></View>
            </View>
            <Text style={styles.bannerDesc}>Prazo para registrar indisponibilidades: 25 de Outubro</Text>
            <Text style={styles.bannerDesc}>Consolidacao da escala: 28 de Outubro</Text>
            <View style={styles.bannerClockRow}>
              <Clock size={14} color={Colors.white} />
              <Text style={styles.bannerClockText}>Encerra a meia-noite</Text>
            </View>
          </View>
        </View>

        <View style={styles.monthHeader}>
          <View style={styles.monthLeft}>
            <View style={styles.monthDot} />
            <Text style={styles.monthTitle}>Novembro 2025</Text>
          </View>
          <View style={styles.monthNav}>
            <TouchableOpacity style={styles.navBtn}><ChevronLeft size={20} color={Colors.onSurfaceVariant} /></TouchableOpacity>
            <TouchableOpacity style={styles.navBtn}><ChevronRight size={20} color={Colors.onSurfaceVariant} /></TouchableOpacity>
          </View>
        </View>

        <View style={[styles.calendarCard, Shadows.sm]}>
          <View style={styles.weekdayRow}>
            {WEEKDAYS.map((d, i) => (
              <View key={i} style={styles.weekdayCell}>
                <Text style={styles.weekdayText}>{d}</Text>
              </View>
            ))}
          </View>
          <View style={styles.daysGrid}>
            {CALENDAR_DAYS.map((day, i) => {
              if (day === null) {
                return <View key={i} style={styles.dayCell} />;
              }
              const isUnavailable = UNAVAILABLE_DAYS.includes(day);
              const isScheduled = SCHEDULED_DAYS.includes(day);
              return (
                <View key={i} style={styles.dayCell}>
                  <View
                    style={[
                      styles.dayCircle,
                      isUnavailable && styles.dayCircleUnavailable,
                      isScheduled && styles.dayCircleScheduled,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayNumber,
                        (isUnavailable || isScheduled) && styles.dayNumberWhite,
                      ]}
                    >
                      {day}
                    </Text>
                  </View>
                  {isUnavailable && <View style={[styles.dayDot, { backgroundColor: Colors.danger }]} />}
                  {isScheduled && <View style={[styles.dayDot, { backgroundColor: Colors.primary }]} />}
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.success }]} />
            <Text style={styles.legendLabel}>Disponivel</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.danger }]} />
            <Text style={styles.legendLabel}>Indisponivel (3)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
            <Text style={styles.legendLabel}>Ja Escalado</Text>
          </View>
        </View>

        <View style={styles.blocksHeader}>
          <Text style={styles.blocksTitle}>Bloqueios em Novembro</Text>
          <View style={CommonStyles.pillPrimary}><Text style={CommonStyles.pillPrimaryText}>2 periodos ativos</Text></View>
        </View>

        {BLOCKS.map((block, idx) => (
          <View key={idx} style={[styles.blockCard, Shadows.sm]}>
            <View style={styles.blockTopRow}>
              <View style={styles.blockDates}>
                <View style={CommonStyles.pillDanger}><Text style={CommonStyles.pillDangerText}>{block.dates}</Text></View>
                <Text style={styles.blockLabel}>{block.label}</Text>
              </View>
              <View style={styles.blockActions}>
                <TouchableOpacity style={styles.blockActionBtn}><Edit size={18} color={Colors.primary} /></TouchableOpacity>
                <TouchableOpacity style={styles.blockActionBtn}><TrashCan size={18} color={Colors.danger} /></TouchableOpacity>
              </View>
            </View>
            <Text style={styles.blockDesc}>{block.description}</Text>
            <Text style={styles.blockAffected}>Afeta: {block.affected}</Text>
          </View>
        ))}

        <TouchableOpacity style={[styles.addBtn, Shadows.md]}>
          <Plus size={20} color={Colors.white} />
          <Text style={styles.addBtnText}>Adicionar Indisponibilidade</Text>
        </TouchableOpacity>

        <View style={styles.infoRow}>
          <Info size={16} color={Colors.primary} />
          <Text style={styles.infoText}>
            Suas restricoes sao respeitadas automaticamente pelo gerador inteligente de escalas.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl },
  screenTitle: { fontSize: FontSize.xl, fontWeight: '500', color: Colors.onSurface, letterSpacing: -0.02 },

  description: { fontSize: FontSize.bodySm, color: Colors.onSurfaceVariant, lineHeight: 20, paddingHorizontal: Spacing.lg, marginTop: Spacing.sm, marginBottom: Spacing.xl },

  tabs: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.lg, marginBottom: Spacing.xl },
  tab: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, backgroundColor: Colors.surfaceContainerLow },
  tabActive: { backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.primary },
  tabDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  tabText: { fontSize: FontSize.labelMd, color: Colors.onSurfaceVariant, fontWeight: '400' },
  tabTextActive: { fontSize: FontSize.labelMd, color: Colors.primary, fontWeight: '500' },

  bannerCard: { flexDirection: 'row', marginHorizontal: Spacing.lg, backgroundColor: Colors.primary, borderRadius: BorderRadius.xl, padding: Spacing.xl, gap: Spacing.lg },
  bannerIconWrap: { width: 44, height: 44, borderRadius: BorderRadius.lg, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  bannerContent: { flex: 1 },
  bannerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
  bannerTitle: { fontSize: FontSize.labelMd, fontWeight: '500', color: Colors.white },
  bannerDesc: { fontSize: FontSize.bodySm, color: 'rgba(255,255,255,0.85)', marginBottom: 2 },
  bannerClockRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginTop: Spacing.sm },
  bannerClockText: { fontSize: FontSize.labelSm, color: 'rgba(255,255,255,0.75)' },

  monthHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, marginTop: Spacing.xxl, marginBottom: Spacing.md },
  monthLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  monthDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  monthTitle: { fontSize: FontSize.titleMd, fontWeight: '500', color: Colors.onSurface },
  monthNav: { flexDirection: 'row', gap: Spacing.xs },
  navBtn: { width: 32, height: 32, borderRadius: BorderRadius.full, backgroundColor: Colors.surfaceContainerLow, justifyContent: 'center', alignItems: 'center' },

  calendarCard: { marginHorizontal: Spacing.lg, backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.lg },
  weekdayRow: { flexDirection: 'row', marginBottom: Spacing.sm },
  weekdayCell: { flex: 1, alignItems: 'center' },
  weekdayText: { fontSize: FontSize.labelSm, fontWeight: '400', color: Colors.onSurfaceVariant },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  dayCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  dayCircleUnavailable: { backgroundColor: Colors.danger },
  dayCircleScheduled: { backgroundColor: Colors.primaryContainer },
  dayNumber: { fontSize: FontSize.labelMd, fontWeight: '400', color: Colors.onSurface },
  dayNumberWhite: { color: Colors.white, fontWeight: '500' },
  dayDot: { width: 4, height: 4, borderRadius: 2, marginTop: 2 },

  legendRow: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.xl, paddingHorizontal: Spacing.lg, marginTop: Spacing.lg },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: FontSize.labelSm, color: Colors.onSurfaceVariant, fontWeight: '400' },

  blocksHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, marginTop: Spacing.xxl, marginBottom: Spacing.md },
  blocksTitle: { fontSize: FontSize.titleMd, fontWeight: '500', color: Colors.onSurface },

  blockCard: { marginHorizontal: Spacing.lg, marginBottom: Spacing.sm, backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.xl },
  blockTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.sm },
  blockDates: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  blockLabel: { fontSize: FontSize.labelMd, fontWeight: '500', color: Colors.onSurface },
  blockActions: { flexDirection: 'row', gap: Spacing.xs },
  blockActionBtn: { width: 32, height: 32, borderRadius: BorderRadius.full, backgroundColor: Colors.surfaceContainerLow, justifyContent: 'center', alignItems: 'center' },
  blockDesc: { fontSize: FontSize.bodySm, color: Colors.onSurfaceVariant, marginBottom: 4 },
  blockAffected: { fontSize: FontSize.bodySm, color: Colors.onSurfaceVariant, fontStyle: 'italic' },

  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, marginHorizontal: Spacing.lg, marginTop: Spacing.xl, backgroundColor: Colors.primaryContainer, borderRadius: BorderRadius.lg, paddingVertical: Spacing.xl },
  addBtnText: { fontSize: FontSize.labelMd, fontWeight: '500', color: Colors.white },

  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginHorizontal: Spacing.lg, marginTop: Spacing.xl, backgroundColor: Colors.primaryLight, borderRadius: BorderRadius.lg, padding: Spacing.lg },
  infoText: { flex: 1, fontSize: FontSize.bodySm, color: Colors.primary, lineHeight: 20 },
});
