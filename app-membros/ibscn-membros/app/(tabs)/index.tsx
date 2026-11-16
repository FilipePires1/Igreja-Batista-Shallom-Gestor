import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Bell, User, Clock, Music, Calendar, AlertCircle, CheckCircle, CloseCircle, CheckboxBlank, History, ChevronRight } from '../../components/Icons';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <View style={styles.headerLeft}>
          <View style={styles.headerLogo}><Text style={styles.headerLogoText}>A</Text></View>
          <View>
            <Text style={styles.headerSmall}>Igreja Shallom</Text>
            <Text style={styles.headerTitle}>Home Do Membro</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon}>
            <Bell size={22} color={Colors.onSurface} />
            <View style={styles.notifBadge}><Text style={styles.notifText}>3</Text></View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.avatarBtn}><User size={18} color={Colors.white} /></TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.greetingRow}>
          <View>
            <Text style={styles.greeting}>Bom dia, Gabriel Santos 👋</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusBadge}><View style={styles.statusDot} /><Text style={styles.statusText}>Membro Ativo</Text></View>
              <Text style={styles.sectorText}>Louvor & Midia</Text>
            </View>
          </View>
          <View style={styles.dateBox}>
            <Text style={styles.dateLabel}>HOJE</Text>
            <Text style={styles.dateDay}>16 Out</Text>
          </View>
        </View>

        <View style={[styles.card, Shadows.md]}>
          <View style={styles.alertRow}>
            <View style={styles.alertPill}>
              <AlertCircle size={14} color={Colors.warning} />
              <Text style={styles.alertText}>Aguardando sua confirmacao</Text>
            </View>
            <View style={styles.daysPill}>
              <Clock size={12} color={Colors.primary} />
              <Text style={styles.daysText}>Em 3 dias</Text>
            </View>
          </View>

          <Text style={styles.escaladoTitle}>Voce esta escalado!</Text>

          <View style={styles.eventInfo}>
            <Music size={18} color={Colors.primary} />
            <View>
              <Text style={styles.eventName}>Culto de Domingo — Noite</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Calendar size={16} color={Colors.primary} />
            <View>
              <Text style={styles.detailMain}>Domingo, 19 de Outubro · 18h00</Text>
              <Text style={styles.detailSub}>Chegada 16h45 para passagem de som</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Music size={16} color={Colors.primary} />
            <View>
              <Text style={styles.detailMain}>Ministerio de Louvor</Text>
              <Text style={styles.detailSub}>Funcao: Guitarra Base</Text>
            </View>
          </View>

          <View style={styles.teamSection}>
            <View style={styles.teamHeader}>
              <Text style={styles.teamLabel}>Equipe escalada (5 voluntarios)</Text>
              <TouchableOpacity><Text style={styles.teamLink}>Ver detalhes</Text></TouchableOpacity>
            </View>
            <View style={styles.avatarsRow}>
              <View style={[styles.miniAvatar, { backgroundColor: Colors.secondary }]} />
              <View style={[styles.miniAvatar, { backgroundColor: Colors.primary, marginLeft: -8 }]} />
              <View style={[styles.miniAvatar, { backgroundColor: '#DC648C', marginLeft: -8 }]} />
              <View style={[styles.miniAvatar, { backgroundColor: Colors.success, marginLeft: -8 }]}>
                <Text style={styles.avatarInitial}>GS</Text>
              </View>
              <Text style={styles.teamNames}>Voce, Pr. Thiago e +3</Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.confirmBtn}>
              <CheckCircle size={18} color={Colors.white} />
              <Text style={styles.confirmText}>Confirmar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn}>
              <CloseCircle size={18} color={Colors.danger} />
              <Text style={styles.cancelText}>Nao poderei ir</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.subLink}>
            <Text style={styles.subLinkText}>Solicitar substituicao de escala</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Minha Semana</Text>
          <TouchableOpacity><Text style={styles.sectionLink}>Ver agenda completa</Text></TouchableOpacity>
        </View>

        <View style={[styles.weekCard, Shadows.sm]}>
          <View style={[styles.dayBadge, { backgroundColor: Colors.primaryLight }]}>
            <Text style={styles.dayWeekday}>QUI</Text>
            <Text style={styles.dayNum}>17</Text>
          </View>
          <View style={styles.weekInfo}>
            <Text style={styles.weekName}>Ensayo Geral de Louvor</Text>
            <Text style={styles.weekMeta}>20h00 · Auditorio Principal</Text>
          </View>
          <ChevronRight size={16} color={Colors.outline} />
        </View>

        <View style={[styles.weekCard, Shadows.sm]}>
          <View style={[styles.dayBadge, { backgroundColor: Colors.secondaryLight }]}>
            <Text style={[styles.dayWeekday, { color: Colors.secondary }]}>SAB</Text>
            <Text style={[styles.dayNum, { color: Colors.secondary }]}>19</Text>
          </View>
          <View style={styles.weekInfo}>
            <Text style={styles.weekName}>Reuniao de Lideres Shallom</Text>
            <Text style={styles.weekMeta}>09h30 · Sala 3</Text>
          </View>
          <ChevronRight size={16} color={Colors.outline} />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Meus Ministerios & Setores</Text>
        </View>

        <View style={styles.ministryRow}>
          <View style={[styles.ministryCard, Shadows.sm]}>
            <View style={styles.ministryIcon}><Music size={20} color={Colors.primary} /></View>
            <View style={styles.ministryBadge}><Text style={styles.ministryBadgeText}>Lider Aux.</Text></View>
            <Text style={styles.ministryName}>Louvor & Adoracao</Text>
            <Text style={styles.ministrySub}>24 membros ativos</Text>
          </View>
          <View style={[styles.ministryCard, Shadows.sm]}>
            <View style={styles.ministryIcon}><Bell size={20} color={Colors.primary} /></View>
            <View style={[styles.ministryBadge, { backgroundColor: Colors.secondaryLight }]}><Text style={[styles.ministryBadgeText, { color: Colors.secondary }]}>Voluntario</Text></View>
            <Text style={styles.ministryName}>Midia & Transmissao</Text>
            <Text style={styles.ministrySub}>Escala mensal</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.taskHeader}>
            <Text style={styles.sectionTitle}>Minhas Tarefas Pendentes</Text>
            <View style={styles.taskCount}><Text style={styles.taskCountText}>1 pendente</Text></View>
          </View>
        </View>

        <View style={[styles.taskCard, Shadows.sm]}>
          <CheckboxBlank size={22} color={Colors.outline} />
          <View style={styles.taskContent}>
            <Text style={styles.taskName}>Enviar repertorio do culto de domingo</Text>
            <View style={styles.taskMeta}>
              <Clock size={12} color={Colors.danger} />
              <Text style={styles.taskDeadline}>Prazo: amanha, 18h</Text>
              <Text style={styles.taskSector}>· Ministerio de Louvor</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.taskHeader}>
            <Text style={styles.sectionTitle}>Avisos Internos Recentes</Text>
            <TouchableOpacity style={styles.historyLink}>
              <History size={14} color={Colors.primary} />
              <Text style={styles.historyText}>Historico</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.annCard, Shadows.sm]}>
          <View style={styles.annIcon}><Calendar size={20} color={Colors.primary} /></View>
          <View style={styles.annContent}>
            <View style={styles.annTop}>
              <View style={styles.annBadge}><Text style={styles.annBadgeText}>Escalas & Voluntariado</Text></View>
              <Text style={styles.annTime}>ha 2 horas</Text>
            </View>
            <Text style={styles.annTitle}>Nova escala de Novembro ja disponivel</Text>
            <Text style={styles.annDesc}>As escalas para todos os cultos e equipes do mes de Novembro foram publicadas. Por favor, verifiquem suas disponibilidades na aba Escalas.</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.white, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  headerLogo: { width: 36, height: 36, borderRadius: BorderRadius.md, backgroundColor: Colors.primaryContainer, justifyContent: 'center', alignItems: 'center' },
  headerLogoText: { color: Colors.white, fontSize: FontSize.titleMd, fontWeight: '500' },
  headerSmall: { fontSize: FontSize.labelSm, color: Colors.onSurfaceVariant, fontWeight: '400' },
  headerTitle: { fontSize: FontSize.titleMd, color: Colors.onSurface, fontWeight: '500', letterSpacing: -0.01 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  headerIcon: { width: 40, height: 40, borderRadius: BorderRadius.full, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  notifBadge: { position: 'absolute', top: 4, right: 4, width: 18, height: 18, borderRadius: 9, backgroundColor: Colors.danger, justifyContent: 'center', alignItems: 'center' },
  notifText: { color: Colors.white, fontSize: 10, fontWeight: '500' },
  avatarBtn: { width: 36, height: 36, borderRadius: BorderRadius.full, backgroundColor: Colors.primaryContainer, justifyContent: 'center', alignItems: 'center' },

  container: { flex: 1 },
  scrollContent: { paddingBottom: 20 },

  greetingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl },
  greeting: { fontSize: FontSize.headlineLg, fontWeight: '500', color: Colors.onSurface, letterSpacing: -0.02 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.xs },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primaryLight, paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: BorderRadius.full },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  statusText: { fontSize: FontSize.labelSm, fontWeight: '500', color: Colors.primary },
  sectorText: { fontSize: FontSize.bodySm, color: Colors.onSurfaceVariant },
  dateBox: { alignItems: 'flex-end' },
  dateLabel: { fontSize: FontSize.labelSm, color: Colors.onSurfaceVariant, fontWeight: '400' },
  dateDay: { fontSize: FontSize.headlineSm, fontWeight: '500', color: Colors.onSurface },

  card: { marginHorizontal: Spacing.lg, marginTop: Spacing.xl, backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.xl },
  alertRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  alertPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFF7ED', paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.full },
  alertText: { fontSize: FontSize.labelSm, fontWeight: '500', color: Colors.warning },
  daysPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primaryLight, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: BorderRadius.full },
  daysText: { fontSize: FontSize.labelSm, fontWeight: '500', color: Colors.primary },

  escaladoTitle: { fontSize: FontSize.headlineSm, fontWeight: '500', color: Colors.onSurface, marginBottom: Spacing.lg },

  eventInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  eventName: { fontSize: FontSize.labelMd, fontWeight: '500', color: Colors.onSurface },

  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: Spacing.md, paddingLeft: Spacing.xs },
  detailMain: { fontSize: FontSize.bodySm, color: Colors.onSurface, fontWeight: '500' },
  detailSub: { fontSize: FontSize.bodySm, color: Colors.onSurfaceVariant, marginTop: 2 },

  teamSection: { marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.outlineVariant },
  teamHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  teamLabel: { fontSize: FontSize.bodySm, color: Colors.onSurfaceVariant },
  teamLink: { fontSize: FontSize.labelMd, fontWeight: '500', color: Colors.primary },
  avatarsRow: { flexDirection: 'row', alignItems: 'center' },
  miniAvatar: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: Colors.white, justifyContent: 'center', alignItems: 'center' },
  avatarInitial: { color: Colors.white, fontSize: 10, fontWeight: '500' },
  teamNames: { marginLeft: Spacing.sm, fontSize: FontSize.bodySm, color: Colors.onSurfaceVariant },

  actionRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xl },
  confirmBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: Colors.primaryContainer, borderRadius: BorderRadius.md, paddingVertical: Spacing.md },
  confirmText: { color: Colors.white, fontWeight: '500', fontSize: FontSize.labelMd },
  cancelBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: Colors.white, borderRadius: BorderRadius.md, paddingVertical: Spacing.md, borderWidth: 1, borderColor: Colors.outlineVariant },
  cancelText: { color: Colors.danger, fontWeight: '500', fontSize: FontSize.labelMd },

  subLink: { alignItems: 'center', marginTop: Spacing.lg },
  subLinkText: { fontSize: FontSize.bodySm, fontWeight: '500', color: Colors.primary },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, marginTop: Spacing.xxl, marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.titleMd, fontWeight: '500', color: Colors.onSurface },
  sectionLink: { fontSize: FontSize.labelMd, fontWeight: '500', color: Colors.primary },

  weekCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: Spacing.lg, marginBottom: Spacing.sm, backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.lg },
  dayBadge: { width: 48, height: 48, borderRadius: BorderRadius.md, justifyContent: 'center', alignItems: 'center' },
  dayWeekday: { fontSize: FontSize.labelSm, fontWeight: '500', color: Colors.primary },
  dayNum: { fontSize: FontSize.titleMd, fontWeight: '500', color: Colors.primary },
  weekInfo: { flex: 1, marginLeft: Spacing.md },
  weekName: { fontSize: FontSize.labelMd, fontWeight: '500', color: Colors.onSurface },
  weekMeta: { fontSize: FontSize.bodySm, color: Colors.onSurfaceVariant, marginTop: 2 },

  ministryRow: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.lg },
  ministryCard: { flex: 1, backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.lg },
  ministryIcon: { width: 40, height: 40, borderRadius: BorderRadius.full, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.sm },
  ministryBadge: { alignSelf: 'flex-start', backgroundColor: Colors.primaryLight, paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.sm, marginBottom: Spacing.sm },
  ministryBadgeText: { fontSize: FontSize.labelSm, fontWeight: '500', color: Colors.primary },
  ministryName: { fontSize: FontSize.labelMd, fontWeight: '500', color: Colors.onSurface },
  ministrySub: { fontSize: FontSize.bodySm, color: Colors.onSurfaceVariant, marginTop: 2 },

  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
  taskCount: { backgroundColor: Colors.primaryLight, paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.sm },
  taskCountText: { fontSize: FontSize.labelSm, fontWeight: '500', color: Colors.primary },

  taskCard: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, marginHorizontal: Spacing.lg, backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.xl },
  taskContent: { flex: 1 },
  taskName: { fontSize: FontSize.labelMd, fontWeight: '500', color: Colors.onSurface },
  taskMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing.xs },
  taskDeadline: { fontSize: FontSize.bodySm, fontWeight: '500', color: Colors.danger },
  taskSector: { fontSize: FontSize.bodySm, color: Colors.onSurfaceVariant },

  historyLink: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  historyText: { fontSize: FontSize.labelMd, fontWeight: '500', color: Colors.primary },

  annCard: { flexDirection: 'row', marginHorizontal: Spacing.lg, backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.xl, gap: Spacing.md },
  annIcon: { width: 40, height: 40, borderRadius: BorderRadius.full, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  annContent: { flex: 1 },
  annTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
  annBadge: { backgroundColor: Colors.primaryLight, paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.sm },
  annBadgeText: { fontSize: FontSize.labelSm, fontWeight: '500', color: Colors.primary },
  annTime: { fontSize: FontSize.bodySm, color: Colors.outline },
  annTitle: { fontSize: FontSize.labelMd, fontWeight: '500', color: Colors.onSurface, marginBottom: 4 },
  annDesc: { fontSize: FontSize.bodySm, color: Colors.onSurfaceVariant, lineHeight: 18 },
});
