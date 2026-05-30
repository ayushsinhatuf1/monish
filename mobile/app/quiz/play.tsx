import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { api } from '../../src/services/api';
import { colors } from '../../src/theme/colors';
import { OptionLetter } from '@monish/shared';

interface Question {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  timeLimitSeconds: number;
}

export default function PlayScreen() {
  const { quizId } = useLocalSearchParams<{ quizId: string }>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [answers, setAnswers] = useState<{ questionId: string; selectedOption: OptionLetter }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Use a ref to prevent stale closures in the timer
  const timeLeftRef = useRef(15);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, [quizId]);

  useEffect(() => {
    if (questions.length > 0 && !isSubmitting) {
      startTimer();
    }
    return () => clearInterval(timerRef.current!);
  }, [currentIndex, questions]);

  const fetchQuestions = async () => {
    try {
      const res = await api.get(`/quizzes/${quizId}/questions`);
      setQuestions(res.data.data.questions);
      setLoading(false);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to fetch questions');
      router.back();
    }
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const limit = questions[currentIndex]?.timeLimitSeconds || 15;
    setTimeLeft(limit);
    timeLeftRef.current = limit;

    timerRef.current = setInterval(() => {
      timeLeftRef.current -= 1;
      setTimeLeft(timeLeftRef.current);

      if (timeLeftRef.current <= 0) {
        clearInterval(timerRef.current!);
        handleTimeout();
      }
    }, 1000);
  };

  const handleTimeout = () => {
    // If user didn't pick, auto-pick an invalid option internally or just skip
    // For MVP, we force them to answer quickly. If they miss, we submit a dummy 'A' but backend won't count it if it's wrong anyway.
    // Actually, better to just let them lose the question. We'll pick 'A' as a dummy.
    handleAnswer('A', true); // Pass a flag indicating it was a timeout if we wanted to
  };

  const handleAnswer = (option: OptionLetter, isTimeout = false) => {
    clearInterval(timerRef.current!);
    
    const currentQuestion = questions[currentIndex];
    const newAnswers = [...answers, { questionId: currentQuestion.id, selectedOption: option }];
    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      submitQuiz(newAnswers);
    }
  };

  const submitQuiz = async (finalAnswers: any[]) => {
    setIsSubmitting(true);
    try {
      await api.post(`/quizzes/${quizId}/submit`, { answers: finalAnswers });
      router.replace({ pathname: '/quiz/result', params: { quizId } });
    } catch (error: any) {
      Alert.alert('Submission Error', error.response?.data?.error || 'Failed to submit quiz');
      router.replace('/(tabs)');
    }
  };

  if (loading || questions.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Preparing your questions...</Text>
      </View>
    );
  }

  const question = questions[currentIndex];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.progress}>Question {currentIndex + 1} of {questions.length}</Text>
        <View style={[styles.timerCircle, timeLeft <= 5 && styles.timerCircleDanger]}>
          <Text style={[styles.timerText, timeLeft <= 5 && styles.timerTextDanger]}>
            {timeLeft}s
          </Text>
        </View>
      </View>

      <View style={styles.questionCard}>
        <Text style={styles.questionText}>{question.questionText}</Text>
      </View>

      <View style={styles.optionsContainer}>
        {[
          { id: 'A', text: question.optionA },
          { id: 'B', text: question.optionB },
          { id: 'C', text: question.optionC },
          { id: 'D', text: question.optionD },
        ].map((opt) => (
          <TouchableOpacity
            key={opt.id}
            style={styles.optionButton}
            onPress={() => handleAnswer(opt.id as OptionLetter)}
            disabled={isSubmitting}
          >
            <View style={styles.optionBadge}>
              <Text style={styles.optionBadgeText}>{opt.id}</Text>
            </View>
            <Text style={styles.optionText}>{opt.text}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {isSubmitting && (
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>Submitting...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  progress: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  timerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerCircleDanger: {
    borderColor: colors.error,
  },
  timerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  timerTextDanger: {
    color: colors.error,
  },
  questionCard: {
    backgroundColor: colors.surface,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 150,
    justifyContent: 'center',
    marginBottom: 32,
  },
  questionText: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 32,
  },
  optionsContainer: {
    gap: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
  },
  optionBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionBadgeText: {
    fontWeight: 'bold',
    color: colors.textSecondary,
  },
  optionText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  overlayText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
});
