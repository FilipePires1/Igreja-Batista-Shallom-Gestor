import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Linking } from 'react-native';
import { ArrowLeft, Lock, Mail, Eye, EyeOff, Fingerprint, Info, ExternalLinkAlt } from '../components/Icons';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    const ok = await login(email.trim(), password);
    if (!ok) setError('E-mail ou senha inválidos. Verifique e tente novamente.');
  };

  return (
    <View style={styles.root}>
      <View style={[styles.topBar, { paddingTop: insets.top + Spacing.xs }]}>
        <TouchableOpacity style={styles.backBtn}>
          <ArrowLeft size={18} color={Colors.onSurface} />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.publicBtn}>
          <Text style={styles.publicText}>App Publico</Text>
          <ExternalLinkAlt size={14} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.logoWrap}>
          <View style={styles.logoCard}>
            <View style={styles.logoIcon}>
              <View style={styles.logoA}><View style={styles.logoAInner} /></View>
            </View>
            <View style={styles.logoLink}><View style={styles.logoLinkDot} /></View>
          </View>
          <View style={styles.restrictBadge}>
            <Lock size={12} color={Colors.primary} />
            <Text style={styles.restrictText}>Acesso Restrito</Text>
          </View>
        </View>

        <Text style={styles.title}>Area dos Membros</Text>
        <Text style={styles.subtitle}>Entre com suas credenciais para acessar escalas, compromissos e comunicados dos seus ministerios.</Text>

        <View style={styles.formCard}>
          <Text style={styles.label}>E-mail ou CPF cadastrado</Text>
          <View style={styles.inputWrap}>
            <Mail size={18} color={Colors.outline} />
            <TextInput
              style={styles.input}
              placeholder="seu.email@exemplo.com"
              placeholderTextColor={Colors.neutral400}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.passHeader}>
            <Text style={styles.label}>Senha</Text>
            <TouchableOpacity><Text style={styles.forgotPass}>Esqueci minha senha</Text></TouchableOpacity>
          </View>
          <View style={styles.inputWrap}>
            <Lock size={18} color={Colors.outline} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={Colors.neutral400}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={18} color={Colors.outline} /> : <Eye size={18} color={Colors.outline} />}
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
            <Text style={styles.loginBtnText}>Entrar no App de Membros</Text>
            <Text style={styles.loginBtnArrow}>→</Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou acesso rapido</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.biometricBtn}>
            <Fingerprint size={22} color={Colors.primary} />
            <Text style={styles.biometricText}>Entrar com Face ID / Biometria</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Info size={20} color={Colors.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Nao possui acesso?</Text>
            <Text style={styles.infoDesc}>O cadastro na area de membros e liberado exclusivamente pela lideranca pastoral ou lider do seu ministerio.</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.backPublicLink}>
          <Text style={styles.backPublicText}>{'< Voltar para o App Publico'}</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>Igreja Shallom · Plataforma Ministerial</Text>
        <TouchableOpacity onPress={() => Linking.openURL('https://nextepsolutions.com.br')}>
          <Text style={styles.devFooter}>Desenvolvido por Nextep Solutions</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  backText: { fontSize: FontSize.bodySm, color: Colors.onSurface, fontWeight: '500' },
  publicBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  publicText: { fontSize: FontSize.bodySm, color: Colors.primary, fontWeight: '500' },

  scrollContent: { paddingHorizontal: Spacing.xxl, paddingBottom: Spacing.xxxl },

  logoWrap: { alignItems: 'center', marginTop: Spacing.xl },
  logoCard: { width: 80, height: 80, borderRadius: BorderRadius.xl, backgroundColor: '#F5F3FF', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  logoIcon: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  logoA: { width: 36, height: 36, borderRadius: BorderRadius.lg, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  logoAInner: { width: 18, height: 18, borderRadius: BorderRadius.sm, backgroundColor: '#FFFFFF' },
  logoLink: { position: 'absolute', bottom: 4, right: 4, width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  logoLinkDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFFFFF' },
  restrictBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primaryLight, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderRadius: BorderRadius.full, marginTop: Spacing.md },
  restrictText: { fontSize: FontSize.labelSm, fontWeight: '500', color: Colors.primary },

  title: { fontSize: FontSize.headlineLg, fontWeight: '500', color: Colors.onSurface, textAlign: 'center', marginTop: Spacing.lg },
  subtitle: { fontSize: FontSize.bodySm, color: Colors.onSurfaceVariant, textAlign: 'center', marginTop: Spacing.sm, lineHeight: 18 },

  formCard: { marginTop: Spacing.xxl },
  label: { fontSize: FontSize.labelMd, fontWeight: '500', color: Colors.onSurface, marginBottom: Spacing.sm },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, borderWidth: 1, borderColor: Colors.outlineVariant, borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, marginBottom: Spacing.lg },
  input: { flex: 1, fontSize: FontSize.bodyMd, color: Colors.onSurface },

  passHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  forgotPass: { fontSize: FontSize.labelSm, fontWeight: '500', color: Colors.primary },

  loginBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: Colors.primaryContainer, borderRadius: BorderRadius.lg, paddingVertical: Spacing.lg, marginTop: Spacing.md },
  loginBtnText: { fontSize: FontSize.bodyMd, fontWeight: '500', color: Colors.white },
  loginBtnArrow: { fontSize: FontSize.bodyMd, color: Colors.white },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: Spacing.xl },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.outlineVariant },
  dividerText: { fontSize: FontSize.labelSm, color: Colors.onSurfaceVariant, marginHorizontal: Spacing.md },

  biometricBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, borderWidth: 1.5, borderColor: Colors.primaryContainer, borderRadius: BorderRadius.lg, paddingVertical: Spacing.lg },
  biometricText: { fontSize: FontSize.bodyMd, fontWeight: '500', color: Colors.primary },

  infoCard: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xxl, backgroundColor: Colors.surfaceContainerLow, borderRadius: BorderRadius.lg, padding: Spacing.lg },
  infoContent: { flex: 1 },
  infoTitle: { fontSize: FontSize.labelMd, fontWeight: '500', color: Colors.onSurface, marginBottom: Spacing.xs },
  infoDesc: { fontSize: FontSize.bodySm, color: Colors.onSurfaceVariant, lineHeight: 18 },

  backPublicLink: { alignItems: 'center', marginTop: Spacing.xxl },
  backPublicText: { fontSize: FontSize.bodySm, color: Colors.onSurfaceVariant },

  footer: { fontSize: FontSize.labelSm, color: Colors.outline, textAlign: 'center', marginTop: Spacing.md },
  devFooter: { fontSize: FontSize.labelSm, color: Colors.primary, textAlign: 'center', marginTop: Spacing.xs, textDecorationLine: 'underline' },
  error: { fontSize: FontSize.bodySm, color: Colors.danger, textAlign: 'center', marginBottom: Spacing.md },
});
