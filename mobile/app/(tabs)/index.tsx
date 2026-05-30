import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { colors } from '../../src/theme/colors';
import { useAuthStore } from '../../src/stores/auth.store';

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name || 'Player'} 👋</Text>
            <Text style={styles.subtitle}>Ready to win today?</Text>
          </View>
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Wallet</Text>
            <Text style={styles.balanceAmount}>₹{user?.walletBalance || 0}</Text>
          </View>
        </View>

        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Mega Sunday Quiz!</Text>
          <Text style={styles.bannerSubtitle}>Prize pool up to ₹50,000</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Live Quizzes</Text>
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No live quizzes at the moment.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming</Text>
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Stay tuned for upcoming quizzes.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  balanceContainer: {
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  banner: {
    backgroundColor: colors.primary,
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
  },
  bannerTitle: {
    color: colors.textInverse,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bannerSubtitle: {
    color: colors.textInverse,
    fontSize: 14,
    opacity: 0.9,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: colors.surface,
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    color: colors.textSecondary,
  },
});
