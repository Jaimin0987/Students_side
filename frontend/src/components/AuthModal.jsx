import React, { useState } from 'react';
import { X } from 'lucide-react';
import { login, register } from '../api/users';

const AuthModal = ({ open, onClose, onAuthenticated, theme }) => {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', uniqueId: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = mode === 'login' 
        ? await login({ email: form.email, password: form.password })
        : await register({ name: form.name, email: form.email, password: form.password, uniqueId: form.uniqueId });
      if (res.ok) {
        onAuthenticated();
        onClose();
      } else {
        setError(res.data?.info || 'Authentication failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-md rounded-lg shadow-xl transition-colors duration-200 ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className={`flex items-center justify-between p-4 border-b ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h2 className="text-lg font-bold">{mode === 'login' ? 'Login' : 'Register'}</h2>
          <button onClick={onClose} className={`p-2 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {mode === 'register' && (
            <>
              <input
                type="text"
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={`w-full p-2 rounded border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}
                required
              />
              <input
                type="text"
                placeholder="Unique ID"
                value={form.uniqueId}
                onChange={(e) => setForm({ ...form, uniqueId: e.target.value })}
                className={`w-full p-2 rounded border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}
                required
              />
            </>
          )}
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={`w-full p-2 rounded border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className={`w-full p-2 rounded border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}
            required
          />
          {error && <div className="text-sm text-red-500">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className={`w-full p-2 rounded text-white ${loading ? 'opacity-70' : ''} ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'}`}
          >
            {loading ? 'Please Wait...' : (mode === 'login' ? 'Login' : 'Register')}
          </button>
        </form>
        <div className="p-4 text-sm">
          {mode === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button className="text-blue-500" onClick={() => setMode('register')}>Register</button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button className="text-blue-500" onClick={() => setMode('login')}>Login</button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;


