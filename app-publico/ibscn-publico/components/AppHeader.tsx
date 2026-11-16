import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Menu, ArrowLeft, Leaf, Search, Bell, User } from './Icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../constants/theme';

interface AppHeaderProps {
  sectionTitle: string;
  showBack?: boolean;
  onBack?: () => void;
}

export default function AppHeader({ sectionTitle, showBack, onBack }: AppHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.sm }]}>
      <View style={styles.topRow}>
        <View style={styles.leftGroup}>
          {showBack ? (
            <TouchableOpacity style={styles.iconBtn} onPress={onBack}>
              <ArrowLeft size={22} color={Colors.onSurface} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.iconBtn}>
              <Menu size={22} color={Colors.onSurface} />
            </TouchableOpacity>
          )}
          <View style={styles.brandGroup}>
            <View style={styles.logoMark}>
              <Leaf size={16} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.appName}>Shallom</Text>
              <Text style={styles.sectionLabel}>{sectionTitle}</Text>
            </View>
          </View>
        </View>
        <View style={styles.rightGroup}>
          <TouchableOpacity style={styles.iconBtn}>
            <Search size={20} color={Colors.onSurfaceVariant} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Bell size={20} color={Colors.onSurfaceVariant} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.avatarBtn}>
            <User size={18} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surfaceContainerLowest,
    paddingBottom: Spacing.sm,
    paddingHorizontal: Spacing.gutter,
    ...Shadows.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logoMark: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: FontSize.bodyMd,
    fontWeight: '500',
    color: Colors.onSurface,
    letterSpacing: -0.01,
  },
  sectionLabel: {
    fontSize: FontSize.labelSm,
    fontWeight: '400',
    color: Colors.onSurfaceVariant,
    marginTop: -1,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.danger,
  },
  avatarBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
