import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { authAPI } from '../api/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);
      const { token, user } = response.data;

      // Store token and user in context
      login(token, user);

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg-login p-layout-md">
      <div className="card w-full max-w-md animate-scale-in">
        <h1 className="text-3xl font-bold text-surface-900 mb-2">FocusDesk</h1>
        <p className="text-surface-800 opacity-80 mb-6">Focus better, track smarter</p>

        {error && (
          <div className="bg-brand-danger/10 border border-brand-danger text-brand-danger px-4 py-3 rounded-lg mb-4 animate-fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-800 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-field"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-800 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-field"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full mt-2"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="text-center text-surface-800 mt-6 text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-primary hover:underline font-semibold">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}