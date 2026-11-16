import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CommonStyles } from '../../constants/commonStyles';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../constants/theme';
import {
  Bell,
  User,
  ChevronLeft,
  Share,
  Calendar,
  Clock,
  Music,
  MapPin,
  CheckCircle,
  CloseCircle,
  Users,
  WhatsApp,
  Copy,
  FileText,
  Info,
  AlertCircle,
  ExternalLink,
} from '../../components/Icons';

export default function DetalheEscala() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const teamMembers = [
    {
      name: 'Pr. Thiago Martins',
      role: 'Ministro de Louvor & Voz',
      status: 'confirmado' as const,
      initials: 'TM',
      color: Colors.primary,
    },
    {
      name: 'Gabriel Santos',
      role: 'Guitarra Base & Violao',
      status: 'pendente' as const,
      initials: 'GS',
      color: '#4CAF50',
    },
    {
      name: 'Lucas Oliveira',
      role: 'Bateria',
      status: 'confirmado' as const,
      initials: 'LO',
      color: '#2196F3',
    },
    {
      name: 'Amanda Silveira',
      role: 'Teclado & Synth',
      status: 'confirmado' as const,
      initials: 'AS',
      color: '#E91E63',
    },
    {
      name: 'Beatriz Lima',
      role: 'Backing Vocal (Soprano)',
      status: 'confirmado' as const,
      initials: 'BL',
      color: '#FF9800',
    },
    {
      name: 'Rafael Costa',
      role: 'Contrabaixo Eletr.',
      status: 'substituicao' as const,
      initials: 'RC',
      color: '#9C27B0',
    },
  ];

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

      <View style={styles.navRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBack}>
          <ChevronLeft size={22} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Detalhe da Escala</Text>
        <TouchableOpacity style={styles.navShare}>
          <Share size={20} color={Colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={CommonStyles.container}
        contentContainerStyle={CommonStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.pillRow}>
            <View style={[CommonStyles.pill, CommonStyles.pillWarning]}>
              <AlertCircle size={12} color={Colors.warning} />
              <Text style={CommonStyles.pillWarningText}>Aguardando Sua Confirmacao</Text>
            </View>
            <View style={[styles.pill, styles.pillOutline]}>
              <Calendar size={12} color={Colors.onSurfaceVariant} />
              <Text style={styles.pillOutlineText}>Escala #2048</Text>
            </View>
          </View>

          <Text style={styles.eventName}>Culto de Celebracao — Domingo Noite</Text>

          <View style={styles.detailRow}>
            <Clock size={16} color={Colors.onSurfaceVariant} />
            <Text style={styles.detailText}>Domingo, 19 de Outubro · 18h00 as 20h00</Text>
          </View>

          <View style={styles.alertBox}>
            <AlertCircle size={18} color="#E65100" />
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>Chegada Obrigatoria: 16h45</Text>
              <Text style={styles.alertText}>
                Presenca obrigatoria para o sound check e ensaio rapido antes do culto. Chegada apos este horario pode resultar na perda do posto.
              </Text>
            </View>
          </View>

          <View style={styles.locationRow}>
            <MapPin size={16} color={Colors.primary} />
            <Text style={styles.locationText}>Auditorio Principal — Campu</Text>
            <TouchableOpacity style={styles.locationLink}>
              <Text style={styles.locationLinkText}>Ver Mapa →</Text>
            </TouchableOpacity>
          </View>

          <View style={CommonStyles.divider} />

          <Text style={styles.labelSection}>SUA DESIGNACAO</Text>
          <View style={[CommonStyles.pill, CommonStyles.pillPrimary, styles.purplePill]}>
            <Music size={12} color={Colors.primary} />
            <Text style={CommonStyles.pillPrimaryText}>Louvor & Adoracao</Text>
          </View>

          <View style={styles.instrumentCard}>
            <View style={CommonStyles.iconCircle}>
              <Music size={18} color={Colors.primary} />
            </View>
            <View style={styles.instrumentInfo}>
              <Text style={styles.instrumentTitle}>Guitarra Base & Violao Principi</Text>
              <Text style={styles.instrumentSubtitle}>Canais de Mesa: #07 (Gtr) & #08 (Ac)</Text>
            </View>
          </View>

          <View style={styles.instructionBox}>
            <View style={styles.instructionHeader}>
              <View style={styles.tmAvatar}>
                <Text style={styles.tmAvatarText}>TM</Text>
              </View>
              <View style={styles.instructionTitleWrap}>
                <Text style={styles.instructionLabel}>Instrucoes do Pr. Thiago Martins</Text>
              </View>
            </View>
            <View style={styles.quoteContainer}>
              <Text style={styles.quoteText}>
                "Traxer o cabo reserva P10 e estudar as musicas da setlist antes do ensaio. Qualquer duvida, me chamar no WhatsApp."
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.repertoireCard}>
            <View style={styles.repertoireIconWrap}>
              <FileText size={20} color={Colors.primary} />
            </View>
            <View style={styles.repertoireContent}>
              <Text style={styles.repertoireTitle}>Ver Repertorio / Cifras</Text>
              <Text style={styles.repertoireSubtitle}>4 cancoes organizadas com BPM e links</Text>
            </View>
            <ExternalLink size={16} color={Colors.onSurfaceVariant} />
          </TouchableOpacity>

          <View style={CommonStyles.divider} />

          <View style={styles.teamHeader}>
            <Text style={styles.labelSection}>Equipe Escalada</Text>
            <View style={styles.teamHeaderRight}>
              <View style={styles.teamCountPill}>
                <Text style={styles.teamCountText}>6</Text>
              </View>
              <Text style={styles.teamConfirmedText}>4 de 6 confirmados</Text>
            </View>
          </View>

          {teamMembers.map((member, index) => (
            <View key={index} style={styles.memberRow}>
              <View style={[styles.memberAvatar, { backgroundColor: member.color }]}>
                <Text style={styles.memberAvatarText}>{member.initials}</Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberRole}>{member.role}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  member.status === 'confirmado' && styles.statusBadgeGreen,
                  member.status === 'pendente' && styles.statusBadgeYellow,
                  member.status === 'substituicao' && styles.statusBadgePurple,
                ]}
              >
                {member.status === 'confirmado' && <CheckCircle size={10} color="#2E7D32" />}
                {member.status === 'pendente' && <Clock size={10} color="#F57F17" />}
                {member.status === 'substituicao' && <Users size={10} color="#7B1FA2" />}
                <Text
                  style={[
                    styles.statusText,
                    member.status === 'confirmado' && styles.statusTextGreen,
                    member.status === 'pendente' && styles.statusTextYellow,
                    member.status === 'substituicao' && styles.statusTextPurple,
                  ]}
                >
                  {member.status === 'confirmado' && 'Confirmado'}
                  {member.status === 'pendente' && 'Pendente'}
                  {member.status === 'substituicao' && 'Substituicao Solicitada'}
                </Text>
              </View>
            </View>
          ))}

          <View style={CommonStyles.divider} />

          <Text style={styles.labelSection}>Minha Resposta</Text>
          <View style={styles.responseCard}>
            <View style={styles.responseIconRow}>
              <User size={16} color={Colors.primary} />
              <Text style={styles.responseText}>Voce podera servir com a equipe neste culto?</Text>
            </View>

            <View style={styles.responseActions}>
              <TouchableOpacity style={styles.confirmBtn}>
                <CheckCircle size={16} color={Colors.white} />
                <Text style={styles.confirmBtnText}>Confirmar Presenca</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.declineBtn}>
                <CloseCircle size={16} color={Colors.danger} />
                <Text style={styles.declineBtnText}>Nao Poderei Ir</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.swapLink}>
              <Text style={styles.swapLinkText}>Solicitar Troca / Encontrar Substituto</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.whatsappCard}>
            <View style={styles.whatsappRow}>
              <WhatsApp size={22} color="#25D366" />
              <View style={styles.whatsappContent}>
                <Text style={styles.whatsappTitle}>Duvidas ou Imprevistos?</Text>
                <Text style={styles.whatsappSubtitle}>Converse diretamente com o Pr. Thiago</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.whatsappBtn}>
              <Text style={styles.whatsappBtnText}>Falar no WhatsApp</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
  },
  navBack: {
    padding: Spacing.sm,
  },
  navTitle: {
    flex: 1,
    fontSize: FontSize.lg,
    fontWeight: '500',
    color: Colors.onSurface,
    textAlign: 'center',
  },
  navShare: {
    padding: Spacing.sm,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  pillRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    flexWrap: 'wrap',
  },
  pill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pillOutline: {
    backgroundColor: Colors.surfaceContainerLow,
  },
  pillOutlineText: {
    fontSize: FontSize.labelSm,
    fontWeight: '400',
    color: Colors.onSurfaceVariant,
  },
  purplePill: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.lg,
  },
  eventName: {
    fontSize: FontSize.headlineSm,
    fontWeight: '500',
    color: Colors.onSurface,
    marginBottom: Spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  detailText: {
    fontSize: FontSize.bodySm,
    fontWeight: '400',
    color: Colors.onSurfaceVariant,
  },
  alertBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF7ED',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: FontSize.labelMd,
    fontWeight: '500',
    color: '#E65100',
    marginBottom: 4,
  },
  alertText: {
    fontSize: FontSize.bodySm,
    fontWeight: '400',
    color: Colors.onSurfaceVariant,
    lineHeight: 18,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  locationText: {
    flex: 1,
    fontSize: FontSize.bodySm,
    fontWeight: '400',
    color: Colors.onSurface,
  },
  locationLink: {
    alignSelf: 'flex-start',
  },
  locationLinkText: {
    fontSize: FontSize.bodySm,
    fontWeight: '500',
    color: Colors.primary,
  },
  labelSection: {
    fontSize: FontSize.labelSm,
    fontWeight: '400',
    color: Colors.onSurfaceVariant,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: Spacing.md,
  },
  instrumentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  instrumentInfo: {
    flex: 1,
  },
  instrumentTitle: {
    fontSize: FontSize.labelMd,
    fontWeight: '500',
    color: Colors.onSurface,
    marginBottom: 2,
  },
  instrumentSubtitle: {
    fontSize: FontSize.bodySm,
    fontWeight: '400',
    color: Colors.onSurfaceVariant,
  },
  instructionBox: {
    borderWidth: 1,
    borderColor: Colors.primaryContainer,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  instructionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  tmAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tmAvatarText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: Colors.white,
  },
  instructionTitleWrap: {
    flex: 1,
  },
  instructionLabel: {
    fontSize: FontSize.bodySm,
    fontWeight: '500',
    color: Colors.onSurface,
  },
  quoteContainer: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  quoteText: {
    fontSize: FontSize.bodySm,
    fontWeight: '400',
    color: Colors.onSurfaceVariant,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  repertoireCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
    ...Shadows.sm,
  },
  repertoireIconWrap: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  repertoireContent: {
    flex: 1,
  },
  repertoireTitle: {
    fontSize: FontSize.labelMd,
    fontWeight: '500',
    color: Colors.onSurface,
    marginBottom: 2,
  },
  repertoireSubtitle: {
    fontSize: FontSize.bodySm,
    fontWeight: '400',
    color: Colors.onSurfaceVariant,
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  teamHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  teamCountPill: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamCountText: {
    fontSize: FontSize.labelSm,
    fontWeight: '500',
    color: Colors.white,
  },
  teamConfirmedText: {
    fontSize: FontSize.bodySm,
    fontWeight: '400',
    color: Colors.onSurfaceVariant,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
    ...Shadows.xs,
  },
  memberAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatarText: {
    fontSize: FontSize.labelXs,
    fontWeight: '500',
    color: Colors.white,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: FontSize.labelMd,
    fontWeight: '500',
    color: Colors.onSurface,
    marginBottom: 2,
  },
  memberRole: {
    fontSize: FontSize.bodySm,
    fontWeight: '400',
    color: Colors.onSurfaceVariant,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusBadgeGreen: {
    backgroundColor: '#E8F5E9',
  },
  statusBadgeYellow: {
    backgroundColor: '#FFF8E1',
  },
  statusBadgePurple: {
    backgroundColor: '#F3E5F5',
  },
  statusText: {
    fontSize: FontSize.labelXs,
    fontWeight: '500',
  },
  statusTextGreen: {
    color: '#2E7D32',
  },
  statusTextYellow: {
    color: '#F57F17',
  },
  statusTextPurple: {
    color: '#7B1FA2',
  },
  responseCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  responseIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  responseText: {
    fontSize: FontSize.bodySm,
    fontWeight: '400',
    color: Colors.onSurfaceVariant,
    flex: 1,
  },
  responseActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  confirmBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
  },
  confirmBtnText: {
    fontSize: FontSize.labelMd,
    fontWeight: '500',
    color: Colors.white,
  },
  declineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  declineBtnText: {
    fontSize: FontSize.labelMd,
    fontWeight: '500',
    color: Colors.danger,
  },
  swapLink: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  swapLinkText: {
    fontSize: FontSize.bodySm,
    fontWeight: '500',
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  whatsappCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  whatsappRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  whatsappContent: {
    flex: 1,
  },
  whatsappTitle: {
    fontSize: FontSize.labelMd,
    fontWeight: '500',
    color: Colors.onSurface,
    marginBottom: 2,
  },
  whatsappSubtitle: {
    fontSize: FontSize.bodySm,
    fontWeight: '400',
    color: Colors.onSurfaceVariant,
  },
  whatsappBtn: {
    borderWidth: 1,
    borderColor: '#25D366',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  whatsappBtnText: {
    fontSize: FontSize.labelMd,
    fontWeight: '500',
    color: '#25D366',
  },
});
