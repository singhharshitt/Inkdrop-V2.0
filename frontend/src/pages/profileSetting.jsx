import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';

const ProfileSettings = () => {
  const { auth, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await axios.get(`/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        setEmail(res.data.email);
      } catch (err) {
        setToast({ type: 'error', msg: 'Failed to load user data' });
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleUpdateEmail = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.patch('/users/update-email', { email }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setToast({ type: 'success', msg: 'Email updated successfully' });
    } catch (err) {
      setToast({ type: 'error', msg: err.response?.data?.error || 'Failed to update email' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      setToast({ type: 'error', msg: 'Passwords do not match' });
      return;
    }
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.patch('/users/update-password', { password: newPassword }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setToast({ type: 'success', msg: 'Password updated successfully' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setToast({ type: 'error', msg: err.response?.data?.error || 'Failed to update password' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.delete('/users/delete-account', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setToast({ type: 'success', msg: 'Account deleted' });
      setTimeout(() => {
        logout();
        navigate('/authPage');
      }, 1500);
    } catch (err) {
      setToast({ type: 'error', msg: err.response?.data?.error || 'Failed to delete account' });
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAEBD7] p-4">
      <div className="w-full max-w-md mb-4 flex justify-start">
        <button
          className="flex items-center gap-2 px-4 py-2 bg-[#E97451] text-white rounded hover:bg-[#A0522D] font-semibold transition"
          onClick={() => {
            if (auth.user?.role === 'admin') {
              navigate('/dashboardAdmin');
            } else {
              navigate('/userdashbord');
            }
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full border border-[#CDB79E]">
        <h2 className="text-2xl font-bold mb-6 text-center text-[#8B4513]">Profile Settings</h2>
        {toast && (
          <div className={`mb-4 px-4 py-2 rounded text-white font-semibold text-center ${toast.type === 'success' ? 'bg-[#E97451]' : 'bg-[#CD5C5C]'}`}>{toast.msg}</div>
        )}
        <div className="mb-4">
          <label className="block font-semibold mb-1 text-[#2E2E2E]">Email</label>
          <input
            type="email"
            className="w-full p-2 border border-[#CDB79E] rounded focus:outline-none"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={loading}
          />
          <button
            className="mt-2 w-full bg-[#E97451] text-white py-2 rounded font-bold hover:bg-[#A0522D] transition"
            onClick={handleUpdateEmail}
            disabled={loading}
          >
            Update Email
          </button>
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1 text-[#2E2E2E]">New Password</label>
          <input
            type="password"
            className="w-full p-2 border border-[#CDB79E] rounded focus:outline-none"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1 text-[#2E2E2E]">Confirm Password</label>
          <input
            type="password"
            className="w-full p-2 border border-[#CDB79E] rounded focus:outline-none"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            disabled={loading}
          />
          <button
            className="mt-2 w-full bg-[#E97451] text-white py-2 rounded font-bold hover:bg-[#A0522D] transition"
            onClick={handleUpdatePassword}
            disabled={loading}
          >
            Update Password
          </button>
        </div>
        <div className="mt-8">
          <button
            className="w-full bg-red-600 text-white py-2 rounded font-bold hover:bg-red-700 transition"
            onClick={() => setShowDeleteModal(true)}
            disabled={loading}
          >
            Delete Account
          </button>
        </div>
      </div>
      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-sm w-full border border-[#CDB79E]">
            <h3 className="text-xl font-bold mb-4 text-[#8B4513]">Confirm Account Deletion</h3>
            <p className="mb-6 text-[#2E2E2E]">Are you sure you want to delete your account? This action cannot be undone.</p>
            <div className="flex gap-4">
              <button
                className="flex-1 bg-red-600 text-white py-2 rounded font-bold hover:bg-red-700 transition"
                onClick={handleDeleteAccount}
                disabled={loading}
              >
                Yes, Delete
              </button>
              <button
                className="flex-1 bg-gray-300 text-[#2E2E2E] py-2 rounded font-bold hover:bg-gray-400 transition"
                onClick={() => setShowDeleteModal(false)}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSettings;
