import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Switch } from 'react-native';
import { Heart, User, Send } from '../../components/Icons';
import { router } from 'expo-router';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../constants/theme';
import AppHeader from '../../components/AppHeader';

export default function PrayerScreen() {
  const [name, setName] = useState('');
  const [request, setRequest] = useState('');
  const [isConfidential, setIsConfidential] = useState(true);

  return (
    <View style={styles.root}>
      <AppHeader sectionTitle="Mais" showBack onBack={() => router.back()} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.icon}><Heart size={28} color={Colors.primary} /></View>
          <Text style={styles.title}>Pedido de Oração</Text>
          <Text style={styles.sub}>Nossa equipe de intercessão está pronta para orar por você. Todos os pedidos são tratados com sigilo e amor.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.fieldLabel}>Seu nome *</Text>
          <View style={[styles.input, Shadows.sm]}><User size={18} color={Colors.outline} /><TextInput style={styles.inputText} placeholder="Como deseja ser chamado(a)?" placeholderTextColor={Colors.outline} value={name} onChangeText={setName} /></View>
          <View style={styles.fieldHeader}>
            <Text style={styles.fieldLabel}>Seu pedido de oração *</Text>
            <Text style={styles.fieldHint}>Confidencial</Text>
          </View>
          <View style={[styles.input, styles.textArea, Shadows.sm]}><TextInput style={[styles.inputText, { height: 120 }]} placeholder="Compartilhe seu pedido de oração..." placeholderTextColor={Colors.outline} multiline value={request} onChangeText={setRequest} /></View>
          <View style={styles.toggleRow}>
            <View style={styles.toggleContent}>
              <Text style={styles.toggleLabel}>Pedido confidencial</Text>
              <Text style={styles.toggleSub}>Visível apenas para a equipe pastoral e de intercessão</Text>
            </View>
            <Switch value={isConfidential} onValueChange={setIsConfidential} trackColor={{ true: Colors.primary, false: Colors.neutral200 }} />
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.submitBtn}>
            <Send size={18} color={Colors.white} />
            <Text style={styles.submitText}>Enviar Pedido de Oração</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white },
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: Spacing.xl, paddingTop: Spacing.xxl, alignItems: 'center' },
  icon: { width: 60, height: 60, borderRadius: BorderRadius.full, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.lg },
  title: { fontSize: FontSize.headlineSm, fontWeight: '500', color: Colors.onSurface, letterSpacing: -0.015, textAlign: 'center' },
  sub: { fontSize: FontSize.bodySm, color: Colors.onSurfaceVariant, textAlign: 'center', marginTop: Spacing.sm, lineHeight: 20, paddingHorizontal: Spacing.lg },

  section: { paddingHorizontal: Spacing.gutter, marginTop: Spacing.xl },
  fieldLabel: { fontSize: FontSize.labelMd, fontWeight: '500', color: Colors.onSurface, marginBottom: Spacing.xs },
  fieldHint: { fontSize: FontSize.bodySm, color: Colors.primary, fontWeight: '500' },
  fieldHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  input: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.surfaceContainerLowest, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, height: 48, marginBottom: Spacing.lg },
  inputText: { flex: 1, fontSize: FontSize.bodyMd, color: Colors.onSurface },
  textArea: { height: 120, alignItems: 'flex-start', paddingTop: Spacing.md },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.xl },
  toggleContent: { flex: 1, marginRight: Spacing.lg },
  toggleLabel: { fontSize: FontSize.labelMd, fontWeight: '500', color: Colors.onSurface },
  toggleSub: { fontSize: FontSize.bodySm, color: Colors.onSurfaceVariant, marginTop: 4 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingVertical: Spacing.lg },
  submitText: { color: Colors.white, fontWeight: '500', fontSize: FontSize.labelMd },
});
