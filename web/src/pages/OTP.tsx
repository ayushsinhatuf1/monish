import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuthStore } from '../store/auth';

export default function OTP() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);
  const { phone, devOtp } = (location.state as any) || {};

  useEffect(() => { if (devOtp) setOtp(devOtp); }, [devOtp]);
  useEffect(() => { if (!phone) navigate('/login'); }, [phone]);

  const handleVerify = async () => {
    if (otp.length !== 6) { setError('Enter 6-digit OTP'); return; }
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/verify-otp', { phone, otp });
      const { user, tokens } = res.data.data;
      login(user, tokens);
      navigate('/');
    } catch (e: any) {
      setError(e.response?.data?.error || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1 style={{ fontSize: 32, fontWeight: 800, textAlign: 'center', marginBottom: 8 }}>Verify OTP</h1>
        <p className="auth-subtitle">Sent to +91 {phone}</p>

        <div className="input-group" style={{ marginBottom: 16 }}>
          <input
            className="input-field otp-input"
            placeholder="000000"
            maxLength={6}
            value={otp}
            onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
          />
        </div>

        {error && <p className="error-text" style={{ textAlign: 'center' }}>{error}</p>}

        <button className="btn btn-primary" onClick={handleVerify} disabled={loading || otp.length !== 6} style={{ marginTop: 16 }}>
          {loading ? 'Verifying...' : 'Verify & Continue'}
        </button>
      </div>
    </div>
  );
}
