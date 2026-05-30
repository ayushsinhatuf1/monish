import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

interface Question {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  timeLimitSeconds: number;
}

export default function QuizPlay() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [answers, setAnswers] = useState<{ questionId: string; selectedOption: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef<any>(null);
  const timeRef = useRef(15);

  useEffect(() => {
    api.get(`/quizzes/${id}/questions`).then(r => setQuestions(r.data.data?.questions || [])).catch(() => navigate('/'));
  }, [id]);

  useEffect(() => {
    if (questions.length > 0 && !submitting) startTimer();
    return () => clearInterval(timerRef.current);
  }, [idx, questions]);

  const startTimer = () => {
    clearInterval(timerRef.current);
    const limit = questions[idx]?.timeLimitSeconds || 15;
    setTimeLeft(limit); timeRef.current = limit;
    timerRef.current = setInterval(() => {
      timeRef.current -= 1;
      setTimeLeft(timeRef.current);
      if (timeRef.current <= 0) { clearInterval(timerRef.current); handleAnswer('A'); }
    }, 1000);
  };

  const handleAnswer = (option: string) => {
    clearInterval(timerRef.current);
    const newAnswers = [...answers, { questionId: questions[idx].id, selectedOption: option }];
    setAnswers(newAnswers);
    if (idx < questions.length - 1) { setIdx(idx + 1); }
    else { submitQuiz(newAnswers); }
  };

  const submitQuiz = async (finalAnswers: any[]) => {
    setSubmitting(true);
    try {
      await api.post(`/quizzes/${id}/submit`, { answers: finalAnswers });
      navigate(`/quiz/${id}/result`);
    } catch { navigate('/'); }
  };

  if (!questions.length) return <div className="loader"><div className="spinner" /></div>;
  const q = questions[idx];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="page">
        <div className="play-header">
          <div className="play-progress">Question {idx + 1} of {questions.length}</div>
          <div className={`play-timer ${timeLeft <= 5 ? 'danger' : ''}`}>{timeLeft}s</div>
        </div>

        <div className="question-card">
          <div className="question-text">{q.questionText}</div>
        </div>

        <div className="options-grid">
          {[{ id: 'A', text: q.optionA }, { id: 'B', text: q.optionB }, { id: 'C', text: q.optionC }, { id: 'D', text: q.optionD }].map(opt => (
            <button key={opt.id} className="option-btn" onClick={() => handleAnswer(opt.id)} disabled={submitting}>
              <span className="option-badge">{opt.id}</span>
              <span>{opt.text}</span>
            </button>
          ))}
        </div>

        {submitting && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(11,15,26,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
            <div style={{ textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto 16px' }} />
              <p style={{ fontSize: 20, fontWeight: 700 }}>Submitting...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
