import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Hand, MessagesSquare, UserPlus, BookOpen, Wallet, Clipboard, ChevronRight, ExternalLink, Banknote, Copy, Users, ShieldCheck, ArrowRight } from '../../components/Icons';
import { router } from 'expo-router';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../constants/theme';
import AppHeader from '../../components/AppHeader';

const MENU = [
  { icon: Hand, title: 'Pedido de Oração', sub: 'Confidencial para nossa equipe intercessora', color: Colors.primary, route: '/mais/oracao' },
  { icon: MessagesSquare, title: 'Fale com a Pastoral', sub: 'Atendimento acolhedor via WhatsApp', color: Colors.success },
  { icon: UserPlus, title: 'Quero ser Membro / Batismo', sub: 'Próximas classes de integração e batismo', color: Colors.secondary, route: '/mais/visitante' },
  { icon: BookOpen, title: 'Nossa História & Valores', sub: 'Declaração de fé, visão e liderança', color: Colors.primary },
  { icon: Wallet, title: 'Dízimos & Ofertas', sub: 'Construindo juntos o Reino e ações sociais', color: Colors.warning },
];

export default function MaisScreen() {
  return (
    <View style={styles.root}>
      <AppHeader sectionTitle="More" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroBanner}>
          <View style={styles.heroDot} />
          <Text style={styles.heroLabel}>Boas-vindas à Shallom</Text>
          <Text style={styles.heroTitle}>Queremos te conhecer melhor!</Text>
          <Text style={styles.heroSub}>Preencha seus dados para receber uma recepção calorosa, um café de boas-vindas e detalhes sobre os nossos Grupos de Conexão.</Text>
          <TouchableOpacity style={styles.heroBtn} onPress={() => router.push('/mais/visitante')}>
            <Clipboard size={16} color={Colors.white} />
            <Text style={styles.heroBtnText}>Cadastrar como Visitante</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cuidado & Integração</Text>
          {MENU.map((item, i) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity key={i} style={[styles.menuCard, Shadows.sm]} onPress={() => item.route ? router.push(item.route) : null}>
                <View style={[styles.menuIcon, { backgroundColor: item.color + '12' }]}>
                  <Icon size={20} color={item.color} />
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSub}>{item.sub}</Text>
                </View>
                {item.route ? <ChevronRight size={16} color={Colors.outline} /> : <ExternalLink size={16} color={Colors.outline} />}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.section}>
          <View style={[styles.pixCard, Shadows.sm]}>
            <View style={styles.pixRow}>
              <Banknote size={18} color={Colors.warning} />
              <Text style={styles.pixTitle}>Dízimos & Ofertas</Text>
            </View>
            <Text style={styles.pixSub}>Construindo juntos o Reino e ações sociais</Text>
            <View style={styles.pixBox}>
              <View style={styles.pixKeyRow}>
                <Text style={styles.pixLabel}>Chave PIX (CNPJ Oficial)</Text>
                <Text style={styles.pixBank}>Banco Shallom</Text>
              </View>
              <View style={styles.pixValueRow}>
                <Text style={styles.pixKey}>12.345.678/0001-90</Text>
                <TouchableOpacity style={styles.copyBtn}><Copy size={14} color={Colors.primary} /><Text style={styles.copyText}>Copiar</Text></TouchableOpacity>
              </View>
              <Text style={styles.pixNote}>Comunidade Batista Shallom — CNPJ auditado para transparência do ministério.</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={[styles.scheduleCard, Shadows.sm]}>
            <View style={styles.scheduleIcon}><Users size={18} color={Colors.primary} /></View>
            <View style={styles.scheduleContent}>
              <Text style={styles.scheduleTitle}>Nossos Encontros Semanais</Text>
              <Text style={styles.scheduleText}>Domingos às 10h e 18h | Quartas às 20h</Text>
              <Text style={styles.scheduleLoc}>📍 Campus Central & Shallom Kids</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={[styles.memberLink, Shadows.sm]}>
            <ShieldCheck size={18} color={Colors.primary} />
            <View style={styles.memberLinkContent}>
              <Text style={styles.memberLinkTitle}>Área Restrita: é membro ou líder de equipe?</Text>
            </View>
            <ArrowRight size={16} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.version}>Versão 2.4 — Shallom App Oficial</Text>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white },
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: 20 },

  heroBanner: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: Spacing.xxl },
  heroDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.secondary, marginBottom: Spacing.sm },
  heroLabel: { color: 'rgba(255,255,255,0.7)', fontSize: FontSize.labelSm, fontWeight: '500' },
  heroTitle: { color: Colors.white, fontSize: FontSize.headlineSm, fontWeight: '500', letterSpacing: -0.015, marginTop: Spacing.xs },
  heroSub: { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.bodySm, marginTop: Spacing.sm, lineHeight: 20 },
  heroBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: BorderRadius.md, paddingVertical: Spacing.md, marginTop: Spacing.xl },
  heroBtnText: { color: Colors.white, fontWeight: '500', fontSize: FontSize.labelMd },

  section: { paddingHorizontal: Spacing.gutter, marginTop: Spacing.xl },
  sectionTitle: { fontSize: FontSize.titleMd, fontWeight: '500', color: Colors.onSurface, letterSpacing: -0.01, marginBottom: Spacing.md },

  menuCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.xl, marginBottom: Spacing.sm },
  menuIcon: { width: 44, height: 44, borderRadius: BorderRadius.full, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  menuContent: { flex: 1 },
  menuTitle: { fontSize: FontSize.labelMd, fontWeight: '500', color: Colors.onSurface },
  menuSub: { fontSize: FontSize.bodySm, color: Colors.onSurfaceVariant, marginTop: 2 },

  pixCard: { backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.xl },
  pixRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pixTitle: { fontSize: FontSize.labelMd, fontWeight: '500', color: Colors.onSurface },
  pixSub: { fontSize: FontSize.bodySm, color: Colors.onSurfaceVariant, marginTop: 4, marginBottom: Spacing.lg },
  pixBox: { backgroundColor: Colors.surfaceContainerLow, borderRadius: BorderRadius.md, padding: Spacing.lg },
  pixKeyRow: { flexDirection: 'row', justifyContent: 'space-between' },
  pixLabel: { fontSize: FontSize.bodySm, color: Colors.onSurfaceVariant },
  pixBank: { fontSize: FontSize.bodySm, color: Colors.onSurfaceVariant },
  pixValueRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.sm },
  pixKey: { fontSize: FontSize.titleMd, fontWeight: '500', color: Colors.onSurface },
  copyBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primaryLight, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.sm },
  copyText: { color: Colors.primary, fontSize: FontSize.labelSm, fontWeight: '500' },
  pixNote: { fontSize: FontSize.bodySm, color: Colors.outline, marginTop: Spacing.md, lineHeight: 18 },

  scheduleCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.primaryLight, borderRadius: BorderRadius.lg, padding: Spacing.xl },
  scheduleIcon: { width: 44, height: 44, borderRadius: BorderRadius.full, backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center' },
  scheduleContent: { flex: 1 },
  scheduleTitle: { fontSize: FontSize.labelMd, fontWeight: '500', color: Colors.primary },
  scheduleText: { fontSize: FontSize.bodySm, color: Colors.onSurfaceVariant, marginTop: 2 },
  scheduleLoc: { fontSize: FontSize.bodySm, color: Colors.primary, marginTop: 4 },

  memberLink: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.xl },
  memberLinkContent: { flex: 1 },
  memberLinkTitle: { fontSize: FontSize.labelMd, fontWeight: '500', color: Colors.onSurface },
  version: { textAlign: 'center', fontSize: FontSize.bodySm, color: Colors.outline, marginTop: Spacing.xl },
});
