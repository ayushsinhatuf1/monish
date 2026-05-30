import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

export default function Profile() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  if (!user) {
    return (
      <div className="page" style={{ textAlign: 'center', paddingTop: 100 }}>
        <div className="empty-state-icon" style={{ fontSize: 64 }}>👤</div>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Login to view your profile</p>
        <button className="btn btn-primary" style={{ maxWidth: 300, margin: '0 auto' }} onClick={() => navigate('/login')}>Login</button>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="profile-header">
        <div className="profile-avatar">{user.name?.charAt(0) || 'U'}</div>
        <div className="profile-name">{user.name || 'User'}</div>
        <div className="profile-phone">+91 {user.phone}</div>
      </div>

      <div className="card" style={{ textAlign: 'center', padding: 24, marginBottom: 24 }}>
        <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--primary)' }}>₹{user.totalWinnings || 0}</div>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>Total Winnings</div>
      </div>

      <div className="referral-card" style={{ marginBottom: 24 }}>
        <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Your Referral Code</div>
        <div className="referral-code">{user.referralCode}</div>
        <div style={{ fontSize: 14, color: 'var(--primary)' }}>Share this code with friends to earn bonus!</div>
      </div>

      <button
        className="btn btn-outline"
        style={{ borderColor: 'var(--error)', color: 'var(--error)' }}
        onClick={handleLogout}
      >
        Log Out
      </button>
    </div>
  );
}
