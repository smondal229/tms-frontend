import { useMutation } from '@apollo/client/react';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { REQUEST_PASSWORD_RESET } from '../graphql/auth/mutations';
import { parseError } from '../helpers/auth';

export default function ForgotPasswordPage() {
  const [username, setUsername] = useState('');
  const [requestReset, { loading }] = useMutation(REQUEST_PASSWORD_RESET);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await requestReset({ variables: { username } });
    } catch (err) {
      enqueueSnackbar(parseError(err), { variant: 'error', autoHideDuration: 3000 });
    }
    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8 space-y-6">
        {sent ? (
          <p className="text-center text-green-600 font-medium">Reset link sent to your email.</p>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-center text-gray-800">Forgot Password</h2>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  id="username"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full !bg-slate-600 text-white py-2 rounded-md hover:!bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        )}
        <div className="flex flex-col text-center space-y-2 xt-sm mx-auto">
          <Link to="/login" className="!text-slate-600 hover:underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
