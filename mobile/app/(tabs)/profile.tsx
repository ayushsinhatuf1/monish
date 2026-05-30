import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../src/stores/auth.store';
import { colors } from '../../src/theme/colors';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <TouchableOpacity style={styles.loginBtn} onPress={() => router.replace('/(auth)/login')}>
          <Text style={styles.loginBtnText}>Login to view profile</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarInitial}>{user.name ? user.name.charAt(0) : 'U'}</Text>
        </View>
        <Text style={styles.name}>{user.name || 'User'}</Text>
        <Text style={styles.phone}>+91 {user.phone}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>₹{user.totalWinnings || 0}</Text>
          <Text style={styles.statLabel}>Total Won</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Referral</Text>
        <View style={styles.referralCard}>
          <Text style={styles.referralLabel}>Your Referral Code:</Text>
          <Text style={styles.referralCode}>{user.referralCode}</Text>
          <Text style={styles.referralHint}>Share this code with friends to earn bonus!</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loginBtn: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
  },
  loginBtnText: {
    color: colors.textInverse,
    fontWeight: 'bold',
  },
  header: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarInitial: {
    color: colors.textInverse,
    fontSize: 48,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  phone: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  statsContainer: {
    padding: 20,
  },
  statBox: {
    backgroundColor: colors.surface,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  referralCard: {
    backgroundColor: '#F3F4F6',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  referralLabel: {
    color: colors.textSecondary,
    marginBottom: 8,
  },
  referralCode: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 4,
    color: colors.text,
    marginBottom: 12,
  },
  referralHint: {
    fontSize: 14,
    color: colors.primary,
    textAlign: 'center',
  },
  logoutBtn: {
    margin: 20,
    marginTop: 'auto',
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F87171',
  },
  logoutText: {
    color: colors.error,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
