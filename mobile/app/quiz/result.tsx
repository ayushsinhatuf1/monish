import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { api } from '../../src/services/api';
import { colors } from '../../src/theme/colors';

export default function ResultScreen() {
  const { quizId } = useLocalSearchParams<{ quizId: string }>();
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetchResult();
  }, [quizId]);

  const fetchResult = async () => {
    try {
      const res = await api.get(`/quizzes/${quizId}/result`);
      setResult(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  if (!result) return null;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Quiz Completed!</Text>
        
        <View style={styles.scoreCard}>
          <Text style={styles.scoreText}>
            {result.totalCorrect} / {result.totalQuestions}
          </Text>
          <Text style={styles.scoreLabel}>Correct Answers</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{result.timeTakenSeconds}s</Text>
            <Text style={styles.statLabel}>Time Taken</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: result.isEligible ? colors.success : colors.error }]}>
              {result.isEligible ? 'YES' : 'NO'}
            </Text>
            <Text style={styles.statLabel}>Eligible for Draw</Text>
          </View>
        </View>

        {result.isEligible ? (
          <View style={[styles.messageBox, styles.messageSuccess]}>
            <Text style={styles.messageTitle}>🎉 Congratulations!</Text>
            <Text style={styles.messageText}>
              You answered all questions correctly and are eligible for the lucky draw! Winners will be announced shortly.
            </Text>
          </View>
        ) : (
          <View style={[styles.messageBox, styles.messageFail]}>
            <Text style={styles.messageTitle}>Better luck next time!</Text>
            <Text style={styles.messageText}>
              You need to answer all questions correctly to be eligible for the prize pool draw.
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity 
        style={styles.homeButton}
        onPress={() => router.replace('/(tabs)')}
      >
        <Text style={styles.homeButtonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 40,
  },
  scoreCard: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    elevation: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.textInverse,
  },
  scoreLabel: {
    fontSize: 16,
    color: colors.textInverse,
    opacity: 0.9,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 32,
    width: '100%',
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
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  messageBox: {
    padding: 20,
    borderRadius: 12,
    width: '100%',
  },
  messageSuccess: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#34D399',
  },
  messageFail: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#F87171',
  },
  messageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.text,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  homeButton: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  homeButtonText: {
    color: colors.textInverse,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
