import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
const SignInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please provide both email and password');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/users/login",{
        headers:{
          "Content-Type":"application/json"
        },
        method:"POST",
        body:JSON.stringify({
          email,password
        })
      });
      const ress = await response.json();
      console.log(ress);
      // Axios wraps the response in a 'data' object
      const res = ress.payload;
      // Store credentials and user data from the response
      localStorage.setItem('jwt', res.token);
      // localStorage.setItem('user', JSON.stringify(res.user));
      
      toast.success(res.message || 'Login successful!');
      console.log(localStorage.getItem('jwt'));
      // console.log(localStorage.getItem('user'));
      // Use window.location.href to trigger a full refresh and re-evaluate routes
      window.location.href = '/'; 
    } catch (err) {
      localStorage.removeItem('jwt');
      localStorage.removeItem('user');
      
      // Handle errors from the API response
      const errorMessage = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#01161E] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <form onSubmit={handleSubmit}>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
            <p className="text-gray-600 mt-2">Sign in to access your OpenStudy portal</p>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#124559]"
              value={email}
              onChange={e => setEmail(e.target.value)}
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
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#124559] text-white py-3 rounded-lg font-semibold hover:bg-[#0d3442] transition-colors"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        <p className="text-center text-gray-600 mt-6">
          Don't have an account?{' '}
          <Link to="/sign-up" className="text-[#124559] hover:underline font-medium">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignInPage;