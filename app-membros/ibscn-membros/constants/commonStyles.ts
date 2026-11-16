import { StyleSheet } from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from './theme';

export const CommonStyles = StyleSheet.create({
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

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, marginTop: Spacing.xxl, marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.titleMd, fontWeight: '500', color: Colors.onSurface },
  sectionLink: { fontSize: FontSize.labelMd, fontWeight: '500', color: Colors.primary },

  card: { marginHorizontal: Spacing.lg, marginTop: Spacing.xl, backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.xl },

  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: BorderRadius.full },
  pillPrimary: { backgroundColor: Colors.primaryLight },
  pillPrimaryText: { fontSize: FontSize.labelSm, fontWeight: '500', color: Colors.primary },
  pillWarning: { backgroundColor: '#FFF7ED' },
  pillWarningText: { fontSize: FontSize.labelSm, fontWeight: '500', color: Colors.warning },
  pillSuccess: { backgroundColor: '#ECFDF5' },
  pillSuccessText: { fontSize: FontSize.labelSm, fontWeight: '500', color: Colors.success },
  pillDanger: { backgroundColor: Colors.dangerLight },
  pillDangerText: { fontSize: FontSize.labelSm, fontWeight: '500', color: Colors.danger },
  pillSecondary: { backgroundColor: Colors.secondaryLight },
  pillSecondaryText: { fontSize: FontSize.labelSm, fontWeight: '500', color: Colors.secondary },

  cardRow: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.lg },

  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: Spacing.md, paddingLeft: Spacing.xs },
  detailMain: { fontSize: FontSize.bodySm, color: Colors.onSurface, fontWeight: '500' },
  detailSub: { fontSize: FontSize.bodySm, color: Colors.onSurfaceVariant, marginTop: 2 },

  actionRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xl },
  confirmBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: Colors.primaryContainer, borderRadius: BorderRadius.md, paddingVertical: Spacing.md },
  confirmText: { color: Colors.white, fontWeight: '500', fontSize: FontSize.labelMd },
  cancelBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: Colors.white, borderRadius: BorderRadius.md, paddingVertical: Spacing.md, borderWidth: 1, borderColor: Colors.outlineVariant },
  cancelText: { color: Colors.danger, fontWeight: '500', fontSize: FontSize.labelMd },

  miniAvatar: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: Colors.white, justifyContent: 'center', alignItems: 'center' },
  miniAvatarText: { color: Colors.white, fontSize: 10, fontWeight: '500' },

  divider: { height: 1, backgroundColor: Colors.outlineVariant, marginVertical: Spacing.lg },

  iconCircle: { width: 40, height: 40, borderRadius: BorderRadius.full, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  iconCircleSmall: { width: 36, height: 36, borderRadius: BorderRadius.full, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
});
