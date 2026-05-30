import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { api } from '../../src/services/api';
import { colors } from '../../src/theme/colors';

export default function QuizzesScreen() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      // Just fetching upcoming and filling quizzes for now
      const res = await api.get('/quizzes?status=upcoming');
      setQuizzes(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const renderQuizItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push({ pathname: '/quiz/[id]', params: { id: item.id } })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.category}>{item.category.toUpperCase()}</Text>
        <View style={[styles.statusBadge, item.status === 'filling' && styles.statusFilling]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.title}>{item.title}</Text>
      
      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.label}>Entry</Text>
          <Text style={styles.value}>₹{item.entryFee}</Text>
        </View>
        <View style={styles.divider} />
        <View>
          <Text style={styles.label}>Pool</Text>
          <Text style={styles.value}>{item.prizePoolPercentage}%</Text>
        </View>
        <View style={styles.divider} />
        <View>
          <Text style={styles.label}>Joined</Text>
          <Text style={styles.value}>{item.currentParticipants}/{item.maxParticipants}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Browse Quizzes</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={quizzes}
          keyExtractor={(item) => item.id}
          renderItem={renderQuizItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No quizzes available right now.</Text>
            </View>
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
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  category: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  statusBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusFilling: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.text,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
  },
  label: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  divider: {
    width: 1,
    backgroundColor: colors.border,
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
  },
});
