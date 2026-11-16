import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, User, Calendar, Clock, Music, BellRing, AlertCircle, CheckCircle, ChevronRight } from '../../components/Icons';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../constants/theme';
import { CommonStyles } from '../../constants/commonStyles';
import { apiGet, ApiAnnouncement } from '../../services/api';

const filterTabs = [
  { label: 'Todas', count: 5, active: true },
  { label: 'Escalas', count: null, active: false },
  { label: 'Avisos', count: null, active: false },
  { label: 'Trocas', count: null, active: false },
];

type NotifItem = {
  id: string;
  icon: ({ size, color }: { size: number; color: string }) => React.ReactElement;
  iconBg: string;
  label: string;
  labelColor: string;
  time: string;
  title: string;
  description: string;
  hasActions: boolean;
  actionPrimary?: string;
  actionSecondary?: string;
};

type NotifSection = { section: string; items: NotifItem[] };

const staticNotifications: NotifSection[] = [
  {
    section: 'HOJE',
    items: [
      {
        id: '1',
        icon: BellRing,
        iconBg: Colors.primary,
        label: 'ESCALAS',
        labelColor: Colors.primary,
        time: 'Ha 25 min',
        title: 'Nova Escala: Culto de Domingo Noite',
        description:
          'Voce foi escalado(a) como Guitarra Base para o Culto de Domingo (19h). Confirme sua presenca ate sexta-feira.',
        hasActions: true,
        actionPrimary: 'Confirmar',
        actionSecondary: 'Ver Detalhes',
      },
      {
        id: '2',
        icon: AlertCircle,
        iconBg: Colors.primary,
        label: 'TROCAS',
        labelColor: Colors.primary,
        time: 'Ha 2 horas',
        title: 'Solicitacao de Substituicao de Escala',
        description:
          'Rafael Costa (Guitarra Base) solicitou uma troca para o Culto de Quarta-feira. Voce e o substituto sugerido.',
        hasActions: true,
        actionPrimary: 'Avaliar Troca',
      },
    ],
  },
  {
    section: 'ONTEM',
    items: [
      {
        id: '3',
        icon: AlertCircle,
        iconBg: Colors.primary,
        label: 'AVISOS',
        labelColor: Colors.primary,
        time: 'Ontem as 17:40',
        title: 'Novo comunicado no Ministerio de Louvor',
        description:
          'Pr. Thiago publicou um novo repertorio para os cultos de Domingo. Confira a lista atualizada.',
        hasActions: false,
      },
      {
        id: '4',
        icon: Clock,
        iconBg: Colors.primary,
        label: 'LEMBRETE',
        labelColor: Colors.primary,
        time: 'Ontem as 11:15',
        title: 'Lembrete de Ensaio Geral',
        description:
          'Ensaio geral marcado para as 20h. Todos os membros devem chegar 30 min antes para afinar instrumentos.',
        hasActions: false,
      },
    ],
  },
  {
    section: 'ESTA SEMANA',
    items: [
      {
        id: '5',
        icon: CheckCircle,
        iconBg: Colors.success,
        label: 'CONFIRMACAO',
        labelColor: Colors.success,
        time: 'Terca-feira',
        title: 'Presenca confirmada registrada',
        description:
          'Sua presenca no Culto de Domingo Noite foi confirmada e registrada com sucesso no sistema.',
        hasActions: false,
      },
    ],
  },
];

