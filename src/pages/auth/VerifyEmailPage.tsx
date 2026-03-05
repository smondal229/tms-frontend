import { useMutation } from '@apollo/client/react';
import { XCircleIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { VERIFY_EMAIL } from '../graphql/auth/mutations';
import type { VerifyEmailResponse } from '../graphql/auth/types';

export default function VerifyEmailPage() {
  const { user, logout } = useAuth();
  const [params] = useSearchParams();
  const token = params.get('token');

  const [verify, { data }] = useMutation<VerifyEmailResponse, {}>(VERIFY_EMAIL);
  const [status, setStatus] = useState('loading');
  const verifiedEmail = data?.verifiedEmail ?? '';

  useEffect(() => {
    if (!token) return;

    verify({ variables: { token } })
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  if (status === 'loading')
    return (
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-700 rounded-full animate-spin mb-2"></div>
        <p>Verifying...</p>
      </div>
    );
  if (status === 'error')
    return (
      <div className="flex flex-col mb-2 items-center">
        <XCircleIcon className="w-16 h-16 text-red-400"></XCircleIcon>
        <p>Invalid or expired link.</p>
      </div>
    );

  return (
    <>
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8 text-center">
        {/* Success Icon */}
        <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-3">Email Verified Successfully 🎉</h2>

        {/* 🔥 CASE 1: Not Logged In */}
        {!user && (
          <>
            <p className="text-gray-500 mb-6">
              Your account has been successfully verified. You can now log in and start using the
              platform.
            </p>

            <Link
              to="/login"
              className="inline-block w-full py-3 rounded-xl !bg-slate-600 text-white font-semibold shadow-md hover:!bg-slate-700 transition"
            >
              Go to Login
            </Link>
          </>
        )}

        {user && user.username === verifiedEmail && (
          <>
            <p className="text-gray-500 mb-6">
              Your account is verified and you're already logged in.
            </p>

            <Link
              to="/dashboard"
              className="inline-block w-full py-3 rounded-xl !bg-slate-800 text-white font-semibold shadow-md hover:bg-slate-600 transition"
            >
              Go to Dashboard
            </Link>
          </>
        )}

        {/* 🔥 CASE 3: Logged In As Different User */}
        {user && user.username !== verifiedEmail && (
          <>
            <div className="!bg-yellow-50 border !border-yellow-200 rounded-xl p-4 text-sm text-yellow-700 mb-6">
              This email belongs to <strong>{verifiedEmail}</strong>, but you are currently logged
              in as <strong>{user.username}</strong>.
            </div>

            <div className="flex flex-col gap-3">
              <Link
                to="/dashboard"
                className="w-full py-3 rounded-xl border !border-slate-300 font-medium !text-slate-700 hover:!bg-slate-50 transition"
              >
                Continue as {user.username}
              </Link>

              <button
                onClick={logout}
                className="w-full py-3 rounded-xl !bg-slate-800 text-white font-semibold shadow-md hover:!bg-slate-600 transition"
              >
                Logout & Login as {verifiedEmail}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
