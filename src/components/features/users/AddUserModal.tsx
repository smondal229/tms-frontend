import { useMutation } from '@apollo/client/react';
import { useState } from 'react';
import { SIGNUP } from '../../../graphql/auth/mutations';
import { GET_ALL_USERS } from '../../../graphql/auth/queries';
import { parseError } from '../../../helpers/auth';
import type { User } from '../../../types/User';
import PasswordInput from '../../ui/PasswordInput';

interface IAddUserModalProps {
  onClose: () => void;
}

export const AddUserModal = ({ onClose }: IAddUserModalProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'EMPLOYEE'>('EMPLOYEE');
  const [error, setError] = useState<string | null>(null);
  const [signupMutation, { loading: creating }] = useMutation(SIGNUP);

  const handleAddUser = async () => {
    if (!username || !password) return;

    await signupMutation({
      variables: {
        signupInput: {
          username: username.trim().toLowerCase(),
          password: password.trim().toLowerCase(),
          role
        }
      },
      update(cache) {
        const existing = cache.readQuery<{ getAllUsers: User[] }>({
          query: GET_ALL_USERS
        });

        if (!existing) return;

        const newUser: User = {
          username,
          password: '',
          role
        };

        cache.writeQuery({
          query: GET_ALL_USERS,
          data: {
            getAllUsers: [...existing.getAllUsers, newUser]
          }
        });
      },
      onError(err: any) {
        setError(parseError(err));
      }
    });

    setUsername('');
    setPassword('');
    setRole('EMPLOYEE');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-slate-800">Add New User</h2>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
            {error}
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
            <input
              type="email"
              value={username}
              placeholder="Enter email"
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>

          <PasswordInput
            id="addUserPassword"
            value={password}
            onChange={setPassword}
            showGenerate={true}
            label="Password"
            required={true}
          />

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'ADMIN' | 'EMPLOYEE')}
              className="w-full border !border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:!ring-slate-500"
            >
              <option value="EMPLOYEE">EMPLOYEE</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => onClose()}
            className="px-4 py-2 rounded-xl border !border-slate-300"
          >
            Cancel
          </button>
          <button
            disabled={creating}
            onClick={handleAddUser}
            className="px-4 py-2 rounded-xl !bg-slate-800 text-white hover:!bg-slate-700 disabled:opacity-50 flex items-center gap-2"
          >
            {creating && (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {creating ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};
