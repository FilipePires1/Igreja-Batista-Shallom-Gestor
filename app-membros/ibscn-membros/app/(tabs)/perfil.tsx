import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Bell,
  User,
  ChevronRight,
  Settings,
  Clock,
  Music,
  Calendar,
  Users,
  Shield,
  HelpCircle,
  LogOut,
  ExternalLinkAlt,
  FileText,
  Key,
  Info,
} from '../../components/Icons';
import { CommonStyles } from '../../constants/commonStyles';
import {
  Colors,
  Spacing,
  FontSize,
  BorderRadius,
  Shadows,
} from '../../constants/theme';

const ministryTags = [
  'Louvor & Adoracao',
  'Midia & Transmissao',
  'Grupo Conexao Jovens',
];

const journeyItems = [
  {
    icon: Calendar,
    title: 'Minha Disponibilidade',
    subtitle: 'Bloqueio de datas & ferias ministeriais',
    badge: 'Atualizado',
    badgeColor: Colors.success,
  },
  {
    icon: Clock,
    title: 'Historico de Escalas',
    subtitle: 'Linha do tempo de cultos e eventos servidos',
    hasArrow: true,
  },
  {
    icon: Users,
    title: 'Meus Grupos de Conexao (Celula)',
    subtitle: 'Celula Betel Jovens \u00b7 Ter\u00e7as 20h',
    hasArrow: true,
  },
  {
    icon: FileText,
    title: 'Documentos & Cifras Salvas',
    subtitle: 'Repertorios, partituras e manuais internos',
    badge: '18 itens',
    badgeColor: Colors.primaryLight,
    badgeTextColor: Colors.primary,
  },
];

const preferenceItems = [
  {
    icon: Bell,
    title: 'Alertas & WhatsApp',
    subtitle: 'Lembretes de escalas e trocas urgentes',
    statusDot: true,
    statusColor: Colors.success,
    statusText: 'Ativadas',
  },
  {
    icon: Shield,
    title: 'Seguranca & Face ID',
    subtitle: 'Acesso veloz as confirmacoes',
    toggle: true,
  },
  {
    icon: Key,
    title: 'Alterar Senha de Acesso',
    subtitle: 'Ultima troca ha 3 meses',
    hasArrow: true,
  },
];

export default function PerfilScreen() {
  const insets = useSafeAreaInsets();
  const [faceIdEnabled, setFaceIdEnabled] = useState(true);

  return (
    <View style={CommonStyles.container}>
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
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: Spacing.lg, marginBottom: Spacing.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
            <Text style={{ fontSize: FontSize.xl, fontWeight: '500', color: Colors.onSurface }}>Meu Perfil</Text>
            <View style={[CommonStyles.pill, CommonStyles.pillPrimary]}>
              <Text style={CommonStyles.pillPrimaryText}>Membro</Text>
            </View>
          </View>
          <TouchableOpacity style={CommonStyles.iconCircleSmall}>
            <Settings size={18} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={[CommonStyles.card, Shadows.sm]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.primaryContainer, alignItems: 'center', justifyContent: 'center' }}>
              <User size={32} color={Colors.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: FontSize.headlineSm, fontWeight: '500', color: Colors.onSurface }}>Gabriel Santos</Text>
              <Text style={{ fontSize: FontSize.bodySm, color: Colors.onSurfaceVariant, marginTop: 2 }}>Lider Auxiliar de Louvor & Voluntario</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing.xs }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success }} />
                <Text style={{ fontSize: FontSize.labelSm, fontWeight: '500', color: Colors.success, letterSpacing: 0.5 }}>ATIVO</Text>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, paddingTop: Spacing.md }}>
            <Calendar size={14} color={Colors.outline} />
            <Text style={{ fontSize: FontSize.bodySm, color: Colors.outline }}>Desde Marco de 2021 (4 anos)</Text>
          </View>
        </View>

        {/* Ministry Tags */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginHorizontal: Spacing.lg, marginBottom: Spacing.lg }}>
          {ministryTags.map((tag) => (
            <View key={tag} style={[CommonStyles.pill, CommonStyles.pillPrimary]}>
              <Text style={CommonStyles.pillPrimaryText}># {tag}</Text>
            </View>
          ))}
        </View>

        {/* Stats Row */}
        <View style={{ flexDirection: 'row', gap: Spacing.sm, marginHorizontal: Spacing.lg, marginBottom: Spacing.xl }}>
          <View style={{ flex: 1, backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.lg, alignItems: 'center', ...Shadows.sm }}>
            <Text style={{ fontSize: FontSize.headlineLg, fontWeight: '500', color: Colors.primary }}>28</Text>
            <Text style={{ fontSize: FontSize.bodySm, color: Colors.onSurfaceVariant, textAlign: 'center', marginTop: 2 }}>Escalas no Ano</Text>
            <Text style={{ fontSize: FontSize.labelSm, color: Colors.success, fontWeight: '500', marginTop: 4 }}>~4 este mes</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.lg, alignItems: 'center', ...Shadows.sm }}>
            <Text style={{ fontSize: FontSize.headlineLg, fontWeight: '500', color: Colors.primary }}>96%</Text>
            <Text style={{ fontSize: FontSize.bodySm, color: Colors.onSurfaceVariant, textAlign: 'center', marginTop: 2 }}>Assiduidade</Text>
            <Text style={{ fontSize: FontSize.labelSm, color: Colors.success, fontWeight: '500', marginTop: 4 }}>Excelente</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.lg, alignItems: 'center', ...Shadows.sm }}>
            <Text style={{ fontSize: FontSize.headlineLg, fontWeight: '500', color: Colors.primary }}>12</Text>
            <Text style={{ fontSize: FontSize.bodySm, color: Colors.onSurfaceVariant, textAlign: 'center', marginTop: 2 }}>Ensaios Concluidos</Text>
            <Text style={{ fontSize: FontSize.labelSm, color: Colors.success, fontWeight: '500', marginTop: 4 }}>{''}</Text>
          </View>
        </View>

        {/* Section: Minha Jornada */}
        <View style={CommonStyles.sectionHeader}>
          <Text style={CommonStyles.sectionTitle}>MINHA JORNADA & ATIVIDADES</Text>
        </View>
        {journeyItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <TouchableOpacity
              key={item.title}
              style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.lg, marginHorizontal: Spacing.lg, marginBottom: Spacing.sm, ...Shadows.xs }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 }}>
                <View style={CommonStyles.iconCircleSmall}>
                  <IconComponent size={18} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: FontSize.labelMd, fontWeight: '500', color: Colors.onSurface }}>{item.title}</Text>
                  <Text style={{ fontSize: FontSize.bodySm, color: Colors.onSurfaceVariant, marginTop: 2 }}>{item.subtitle}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                {item.badge && (
                  <View style={[CommonStyles.pill, { backgroundColor: item.badgeColor || Colors.primaryLight }]}>
                    <Text style={[CommonStyles.pillPrimaryText, { color: item.badgeTextColor || Colors.primary }]}>{item.badge}</Text>
                  </View>
                )}
                {item.hasArrow && <ChevronRight size={18} color={Colors.outline} />}
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Section: Preferencias & Seguranca */}
        <View style={CommonStyles.sectionHeader}>
          <Text style={CommonStyles.sectionTitle}>PREFERENCIAS & SEGURANCA</Text>
        </View>
        {preferenceItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <View
              key={item.title}
              style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.lg, marginHorizontal: Spacing.lg, marginBottom: Spacing.sm, ...Shadows.xs }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 }}>
                <View style={CommonStyles.iconCircleSmall}>
                  <IconComponent size={18} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: FontSize.labelMd, fontWeight: '500', color: Colors.onSurface }}>{item.title}</Text>
                  <Text style={{ fontSize: FontSize.bodySm, color: Colors.onSurfaceVariant, marginTop: 2 }}>{item.subtitle}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                {item.statusDot && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.statusColor }} />
                    <Text style={{ fontSize: FontSize.labelSm, color: Colors.success, fontWeight: '400' }}>{item.statusText}</Text>
                  </View>
                )}
                {item.toggle && (
                  <Switch
                    value={faceIdEnabled}
                    onValueChange={setFaceIdEnabled}
                    trackColor={{ false: Colors.outlineVariant, true: Colors.primaryLight }}
                    thumbColor={faceIdEnabled ? Colors.primary : Colors.outline}
                  />
                )}
                {item.hasArrow && <ChevronRight size={18} color={Colors.outline} />}
              </View>
            </View>
          );
        })}

        {/* Public App Button */}
        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, marginHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.primary, marginTop: Spacing.xl, marginBottom: Spacing.lg }}>
          <ExternalLinkAlt size={18} color={Colors.primary} />
          <Text style={{ fontSize: FontSize.labelMd, color: Colors.primary, fontWeight: '500' }}>Acessar App Publico da Igreja</Text>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity style={{ alignItems: 'center', paddingVertical: Spacing.md, marginBottom: Spacing.xl }}>
          <Text style={{ fontSize: FontSize.labelMd, color: Colors.danger, fontWeight: '500' }}>Sair da Conta (Logout)</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={{ alignItems: 'center', paddingVertical: Spacing.lg, gap: 4 }}>
          <Text style={{ fontSize: FontSize.labelSm, color: Colors.outline }}>Igreja Shallom \u00b7 Versao 2.4.0 (Build 142)</Text>
          <Text style={{ fontSize: FontSize.labelSm, color: Colors.outline }}>ID da Credencial: #MEM-8921</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}
