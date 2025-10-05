import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api'; // Import our api service

const SignUpPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await authAPI.signUp({ name, email, password });
      toast.success('Account created successfully! Please sign in.');
      navigate('/'); // Redirect to sign-in page on success
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Sign-up failed. Please try again.';
      toast.error(errorMessage);
      console.error('Sign-up error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#01161E] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <form onSubmit={handleSubmit}>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Create Account</h1>
            <p className="text-gray-600 mt-2">Join the OpenStudy community</p>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">Full Name</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#124559]"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#124559]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2 font-medium">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#124559]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#124559] text-white py-3 rounded-lg font-semibold hover:bg-[#0d3442] transition-colors"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        <p className="text-center text-gray-600 mt-6">
          Already have an account?{' '}
          <Link to="/" className="text-[#124559] hover:underline font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;