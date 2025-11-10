import { useEffect, useMemo, useState } from 'react';
import { FiFilter, FiSearch, FiMoreHorizontal } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

// NOTE: this page previously used a static `userData` array. It's now fetched from the API.

const statusStyles = {
  Active: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  Inactive: 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  Pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
};

const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedUser, setSelectedUser] = useState(null);
  const { authFetchJson } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const body = await authFetchJson('/api/admin/users');
      const list = body?.data ?? [];
      // map server user shape to UI-friendly shape
      const mapped = list.map((u) => ({
        id: u.id,
        name: u.fullName ?? u.full_name ?? u.email,
        email: u.email,
        type: u.role === 'employer' ? 'Employer' : u.role === 'employee' ? 'Freelancer' : 'Admin',
        joined: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '',
        status: u.isActive ? 'Active' : 'Inactive',
        raw: u,
        skills: u.skills ?? [],
        earnings: u.earnings ?? null,
      }));
      setUsers(mapped);
    } catch (err) {
      console.error('Failed to load admin users', err);
      setUsers([]);
      toast.error(err?.message ?? 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = `${user.name} ${user.email}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase().trim());
      const matchesType = typeFilter === 'All' || user.type === typeFilter;
      const matchesStatus = statusFilter === 'All' || user.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [users, searchTerm, statusFilter, typeFilter]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setTypeFilter('All');
    setStatusFilter('All');
  };

  const setUserActive = async (userId, isActive) => {
    setActionLoading(userId);
    try {
      await authFetchJson(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });
      toast.success(isActive ? 'User activated' : 'User deactivated');
      await loadUsers();
    } catch (err) {
      console.error('Failed to set user active status', err);
      toast.error(err?.message ?? 'Failed to update user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Delete this user? This action cannot be undone.')) return;
    setActionLoading(userId);
    try {
      await authFetchJson(`/api/admin/users/${userId}`, { method: 'DELETE' });
      toast.success('User deleted');
      await loadUsers();
    } catch (err) {
      console.error('Failed to delete user', err);
      toast.error(err?.message ?? 'Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">User Management</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Search, filter, and review freelancers and employers onboarding the platform.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-500/50"
          >
            <FiFilter className="text-base" />
            Export CSV
          </button>
          <button
            type="button"
            onClick={handleResetFilters}
            className="rounded-lg border border-transparent bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Reset
          </button>
        </div>
      </header>

      <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 dark:border-slate-700 dark:bg-slate-900 lg:max-w-md">
            <FiSearch className="text-lg text-slate-400" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by name or email"
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              {['All', 'Employer', 'Freelancer'].map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              {['All', 'Active', 'Inactive', 'Pending'].map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="-mx-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-900/60">
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <th scope="col" className="px-4 py-3">Name</th>
                <th scope="col" className="px-4 py-3">Email</th>
                <th scope="col" className="px-4 py-3">Account Type</th>
                <th scope="col" className="px-4 py-3">Registration Date</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="transition hover:bg-slate-50/60 dark:hover:bg-slate-800/70"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900 dark:text-white">{user.name}</div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{user.id}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{user.email}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{user.type}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{user.joined}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        statusStyles[user.status] || statusStyles.Active
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedUser(user)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-500/60"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        disabled={actionLoading === user.id}
                        onClick={() => setUserActive(user.id, true)}
                        className="rounded-lg border border-transparent bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-600 transition hover:bg-emerald-500/20 dark:text-emerald-400 disabled:opacity-50"
                      >
                        {actionLoading === user.id ? '…' : 'Approve'}
                      </button>
                      <button
                        type="button"
                        disabled={actionLoading === user.id}
                        onClick={() => setUserActive(user.id, false)}
                        className="rounded-lg border border-transparent bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-600 transition hover:bg-amber-500/20 dark:text-amber-400 disabled:opacity-50"
                      >
                        {actionLoading === user.id ? '…' : 'Deactivate'}
                      </button>
                      <button
                        type="button"
                        disabled={actionLoading === user.id}
                        onClick={() => handleDeleteUser(user.id)}
                        className="rounded-lg border border-transparent bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-500/20 dark:text-rose-400 disabled:opacity-50"
                      >
                        {actionLoading === user.id ? '…' : 'Delete'}
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-indigo-500/60"
                        aria-label="More actions"
                      >
                        <FiMoreHorizontal />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400">
            No users match your filters. Adjust filters or search query to see more results.
          </div>
        )}
      </section>

      {selectedUser && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 px-4 py-6 backdrop-blur"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{selectedUser.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{selectedUser.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="rounded-full border border-transparent bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Close
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-800/60">
                <p className="text-xs uppercase tracking-wide text-slate-400">Account Type</p>
                <p className="mt-2 font-medium text-slate-900 dark:text-white">{selectedUser?.type ?? selectedUser?.raw?.role ?? ''}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-800/60">
                <p className="text-xs uppercase tracking-wide text-slate-400">Status</p>
                <p className="mt-2 font-medium text-slate-900 dark:text-white">{selectedUser?.status ?? (selectedUser?.raw?.isActive ? 'Active' : 'Inactive')}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-800/60">
                <p className="text-xs uppercase tracking-wide text-slate-400">Joined</p>
                <p className="mt-2 font-medium text-slate-900 dark:text-white">{selectedUser?.joined ?? (selectedUser?.raw?.createdAt ? new Date(selectedUser.raw.createdAt).toLocaleDateString() : '')}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-800/60">
                <p className="text-xs uppercase tracking-wide text-slate-400">Lifetime Earnings</p>
                <p className="mt-2 font-medium text-slate-900 dark:text-white">{selectedUser?.earnings ?? '—'}</p>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-xs uppercase tracking-wide text-slate-400">Skills & Tags</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(selectedUser?.skills || []).map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3 text-sm">
              <button
                type="button"
                className="rounded-lg border border-slate-200 px-4 py-2 font-medium text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-500/60"
              >
                Edit Profile
              </button>
              <button
                type="button"
                className="rounded-lg border border-transparent bg-indigo-600 px-4 py-2 font-medium text-white shadow-sm transition hover:bg-indigo-500"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
