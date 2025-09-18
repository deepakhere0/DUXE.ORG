import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { EnvelopeIcon } from '@heroicons/react/24/outline';

const ForgotPassword = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validate = () => {
    if (!email) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Email is invalid';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    setError(err);
    if (err) return;

    setLoading(true);
    await resetPassword(email);
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-navy-50 to-accent-50">
      <div className="max-w-md w-full">
        <div className="card">
          <div className="card-body">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="bg-accent-100 p-3 rounded-full">
                  <EnvelopeIcon className="h-12 w-12 text-accent-600" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Reset Password</h2>
              <p className="mt-2 text-sm text-gray-600">
                Enter your email to receive a password reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="label">Email Address</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`input ${error ? 'input-error' : ''}`}
                  placeholder="you@example.com"
                />
                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <div className="text-center text-sm">
                <Link to="/login" className="text-accent-600 hover:text-accent-700 font-medium">Back to Log In</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

