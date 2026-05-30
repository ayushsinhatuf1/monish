import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { api } from '../../src/services/api';
import { colors } from '../../src/theme/colors';
import { useAuthStore } from '../../src/stores/auth.store';

export default function WalletScreen() {
  const user = useAuthStore((state) => state.user);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await api.get('/wallet/transactions');
      setTransactions(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const renderTransaction = ({ item }: { item: any }) => (
    <View style={styles.txRow}>
      <View style={styles.txIconContainer}>
        <Text style={{ fontSize: 20 }}>{item.type === 'credit' ? '↓' : '↑'}</Text>
      </View>
      <View style={styles.txDetails}>
        <Text style={styles.txTitle}>{item.description}</Text>
        <Text style={styles.txDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
      <View style={styles.txAmountContainer}>
        <Text style={[styles.txAmount, { color: item.type === 'credit' ? colors.success : colors.text }]}>
          {item.type === 'credit' ? '+' : '-'}₹{item.amount}
        </Text>
        <Text style={styles.txStatus}>{item.status}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wallet</Text>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text style={styles.balanceAmount}>₹{user?.walletBalance || 0}</Text>
        
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.button, styles.addMoneyBtn]}>
            <Text style={styles.addMoneyText}>Add Money</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.withdrawBtn]}>
            <Text style={styles.withdrawText}>Withdraw</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>Transaction History</Text>
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={transactions}
            keyExtractor={(item) => item.id}
            renderItem={renderTransaction}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No transactions yet</Text>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  balanceCard: {
    margin: 20,
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 24,
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    marginBottom: 8,
  },
  balanceAmount: {
    color: colors.textInverse,
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMoneyBtn: {
    backgroundColor: colors.textInverse,
  },
  addMoneyText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  withdrawBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  withdrawText: {
    color: colors.textInverse,
    fontWeight: 'bold',
    fontSize: 16,
  },
  historySection: {
    flex: 1,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  list: {
    paddingBottom: 20,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  txIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  txDetails: {
    flex: 1,
  },
  txTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  txDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  txAmountContainer: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  txStatus: {
    fontSize: 10,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 40,
  },
});
