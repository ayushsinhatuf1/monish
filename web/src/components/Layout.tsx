import { Outlet, NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { Home, Trophy, Wallet, Users, User } from 'lucide-react';

export default function Layout() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="app-layout">
      <nav className="navbar">
        <div className="navbar-brand">Monish</div>
        <NavLink to="/wallet" className="navbar-wallet">
          💰 <span>₹{user?.walletBalance ?? 0}</span>
        </NavLink>
      </nav>

      <div className="main-content">
        <Outlet />
      </div>

      <nav className="bottom-nav">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
          <Home size={22} />
          <span>Home</span>
        </NavLink>
        <NavLink to="/quizzes" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Trophy size={22} />
          <span>Quizzes</span>
        </NavLink>
        <NavLink to="/wallet" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Wallet size={22} />
          <span>Wallet</span>
        </NavLink>
        <NavLink to="/winners" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Users size={22} />
          <span>Winners</span>
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <User size={22} />
          <span>Profile</span>
        </NavLink>
      </nav>
    </div>
  );
}
