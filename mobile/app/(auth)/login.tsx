import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { api } from '../../src/services/api';
import { colors } from '../../src/theme/colors';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Send OTP API call
      const res = await api.post('/auth/send-otp', { phone });
      
      // In dev mode, the backend returns the OTP in the response for easy testing
      const devOtp = res.data.data?.otp;
      
      router.push({
        pathname: '/(auth)/otp',
        params: { phone, devOtp }
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Monish</Text>
        <Text style={styles.subtitle}>Enter your phone number to get started</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.prefix}>+91</Text>
          <TextInput
            style={styles.input}
            placeholder="Mobile Number"
            keyboardType="numeric"
            maxLength={10}
            value={phone}
            onChangeText={(text) => {
              setPhone(text.replace(/[^0-9]/g, ''));
              setError('');
            }}
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity 
          style={[styles.button, loading || phone.length !== 10 ? styles.buttonDisabled : null]} 
          onPress={handleSendOtp}
          disabled={loading || phone.length !== 10}
        >
          {loading ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <Text style={styles.buttonText}>Get OTP</Text>
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
    fontSize: 42,
    fontWeight: 'bold',
    color: colors.primary,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: colors.surface,
  },
  prefix: {
    fontSize: 18,
    color: colors.text,
    marginRight: 12,
    fontWeight: '500',
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: colors.text,
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
  },
});
