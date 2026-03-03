import { useMutation } from '@apollo/client/react';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { VERIFY_EMAIL } from '../graphql/auth/mutations';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get('token');

  const [verify] = useMutation(VERIFY_EMAIL);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!token) return;

    verify({ variables: { token } })
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  if (status === 'loading') return <p>Verifying...</p>;
  if (status === 'error') return <p>Invalid or expired link.</p>;

  return (
    <div>
      <h2>Email Verified Successfully 🎉</h2>
      <Link to="/login">Login</Link>
    </div>
  );
}
