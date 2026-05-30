import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSend = async () => {
    if (phone.length !== 10) { setError('Enter a valid 10-digit number'); return; }
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/send-otp', { phone });
      const devOtp = res.data.data?.otp;
      navigate('/otp', { state: { phone, devOtp } });
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1 className="auth-title">Monish</h1>
        <p className="auth-subtitle">Enter your phone number to get started</p>

        <div className="input-group" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex' }}>
            <span className="input-prefix">+91</span>
            <input
              className="input-field input-with-prefix"
              style={{ flex: 1, fontSize: 20, letterSpacing: 2 }}
              placeholder="Mobile Number"
              maxLength={10}
              value={phone}
              onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '')); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
          </div>
        </div>

        {error && <p className="error-text">{error}</p>}

        <button
          className="btn btn-primary"
          onClick={handleSend}
          disabled={loading || phone.length !== 10}
          style={{ marginTop: 16 }}
        >
          {loading ? 'Sending...' : 'Get OTP'}
        </button>
      </div>
    </div>
  );
}
