import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Music, Play, MapPin, Heart, Map, Camera, MessageCircle } from '../../components/Icons';
import { router } from 'expo-router';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../constants/theme';
import AppHeader from '../../components/AppHeader';

export default function HomeScreen() {
  return (
    <View style={styles.root}>
      <AppHeader sectionTitle="Home" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.greeting}>
          <Text style={styles.greetingLabel}>PAZ E GRAÇA</Text>
          <Text style={styles.greetingTitle}>Bem-vindo à Shallom</Text>
          <Text style={styles.greetingSub}>Um lugar para você pertencer e crescer.</Text>
        </View>

        <View style={[styles.card, Shadows.md]}>
          <View style={styles.nextBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.nextBadgeText}>DOMINGO 18:00</Text>
            <Text style={styles.nextBadgeLoc}>Auditório Principal</Text>
          </View>
          <Text style={styles.nextTitle}>Culto de Celebração &{'\n'}Santa Ceia</Text>
          <Text style={styles.nextPastor}>🎵 Com Pastor Thiago & Louvor Shallom</Text>

          <View style={styles.nextImage}>
            <View style={styles.nextImageInner}>
              <Music size={36} color={Colors.white} />
              <Text style={styles.nextImageText}>🎵 248 inscritos confirmados</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.btnPrimary}>
            <Play size={18} color={Colors.white} />
            <Text style={styles.btnPrimaryText}>Assistir Transmissão</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnSecondary}>
            <MapPin size={16} color={Colors.onSurface} />
            <Text style={styles.btnSecondaryText}>Como Chegar</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.welcomeCard, Shadows.sm]}>
          <View style={styles.welcomeIcon}>
            <Heart size={22} color={Colors.primary} />
          </View>
          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeTitle}>Primeira vez aqui?</Text>
            <Text style={styles.welcomeSub}>Receba nosso abraço e um</Text>
          </View>
          <TouchableOpacity style={styles.welcomeBtn}>
            <Text style={styles.welcomeBtnText}>Boas-Vindas</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Esta Semana</Text>
          <TouchableOpacity><Text style={styles.seeAll}>Ver todos ›</Text></TouchableOpacity>
        </View>
        <Text style={styles.sectionSub}>Conecte-se em nossos grupos e encontros</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.eventsScroll} contentContainerStyle={styles.eventsScrollContent}>
          <TouchableOpacity style={[styles.eventCard, Shadows.sm]} onPress={() => router.push('/eventos/1')}>
            <View style={styles.eventImage1}>
              <Text style={styles.eventDateTag}>Sexta · 19h30</Text>
            </View>
            <View style={styles.eventCardBody}>
              <Text style={styles.eventTypeTag}>JOVENS</Text>
              <Text style={styles.eventCardTitle}>Shallom Jovens</Text>
              <Text style={styles.eventCardLoc}>📍 Sala Multiuso</Text>
              <TouchableOpacity style={styles.eventCardBtn}>
                <Text style={styles.eventCardBtnText}>Quero Participar</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.eventCard, Shadows.sm]} onPress={() => router.push('/eventos/2')}>
            <View style={styles.eventImage2}>
              <Text style={styles.eventDateTag}>Terça · 20h00</Text>
            </View>
            <View style={styles.eventCardBody}>
              <Text style={styles.eventTypeTag}>MULHERES</Text>
              <Text style={styles.eventCardTitle}>Reunião de Mulheres</Text>
              <Text style={styles.eventCardLoc}>📍 Espaço Café</Text>
              <TouchableOpacity style={styles.eventCardBtn}>
                <Text style={styles.eventCardBtnText}>Quero Participar</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Avisos da Comunidade</Text>
          <Text style={styles.sectionMeta}>Atualizado hoje</Text>
        </View>

        <View style={[styles.annCard, Shadows.sm]}>
          <View style={styles.annRow}>
            <View style={[styles.annBadge, { backgroundColor: Colors.successLight }]}>
              <Text style={[styles.annBadgeText, { color: Colors.success }]}>Novo</Text>
            </View>
            <Text style={styles.annTime}>Há 2 horas</Text>
          </View>
          <Text style={styles.annTitle}>Inscrições abertas para o Retiro Anual de Famílias</Text>
          <Text style={styles.annPreview}>Três dias de comunhão, descanso e renovação na Serra da Mantiqueira. Vagas limitadas para o lote promocional.</Text>
          <Text style={styles.annLink}>Inscrever Família →</Text>
        </View>

        <View style={[styles.annCard, Shadows.sm]}>
          <View style={styles.annRow}>
            <View style={[styles.annBadge, { backgroundColor: Colors.secondaryLight }]}>
              <Text style={[styles.annBadgeText, { color: Colors.secondary }]}>Ação Social</Text>
            </View>
            <Text style={styles.annTime}>Ontem</Text>
          </View>
          <Text style={styles.annTitle}>Campanha do Quilo: arrecadação especial</Text>
          <Text style={styles.annPreview}>Traga 1kg de alimento não perecível neste domingo para apoiarmos 80 famílias da nossa vizinhança.</Text>
          <Text style={styles.annLink}>Ver Alimentos Prioritários →</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sobre & Localização</Text>
        </View>
        <Text style={styles.sectionSub}>Venha tomar um café conosco no coração da cidade</Text>
        <View style={[styles.mapPlaceholder, Shadows.sm]}>
          <Map size={40} color={Colors.outline} />
          <Text style={styles.mapText}>Mapa</Text>
        </View>
        <View style={styles.locationRow}>
          <MapPin size={14} color={Colors.primary} />
          <Text style={styles.locationText}>Av. Paulista, 1200 - Bela Vista, SP</Text>
        </View>

        <View style={styles.scheduleRow}>
          <View style={[styles.scheduleBox, Shadows.sm]}>
            <Text style={styles.scheduleDay}>DOMINGOS</Text>
            <Text style={styles.scheduleTime}>10h & 18h</Text>
            <Text style={styles.scheduleDesc}>Cultos de Celebração</Text>
          </View>
          <View style={[styles.scheduleBox, Shadows.sm]}>
            <Text style={styles.scheduleDay}>QUARTAS</Text>
            <Text style={styles.scheduleTime}>20h00</Text>
            <Text style={styles.scheduleDesc}>Oração & Palavra</Text>
          </View>
        </View>

        <View style={styles.socialRow}>
          <Text style={styles.socialLabel}>Acompanhe nas redes:</Text>
          <View style={styles.socialIcons}>
            <TouchableOpacity style={styles.socialIcon}><Camera size={18} color={Colors.primary} /></TouchableOpacity>
            <TouchableOpacity style={styles.socialIcon}><Play size={18} color={Colors.primary} /></TouchableOpacity>
            <TouchableOpacity style={styles.socialIcon}><Music size={18} color={Colors.primary} /></TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={[styles.prayerCard, Shadows.sm]} onPress={() => router.push('/mais/oracao')}>
          <View style={styles.prayerIcon}>
            <Heart size={26} color={Colors.primary} />
          </View>
          <View style={styles.prayerContent}>
            <Text style={styles.prayerTitle}>Precisa de oração ou conversa?</Text>
            <Text style={styles.prayerSub}>Nossa equipe pastoral está sempre pronta para te ouvir.</Text>
          </View>
          <MessageCircle size={20} color={Colors.primaryContainer} />
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white },
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: 20 },

  greeting: { paddingHorizontal: Spacing.gutter, paddingTop: Spacing.xl },
  greetingLabel: { fontSize: FontSize.labelSm, fontWeight: '500', color: Colors.secondary, letterSpacing: 0.05, textTransform: 'uppercase' },
  greetingTitle: { fontSize: FontSize.headlineXl, fontWeight: '500', color: Colors.onSurface, letterSpacing: -0.02, marginTop: Spacing.xs },
  greetingSub: { fontSize: FontSize.bodyMd, color: Colors.onSurfaceVariant, marginTop: 2 },

  card: {
    marginHorizontal: Spacing.gutter, marginTop: Spacing.xl,
    backgroundColor: Colors.white, borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
  },
  nextBadge: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.primaryLight, alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full, marginBottom: Spacing.md,
  },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success },
  nextBadgeText: { fontSize: FontSize.labelSm, fontWeight: '500', color: Colors.primary },
  nextBadgeLoc: { fontSize: FontSize.labelSm, color: Colors.onSurfaceVariant },
  nextTitle: { fontSize: FontSize.headlineSm, fontWeight: '500', color: Colors.onSurface, letterSpacing: -0.015, lineHeight: 24 },
  nextPastor: { fontSize: FontSize.bodySm, color: Colors.onSurfaceVariant, marginTop: Spacing.xs },
  nextImage: { height: 150, borderRadius: BorderRadius.lg, overflow: 'hidden', marginTop: Spacing.lg, marginBottom: Spacing.lg },
  nextImageInner: { flex: 1, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  nextImageText: { color: Colors.white, fontSize: FontSize.bodySm, fontWeight: '500', marginTop: Spacing.sm },

  btnPrimary: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingVertical: Spacing.md,
  },
  btnPrimaryText: { color: Colors.white, fontWeight: '500', fontSize: FontSize.bodyMd },
  btnSecondary: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    backgroundColor: Colors.surfaceContainerLow, borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md, marginTop: Spacing.sm,
  },
  btnSecondaryText: { color: Colors.onSurface, fontWeight: '500', fontSize: FontSize.bodyMd },

  welcomeCard: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: Spacing.gutter, marginTop: Spacing.xl,
    backgroundColor: Colors.white, borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  welcomeIcon: { width: 44, height: 44, borderRadius: BorderRadius.full, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  welcomeContent: { flex: 1, marginLeft: Spacing.md },
  welcomeTitle: { fontSize: FontSize.labelMd, fontWeight: '500', color: Colors.onSurface },
  welcomeSub: { fontSize: FontSize.bodySm, color: Colors.onSurfaceVariant, marginTop: 1 },
  welcomeBtn: { backgroundColor: Colors.primaryLight, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
  welcomeBtnText: { color: Colors.primary, fontWeight: '500', fontSize: FontSize.labelSm },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.gutter, marginTop: Spacing.xxl },
  sectionTitle: { fontSize: FontSize.titleMd, fontWeight: '500', color: Colors.onSurface, letterSpacing: -0.01 },
  sectionSub: { fontSize: FontSize.bodySm, color: Colors.onSurfaceVariant, paddingHorizontal: Spacing.gutter, marginTop: 4, marginBottom: Spacing.md },
  sectionMeta: { fontSize: FontSize.bodySm, color: Colors.onSurfaceVariant },
  seeAll: { fontSize: FontSize.labelMd, color: Colors.primary, fontWeight: '500' },

  eventsScroll: { marginLeft: -Spacing.gutter },
  eventsScrollContent: { paddingLeft: Spacing.gutter, paddingRight: Spacing.sm },
  eventCard: {
    width: 220, backgroundColor: Colors.white, borderRadius: BorderRadius.lg,
    marginRight: Spacing.md, overflow: 'hidden',
  },
  eventImage1: { height: 110, backgroundColor: Colors.primary, justifyContent: 'flex-end', padding: Spacing.md },
  eventImage2: { height: 110, backgroundColor: Colors.secondary, justifyContent: 'flex-end', padding: Spacing.md },
  eventDateTag: { color: Colors.white, fontSize: FontSize.labelSm, fontWeight: '500', backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start', paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.sm },
  eventCardBody: { padding: Spacing.md },
  eventTypeTag: { fontSize: FontSize.labelSm, fontWeight: '500', color: Colors.primary, backgroundColor: Colors.primaryLight, alignSelf: 'flex-start', paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.sm, marginBottom: Spacing.xs },
  eventCardTitle: { fontSize: FontSize.labelMd, fontWeight: '500', color: Colors.onSurface },
  eventCardLoc: { fontSize: FontSize.bodySm, color: Colors.onSurfaceVariant, marginTop: 4 },
  eventCardBtn: { backgroundColor: Colors.primaryLight, borderRadius: BorderRadius.md, paddingVertical: Spacing.sm, alignItems: 'center', marginTop: Spacing.md },
  eventCardBtnText: { color: Colors.primary, fontWeight: '500', fontSize: FontSize.labelSm },

  annCard: {
    marginHorizontal: Spacing.gutter, marginTop: Spacing.md,
    backgroundColor: Colors.white, borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
  },
  annRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  annBadge: { paddingHorizontal: Spacing.md, paddingVertical: 3, borderRadius: BorderRadius.sm },
  annBadgeText: { fontSize: FontSize.labelSm, fontWeight: '500' },
  annTime: { fontSize: FontSize.bodySm, color: Colors.outline },
  annTitle: { fontSize: FontSize.labelMd, fontWeight: '500', color: Colors.onSurface, marginBottom: Spacing.xs },
  annPreview: { fontSize: FontSize.bodySm, color: Colors.onSurfaceVariant, lineHeight: 20 },
  annLink: { fontSize: FontSize.labelMd, fontWeight: '500', color: Colors.primary, marginTop: Spacing.md },

  mapPlaceholder: {
    marginHorizontal: Spacing.gutter, height: 150, backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center', alignItems: 'center', marginTop: Spacing.sm,
  },
  mapText: { color: Colors.outline, marginTop: Spacing.xs, fontSize: FontSize.bodySm },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, paddingHorizontal: Spacing.gutter, marginTop: Spacing.md },
  locationText: { fontSize: FontSize.bodySm, color: Colors.onSurfaceVariant },

  scheduleRow: { flexDirection: 'row', gap: Spacing.md, paddingHorizontal: Spacing.gutter, marginTop: Spacing.lg },
  scheduleBox: { flex: 1, backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.lg, alignItems: 'center' },
  scheduleDay: { fontSize: FontSize.labelSm, fontWeight: '500', color: Colors.primary, letterSpacing: 0.05 },
  scheduleTime: { fontSize: FontSize.headlineSm, fontWeight: '500', color: Colors.primary, marginTop: Spacing.xs },
  scheduleDesc: { fontSize: FontSize.bodySm, color: Colors.onSurfaceVariant, marginTop: 2 },

  socialRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.gutter, marginTop: Spacing.xl, marginBottom: Spacing.xl },
  socialLabel: { fontSize: FontSize.bodySm, color: Colors.onSurfaceVariant },
  socialIcons: { flexDirection: 'row', gap: Spacing.sm },
  socialIcon: { width: 36, height: 36, borderRadius: BorderRadius.full, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center' },

  prayerCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    marginHorizontal: Spacing.gutter, backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
  },
  prayerIcon: { width: 44, height: 44, borderRadius: BorderRadius.full, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  prayerContent: { flex: 1 },
  prayerTitle: { fontSize: FontSize.labelMd, fontWeight: '500', color: Colors.onSurface },
  prayerSub: { fontSize: FontSize.bodySm, color: Colors.onSurfaceVariant, marginTop: 2 },
});
