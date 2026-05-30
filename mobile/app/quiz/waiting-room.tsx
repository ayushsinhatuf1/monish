import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { io, Socket } from 'socket.io-client';
import { colors } from '../../src/theme/colors';
import { SOCKET_EVENTS } from '@monish/shared';
import { api } from '../../src/services/api';

export default function WaitingRoomScreen() {
  const { quizId, title } = useLocalSearchParams<{ quizId: string; title: string }>();
  const [participantCount, setParticipantCount] = useState(0);
  const [status, setStatus] = useState('Waiting for players...');
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // 1. Fetch initial count
    fetchStatus();

    // 2. Connect to socket
    // In prod, use the base URL without /api
    const socketUrl = api.defaults.baseURL?.replace('/api', '') || 'http://localhost:3000';
    const newSocket = io(socketUrl);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit(SOCKET_EVENTS.JOIN_QUIZ_ROOM, quizId);
    });

    // Listen for participant updates
    newSocket.on(SOCKET_EVENTS.QUIZ_PARTICIPANT_JOINED, (data: { count: number }) => {
      setParticipantCount(data.count);
    });

    // Listen for quiz start
    newSocket.on(SOCKET_EVENTS.QUIZ_STARTED, () => {
      setStatus('Quiz is starting!');
      setTimeout(() => {
        router.replace({
          pathname: '/quiz/play',
          params: { quizId }
        });
      }, 2000);
    });

    // Listen for quiz cancelled
    newSocket.on(SOCKET_EVENTS.QUIZ_CANCELLED, () => {
      setStatus('Quiz was cancelled. Refund processed.');
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 3000);
    });

    return () => {
      newSocket.emit(SOCKET_EVENTS.LEAVE_QUIZ_ROOM, quizId);
      newSocket.disconnect();
    };
  }, [quizId]);

  const fetchStatus = async () => {
    try {
      const res = await api.get(`/quizzes/${quizId}`);
      setParticipantCount(res.data.data.currentParticipants);
      if (res.data.data.status === 'active') {
        router.replace({ pathname: '/quiz/play', params: { quizId } });
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        
        <View style={styles.circle}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.count}>{participantCount}</Text>
          <Text style={styles.countLabel}>Joined</Text>
        </View>

        <Text style={styles.status}>{status}</Text>
        <Text style={styles.hint}>Do not close this app or leave this screen.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 48,
  },
  circle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 48,
    backgroundColor: colors.surface,
  },
  count: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 16,
  },
  countLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  status: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  hint: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
