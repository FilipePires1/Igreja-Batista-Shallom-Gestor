import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Switch } from 'react-native';
import { Heart, Coffee, Users, User, MessageCircle, AtSign, Calendar, CircleHelp, Check, ShieldCheck } from '../../components/Icons';
import { router } from 'expo-router';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../constants/theme';
import AppHeader from '../../components/AppHeader';

export default function VisitorScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [wantsContact, setWantsContact] = useState(true);
  const [acceptsNews, setAcceptsNews] = useState(true);

  return (
    <View style={styles.root}>
      <AppHeader sectionTitle="Mais" showBack onBack={() => router.back()} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <View style={styles.heroIcon}><Heart size={26} color={Colors.white} /></View>
          <View style={styles.heroDot} />
          <Text style={styles.heroLabel}>Primeira vez aqui?</Text>
          <Text style={styles.heroTitle}>Seja muito bem-vindo à Família Shallom!</Text>
          <Text style={styles.heroSub}>Preencha seus dados para receber uma recepção calorosa, retirar seu café de cortesia na Cantina e descobrir nossos Grupos de Conexão.</Text>
          <View style={styles.heroFeatures}>
            <View style={styles.heroFeature}><Coffee size={16} color={Colors.white} /><Text style={styles.heroFeatureText}>Café Cortesia{'\n'}Retire no balcão</Text></View>
            <View style={styles.heroFeature}><Users size={16} color={Colors.white} /><Text style={styles.heroFeatureText}>Conexão Real{'\n'}Grupos por faixa</Text></View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Pessoais</Text>
          <Text style={styles.fieldLabel}>Nome Completo *</Text>
          <View style={[styles.input, Shadows.sm]}><User size={18} color={Colors.outline} /><TextInput style={styles.inputText} placeholder="Ex: Lucas Silveira" placeholderTextColor={Colors.outline} value={name} onChangeText={setName} /></View>
          <View style={styles.fieldHeader}><Text style={styles.fieldLabel}>Telefone / WhatsApp *</Text><Text style={styles.fieldHint}>Principal canal</Text></View>
          <View style={[styles.input, Shadows.sm]}><MessageCircle size={18} color={Colors.success} /><TextInput style={styles.inputText} placeholder="(11) 98765-4321" placeholderTextColor={Colors.outline} value={phone} onChangeText={setPhone} keyboardType="phone-pad" /></View>
          <View style={styles.fieldHeader}><Text style={styles.fieldLabel}>E-mail</Text><Text style={styles.fieldHint}>Opcional</Text></View>
          <View style={[styles.input, Shadows.sm]}><AtSign size={18} color={Colors.outline} /><TextInput style={styles.inputText} placeholder="lucas@email.com" placeholderTextColor={Colors.outline} value={email} onChangeText={setEmail} keyboardType="email-address" /></View>
          <Text style={styles.fieldLabel}>Data de Nascimento</Text>
          <View style={[styles.input, Shadows.sm]}><Calendar size={18} color={Colors.outline} /><TextInput style={styles.inputText} placeholder="mm/dd/yyyy" placeholderTextColor={Colors.outline} /></View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Queremos Saber Mais</Text>
          <Text style={styles.fieldLabel}>Como nos conheceu?</Text>
          <View style={[styles.input, Shadows.sm]}><CircleHelp size={18} color={Colors.outline} /><TextInput style={styles.inputText} placeholder="Selecione uma opção..." placeholderTextColor={Colors.outline} /></View>
          <View style={styles.fieldHeader}><Text style={styles.fieldLabel}>Pedido de oração ou mensagem especial</Text><Text style={styles.fieldHint}>Confidencial</Text></View>
          <View style={[styles.input, styles.textArea, Shadows.sm]}><TextInput style={[styles.inputText, { height: 80 }]} placeholder="Compartilhe conosco se tiver algum pedido..." placeholderTextColor={Colors.outline} multiline /></View>
          <View style={styles.toggleRow}>
            <View style={styles.toggleContent}>
              <Text style={styles.toggleLabel}>Contato pastoral acolhedor</Text>
              <Text style={styles.toggleSub}>Desejo que a equipe pastoral ou um líder entre em contato comigo via WhatsApp</Text>
            </View>
            <Switch value={wantsContact} onValueChange={setWantsContact} trackColor={{ true: Colors.primary, false: Colors.neutral200 }} />
          </View>
          <TouchableOpacity style={styles.checkboxRow} onPress={() => setAcceptsNews(!acceptsNews)}>
            <View style={[styles.checkbox, acceptsNews && styles.checkboxActive]}>{acceptsNews && <Check size={12} color={Colors.white} />}</View>
            <Text style={styles.checkboxText}>Aceito receber novidades e programações dos cultos, palestras e conferências da comunidade.</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.submitBtn}>
            <Text style={styles.submitText}>Concluir Cadastro & Receber Boas-Vindas →</Text>
          </TouchableOpacity>
          <View style={[styles.privacyCard, Shadows.sm]}>
            <ShieldCheck size={20} color={Colors.primary} />
            <View style={styles.privacyContent}>
              <Text style={styles.privacyTitle}>Privacidade & Respeito</Text>
              <Text style={styles.privacyText}>Seus dados estão seguros e serão utilizados exclusivamente para acolhimento pastoral e integração na comunidade.</Text>
            </View>
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
  hero: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.xl },
  heroIcon: { width: 56, height: 56, borderRadius: BorderRadius.full, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md },
  heroDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.secondary, marginBottom: Spacing.sm },
  heroLabel: { color: Colors.white, fontSize: FontSize.labelSm, fontWeight: '500' },
  heroTitle: { color: Colors.white, fontSize: FontSize.headlineSm, fontWeight: '500', letterSpacing: -0.015, marginTop: 4 },
  heroSub: { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.bodySm, marginTop: Spacing.sm, lineHeight: 20 },
  heroFeatures: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xl },
  heroFeature: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: BorderRadius.md, padding: Spacing.md },
  heroFeatureText: { color: Colors.white, fontSize: FontSize.labelSm, fontWeight: '500', lineHeight: 16 },

  section: { paddingHorizontal: Spacing.gutter, marginTop: Spacing.xl },
  sectionTitle: { fontSize: FontSize.titleMd, fontWeight: '500', color: Colors.onSurface, marginBottom: Spacing.lg },
  fieldLabel: { fontSize: FontSize.labelMd, fontWeight: '500', color: Colors.onSurface, marginBottom: Spacing.xs },
  fieldHint: { fontSize: FontSize.bodySm, color: Colors.primary, fontWeight: '500' },
  fieldHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  input: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.surfaceContainerLowest, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, height: 48, marginBottom: Spacing.lg },
  inputText: { flex: 1, fontSize: FontSize.bodyMd, color: Colors.onSurface },
  textArea: { height: 100, alignItems: 'flex-start', paddingTop: Spacing.md },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.xl },
  toggleContent: { flex: 1, marginRight: Spacing.lg },
  toggleLabel: { fontSize: FontSize.labelMd, fontWeight: '500', color: Colors.onSurface },
  toggleSub: { fontSize: FontSize.bodySm, color: Colors.onSurfaceVariant, marginTop: 4, lineHeight: 18 },
  checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, paddingVertical: Spacing.lg },
  checkbox: { width: 22, height: 22, borderRadius: 4, borderWidth: 2, borderColor: Colors.outline, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  checkboxActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  checkboxText: { flex: 1, fontSize: FontSize.bodySm, color: Colors.onSurfaceVariant, lineHeight: 20 },
  submitBtn: { backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingVertical: Spacing.lg, alignItems: 'center' },
  submitText: { color: Colors.white, fontWeight: '500', fontSize: FontSize.labelMd },
  privacyCard: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xl, padding: Spacing.xl, backgroundColor: Colors.surfaceContainerLowest, borderRadius: BorderRadius.lg },
  privacyContent: { flex: 1 },
  privacyTitle: { fontSize: FontSize.labelMd, fontWeight: '500', color: Colors.onSurface },
  privacyText: { fontSize: FontSize.bodySm, color: Colors.onSurfaceVariant, marginTop: 4, lineHeight: 18 },
});
