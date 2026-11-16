import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Search, UtensilsCrossed, Wallet, Plus } from '../../components/Icons';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../constants/theme';
import AppHeader from '../../components/AppHeader';

const CATEGORIES = ['Lanches', 'Bebidas', 'Sobremesas', 'Combos'];
const PRODUCTS = [
  { id: '1', name: 'Pão de Queijo Artesanal (3 un)', price: 9.0, cat: 'Lanches' },
  { id: '2', name: 'Torta Salgada de Frango Cremoso', price: 14.0, cat: 'Lanches', tag: 'Mais pedido' },
  { id: '3', name: 'Espresso Duplo Gourmet', price: 8.0, cat: 'Bebidas' },
  { id: '4', name: 'Suco Natural de Laranja 400ml', price: 10.0, cat: 'Bebidas' },
  { id: '5', name: 'Bolo Caseiro de Cenoura com...', price: 11.0, cat: 'Sobremesas' },
  { id: '6', name: 'Combo Café + Torta Especial', price: 19.9, cat: 'Combos' },
];

export default function CanteenScreen() {
  const [activeCat, setActiveCat] = useState('Lanches');
  const [cart, setCart] = useState<Record<string, number>>({});
  const filtered = PRODUCTS.filter(p => p.cat === activeCat);
  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = PRODUCTS.reduce((acc, p) => acc + (cart[p.id] || 0) * p.price, 0);
  const add = (id: string) => setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));

  return (
    <View style={styles.root}>
      <AppHeader sectionTitle="Cantina" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Cantina Shallom</Text>
          <Text style={styles.pageSub}>Faça seu pedido com antecedência e retire sem filas após o culto!</Text>
        </View>

        <View style={styles.statusPill}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Aberta agora (Fecha às 21h30)</Text>
        </View>

        <View style={[styles.searchBar, Shadows.sm]}>
          <Search size={18} color={Colors.outline} />
          <TextInput style={styles.searchInput} placeholder="Buscar no cardápio..." placeholderTextColor={Colors.outline} />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={styles.catContent}>
          {CATEGORIES.map(c => (
            <TouchableOpacity key={c} style={[styles.catChip, activeCat === c && styles.catChipActive]} onPress={() => setActiveCat(c)}>
              <Text style={[styles.catText, activeCat === c && styles.catTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.grid}>
          {filtered.map(p => (
            <View key={p.id} style={[styles.productCard, Shadows.sm]}>
              <View style={styles.productImg}>
                <UtensilsCrossed size={28} color={Colors.outline} />
                {p.tag && <View style={styles.productTag}><Text style={styles.productTagText}>{p.tag}</Text></View>}
              </View>
              <Text style={styles.productName}>{p.name}</Text>
              <View style={styles.productFooter}>
                <Text style={styles.productPrice}>R$ {p.price.toFixed(2).replace('.', ',')}</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => add(p.id)}>
                  <Plus size={20} color={Colors.white} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.paymentInfo, Shadows.sm]}>
          <View style={styles.paymentIcon}><Wallet size={18} color={Colors.primary} /></View>
          <View style={styles.paymentContent}>
            <Text style={styles.paymentTitle}>Pagamento Ágil</Text>
            <Text style={styles.paymentSub}>Pagamento via PIX ou Cartão no balcão de retirada rápida.</Text>
          </View>
        </View>
        <View style={{ height: 140 }} />
      </ScrollView>

      {cartCount > 0 && (
        <View style={[styles.cartBar, Shadows.md]}>
          <View style={styles.cartInfo}>
            <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{cartCount}</Text></View>
            <View>
              <Text style={styles.cartLabel}>VER PEDIDO</Text>
              <Text style={styles.cartTotal}>R$ {cartTotal.toFixed(2).replace('.', ',')}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.cartBtn}>
            <Text style={styles.cartBtnText}>Avançar para Retirada →</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white },
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: 20 },

  pageHeader: { paddingHorizontal: Spacing.gutter, paddingTop: Spacing.xl },
  pageTitle: { fontSize: FontSize.headlineXl, fontWeight: '500', color: Colors.onSurface, letterSpacing: -0.02 },
  pageSub: { fontSize: FontSize.bodySm, color: Colors.onSurfaceVariant, marginTop: 4 },

  statusPill: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.successLight, alignSelf: 'flex-start', marginHorizontal: Spacing.gutter, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.full, marginTop: Spacing.lg },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success },
  statusText: { fontSize: FontSize.labelSm, fontWeight: '500', color: Colors.success },

  searchBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: Spacing.gutter, marginTop: Spacing.lg, backgroundColor: Colors.surfaceContainerLowest, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, height: 44 },
  searchInput: { flex: 1, marginLeft: Spacing.sm, fontSize: FontSize.bodySm, color: Colors.onSurface },

  catScroll: { marginTop: Spacing.lg },
  catContent: { paddingHorizontal: Spacing.gutter, gap: Spacing.sm },
  catChip: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, backgroundColor: Colors.surfaceContainerLowest, ...Shadows.sm },
  catChipActive: { backgroundColor: Colors.primary },
  catText: { fontSize: FontSize.labelMd, fontWeight: '500', color: Colors.onSurfaceVariant },
  catTextActive: { color: Colors.white },

  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.gutter, marginTop: Spacing.lg, gap: Spacing.md },
  productCard: { width: '47%', backgroundColor: Colors.white, borderRadius: BorderRadius.lg, overflow: 'hidden' },
  productImg: { height: 120, backgroundColor: Colors.surfaceContainerLow, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  productTag: { position: 'absolute', top: Spacing.sm, right: Spacing.sm, backgroundColor: Colors.primary, paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.sm },
  productTagText: { color: Colors.white, fontSize: FontSize.labelSm, fontWeight: '500' },
  productName: { fontSize: FontSize.bodySm, fontWeight: '500', color: Colors.onSurface, padding: Spacing.md, paddingBottom: 4 },
  productFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingBottom: Spacing.md },
  productPrice: { fontSize: FontSize.titleMd, fontWeight: '500', color: Colors.onSurface },
  addBtn: { width: 36, height: 36, borderRadius: BorderRadius.full, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },

  paymentInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginHorizontal: Spacing.gutter, marginTop: Spacing.xl, backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.xl },
  paymentIcon: { width: 40, height: 40, borderRadius: BorderRadius.full, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  paymentContent: { flex: 1 },
  paymentTitle: { fontSize: FontSize.labelMd, fontWeight: '500', color: Colors.onSurface },
  paymentSub: { fontSize: FontSize.bodySm, color: Colors.onSurfaceVariant, marginTop: 2 },

  cartBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg, paddingBottom: Spacing.xxl },
  cartInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  cartBadge: { width: 32, height: 32, borderRadius: BorderRadius.full, borderWidth: 2, borderColor: Colors.white, justifyContent: 'center', alignItems: 'center' },
  cartBadgeText: { color: Colors.white, fontWeight: '500', fontSize: FontSize.labelMd },
  cartLabel: { color: 'rgba(255,255,255,0.7)', fontSize: FontSize.labelSm, fontWeight: '500' },
  cartTotal: { color: Colors.white, fontSize: FontSize.titleMd, fontWeight: '500' },
  cartBtn: { backgroundColor: Colors.white, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
  cartBtnText: { color: Colors.primary, fontWeight: '500', fontSize: FontSize.labelMd },
});
