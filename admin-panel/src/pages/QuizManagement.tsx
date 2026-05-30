import React, { useState } from 'react';

export default function QuizManagement() {
  const [quizzes, setQuizzes] = useState([
    { id: '1', title: 'Mega Sunday Quiz', category: 'General', status: 'upcoming', fee: 50, joined: 120, max: 500 },
    { id: '2', title: 'Tech Trivia', category: 'Technology', status: 'active', fee: 20, joined: 50, max: 50 },
    { id: '3', title: 'Bollywood Bonanza', category: 'Entertainment', status: 'completed', fee: 10, joined: 100, max: 100 },
  ]);

  return (
    <div className="p-4">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 className="text-2xl font-bold" style={{ color: '#FF6B00', margin: 0 }}>Quiz Management</h2>
        <button style={{ backgroundColor: '#FF6B00', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}>
          + Create Quiz
        </button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#1a1a1a', borderRadius: '10px', overflow: 'hidden' }}>
        <thead style={{ backgroundColor: '#333' }}>
          <tr>
            <th style={{ padding: '15px', textAlign: 'left' }}>Title</th>
            <th style={{ padding: '15px', textAlign: 'left' }}>Category</th>
            <th style={{ padding: '15px', textAlign: 'left' }}>Entry Fee</th>
            <th style={{ padding: '15px', textAlign: 'left' }}>Participants</th>
            <th style={{ padding: '15px', textAlign: 'left' }}>Status</th>
            <th style={{ padding: '15px', textAlign: 'left' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {quizzes.map((q) => (
            <tr key={q.id} style={{ borderBottom: '1px solid #333' }}>
              <td style={{ padding: '15px' }}>{q.title}</td>
              <td style={{ padding: '15px' }}>{q.category}</td>
              <td style={{ padding: '15px' }}>₹{q.fee}</td>
              <td style={{ padding: '15px' }}>{q.joined}/{q.max}</td>
              <td style={{ padding: '15px' }}>
                <span style={{ 
                  padding: '5px 10px', 
                  borderRadius: '15px', 
                  fontSize: '12px',
                  backgroundColor: q.status === 'active' ? '#10B98120' : '#FFB80020',
                  color: q.status === 'active' ? '#10B981' : '#FFB800'
                }}>
                  {q.status.toUpperCase()}
                </span>
              </td>
              <td style={{ padding: '15px' }}>
                <button style={{ marginRight: '10px', background: 'transparent', border: '1px solid #FF6B00', color: '#FF6B00', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>Edit</button>
                {q.status === 'completed' && (
                  <button style={{ background: '#10B981', border: 'none', color: 'white', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>Announce Winners</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
