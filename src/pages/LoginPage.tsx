import { useMutation } from '@apollo/client/react';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import PasswordInput from '../components/common/PasswordInput';
import { LOGIN, RESEND_VERIFICATION } from '../graphql/auth/mutations';
import type { LoginRequest, LoginResponse } from '../graphql/auth/types';
import { parseError } from '../helpers/auth';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    password: ''
  });

  const [loginMutation, { loading }] = useMutation<LoginResponse, LoginRequest>(LOGIN);
  const [resendVerification] = useMutation(RESEND_VERIFICATION);

  const handleLoginError = async (errorMsg: string) => {
    if (errorMsg.includes('not verified')) {
      await handleUnverifiedUser();
    } else {
      enqueueSnackbar(errorMsg, { variant: 'error' });
    }
  };

  const handleUnverifiedUser = async () => {
    try {
      await resendVerification({
        variables: { username: form.username }
      });

      enqueueSnackbar('Your account is not verified. A new verification email has been sent.', {
        variant: 'info'
      });
    } catch {
      enqueueSnackbar('Unable to resend verification email. Please try again later.', {
        variant: 'error'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data } = await loginMutation({
        variables: form
      });

      if (data?.login) {
        login(data.login);
        navigate('/');
      }
    } catch (err: any) {
      handleLoginError(parseError(err));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8 space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-800">Login</h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              id="username"
              type="email"
              placeholder="Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <PasswordInput
              id="password"
              value={form.password}
              onChange={(val) => setForm({ ...form, password: val })}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full !bg-slate-600 text-white py-2 rounded-md hover:!bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="flex flex-col text-center space-y-2 xt-sm mx-auto">
          <Link to="/forgot-password" className="!text-slate-600 hover:underline">
            Forgot Password?
          </Link>
          <Link to="/signup" className="!text-slate-600 hover:underline">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
