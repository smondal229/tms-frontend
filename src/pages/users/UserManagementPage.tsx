import { useMutation, useQuery } from '@apollo/client/react';
import {
  ArrowDownIcon,
  ArrowPathIcon,
  ArrowUpIcon,
  ChevronUpDownIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon, NoSymbolIcon } from '@heroicons/react/24/solid';
import { closeSnackbar, enqueueSnackbar } from 'notistack';
import { useEffect, useMemo, useState } from 'react';
import { AddUserModal } from '../../components/features/users/AddUserModal';
import { CHANGE_ACTIVE_STATUS } from '../../graphql/auth/mutations';
import { GET_ALL_USERS } from '../../graphql/auth/queries';
import type {
  ChangeActiveStatusRequest,
  ChangeActiveStatusResponse,
  GetAllUsersResponse
} from '../../graphql/auth/types';
import { useAuth } from '../../hooks/useAuth';
import type { User } from '../../types/User';

interface ColumnConfig {
  key: string;
  label: string;
  align: 'left' | 'right';
  render: (user: User) => React.ReactNode;
  sortable?: boolean;
}

export default function UserManagementPage() {
  const { user } = useAuth();
  const currentUserRole: 'ADMIN' | 'EMPLOYEE' = 'ADMIN'; // Replace with real auth context
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'EMPLOYEE'>('ALL');
  const [verifiedFilter, setVerifiedFilter] = useState<'ALL' | 'VERIFIED' | 'NOT_VERIFIED'>('ALL');
  const [sort, setSort] = useState<{ field: string; direction: 'ASC' | 'DESC' }>({
    field: 'ID',
    direction: 'ASC'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, loading, refetch } = useQuery<GetAllUsersResponse, {}>(GET_ALL_USERS, {
    fetchPolicy: 'network-only'
  });

  const [changeActiveStatus] = useMutation<ChangeActiveStatusResponse, ChangeActiveStatusRequest>(
    CHANGE_ACTIVE_STATUS
  );

  const users: User[] = useMemo(() => {
    let filtered = data?.getAllUsers.filter((u) => u.id !== user?.id) ?? [];

    // 🔎 Search (username)
    if (search.trim()) {
      filtered = filtered.filter((u) => u.username.toLowerCase().includes(search.toLowerCase()));
    }

    // 👤 Role Filter
    if (roleFilter !== 'ALL') {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }

    // ✅ Verified Filter
    if (verifiedFilter !== 'ALL') {
      filtered = filtered.filter((u) => (verifiedFilter === 'VERIFIED' ? u.verified : !u.verified));
    }

    // 🔃 Sorting
    if (!sort?.field) return filtered;

    const sorted = [...filtered].sort((a, b) => {
      const aVal = a[sort.field as keyof User];
      const bVal = b[sort.field as keyof User];

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
  }, [data, sort, search, roleFilter, verifiedFilter]);

  const totalPages = Math.ceil(users.length / pageSize);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return users.slice(start, start + pageSize);
  }, [users, currentPage, pageSize]);

  const handleToggleActive = async (user: User) => {
    const newStatus = !user.active;

    const snackbarId = enqueueSnackbar(`${newStatus ? 'Activating' : 'Suspending'} user...`, {
      variant: 'info',
      persist: true
    });

    try {
      const { data } = await changeActiveStatus({
        variables: {
          userId: Number(user.id),
          activeStatus: newStatus
        },
        update: (cache) => {
          cache.modify({
            id: cache.identify({ __typename: 'User', id: user.id }),
            fields: {
              active() {
                return newStatus;
              }
            }
          });
        }
      });

      closeSnackbar(snackbarId);

      if (data?.changeActiveStatus) {
        enqueueSnackbar(`User ${newStatus ? 'activated' : 'suspended'} successfully`, {
          variant: 'success'
        });
      } else {
        enqueueSnackbar('Operation failed', { variant: 'error' });
      }
    } catch {
      closeSnackbar(snackbarId);
      enqueueSnackbar('Something went wrong', { variant: 'error' });
    }
  };

  const USER_COLUMNS: ColumnConfig[] = useMemo(() => {
    return [
      {
        key: 'id',
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
      },
      {
        key: 'active',
        label: 'Active',
        align: 'left',
        render: (u: User) => (
          <span
            className={`px-3 py-1 text-xs rounded-full ${
              u.active ? '!bg-blue-600 text-white' : '!bg-red-500 text-white'
            }`}
          >
            {u.active ? 'Active' : 'Suspended'}
          </span>
        )
      },
      {
        key: 'actions',
        label: '',
        align: 'right',
        render: (u: User) => (
          <button
            onClick={() => handleToggleActive(u)}
            title={u.active ? 'Suspend user' : 'Activate user'}
            className={`p-2 rounded-lg transition
        ${u.active ? 'text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}
      `}
          >
            {u.active ? (
              <NoSymbolIcon className="w-6 h-6" />
            ) : (
              <CheckCircleIcon className="w-6 h-6" />
            )}
          </button>
        )
      }
    ];
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter, verifiedFilter]);

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
      {/* Search + Filters */}
      <div className="max-w-6xl mx-auto">
        {/* Toolbar */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow px-5 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* LEFT SIDE: Search + Filters */}
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              {/* Search */}
              <div className="relative w-full sm:max-w-xs">
                <input
                  type="text"
                  placeholder="Search username..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full border border-slate-300 rounded-md pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>

              {/* Role Filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as 'ALL' | 'ADMIN' | 'EMPLOYEE')}
                className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                <option value="ALL">All Roles</option>
                <option value="ADMIN">ADMIN</option>
                <option value="EMPLOYEE">EMPLOYEE</option>
              </select>

              {/* Verified Filter */}
              <select
                value={verifiedFilter}
                onChange={(e) =>
                  setVerifiedFilter(e.target.value as 'ALL' | 'VERIFIED' | 'NOT_VERIFIED')
                }
                className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                <option value="ALL">All Status</option>
                <option value="VERIFIED">Verified</option>
                <option value="NOT_VERIFIED">Not Verified</option>
              </select>

              {/* Reset */}
              <button
                onClick={() => {
                  setSearch('');
                  setRoleFilter('ALL');
                  setVerifiedFilter('ALL');
                }}
                className="px-4 py-2 text-sm rounded-md border !border-slate-300 hover:!bg-slate-50 transition"
              >
                Reset
              </button>
            </div>

            {/* RIGHT SIDE: Actions */}
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
                  className="!bg-slate-800 text-white px-4 py-2 rounded-lg shadow hover:!bg-slate-700 transition"
                >
                  Add User
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="!bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="h-10 w-10 border-4 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
            </div>
          ) : (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="!bg-slate-800 sticky top-0 z-10">
                <tr>
                  {USER_COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col)}
                      className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider !bg-slate-800 !text-white
                      ${col.align === 'right' ? 'text-right' : 'text-left'}
                      ${col.sortable ? 'cursor-pointer select-none hover:!bg-slate-700 transition' : ''}`}
                    >
                      <span className="inline-flex items-center gap-2">
                        {col.label}

                        {col.sortable && (
                          <span className="inline-flex flex-col">
                            {sort?.direction === 'ASC' && sort?.field === col.key && (
                              <ArrowUpIcon className="w-3 h-3 -mb-1 text-white" />
                            )}

                            {sort?.direction === 'DESC' && sort?.field === col.key && (
                              <ArrowDownIcon className="w-3 h-3 text-white" />
                            )}

                            {sort?.field !== col.key && (
                              <ChevronUpDownIcon className="w-4 h-4 !text-slate-300" />
                            )}
                          </span>
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition">
                    {USER_COLUMNS.map((col) => (
                      <td
                        key={col.key}
                        className={`px-6 py-4 text-sm ${
                          col.align === 'right' ? 'text-right' : 'text-left'
                        }`}
                      >
                        {col.render ? col.render(user) : user[col.key as keyof User]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {/* Pagination */}
          <div className="flex flex-col md:flex-row items-center justify-between px-6 py-4 border-t border-slate-200 gap-4">
            {/* Rows Info */}
            <div className="text-sm text-slate-600">
              Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-medium">{Math.min(currentPage * pageSize, users.length)}</span>{' '}
              of <span className="font-medium">{users.length}</span> users
            </div>

            <div className="flex items-center gap-4">
              {/* Page Size */}
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-slate-300 rounded-xl px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>

              {/* Pagination Controls */}
              <div className="flex items-center gap-2">
                {/* Previous */}
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="px-3 py-1 rounded-xl border border-slate-300 disabled:opacity-40 hover:bg-slate-50 transition"
                >
                  Prev
                </button>

                {/* Page Numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-xl border transition ${
                      currentPage === page
                        ? '!bg-slate-800 text-white border-slate-800'
                        : 'border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                {/* Next */}
                <button
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-3 py-1 rounded-xl border border-slate-300 disabled:opacity-40 hover:bg-slate-50 transition"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isOpen && <AddUserModal onClose={() => setIsOpen(false)} />}
    </div>
  );
}
