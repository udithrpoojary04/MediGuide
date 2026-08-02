import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Stethoscope, AlertCircle } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const { register, error, setError, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const { name, email, password, confirmPassword } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    
    try {
      await register({ name, email, password });
      navigate('/dashboard');
    } catch (err) {
      // Error is handled in context
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-br from-slate-50 via-sky-50/40 to-indigo-50/50">
      {/* Decorative background blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-300/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-300/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 animate-slide-up">
        <div className="flex justify-center">
          <div className="bg-gradient-to-br from-primary-500 to-primary-700 p-3 rounded-2xl shadow-xl shadow-primary-500/30">
            <Stethoscope className="h-10 w-10 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-black text-slate-800 tracking-tight">
          Create a new account
        </h2>
        <p className="mt-2 text-center text-sm font-medium text-slate-500">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-bold text-primary-600 hover:text-primary-700 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 animate-slide-up animate-delay-100">
        <div className="glass-card rounded-3xl p-8 sm:p-10 shadow-2xl shadow-slate-300/40">
          {(error || passwordError) && (
            <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-4 animate-slide-up">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-3 shrink-0" />
                <span className="text-sm font-bold text-red-800">
                  {passwordError || error}
                </span>
              </div>
            </div>
          )}
          <form className="space-y-5" onSubmit={onSubmit}>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide"
              >
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={onChange}
                placeholder="John Doe"
                className="w-full rounded-2xl border border-slate-200 bg-white/80 py-3 px-4 text-slate-800 font-medium placeholder:text-slate-400 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={onChange}
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-slate-200 bg-white/80 py-3 px-4 text-slate-800 font-medium placeholder:text-slate-400 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={onChange}
                placeholder="Min 6 characters"
                className="w-full rounded-2xl border border-slate-200 bg-white/80 py-3 px-4 text-slate-800 font-medium placeholder:text-slate-400 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
            </div>
            
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={onChange}
                placeholder="Repeat password"
                className="w-full rounded-2xl border border-slate-200 bg-white/80 py-3 px-4 text-slate-800 font-medium placeholder:text-slate-400 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 py-3.5 px-4 text-base font-bold text-white shadow-lg shadow-primary-500/30 transition-all hover:scale-[1.02] hover:shadow-primary-500/50 disabled:opacity-70 disabled:hover:scale-100"
              >
                {loading ? 'Registering...' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
