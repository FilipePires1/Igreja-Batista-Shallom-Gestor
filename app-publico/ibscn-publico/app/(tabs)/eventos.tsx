import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Calendar, Search, Star, MapPin, Ticket, Bookmark } from '../../components/Icons';
import { router } from 'expo-router';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../constants/theme';
import AppHeader from '../../components/AppHeader';

const FILTERS = ['Todos', 'Cultos', 'Especiais', 'Jovens'];

const EVENTS = [
  { id: '1', title: 'Conferência Águas Profundas 2025', date: '24 a 26 de Outubro', time: '19h30', location: 'Auditório Principal', type: 'ESPECIAL', badge: 'ESPECIAL DO MÊS', spots: 'Entrada Gratuita (vagas limitadas)', confirmed: 90, featured: true },
  { id: '2', title: 'Noite de Louvor & Clamor', date: 'OUT 17', weekday: 'SEX', time: 'Sexta-feira, 20h00', location: 'Espaço Comunidade', tags: ['Cultos', 'Especial'], spots: 'Vagas livres · Sem inscrição prévia' },
  { id: '3', title: 'Workshop de Líderes e Servos', date: 'OUT 18', weekday: 'SÁB', time: 'Sábado, 09h00 às 12h30', location: 'Sala 4 · Centro Past', tags: ['Cursos', 'Liderança'], spots: 'Inclui café da manhã de boas-vindas' },
  { id: '4', title: 'Culto Kids Especial: A Grande Aventura', date: 'OUT 19', weekday: 'DOM', time: 'Domingo, 10h00', location: 'Pavilhão Infantil', tags: ['Infantil / Kids', 'Família'], spots: 'Teatro interativo, fantoches e lanche' },
  { id: '5', title: 'Papo Aberto: Fé & Carreira Universitária', date: 'OUT 22', weekday: 'QUA', time: 'Quarta-feira, 19h30', location: 'Sala Jovem · Shallom', tags: ['Jovens', 'Roda de Conversa'], spots: 'Mentores convidados & debate dinâmico' },
];

