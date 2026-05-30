import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import React from 'react';

import Dashboard from './pages/Dashboard';
import QuizManagement from './pages/QuizManagement';
import UserManagement from './pages/UserManagement';

function App() {
  return (
    <Router>
      <div className="layout">
        <aside className="sidebar">
          <h1>Monish Admin</h1>
          <nav>
            <ul>
              <li><Link to="/">Dashboard</Link></li>
              <li><Link to="/quizzes">Quizzes</Link></li>
              <li><Link to="/users">Users</Link></li>
            </ul>
          </nav>
        </aside>
        <main className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/quizzes" element={<QuizManagement />} />
            <Route path="/users" element={<UserManagement />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
