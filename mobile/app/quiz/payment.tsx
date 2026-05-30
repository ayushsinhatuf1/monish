import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { api } from '../../src/services/api';
import { colors } from '../../src/theme/colors';
import { useAuthStore } from '../../src/stores/auth.store';

export default function PaymentScreen() {
  const { quizId, entryFee, title } = useLocalSearchParams<{ quizId: string; entryFee: string; title: string }>();
  const [loading, setLoading] = useState(false);
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  const handlePayAndJoin = async () => {
    const fee = Number(entryFee);
    
    if (user && user.walletBalance < fee) {
      Alert.alert(
        'Insufficient Balance',
        `You need ₹${fee} to join. Your balance is ₹${user.walletBalance}. Please add money to your wallet.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add Money', onPress: () => router.push('/(tabs)/wallet') }
        ]
      );
      return;
    }

    setLoading(true);
    try {
      await api.post(`/quizzes/${quizId}/join`);
      
      // Update local wallet balance
      if (user) {
        updateUser({ walletBalance: user.walletBalance - fee });
      }
      
      // Navigate to waiting room
      router.replace({
        pathname: '/quiz/waiting-room',
        params: { quizId, title }
      });
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to join quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Confirm Entry</Text>
        <Text style={styles.subtitle}>{title}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Entry Fee</Text>
          <Text style={styles.value}>₹{entryFee}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>Available Balance</Text>
          <Text style={styles.balance}>₹{user?.walletBalance || 0}</Text>
        </View>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          The entry fee will be deducted directly from your wallet balance.
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.payButton} 
          onPress={handlePayAndJoin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <Text style={styles.payButtonText}>Pay & Join</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
  },
  header: {
    marginTop: 40,
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  label: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  balance: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
  },
  infoBox: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
  },
  infoText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    marginTop: 'auto',
    marginBottom: 20,
    gap: 16,
  },
  cancelButton: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  payButton: {
    flex: 2,
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  payButtonText: {
    color: colors.textInverse,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
