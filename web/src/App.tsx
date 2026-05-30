import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth';
import Layout from './components/Layout';
import Login from './pages/Login';
import OTP from './pages/OTP';
import Home from './pages/Home';
import Quizzes from './pages/Quizzes';
import QuizDetail from './pages/QuizDetail';
import QuizPlay from './pages/QuizPlay';
import QuizResult from './pages/QuizResult';
import Wallet from './pages/Wallet';
import Winners from './pages/Winners';
import Profile from './pages/Profile';

function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
        <Route path="/otp" element={<OTP />} />

        {/* App routes with bottom nav */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/quizzes" element={<Quizzes />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/winners" element={<Winners />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Full-screen routes */}
        <Route path="/quiz/:id" element={<QuizDetail />} />
        <Route path="/quiz/:id/play" element={<QuizPlay />} />
        <Route path="/quiz/:id/result" element={<QuizResult />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
