import { useMutation } from '@apollo/client/react';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import PasswordInput from '../../components/ui/PasswordInput';
import { SIGNUP } from '../../graphql/auth/mutations';
import { parseError } from '../../helpers/auth';

export default function SignupPage() {
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: 'EMPLOYEE'
  });

  const [signup, { loading }] = useMutation(SIGNUP);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      await signup({
        variables: {
          signupInput: {
            username: form.username,
            password: form.password,
            role: form.role
          }
        }
      });

      setSuccess(true);
    } catch (err: any) {
      enqueueSnackbar(parseError(err), { variant: 'error', autoHideDuration: 5000 });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8 space-y-6">
        {success ? (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-green-100 p-4 rounded-full">
                <CheckCircleIcon className="w-10 h-10 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Verify Your Email</h2>
            <p className="text-gray-600">Please check your email to verify your account.</p>
            <Link to="/login" className="text-blue-600 hover:underline font-medium">
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-center text-gray-800">Signup</h2>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  placeholder="Username"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <PasswordInput
                  id="password"
                  label="Password"
                  placeholder="Password"
                  value={form.password}
                  onChange={(val) => setForm({ ...form, password: val })}
                  required
                  showGenerate
                />
              </div>

              <div>
                <PasswordInput
                  id="confirmPassword"
                  label="Confirm Password"
                  placeholder="Confirm Password"
                  value={form.confirmPassword}
                  onChange={(val) => setForm({ ...form, confirmPassword: val })}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full !bg-slate-600 text-white py-2 rounded-md hover:!bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Creating...' : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-600 mt-4">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:underline font-medium">
                Login
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
