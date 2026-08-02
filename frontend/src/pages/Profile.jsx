import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/common/Layout';
import userService from '../services/userService';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';

const Profile = () => {
  const { user, logout, setError: setGlobalError } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    password: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { name, password, confirmPassword } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (password && password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    if (password && password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const updateData = { name };
      if (password) updateData.password = password;

      await userService.updateProfile(updateData);
      setSuccessMsg('Profile updated successfully');
      setFormData({ ...formData, password: '', confirmPassword: '' });
      
      // Update local state by forcing a reload or updating context
      window.location.reload(); 
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you absolutely sure you want to delete your account? This action will permanently delete all your symptom history and personal data. This cannot be undone.')) {
      try {
        await userService.deleteAccount();
        logout();
        navigate('/login');
      } catch (err) {
        setErrorMsg(err.response?.data?.error || 'Failed to delete account');
      }
    }
  };

  return (
    <Layout>
      <div className="flex items-center mb-2 mt-2 animate-slide-up">
        <div className="bg-gradient-to-br from-primary-400 to-primary-600 p-2 rounded-xl mr-3 shadow-lg shadow-primary-500/30">
          <User className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Profile & Privacy Settings</h1>
      </div>
      <p className="text-base text-slate-500 mb-8 ml-11 animate-slide-up">
        Manage your personal information, security preferences, and data privacy.
      </p>

      <div className="space-y-8 max-w-4xl animate-slide-up animate-delay-100">
        {/* Personal Details Card */}
        <div className="glass-card rounded-3xl p-6 md:p-8">
          <div className="border-b border-slate-100/60 pb-4 mb-6">
            <h3 className="text-xl font-black text-slate-800">Personal Information</h3>
            <p className="text-sm font-medium text-slate-500 mt-1">
              Update your account details and password.
            </p>
          </div>

          {successMsg && (
            <div className="mb-6 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 animate-slide-up">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-emerald-500 mr-3 shrink-0" />
                <span className="text-sm font-bold text-emerald-800">{successMsg}</span>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-4 animate-slide-up">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-3 shrink-0" />
                <span className="text-sm font-bold text-red-800">{errorMsg}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                  Full Name
                </label>
                <div className="flex rounded-2xl shadow-sm bg-white border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all">
                  <div className="flex items-center pl-4 bg-transparent">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={name}
                    onChange={onChange}
                    className="flex-1 w-full border-none py-3 px-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-0 bg-transparent font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                  Email Address (Fixed)
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-100/70 py-3 px-4 text-slate-500 font-medium cursor-not-allowed"
                />
              </div>
            </div>

            <div className="border-t border-slate-100/60 pt-6 mt-6">
              <h4 className="text-lg font-black text-slate-800 mb-1">Change Password</h4>
              <p className="text-xs font-medium text-slate-400 mb-6">Leave blank if you don't wish to change your password.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                    New Password
                  </label>
                  <div className="flex rounded-2xl shadow-sm bg-white border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all">
                    <div className="flex items-center pl-4 bg-transparent">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="password"
                      name="password"
                      id="password"
                      value={password}
                      onChange={onChange}
                      placeholder="Min 6 characters"
                      className="flex-1 w-full border-none py-3 px-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-0 bg-transparent font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                    Confirm New Password
                  </label>
                  <div className="flex rounded-2xl shadow-sm bg-white border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all">
                    <div className="flex items-center pl-4 bg-transparent">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="password"
                      name="confirmPassword"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={onChange}
                      placeholder="Repeat new password"
                      className="flex-1 w-full border-none py-3 px-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-0 bg-transparent font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-3 text-base font-bold text-white shadow-lg shadow-primary-500/30 transition-all hover:scale-[1.02] hover:shadow-primary-500/50 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Privacy Card */}
        <div className="glass-card rounded-3xl p-6 md:p-8 border border-red-100 bg-red-50/30">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-black text-red-900">Privacy & Data Control</h3>
              <p className="mt-2 text-sm font-medium text-slate-600 max-w-xl leading-relaxed">
                MediGuide AI takes your medical data privacy seriously. You can permanently erase your profile along with all associated symptom reports and assessment history.
              </p>
            </div>
          </div>
          <div className="mt-6">
            <button
              type="button"
              onClick={handleDeleteAccount}
              className="inline-flex items-center justify-center rounded-2xl bg-red-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-red-600/20 hover:bg-red-700 hover:shadow-lg transition-all"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Permanently Delete Account
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
