import { useMutation } from '@apollo/client/react';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { RESET_PASSWORD } from '../graphql/auth/mutations';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [resetPassword, { loading }] = useMutation(RESET_PASSWORD);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) return;

    await resetPassword({
      variables: { token, newPassword: password }
    });

    alert('Password reset successful');
    navigate('/login');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Reset Password</h2>

      <input
        type="password"
        placeholder="New Password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button disabled={loading}>{loading ? 'Resetting...' : 'Reset Password'}</button>
    </form>
  );
}
