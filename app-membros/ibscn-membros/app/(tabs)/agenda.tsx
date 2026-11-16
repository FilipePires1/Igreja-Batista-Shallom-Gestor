import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../constants/theme';
import { CommonStyles } from '../../constants/commonStyles';
import { Bell, User, Calendar, Clock, Music, ChevronRight, ChevronLeft, Filter, CheckCircle, Share, Users } from '../../components/Icons';

const DAYS = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'];
const DAY_NUMBERS = [13, 14, 15, 16, 17, 18, 19];
const DAY_DOTS: Record<number, string[]> = {
  13: [],
  14: [],
  15: [],
  16: [Colors.primary],
  17: ['#F59E0B'],
  18: ['#10B981'],
  19: [Colors.primary],
};

export default function AgendaScreen() {
  const insets = useSafeAreaInsets();
  const [syncEnabled, setSyncEnabled] = useState(true);
  const currentDay = 16;

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
          <View style={{ backgroundColor: Colors.primaryLight, alignSelf: 'flex-start', borderRadius: BorderRadius.full, paddingHorizontal: Spacing.sm, paddingVertical: 3 }}>
            <Text style={{ fontSize: FontSize.xs, color: Colors.primary, fontWeight: '500', letterSpacing: 1 }}>PROGRAMACAO PESSOAL</Text>
          </View>
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.title}>Agenda & Compromissos</Text>
          <TouchableOpacity style={styles.filterBtn}>
            <Filter size={18} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.toggleContainer}>
          <TouchableOpacity style={styles.toggleActive}>
            <Text style={styles.toggleActiveText}>Minha Agenda</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toggleInactive}>
            <Text style={styles.toggleInactiveText}>Igreja Toda</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.monthRow}>
          <TouchableOpacity style={styles.monthNavBtn}>
            <ChevronLeft size={20} color={Colors.onSurfaceVariant} />
          </TouchableOpacity>
          <Text style={styles.monthText}>Outubro 2025</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
            <View style={styles.todayPill}>
              <Text style={styles.todayPillText}>Hoje, 16 Out</Text>
            </View>
            <TouchableOpacity style={styles.monthNavBtn}>
              <ChevronRight size={20} color={Colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.daySelector}>
          {DAYS.map((day, i) => {
            const num = DAY_NUMBERS[i];
            const isCurrent = num === currentDay;
            const dots = DAY_DOTS[num] || [];
            return (
              <View key={day} style={styles.dayItem}>
                <Text style={[styles.dayLabel, isCurrent && styles.dayLabelActive]}>{day}</Text>
                <View style={[styles.dayCircle, isCurrent && styles.dayCircleActive]}>
                  <Text style={[styles.dayNumber, isCurrent && styles.dayNumberActive]}>{num}</Text>
                </View>
                <View style={styles.dotsRow}>
                  {dots.map((dotColor, j) => (
                    <View key={j} style={[styles.dot, { backgroundColor: dotColor }]} />
                  ))}
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>Hoje — Quinta-feira, 16 de Outubro</Text>
          <Text style={styles.sectionCount}>1 compromisso</Text>
        </View>

        <View style={[styles.eventCard, Shadows.sm]}>
          <View style={styles.eventCardHeader}>
            <View style={styles.iconCircleLarge}>
              <Music size={18} color={Colors.primary} />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <View style={styles.purplePill}>
                <Text style={styles.purplePillText}>Ministerio de Louvor</Text>
              </View>
              <View style={styles.greenPill}>
                <CheckCircle size={12} color={Colors.success} />
                <Text style={styles.greenPillText}>Escalado (Presenca confirmada)</Text>
              </View>
            </View>
          </View>

          <Text style={styles.eventName}>Ensaio Geral de Louvor</Text>

          <View style={styles.detailBlock}>
            <View style={styles.detailIconRow}>
              <View style={styles.detailIconCircle}>
                <Clock size={14} color={Colors.primary} />
              </View>
              <Text style={styles.detailLabel}>HORARIO</Text>
            </View>
            <Text style={styles.detailValue}>20h00 as 21h30</Text>
          </View>

          <View style={styles.detailBlock}>
            <View style={styles.detailIconRow}>
              <View style={styles.detailIconCircle}>
                <Share size={14} color={Colors.primary} />
              </View>
              <Text style={styles.detailLabel}>LOCAL</Text>
            </View>
            <Text style={styles.detailValue}>Auditorio Principal</Text>
          </View>

          <View style={styles.eventFooter}>
            <View style={styles.teamAvatars}>
              <View style={[CommonStyles.miniAvatar, { backgroundColor: '#E0E7FF' }]}>
                <Text style={[CommonStyles.miniAvatarText, { color: Colors.primary }]}>M</Text>
              </View>
              <View style={[CommonStyles.miniAvatar, { backgroundColor: '#DBEAFE' }]}>
                <Text style={[CommonStyles.miniAvatarText, { color: '#3B82F6' }]}>R</Text>
              </View>
              <View style={[CommonStyles.miniAvatar, { backgroundColor: '#FEF3C7' }]}>
                <Text style={[CommonStyles.miniAvatarText, { color: '#F59E0B' }]}>A</Text>
              </View>
              <View style={[CommonStyles.miniAvatar, { backgroundColor: '#D1FAE5' }]}>
                <Text style={[CommonStyles.miniAvatarText, { color: '#10B981' }]}>L</Text>
              </View>
              <View style={styles.miniAvatarMore}>
                <Text style={styles.miniAvatarMoreText}>+4</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.outlineButton}>
              <Text style={styles.outlineButtonText}>Ver Repertorio</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={CommonStyles.sectionHeader}>
          <Text style={CommonStyles.sectionTitle}>Proximos Dias Desta Semana</Text>
          <TouchableOpacity>
            <Text style={CommonStyles.sectionLink}>Ver Mes Completo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dayGroup}>
          <View style={styles.dayGroupHeader}>
            <View style={styles.bullet} />
            <Text style={styles.dayGroupTitle}>Sexta, 17 de Outubro</Text>
          </View>
          <View style={[styles.compactCard, Shadows.sm]}>
            <View style={styles.compactHeader}>
              <Music size={16} color={Colors.primary} />
              <Text style={styles.compactEventName}>Reuniao</Text>
              <View style={styles.grayPill}>
                <Text style={styles.grayPillText}>Geral</Text>
              </View>
            </View>
            <View style={styles.compactDetails}>
              <Clock size={12} color={Colors.onSurfaceVariant} />
              <Text style={styles.compactDetailText}>19h30</Text>
            </View>
            <View style={styles.compactDetails}>
              <Text style={styles.compactDetailText}>Capela</Text>
            </View>
          </View>
        </View>

        <View style={styles.dayGroup}>
          <View style={styles.dayGroupHeader}>
            <View style={styles.bullet} />
            <Text style={styles.dayGroupTitle}>Sabado, 18 de Outubro</Text>
          </View>
          <View style={[styles.compactCard, Shadows.sm]}>
            <View style={styles.compactHeader}>
              <Users size={16} color={Colors.primary} />
              <Text style={styles.compactEventName}>Workshop de Lideres</Text>
              <View style={styles.grayPill}>
                <Text style={styles.grayPillText}>Lideranca</Text>
              </View>
            </View>
            <View style={styles.compactDetails}>
              <Clock size={12} color={Colors.onSurfaceVariant} />
              <Text style={styles.compactDetailText}>09h30 as 12h00</Text>
            </View>
            <View style={styles.compactDetails}>
              <Text style={styles.compactDetailText}>Sala 3</Text>
            </View>
          </View>
        </View>

        <View style={styles.dayGroup}>
          <View style={styles.dayGroupHeader}>
            <View style={styles.bullet} />
            <Text style={styles.dayGroupTitle}>Domingo, 19 de Outubro</Text>
          </View>
          <View style={[styles.eventCard, Shadows.sm]}>
            <View style={styles.eventCardHeader}>
              <View style={styles.iconCircleLarge}>
                <Music size={18} color={Colors.primary} />
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <View style={styles.purplePill}>
                  <Text style={styles.purplePillText}>Culto de Celebracao</Text>
                </View>
                <View style={styles.greenPill}>
                  <CheckCircle size={12} color={Colors.success} />
                  <Text style={styles.greenPillText}>Escalado</Text>
                </View>
              </View>
            </View>

            <View style={styles.instrumentBadges}>
              <View style={styles.instrumentBadge}>
                <Text style={styles.instrumentBadgeText}>Voce toca Guitarra Base</Text>
              </View>
              <View style={styles.instrumentBadgeYellow}>
                <Text style={styles.instrumentBadgeYellowText}>Dia de Escala</Text>
              </View>
            </View>

            <View style={styles.detailBlock}>
              <View style={styles.detailIconRow}>
                <View style={styles.detailIconCircle}>
                  <Clock size={14} color={Colors.primary} />
                </View>
                <Text style={styles.detailLabel}>HORARIO</Text>
              </View>
              <Text style={styles.detailValue}>18h00</Text>
            </View>

            <View style={styles.detailBlock}>
              <View style={styles.detailIconRow}>
                <View style={styles.detailIconCircle}>
                  <Share size={14} color={Colors.primary} />
                </View>
                <Text style={styles.detailLabel}>LOCAL</Text>
              </View>
              <Text style={styles.detailValue}>Auditorio Principal</Text>
            </View>

            <View style={styles.eventFooter}>
              <View style={styles.teamAvatars}>
                <View style={[CommonStyles.miniAvatar, { backgroundColor: '#E0E7FF' }]}>
                  <Text style={[CommonStyles.miniAvatarText, { color: Colors.primary }]}>M</Text>
                </View>
                <View style={[CommonStyles.miniAvatar, { backgroundColor: '#DBEAFE' }]}>
                  <Text style={[CommonStyles.miniAvatarText, { color: '#3B82F6' }]}>R</Text>
                </View>
                <View style={[CommonStyles.miniAvatar, { backgroundColor: '#FEF3C7' }]}>
                  <Text style={[CommonStyles.miniAvatarText, { color: '#F59E0B' }]}>A</Text>
                </View>
                <View style={[CommonStyles.miniAvatar, { backgroundColor: '#D1FAE5' }]}>
                  <Text style={[CommonStyles.miniAvatarText, { color: '#10B981' }]}>L</Text>
                </View>
                <View style={styles.miniAvatarMore}>
                  <Text style={styles.miniAvatarMoreText}>+6</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.outlineButton}>
                <Text style={styles.outlineButtonText}>Ver Escala →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={[styles.syncCard, Shadows.sm]}>
          <View style={styles.syncLeft}>
            <View style={styles.syncIconCircle}>
              <Calendar size={18} color={Colors.primary} />
            </View>
            <Text style={styles.syncText}>Sincronizar Calendario</Text>
          </View>
          <Switch
            value={syncEnabled}
            onValueChange={setSyncEnabled}
            trackColor={{ false: Colors.surfaceContainerHigh, true: Colors.primaryLight }}
            thumbColor={syncEnabled ? Colors.primary : Colors.neutral400}
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xl,
    color: Colors.onSurface,
    fontWeight: '500',
  },
  filterBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.md,
    padding: 3,
    marginBottom: Spacing.md,
  },
  toggleActive: {
    flex: 1,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.primaryContainer,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  toggleActiveText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  toggleInactive: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  toggleInactiveText: {
    color: Colors.onSurfaceVariant,
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    justifyContent: 'space-between',
  },
  monthNavBtn: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthText: {
    fontSize: FontSize.md,
    color: Colors.onSurface,
    fontWeight: '500',
  },
  todayPill: {
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  todayPillText: {
    color: Colors.primary,
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  daySelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  dayItem: {
    alignItems: 'center',
    gap: 4,
  },
  dayLabel: {
    fontSize: FontSize.xxs,
    color: Colors.onSurfaceVariant,
    fontWeight: '400',
  },
  dayLabelActive: {
    color: Colors.primary,
    fontWeight: '500',
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCircleActive: {
    backgroundColor: Colors.primary,
  },
  dayNumber: {
    fontSize: FontSize.sm,
    color: Colors.onSurface,
    fontWeight: '500',
  },
  dayNumberActive: {
    color: Colors.white,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 3,
    height: 6,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sectionLabel: {
    fontSize: FontSize.bodySm,
    color: Colors.onSurface,
    fontWeight: '500',
  },
  sectionCount: {
    fontSize: FontSize.labelSm,
    color: Colors.onSurfaceVariant,
    fontWeight: '400',
  },
  eventCard: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.md,
  },
  eventCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  iconCircleLarge: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  purplePill: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  purplePillText: {
    color: Colors.primary,
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  greenPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.successLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  greenPillText: {
    color: Colors.success,
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  eventName: {
    fontSize: FontSize.lg,
    color: Colors.onSurface,
    fontWeight: '500',
    marginBottom: Spacing.sm,
  },
  detailBlock: {
    marginBottom: Spacing.xs,
  },
  detailIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  detailIconCircle: {
    width: 20,
    height: 20,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: FontSize.xxs,
    color: Colors.onSurfaceVariant,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: FontSize.bodySm,
    color: Colors.onSurface,
    fontWeight: '400',
    marginLeft: 26,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  teamAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniAvatarMore: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceContainerHigh,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -6,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  miniAvatarMoreText: {
    fontSize: FontSize.labelXs,
    color: Colors.onSurfaceVariant,
    fontWeight: '500',
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  outlineButtonText: {
    color: Colors.primary,
    fontSize: FontSize.bodySm,
    fontWeight: '500',
  },
  dayGroup: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  dayGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  dayGroupTitle: {
    fontSize: FontSize.bodyMd,
    color: Colors.onSurface,
    fontWeight: '500',
  },
  compactCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginLeft: Spacing.lg,
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  compactEventName: {
    fontSize: FontSize.bodyMd,
    color: Colors.onSurface,
    fontWeight: '500',
    flex: 1,
  },
  grayPill: {
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  grayPillText: {
    color: Colors.onSurfaceVariant,
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  compactDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  compactDetailText: {
    fontSize: FontSize.bodySm,
    color: Colors.onSurfaceVariant,
    fontWeight: '400',
  },
  instrumentBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
    marginLeft: 52,
  },
  instrumentBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  instrumentBadgeText: {
    color: Colors.primary,
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  instrumentBadgeYellow: {
    backgroundColor: Colors.warningLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  instrumentBadgeYellowText: {
    color: Colors.warning,
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  syncCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
  },
  syncLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  syncIconCircle: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  syncText: {
    fontSize: FontSize.bodyMd,
    color: Colors.onSurface,
    fontWeight: '500',
  },
});
