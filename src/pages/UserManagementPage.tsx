import { useMutation, useQuery } from '@apollo/client/react';
import {
  ArrowDownIcon,
  ArrowPathIcon,
  ArrowUpIcon,
  ChevronUpDownIcon
} from '@heroicons/react/24/outline';
import { useMemo, useState } from 'react';
import PasswordInput from '../components/common/PasswordInput';
import { SIGNUP } from '../graphql/auth/mutations';
import { GET_ALL_USERS } from '../graphql/auth/queries';
import type { GetAllUsersResponse } from '../graphql/auth/types';
import type { User } from '../types/User';

interface ColumnConfig {
  key: string;
  label: string;
  sortable: boolean;
  render: (user: User) => React.ReactNode;
}

export default function UserManagementPage() {
  const currentUserRole: 'ADMIN' | 'EMPLOYEE' = 'ADMIN'; // Replace with real auth context

  const { data, loading, refetch } = useQuery<GetAllUsersResponse, {}>(GET_ALL_USERS, {
    fetchPolicy: 'cache-and-network'
  });

  const [signupMutation, { loading: creating }] = useMutation(SIGNUP);

  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'EMPLOYEE'>('EMPLOYEE');
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<{ field: string; direction: 'ASC' | 'DESC' }>({
    field: 'ID',
    direction: 'ASC'
  });

  const USER_COLUMNS = useMemo(() => {
    return [
      {
        key: 'id',
        sortKey: 'ID',
        label: 'ID',
        sortable: true,
        align: 'left',
        render: (u: User) => <span className="text-sm font-medium text-gray-400">#{u.id}</span>
      },
      {
        key: 'username',
        label: 'Username',
        sortable: true,
        align: 'left',
        render: (u: User) => <span className="font-medium text-gray-900">{u.username}</span>
      },
      {
        key: 'role',
        label: 'Role',
        sortable: true,
        align: 'left',
        render: (u: User) => <span className="text-gray-600">{u.role}</span>
      },
      {
        key: 'verified',
        label: 'Verified',
        sortable: false,
        align: 'left',
        render: (u: User) => (
          <span
            className={`px-3 py-1 text-xs rounded-full ${
              u.verified ? 'bg-green-600 text-white' : 'bg-slate-300 text-slate-700'
            }`}
          >
            {u.verified ? 'Verified' : 'Not Verified'}
          </span>
        )
      }
    ];
  }, []);

  const handleAddUser = async () => {
    if (!username || !password) return;

    await signupMutation({
      variables: { signupInput: { username, password, role } },
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
        if (err.errors?.length) {
          setError(err.errors[0]?.message);
        }
      }
    });

    setUsername('');
    setPassword('');
    setRole('EMPLOYEE');
    setIsOpen(false);
  };

  const users: User[] = useMemo(() => {
    const usersData = data?.getAllUsers ?? [];
    if (!sort?.field) return usersData;

    const sorted = [...usersData].sort((a, b) => {
      let aVal = a[sort.field as keyof User];
      let bVal = b[sort.field as keyof User];

      if (aVal == null || bVal == null) return 0;

      const isNumericA =
        typeof aVal === 'number' || (typeof aVal === 'string' && !isNaN(Number(aVal)));

      const isNumericB =
        typeof bVal === 'number' || (typeof bVal === 'string' && !isNaN(Number(bVal)));

      if (isNumericA && isNumericB) {
        return Number(aVal) - Number(bVal);
      }

      return String(aVal).localeCompare(String(bVal), undefined, {
        numeric: true,
        sensitivity: 'base'
      });
    });

    return sort.direction === 'DESC' ? sorted.reverse() : sorted;
  }, [data, sort]);

  const handleSort = (col: ColumnConfig) => {
    if (!col.sortable) return;

    const reverseDir: { ASC: 'DESC'; DESC: 'ASC' } = { DESC: 'ASC', ASC: 'DESC' };

    setSort((prevSort) => ({
      field: col.key,
      direction: prevSort?.field === col.key ? reverseDir[prevSort.direction] : 'ASC'
    }));
  };

  return (
    <div className="min-h-screen !bg-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => refetch()}
              className="p-2 rounded-2xl !bg-white shadow hover:!bg-slate-50 transition"
            >
              <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {currentUserRole === 'ADMIN' && (
              <button
                onClick={() => setIsOpen(true)}
                className="!bg-slate-800 text-white px-4 py-2 rounded-2xl shadow hover:!bg-slate-700 transition"
              >
                Add User
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="!bg-white rounded-2xl shadow overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="h-10 w-10 border-4 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
            </div>
          ) : (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  {USER_COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col)}
                      className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50
                  ${col.align === 'right' ? 'text-right' : 'text-left'}
                  ${col.sortable ? 'cursor-pointer hover:text-gray-700 select-none' : ''}`}
                    >
                      <span className="inline-flex items-center gap-1">
                        {col.label}
                        {col.sortable && (
                          <span className="inline-flex flex-col">
                            {sort?.direction === 'ASC' && sort?.field === col.sortKey && (
                              <ArrowUpIcon className={`w-3 h-3 -mb-1 text-gray-900`} />
                            )}
                            {sort?.direction === 'DESC' && sort?.field === col.sortKey && (
                              <ArrowDownIcon
                                className={`w-3 h-3 ${sort?.field === col.sortKey && sort?.direction === 'DESC' ? 'text-gray-900' : 'text-gray-300'}`}
                              />
                            )}
                            {sort?.field !== col.sortKey && (
                              <ChevronUpDownIcon className={`w-4 h-4 text-gray-600`} />
                            )}
                          </span>
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 text-slate-600 text-sm">{user.id}</td>
                    <td className="px-6 py-4 text-slate-700">{user.username}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-xs rounded-full bg-slate-800 text-white">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs rounded-full ${
                          user.verified ? 'bg-green-600 text-white' : 'bg-slate-300 text-slate-700'
                        }`}
                      >
                        {user.verified ? 'Verified' : 'Not Verified'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isOpen && (
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
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>

              {/* <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Password</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex-1 border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setPassword(generatePassword())}
                    className="!bg-slate-800 text-white px-3 py-2 rounded-xl hover:!bg-slate-700"
                  >
                    Auto
                  </button>
                </div>
              </div> */}
              <PasswordInput
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
                  className="w-full border !border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:!ring-slate-500"
                >
                  <option value="EMPLOYEE">EMPLOYEE</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsOpen(false)}
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
      )}
    </div>
  );
}
