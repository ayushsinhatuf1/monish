import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function Quizzes() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/quizzes?status=upcoming').then(r => setQuizzes(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  return (
    <div className="page">
      <h1 className="section-title" style={{ marginBottom: 28 }}>Browse Quizzes</h1>
      <div className="quiz-grid">
        {quizzes.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">📝</div><p>No quizzes available right now.</p></div>
        ) : quizzes.map((q) => (
          <div key={q.id} className="card card-clickable quiz-card" onClick={() => navigate(`/quiz/${q.id}`)}>
            <div className="quiz-card-header">
              <span className="quiz-category">{q.category}</span>
              <span className={`quiz-status ${q.status}`}>{q.status}</span>
            </div>
            <div className="quiz-title">{q.title}</div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{q.description}</p>
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
