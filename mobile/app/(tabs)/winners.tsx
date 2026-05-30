import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { api } from '../../src/services/api';
import { colors } from '../../src/theme/colors';

export default function WinnersScreen() {
  const [winners, setWinners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWinners();
  }, []);

  const fetchWinners = async () => {
    try {
      const res = await api.get('/winners');
      setWinners(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const renderWinner = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarInitial}>{item.user?.name?.charAt(0) || '?'}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.user?.name || 'Anonymous User'}</Text>
        <Text style={styles.quizTitle}>Quiz: {item.quiz?.title}</Text>
      </View>
      <View style={styles.prizeBadge}>
        <Text style={styles.prizeRank}>{item.rankLabel}</Text>
        <Text style={styles.prizeValue}>₹{item.prizeValue}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Recent Winners</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={winners}
          keyExtractor={(item) => item.id}
          renderItem={renderWinner}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No winners announced yet. Be the first!</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    padding: 24,
    paddingTop: 60,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  list: {
    padding: 16,
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarInitial: {
    color: colors.textInverse,
    fontSize: 24,
    fontWeight: 'bold',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  quizTitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  prizeBadge: {
    alignItems: 'flex-end',
  },
  prizeRank: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  prizeValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 40,
    fontSize: 16,
  },
});
