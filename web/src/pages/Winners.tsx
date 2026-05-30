import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function Winners() {
  const [winners, setWinners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/winners').then(r => setWinners(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  return (
    <div className="page">
      <h1 className="section-title" style={{ marginBottom: 28 }}>🏆 Recent Winners</h1>
      <div className="quiz-grid">
        {winners.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">🏆</div><p>No winners announced yet. Be the first!</p></div>
        ) : winners.map((w) => (
          <div key={w.id} className="card winner-card">
            <div className="winner-avatar">{w.user?.name?.charAt(0) || '?'}</div>
            <div className="winner-info">
              <div className="winner-name">{w.user?.name || 'Anonymous'}</div>
              <div className="winner-quiz">{w.quiz?.title}</div>
            </div>
            <div className="winner-prize">
              <div className="winner-rank">{w.rankLabel}</div>
              <div className="winner-amount">₹{w.prizeValue}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
