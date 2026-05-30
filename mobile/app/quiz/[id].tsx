import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { api } from '../../src/services/api';
import { colors } from '../../src/theme/colors';
import { Quiz } from '@monish/shared';
import { useAuthStore } from '../../src/stores/auth.store';

export default function QuizDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    fetchQuizDetail();
  }, [id]);

  const fetchQuizDetail = async () => {
    try {
      const res = await api.get(`/quizzes/${id}`);
      setQuiz(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = () => {
    if (!user) {
      router.push('/(auth)/login');
      return;
    }
    router.push({
      pathname: '/quiz/payment',
      params: { quizId: id, entryFee: quiz.entryFee, title: quiz.title },
    });
  };

  if (loading || !quiz) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.category}>{quiz.category.toUpperCase()}</Text>
          <Text style={styles.title}>{quiz.title}</Text>
          <Text style={styles.description}>{quiz.description}</Text>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Entry Fee</Text>
            <Text style={styles.statValue}>₹{quiz.entryFee}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Participants</Text>
            <Text style={styles.statValue}>{quiz.currentParticipants} / {quiz.maxParticipants}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prize Pool ({quiz.prizePoolPercentage}%)</Text>
          {quiz.prizeStructure?.map((prize: any, index: number) => (
            <View key={index} style={styles.prizeRow}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>{prize.rankLabel}</Text>
              </View>
              <View style={styles.prizeInfo}>
                <Text style={styles.prizeValue}>₹{prize.prizeValue}</Text>
                <Text style={styles.prizeDesc}>{prize.prizeDescription}</Text>
              </View>
              <Text style={styles.winnerCount}>x{prize.winnerCount} Winners</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.joinButton, 
            (quiz.hasJoined || quiz.currentParticipants >= quiz.maxParticipants) && styles.disabledButton
          ]}
          onPress={handleJoin}
          disabled={quiz.hasJoined || quiz.currentParticipants >= quiz.maxParticipants}
        >
          <Text style={styles.joinButtonText}>
            {quiz.hasJoined ? 'Already Joined' : quiz.currentParticipants >= quiz.maxParticipants ? 'Quiz Full' : `Pay ₹${quiz.entryFee} & Join`}
          </Text>
        </TouchableOpacity>
      </View>
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
  scroll: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
    marginTop: 40,
  },
  category: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  prizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rankBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 16,
    width: 80,
    alignItems: 'center',
  },
  rankText: {
    color: colors.textInverse,
    fontWeight: 'bold',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  prizeInfo: {
    flex: 1,
  },
  prizeValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  prizeDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  winnerCount: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  joinButton: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: colors.border,
  },
  joinButtonText: {
    color: colors.textInverse,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