export default function EventsScreen() {
  const [activeFilter, setActiveFilter] = useState('Todos');

  return (
    <View style={styles.root}>
      <AppHeader sectionTitle="Events" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.pageHeader}>
          <View style={styles.pageHeaderLeft}>
            <Text style={styles.pageTitle}>Eventos & Calendário</Text>
            <Text style={styles.pageSub}>Fique por dentro de tudo o que acontece</Text>
          </View>
          <TouchableOpacity style={styles.calendarBtn}>
            <Calendar size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={[styles.searchBar, Shadows.sm]}>
          <Search size={18} color={Colors.outline} />
          <TextInput style={styles.searchInput} placeholder="Buscar por evento, data ou tema..." placeholderTextColor={Colors.outline} />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll} contentContainerStyle={styles.filtersContent}>
          {FILTERS.map((f) => (
            <TouchableOpacity key={f} style={[styles.filterChip, activeFilter === f && styles.filterChipActive]} onPress={() => setActiveFilter(f)}>
              <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={[styles.featuredCard, Shadows.md]}>
          <View style={styles.featuredBanner}>
            <View style={styles.featuredTopTags}>
              <View style={styles.featuredTag}><Star size={10} color={Colors.white} /><Text style={styles.featuredTagText}>ESPECIAL DO MÊS</Text></View>
              <View style={styles.featuredTag2}><Text style={styles.featuredTag2Text}>● Inscrições Abertas</Text></View>
            </View>
            <Text style={styles.featuredDate}>{EVENTS[0].date} · {EVENTS[0].time}</Text>
          </View>
          <View style={styles.featuredContent}>
            <Text style={styles.featuredTitle}>{EVENTS[0].title}</Text>
            <View style={styles.featuredInfo}><MapPin size={14} color={Colors.outline} /><Text style={styles.featuredInfoText}>{EVENTS[0].location} (Presencial e Online)</Text></View>
            <View style={styles.featuredInfo}><Ticket size={14} color={Colors.outline} /><Text style={styles.featuredInfoText}>{EVENTS[0].spots}</Text></View>
            <View style={styles.featuredPeople}>
              <View style={styles.avatarStack}>
                <View style={[styles.miniAvatar, { backgroundColor: Colors.primary }]} />
                <View style={[styles.miniAvatar, { backgroundColor: Colors.secondary, marginLeft: -8 }]} />
                <View style={[styles.miniAvatar, { backgroundColor: '#DC648C', marginLeft: -8 }]} />
              </View>
              <Text style={styles.featuredPeopleText}>L · M · +{EVENTS[0].confirmed}</Text>
            </View>
            <TouchableOpacity style={styles.featuredBtn}><Text style={styles.featuredBtnText}>Saber mais & Inscrição →</Text></TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Próximos Eventos</Text>
          <View style={styles.countPill}><Text style={styles.countText}>{EVENTS.length - 1}</Text></View>
          <TouchableOpacity style={{ marginLeft: 'auto' }}><Text style={styles.seeAll}>Ver agenda completa ›</Text></TouchableOpacity>
        </View>

        {EVENTS.slice(1).map((ev) => (
          <TouchableOpacity key={ev.id} style={[styles.eventRow, Shadows.sm]} onPress={() => router.push(`/eventos/${ev.id}`)}>
            <View style={styles.eventDateCol}>
              <Text style={styles.evMonth}>{ev.date.split(' ')[0]}</Text>
              <Text style={styles.evDay}>{ev.date.split(' ')[1]}</Text>
              <Text style={styles.evWeekday}>{ev.weekday}</Text>
            </View>
            <View style={styles.eventContentCol}>
              <View style={styles.evTags}>
                {ev.tags?.map((t, i) => (
                  <View key={i} style={[styles.evTag, i === 0 ? styles.evTagPrimary : styles.evTagAccent]}>
                    <Text style={[styles.evTagText, i === 0 ? styles.evTagTextPrimary : styles.evTagTextAccent]}>{t}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.evTitle}>{ev.title}</Text>
              <Text style={styles.evTime}>🕐 {ev.time}</Text>
              <View style={styles.evLoc}><MapPin size={12} color={Colors.outline} /><Text style={styles.evLocText}>{ev.location}</Text></View>
              <Text style={styles.evSpots}>📋 {ev.spots}</Text>
              <View style={styles.evInterest}>
                <Bookmark size={14} color={Colors.primary} />
                <Text style={styles.evInterestText}>Tenho Interesse</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white },
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: 20 },

  pageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: Spacing.gutter, paddingTop: Spacing.xl },
  pageHeaderLeft: { flex: 1 },
  pageTitle: { fontSize: FontSize.headlineXl, fontWeight: '500', color: Colors.onSurface, letterSpacing: -0.02 },
  pageSub: { fontSize: FontSize.bodySm, color: Colors.onSurfaceVariant, marginTop: 4 },
  calendarBtn: { width: 44, height: 44, borderRadius: BorderRadius.full, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center' },

  searchBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: Spacing.gutter, marginTop: Spacing.lg, backgroundColor: Colors.surfaceContainerLowest, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, height: 44 },
  searchInput: { flex: 1, marginLeft: Spacing.sm, fontSize: FontSize.bodySm, color: Colors.onSurface },

  filtersScroll: { marginTop: Spacing.lg },
  filtersContent: { paddingHorizontal: Spacing.gutter, gap: Spacing.sm },
  filterChip: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, backgroundColor: Colors.surfaceContainerLowest, ...Shadows.sm },
  filterChipActive: { backgroundColor: Colors.primary },
  filterText: { fontSize: FontSize.labelMd, fontWeight: '500', color: Colors.onSurfaceVariant },
  filterTextActive: { color: Colors.white },

  featuredCard: { marginHorizontal: Spacing.gutter, marginTop: Spacing.xl, backgroundColor: Colors.white, borderRadius: BorderRadius.lg, overflow: 'hidden' },
  featuredBanner: { height: 130, backgroundColor: Colors.primary, padding: Spacing.xl, justifyContent: 'space-between' },
  featuredTopTags: { flexDirection: 'row', gap: Spacing.sm },
  featuredTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.danger, paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: BorderRadius.sm },
  featuredTagText: { color: Colors.white, fontSize: FontSize.labelSm, fontWeight: '500' },
  featuredTag2: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: BorderRadius.sm },
  featuredTag2Text: { color: Colors.white, fontSize: FontSize.labelSm, fontWeight: '500' },
  featuredDate: { color: Colors.white, fontSize: FontSize.labelMd, fontWeight: '500', backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'flex-start', paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.sm },
  featuredContent: { padding: Spacing.xl },
  featuredTitle: { fontSize: FontSize.headlineSm, fontWeight: '500', color: Colors.onSurface, letterSpacing: -0.015, marginBottom: Spacing.md },
  featuredInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.xs },
  featuredInfoText: { fontSize: FontSize.bodySm, color: Colors.onSurfaceVariant },
  featuredPeople: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: Spacing.md, marginBottom: Spacing.lg },
  avatarStack: { flexDirection: 'row' },
  miniAvatar: { width: 24, height: 24, borderRadius: 12 },
  featuredPeopleText: { fontSize: FontSize.labelSm, color: Colors.outline },
  featuredBtn: { backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingVertical: Spacing.md, alignItems: 'center' },
  featuredBtnText: { color: Colors.white, fontWeight: '500', fontSize: FontSize.labelMd },

  sectionRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.gutter, marginTop: Spacing.xxl, marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.titleMd, fontWeight: '500', color: Colors.onSurface, letterSpacing: -0.01 },
  countPill: { backgroundColor: Colors.primary, borderRadius: BorderRadius.full, width: 24, height: 24, justifyContent: 'center', alignItems: 'center', marginLeft: Spacing.sm },
  countText: { color: Colors.white, fontSize: FontSize.labelSm, fontWeight: '500' },
  seeAll: { fontSize: FontSize.labelMd, color: Colors.primary, fontWeight: '500' },

  eventRow: { flexDirection: 'row', marginHorizontal: Spacing.gutter, marginBottom: Spacing.md, backgroundColor: Colors.white, borderRadius: BorderRadius.lg, overflow: 'hidden' },
  eventDateCol: { width: 64, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center', padding: Spacing.md },
  evMonth: { fontSize: FontSize.labelSm, fontWeight: '500', color: Colors.primary, textTransform: 'uppercase' },
  evDay: { fontSize: FontSize.headlineSm, fontWeight: '500', color: Colors.primary },
  evWeekday: { fontSize: FontSize.labelSm, color: Colors.onSurfaceVariant },
  eventContentCol: { flex: 1, padding: Spacing.lg },
  evTags: { flexDirection: 'row', gap: Spacing.xs, marginBottom: Spacing.xs },
  evTag: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.sm },
  evTagPrimary: { backgroundColor: Colors.primaryLight },
  evTagAccent: { backgroundColor: Colors.secondaryLight },
  evTagText: { fontSize: FontSize.labelSm, fontWeight: '500' },
  evTagTextPrimary: { color: Colors.primary },
  evTagTextAccent: { color: Colors.secondary },
  evTitle: { fontSize: FontSize.labelMd, fontWeight: '500', color: Colors.onSurface, marginBottom: 4 },
  evTime: { fontSize: FontSize.bodySm, color: Colors.onSurfaceVariant },
  evLoc: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  evLocText: { fontSize: FontSize.bodySm, color: Colors.onSurfaceVariant },
  evSpots: { fontSize: FontSize.bodySm, color: Colors.onSurfaceVariant, marginTop: 4 },
  evInterest: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing.md },
  evInterestText: { fontSize: FontSize.labelMd, color: Colors.primary, fontWeight: '500' },
});