export default function AvisosScreen() {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState(0);
  const [apiAnns, setApiAnns] = useState<ApiAnnouncement[]>([]);

  useEffect(() => {
    apiGet<ApiAnnouncement[]>('/announcements?limit=10').then((data) => {
      if (data) setApiAnns(data);
    });
  }, []);

  const notifications: NotifSection[] = React.useMemo(() => {
    if (!apiAnns.length) return staticNotifications;
    const hoje = apiAnns.slice(0, 2).map((a) => ({
      id: 'api-' + a.id,
      icon: a.isUrgent ? AlertCircle : BellRing,
      iconBg: a.isUrgent ? '#DC2626' : Colors.primary,
      label: a.type || 'AVISOS',
      labelColor: a.isUrgent ? '#DC2626' : Colors.primary,
      time: 'Hoje',
      title: a.title,
      description: a.body || '',
      hasActions: false,
    }));
    const resto = apiAnns.slice(2).map((a) => ({
      id: 'api-' + a.id,
      icon: BellRing,
      iconBg: Colors.primary,
      label: a.type || 'AVISOS',
      labelColor: Colors.primary,
      time: new Date(a.createdAt).toLocaleDateString('pt-BR'),
      title: a.title,
      description: a.body || '',
      hasActions: false,
    }));
    return [
      { section: 'HOJE', items: hoje },
      { section: 'ESTA SEMANA', items: resto.length ? resto : staticNotifications[2].items },
      ...staticNotifications.slice(1, 2),
    ];
  }, [apiAnns]);

  const renderNotificationCard = (item: NotifItem) => {
    const IconComponent = item.icon;
    return (
      <View key={item.id} style={[styles.card, Shadows.sm]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconCircle, { backgroundColor: item.iconBg + '15' }]}>
            <IconComponent size={20} color={item.iconBg} />
          </View>
          <View style={styles.cardMeta}>
            <Text style={[styles.cardLabel, { color: item.labelColor }]}>
              {item.label}
            </Text>
            <Text style={styles.cardTime}>{item.time}</Text>
          </View>
        </View>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDescription}>{item.description}</Text>
        {item.hasActions && (
          <View style={styles.cardActions}>
            {item.actionSecondary ? (
              <>
                <TouchableOpacity style={styles.btnPrimary}>
                  <Text style={styles.btnPrimaryText}>{item.actionPrimary}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnSecondary}>
                  <Text style={styles.btnSecondaryText}>{item.actionSecondary}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={styles.btnPrimary}>
                <Text style={styles.btnPrimaryText}>{item.actionPrimary}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={CommonStyles.root}>
      {/* Header */}
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

      <ScrollView
        style={CommonStyles.container}
        contentContainerStyle={CommonStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Row */}
        <View style={styles.titleRow}>
          <View style={styles.titleLeft}>
            <Text style={styles.screenTitle}>Notificacoes</Text>
            <View style={styles.badgePill}>
              <Text style={styles.badgePillText}>2 novas</Text>
            </View>
          </View>
          <TouchableOpacity>
            <Text style={styles.markAllRead}>Marcar todas como lidas</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          {filterTabs.map((tab, index) => (
            <TouchableOpacity
              key={tab.label}
              style={[
                styles.filterTab,
                activeFilter === index && styles.filterTabActive,
              ]}
              onPress={() => setActiveFilter(index)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  activeFilter === index && styles.filterTabTextActive,
                ]}
              >
                {tab.label}
                {tab.count !== null ? ` ${tab.count}` : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Notification Sections */}
        {notifications.map((section) => (
          <View key={section.section} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.section}</Text>
            {section.items.map(renderNotificationCard)}
          </View>
        ))}

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
    marginBottom: Spacing.lg,
  },
  titleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  screenTitle: {
    fontSize: FontSize.xl,
    fontWeight: '500',
    color: Colors.onSurface,
  },
  badgePill: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  badgePillText: {
    fontSize: FontSize.labelSm,
    color: Colors.primary,
    fontWeight: '500',
  },
  markAllRead: {
    fontSize: FontSize.labelMd,
    color: Colors.primary,
    fontWeight: '400',
  },
  filterTabs: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  filterTab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  filterTabActive: {
    backgroundColor: Colors.primaryContainer,
    borderColor: Colors.primaryContainer,
  },
  filterTabText: {
    fontSize: FontSize.labelSm,
    color: Colors.onSurfaceVariant,
    fontWeight: '400',
  },
  filterTabTextActive: {
    color: Colors.white,
    fontWeight: '500',
  },
  section: {
    marginTop: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: FontSize.labelSm,
    fontWeight: '500',
    color: Colors.onSurfaceVariant,
    letterSpacing: 1,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  card: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardMeta: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: FontSize.labelSm,
    fontWeight: '500',
  },
  cardTime: {
    fontSize: FontSize.bodySm,
    color: Colors.outline,
  },
  cardTitle: {
    fontSize: FontSize.titleMd,
    fontWeight: '500',
    color: Colors.onSurface,
    marginBottom: Spacing.xs,
  },
  cardDescription: {
    fontSize: FontSize.bodySm,
    color: Colors.onSurfaceVariant,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  cardActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  btnPrimary: {
    flex: 1,
    backgroundColor: Colors.primaryContainer,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  btnPrimaryText: {
    fontSize: FontSize.labelMd,
    color: Colors.white,
    fontWeight: '500',
  },
  btnSecondary: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primaryContainer,
  },
  btnSecondaryText: {
    fontSize: FontSize.labelMd,
    color: Colors.primary,
    fontWeight: '500',
  },
});
