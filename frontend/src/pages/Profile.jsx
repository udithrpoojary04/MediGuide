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
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Profile & Privacy Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account details and control your data.
        </p>
      </div>

      <div className="space-y-6 max-w-3xl">
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Personal Information</h3>
              <p className="mt-1 text-sm text-gray-500">
                Update your name and email address.
              </p>
            </div>
            <div className="mt-5 md:col-span-2 md:mt-0">
              
              {successMsg && (
                <div className="mb-4 rounded-md bg-green-50 p-4">
                  <div className="flex">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <div className="ml-3 text-sm font-medium text-green-800">{successMsg}</div>
                  </div>
                </div>
              )}
              {errorMsg && (
                <div className="mb-4 rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    <div className="ml-3 text-sm font-medium text-red-800">{errorMsg}</div>
                  </div>
                </div>
              )}

              <form onSubmit={handleUpdate}>
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                        <User className="h-4 w-4" />
                      </span>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={name}
                        onChange={onChange}
                        className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                      />
                    </div>
                  </div>

                  <div className="col-span-6 sm:col-span-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email address (Cannot be changed)
                    </label>
                    <input
                      type="email"
                      disabled
                      value={user?.email || ''}
                      className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-100 py-2 px-3 text-gray-500 shadow-sm sm:text-sm"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-4 border-t pt-6 mt-2">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Change Password</h4>
                    
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      New Password
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm mb-4">
                      <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                        <Lock className="h-4 w-4" />
                      </span>
                      <input
                        type="password"
                        name="password"
                        id="password"
                        value={password}
                        onChange={onChange}
                        placeholder="Leave blank to keep current password"
                        className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                      />
                    </div>

                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={onChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Privacy & Data Control</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>
                MediGuide AI takes your privacy seriously. You can permanently delete your account and all associated symptom history data at any time.
              </p>
            </div>
            <div className="mt-5">
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 font-medium text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:text-sm"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
