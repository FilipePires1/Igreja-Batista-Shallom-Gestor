import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { Colors } from '../constants/theme';

function RootLayoutInner() {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.splash}>
        <View style={styles.splashCard}>
          <View style={styles.splashIcon}>
            <View style={styles.iconA}><View style={styles.iconAInner} /></View>
          </View>
          <View style={styles.splashLink}><View style={styles.splashLinkDot} /></View>
        </View>
        <View style={styles.splashTextWrap}>
          <View style={styles.splashLogoRow}>
            <View style={styles.splashLogoIcon} />
          </View>
          <View style={[styles.splashLogoText, { width: 160 }]} />
          <View style={[styles.splashLogoText, { width: 80, height: 12, marginTop: 6 }]} />
        </View>
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!isLoggedIn ? (
        <Stack.Screen name="login" options={{ animation: 'fade' }} />
      ) : (
        <>
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          <Stack.Screen name="escalas/[id]" options={{ presentation: 'card' }} />
          <Stack.Screen name="disponibilidade" options={{ presentation: 'card' }} />
        </>
      )}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <RootLayoutInner />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  splashCard: { width: 120, height: 120, backgroundColor: '#F5F3FF', borderRadius: 24, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  splashIcon: { width: 56, height: 56, justifyContent: 'center', alignItems: 'center' },
  iconA: { width: 48, height: 48, borderRadius: 12, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  iconAInner: { width: 24, height: 24, borderRadius: 6, backgroundColor: '#FFFFFF' },
  splashLink: { position: 'absolute', bottom: 12, right: 12, width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  splashLinkDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FFFFFF' },
  splashTextWrap: { marginTop: 24, alignItems: 'center' },
  splashLogoRow: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#F5F3FF', marginBottom: 12, justifyContent: 'center', alignItems: 'center' },
  splashLogoIcon: { width: 24, height: 24, borderRadius: 6, backgroundColor: Colors.primary },
  splashLogoText: { height: 18, borderRadius: 4, backgroundColor: '#E5E7EB' },
  loadingRow: { marginTop: 24 },
});
