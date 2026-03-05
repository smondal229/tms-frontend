import { useMutation } from '@apollo/client/react';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PasswordInput from '../../components/ui/PasswordInput';
import { RESET_PASSWORD } from '../../graphql/auth/mutations';
import { parseError } from '../../helpers/auth';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [resetPassword, { loading }] = useMutation(RESET_PASSWORD);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Invalid or expired reset link.');
      return;
    }

    try {
      await resetPassword({
        variables: { token, newPassword: password }
      });

      setSuccess(true);

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(parseError(err));
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-300 px-4">
      {/* 🔄 Full Screen Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 border-4 border-slate-400 border-t-slate-800 rounded-full animate-spin" />
            <p className="text-slate-700 font-medium">Resetting your password...</p>
          </div>
        </div>
      )}

      <div className="relative w-full max-w-md bg-white shadow-2xl rounded-2xl p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Reset Your Password</h2>
          <p className="text-slate-500 text-sm mt-2">Enter your new password below.</p>
        </div>

        {/* Success State */}
        {success ? (
          <div className="rounded-xl !bg-green-50 border border-green-200 text-green-700 px-4 py-4 text-sm text-center animate-fade-in">
            <div className="flex items-center justify-center mb-2">
              <div className="w-10 h-10 rounded-full !bg-green-100 flex items-center justify-center">
                <svg
                  className="w-5 h-5 !text-green-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            Password reset successfully 🎉 <br />
            Redirecting to login...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 🚨 Premium Error UI */}
            {error && (
              <div className="relative rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm !text-red-700 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <svg
                      className="w-5 h-5 text-red-500"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v2m0 4h.01M4.93 19h14.14c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.2 16c-.77 1.33.19 3 1.73 3z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold">Password Reset Failed</p>
                    <p className="mt-1 !text-red-600">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Password Field */}
            <div>
              {/* <label className="block text-sm font-medium !text-slate-600 mb-1">New Password</label>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border !border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:!border-slate-500 transition"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setPassword(generatePassword())}
                  className="!bg-slate-800 text-white px-3 py-2 rounded-xl hover:!bg-slate-700"
                >
                  Auto
                </button>
              </div> */}
              <PasswordInput
                id="resetPasswordPassword"
                label="New Password"
                placeholder="Enter new password"
                value={password}
                onChange={setPassword}
                required
                showGenerate={true}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl !bg-slate-800 text-white font-semibold shadow-md hover:!bg-slate-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
