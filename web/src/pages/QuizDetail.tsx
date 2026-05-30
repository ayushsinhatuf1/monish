import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuthStore } from '../store/auth';

export default function QuizDetail() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState<any>(null);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();

  useEffect(() => { api.get(`/quizzes/${id}`).then(r => setQuiz(r.data.data)).catch(() => {}); }, [id]);

  if (!quiz) return <div className="loader"><div className="spinner" /></div>;

  const handleJoin = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setJoining(true);
    setError('');

    try {
      // Step 1: Join the quiz (pay entry fee from wallet)
      await api.post(`/quizzes/${id}/join`);
      
      // Step 2: Navigate to play screen
      navigate(`/quiz/${id}/play`);
    } catch (e: any) {
      const msg = e.response?.data?.error || 'Failed to join quiz';
      setError(msg);
      
      // If already joined, go straight to play
      if (msg.includes('already joined') || msg.includes('Already joined')) {
        navigate(`/quiz/${id}/play`);
      }
    } finally {
      setJoining(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="page">
        <button className="btn btn-outline btn-sm" onClick={() => navigate(-1)} style={{ width: 'auto', marginBottom: 24 }}>← Back</button>

        <span className="quiz-category">{quiz.category}</span>
        <h1 style={{ fontSize: 32, fontWeight: 900, margin: '12px 0' }}>{quiz.title}</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>{quiz.description}</p>

        <div className="quiz-stats" style={{ marginBottom: 32 }}>
          <div className="quiz-stat"><div className="quiz-stat-label">Entry Fee</div><div className="quiz-stat-value">₹{quiz.entryFee}</div></div>
          <div className="quiz-stat"><div className="quiz-stat-label">Participants</div><div className="quiz-stat-value">{quiz.currentParticipants}/{quiz.maxParticipants}</div></div>
        </div>

        {quiz.prizeStructure?.length > 0 && (
          <>
            <h2 className="section-title">Prize Pool ({quiz.prizePoolPercentage}%)</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>
              {quiz.prizeStructure.map((p: any, i: number) => (
                <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16 }}>
                  <div style={{ background: 'var(--gradient-primary)', padding: '6px 14px', borderRadius: 8, fontWeight: 700, fontSize: 12, color: 'white', textTransform: 'uppercase' }}>{p.rankLabel}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 18 }}>₹{p.prizeValue}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.prizeDescription}</div>
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>x{p.winnerCount}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {!isAuthenticated && (
          <div style={{ background: 'rgba(255,107,0,0.1)', border: '1px solid rgba(255,107,0,0.3)', borderRadius: 12, padding: 16, marginBottom: 16, textAlign: 'center' }}>
            <p style={{ color: 'var(--primary)', fontWeight: 600 }}>⚠️ You need to login first to join this quiz</p>
          </div>
        )}

        {error && <p className="error-text" style={{ textAlign: 'center', marginBottom: 16 }}>{error}</p>}

        <button className="btn btn-primary" onClick={handleJoin} disabled={joining}>
          {joining ? 'Joining...' : !isAuthenticated ? 'Login to Join' : `Pay ₹${quiz.entryFee} & Join`}
        </button>
      </div>
    </div>
  );
}
