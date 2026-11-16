import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Music, Users, Calendar, MapPin, User, Map, Navigation, BookOpen, Heart, Accessibility, MessageCircle, Play } from '../../components/Icons';
import { router } from 'expo-router';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../constants/theme';
import AppHeader from '../../components/AppHeader';

export default function EventDetailScreen() {
  const [adults, setAdults] = useState(2);
  const [kids, setKids] = useState(1);

  return (
    <View style={styles.root}>
      <AppHeader sectionTitle="Events" showBack onBack={() => router.back()} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
          <View style={styles.bannerTag}>
            <Music size={12} color={Colors.white} />
            <Text style={styles.bannerTagText}>Culto de Celebração & Santa Ceia</Text>
          </View>
          <Text style={styles.bannerInfo}>Neste Domingo · 18h00</Text>
        </View>
        <View style={styles.content}>
          <View style={styles.badges}>
            <View style={styles.greenBadge}><View style={styles.greenDot} /><Text style={styles.greenText}>Vagas Presenciais Disponíveis</Text></View>
            <View style={styles.grayBadge}><Users size={14} color={Colors.onSurfaceVariant} /><Text style={styles.grayText}>248 confirmados</Text></View>
          </View>
          <Text style={styles.title}>Culto de Celebração & Santa Ceia</Text>
          <Text style={styles.desc}>Uma noite especial de louvor, palavra inspiradora e comunhão com toda a igreja reunida ao redor da mesa.</Text>

          <View style={[styles.infoCard, Shadows.sm]}>
            <Calendar size={20} color={Colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>DATA E HORÁRIO</Text>
              <Text style={styles.infoValue}>Domingo, 19 de Outubro</Text>
              <Text style={styles.infoSub}>18h00 às 20h00 · Portas abrem às 17h15</Text>
            </View>
          </View>
          <View style={[styles.infoCard, Shadows.sm]}>
            <MapPin size={20} color={Colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>LOCALIZAÇÃO</Text>
              <Text style={styles.infoValue}>Auditório Principal — Campus Central</Text>
              <Text style={styles.infoSub}>Av. Paulista, 1200 · Bela Vista, SP</Text>
            </View>
          </View>
          <View style={styles.mapActions}>
            <TouchableOpacity style={[styles.mapBtn, Shadows.sm]}><Map size={16} color={Colors.primary} /><Text style={styles.mapBtnText}>Google Maps</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.mapBtn, Shadows.sm]}><Navigation size={16} color={Colors.primary} /><Text style={styles.mapBtnText}>Waze</Text></TouchableOpacity>
          </View>
          <View style={[styles.infoCard, Shadows.sm]}>
            <User size={20} color={Colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>PRELETOR & LOUVOR</Text>
              <Text style={styles.infoValue}>Pastor Thiago Martins</Text>
              <Text style={styles.infoSub}>Ministração de Louvor: Shallom Worship Band</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>O Que Esperar Desta Noite</Text>
          <View style={styles.featuresGrid}>
            {[
              { Icon: Music, title: 'Louvor Vivo', sub: 'Adoração contemporânea e coral' },
              { Icon: BookOpen, title: 'Palavra Prática', sub: 'Mensagem bíblica para o dia a dia' },
              { Icon: Heart, title: 'Santa Ceia', sub: 'Comunhão e renovação espiritual' },
              { Icon: Accessibility, title: 'Acessibilidade', sub: 'Intérprete em LIBRAS e rampas' },
            ].map((f, i) => (
              <View key={i} style={[styles.featureItem, Shadows.sm]}>
                <f.Icon size={20} color={Colors.primary} />
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureSub}>{f.sub}</Text>
              </View>
            ))}
          </View>

          <View style={styles.rsvpCard}>
            <Text style={styles.rsvpTitle}>Quero Participar</Text>
            <Text style={styles.rsvpSub}>Confirme sua presença para garantir assento e recepção especial.</Text>
            <View style={styles.counterRow}>
              <Text style={styles.counterLabel}>Adultos / Jovens</Text>
              <View style={styles.counter}>
                <TouchableOpacity style={styles.counterBtn} onPress={() => setAdults(Math.max(0, adults - 1))}><Text style={styles.counterBtnText}>-</Text></TouchableOpacity>
                <Text style={styles.counterValue}>{adults}</Text>
                <TouchableOpacity style={styles.counterBtn} onPress={() => setAdults(adults + 1)}><Text style={styles.counterBtnText}>+</Text></TouchableOpacity>
              </View>
            </View>
            <View style={styles.counterRow}>
              <Text style={styles.counterLabel}>Crianças (Shallom Kids)</Text>
              <View style={styles.counter}>
                <TouchableOpacity style={styles.counterBtn} onPress={() => setKids(Math.max(0, kids - 1))}><Text style={styles.counterBtnText}>-</Text></TouchableOpacity>
                <Text style={styles.counterValue}>{kids}</Text>
                <TouchableOpacity style={styles.counterBtn} onPress={() => setKids(kids + 1)}><Text style={styles.counterBtnText}>+</Text></TouchableOpacity>
              </View>
            </View>
            <Text style={styles.totalText}>Total reservado: {adults + kids} Lugares</Text>
            <TouchableOpacity style={styles.confirmBtn}>
              <Users size={18} color={Colors.white} />
              <Text style={styles.confirmBtnText}>Confirmar Minha Presença</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.liveBtn}>
              <Play size={18} color={Colors.white} />
              <Text style={styles.liveBtnText}>Assistir Transmissão Online (YouTube)</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.whatsappRow}>
            <MessageCircle size={18} color={Colors.primary} />
            <Text style={styles.whatsappText}>Dúvidas? Fale com a equipe de recepção no WhatsApp</Text>
          </View>

          <View style={[styles.quoteCard, Shadows.sm]}>
            <Text style={styles.quote}>"A casa de Deus é a sua casa."</Text>
            <Text style={styles.quoteSub}>Chegue alguns minutos antes para tomar um café e conversar com nossa equipe de boas-vindas.</Text>
          </View>
        </View>
        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white },
  container: { flex: 1, backgroundColor: Colors.background },

  banner: { height: 200, backgroundColor: Colors.primary, justifyContent: 'flex-end', padding: Spacing.xl },
  bannerTag: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start', paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: BorderRadius.sm },
  bannerTagText: { color: Colors.white, fontSize: FontSize.labelSm, fontWeight: '500' },
  bannerInfo: { color: Colors.white, fontSize: FontSize.bodySm, marginTop: 8 },

  content: { padding: Spacing.xl },
  badges: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xl },
  greenBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.successLight, paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: BorderRadius.sm },
  greenDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success },
  greenText: { color: Colors.success, fontSize: FontSize.labelSm, fontWeight: '500' },
  grayBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.surfaceContainerLow, paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: BorderRadius.sm },
  grayText: { color: Colors.onSurfaceVariant, fontSize: FontSize.labelSm, fontWeight: '500' },
  title: { fontSize: FontSize.headlineSm, fontWeight: '500', color: Colors.onSurface, letterSpacing: -0.015 },
  desc: { fontSize: FontSize.bodyMd, color: Colors.onSurfaceVariant, marginTop: Spacing.sm, lineHeight: 24 },

  infoCard: { flexDirection: 'row', gap: Spacing.md, backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.xl, marginTop: Spacing.lg },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: FontSize.labelSm, fontWeight: '500', color: Colors.outline, letterSpacing: 0.05, textTransform: 'uppercase' },
  infoValue: { fontSize: FontSize.labelMd, fontWeight: '500', color: Colors.onSurface, marginTop: 4 },
  infoSub: { fontSize: FontSize.bodySm, color: Colors.onSurfaceVariant, marginTop: 2 },

  mapActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  mapBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: Colors.surfaceContainerLow, borderRadius: BorderRadius.md, paddingVertical: Spacing.md },
  mapBtnText: { color: Colors.primary, fontWeight: '500', fontSize: FontSize.labelMd },

  sectionTitle: { fontSize: FontSize.titleMd, fontWeight: '500', color: Colors.onSurface, letterSpacing: -0.01, marginTop: Spacing.xxl, marginBottom: Spacing.lg },
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  featureItem: { width: '47%', backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.xl, alignItems: 'center' },
  featureTitle: { fontSize: FontSize.labelMd, fontWeight: '500', color: Colors.onSurface, marginTop: Spacing.sm },
  featureSub: { fontSize: FontSize.bodySm, color: Colors.onSurfaceVariant, marginTop: 2, textAlign: 'center' },

  rsvpCard: { backgroundColor: Colors.primary, borderRadius: BorderRadius.lg, padding: Spacing.xl, marginTop: Spacing.xxl },
  rsvpTitle: { fontSize: FontSize.headlineSm, fontWeight: '500', color: Colors.white },
  rsvpSub: { fontSize: FontSize.bodySm, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  counterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.xl },
  counterLabel: { fontSize: FontSize.labelMd, color: Colors.white, fontWeight: '500' },
  counter: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  counterBtn: { width: 36, height: 36, borderRadius: BorderRadius.full, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  counterBtnText: { color: Colors.white, fontSize: FontSize.titleMd, fontWeight: '500' },
  counterValue: { color: Colors.white, fontSize: FontSize.headlineSm, fontWeight: '500', minWidth: 30, textAlign: 'center' },
  totalText: { color: 'rgba(255,255,255,0.7)', fontSize: FontSize.bodySm, marginTop: Spacing.lg, textAlign: 'right' },
  confirmBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.white, borderRadius: BorderRadius.md, paddingVertical: Spacing.md, marginTop: Spacing.lg },
  confirmBtnText: { color: Colors.primary, fontWeight: '500', fontSize: FontSize.labelMd },
  liveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: BorderRadius.md, paddingVertical: Spacing.md, marginTop: Spacing.sm },
  liveBtnText: { color: Colors.white, fontWeight: '500', fontSize: FontSize.labelMd },

  whatsappRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.xl, padding: Spacing.xl },
  whatsappText: { flex: 1, fontSize: FontSize.bodySm, color: Colors.primary, fontWeight: '500' },

  quoteCard: { backgroundColor: Colors.primaryLight, borderRadius: BorderRadius.lg, padding: Spacing.xl, marginTop: Spacing.md },
  quote: { fontSize: FontSize.bodyLg, fontWeight: '500', color: Colors.primary, fontStyle: 'italic' },
  quoteSub: { fontSize: FontSize.bodySm, color: Colors.onSurfaceVariant, marginTop: Spacing.sm, lineHeight: 20 },
});
