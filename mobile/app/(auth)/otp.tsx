import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { api } from '../../src/services/api';
import { useAuthStore } from '../../src/stores/auth.store';
import { colors } from '../../src/theme/colors';

export default function OtpScreen() {
  const { phone, devOtp } = useLocalSearchParams<{ phone: string; devOtp?: string }>();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const login = useAuthStore((state) => state.login);

  // Auto-fill OTP in dev mode
  useEffect(() => {
    if (devOtp) {
      setOtp(devOtp);
    }
  }, [devOtp]);

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const res = await api.post('/auth/verify-otp', { phone, otp });
      const { user, tokens, isNewUser } = res.data.data;
      
      await login(user, tokens);

      if (isNewUser) {
        // router.replace('/(auth)/profile-setup'); // Implement later
        router.replace('/(tabs)');
      } else {
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>Sent to +91 {phone}</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="000000"
          keyboardType="numeric"
          maxLength={6}
          value={otp}
          onChangeText={(text) => {
            setOtp(text.replace(/[^0-9]/g, ''));
            setError('');
          }}
          textAlign="center"
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity 
          style={[styles.button, loading || otp.length !== 6 ? styles.buttonDisabled : null]} 
          onPress={handleVerifyOtp}
          disabled={loading || otp.length !== 6}
        >
          {loading ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <Text style={styles.buttonText}>Verify & Continue</Text>
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
    justifyContent: 'center',
  },
  header: {
    marginBottom: 48,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 64,
    backgroundColor: colors.surface,
    fontSize: 32,
    letterSpacing: 8,
    color: colors.text,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.textInverse,
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
  },
});
