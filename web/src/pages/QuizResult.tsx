import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function QuizResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState<any>(null);

  useEffect(() => { api.get(`/quizzes/${id}/result`).then(r => setResult(r.data.data)).catch(() => {}); }, [id]);

  if (!result) return <div className="loader"><div className="spinner" /></div>;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="page" style={{ textAlign: 'center', paddingTop: 60 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 40 }}>Quiz Completed! 🎯</h1>

        <div className="result-score">
          <div className="result-score-number">{result.totalCorrect}/{result.totalQuestions}</div>
          <div className="result-score-label">Correct</div>
        </div>

        <div className="result-stats">
          <div className="result-stat">
            <div className="result-stat-value">{result.timeTakenSeconds}s</div>
            <div className="result-stat-label">Time Taken</div>
          </div>
          <div className="result-stat">
            <div className="result-stat-value" style={{ color: result.isEligible ? 'var(--success)' : 'var(--error)' }}>{result.isEligible ? 'YES' : 'NO'}</div>
            <div className="result-stat-label">Eligible</div>
          </div>
        </div>

        <div className={`result-message ${result.isEligible ? 'eligible' : 'not-eligible'}`}>
          {result.isEligible ? (
            <>
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>🎉 Congratulations!</h3>
              <p style={{ color: 'var(--text-secondary)' }}>You're eligible for the lucky draw! Winners will be announced shortly.</p>
            </>
          ) : (
            <>
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Better luck next time!</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Answer all correctly to enter the prize draw.</p>
            </>
          )}
        </div>

        <button className="btn btn-primary" onClick={() => navigate('/')}>Back to Home</button>
      </div>
    </div>
  );
}
