import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuthStore } from '../store/auth';

export default function Home() {
  const user = useAuthStore((s) => s.user);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/quizzes?status=upcoming').then(r => setQuizzes(r.data.data || [])).catch(() => {});
  }, []);

  return (
    <div className="page">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800 }}>Hello, {user?.name || 'Player'} 👋</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>Ready to win today?</p>
      </div>

      <div className="hero-banner">
        <h2>🎉 Mega Sunday Quiz!</h2>
        <p>Prize pool up to</p>
        <div className="hero-amount">₹50,000</div>
      </div>

      <div className="section-title">
        Live & Upcoming
        <span className="see-all" onClick={() => navigate('/quizzes')}>See All →</span>
      </div>

      <div className="quiz-grid">
        {quizzes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎮</div>
            <p>No quizzes right now. Stay tuned!</p>
          </div>
        ) : quizzes.slice(0, 3).map((q) => (
          <div key={q.id} className="card card-clickable quiz-card" onClick={() => navigate(`/quiz/${q.id}`)}>
            <div className="quiz-card-header">
              <span className="quiz-category">{q.category}</span>
              <span className={`quiz-status ${q.status}`}>{q.status}</span>
            </div>
            <div className="quiz-title">{q.title}</div>
            <div className="quiz-stats">
              <div className="quiz-stat"><div className="quiz-stat-label">Entry</div><div className="quiz-stat-value">₹{q.entryFee}</div></div>
              <div className="quiz-stat"><div className="quiz-stat-label">Pool</div><div className="quiz-stat-value">{q.prizePoolPercentage}%</div></div>
              <div className="quiz-stat"><div className="quiz-stat-label">Joined</div><div className="quiz-stat-value">{q.currentParticipants}/{q.maxParticipants}</div></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
