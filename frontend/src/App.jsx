import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext, AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TasksPage from './pages/TasksPage';
import TimerPage from './pages/TimerPage';
import DashboardPage from './pages/DashboardPage';
import Navbar from './components/Navbar';

function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return <div className="dark:text-white">Loading...</div>;
  
  return user ? children : <Navigate to="/login" />;
}

function AppContent() {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900 transition-colors duration-200">
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
        <Route path="/timer" element={<ProtectedRoute><TimerPage /></ProtectedRoute>} />
        
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}