import { useEffect, useMemo, useState } from 'react';
import { FiCamera, FiLock, FiMail, FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';

const initialProfile = {
  name: 'Alex Bennett',
  role: 'Platform Admin',
  email: 'alex.bennett@flexisphere.com',
  phone: '+1 (512) 440-8820',
  location: 'Austin, Texas',
};

const AdminProfile = () => {
  const [profile, setProfile] = useState(initialProfile);
  const [pendingProfile, setPendingProfile] = useState(initialProfile);
  const [passwordFields, setPasswordFields] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [avatarFile, setAvatarFile] = useState(null);

  const avatarPreview = useMemo(() => {
    if (!avatarFile) return null;
    return URL.createObjectURL(avatarFile);
  }, [avatarFile]);

  const initials = useMemo(() => {
    return profile.name
      .split(' ')
      .filter(Boolean)
      .map((segment) => segment[0]?.toUpperCase())
      .slice(0, 2)
      .join('');
  }, [profile.name]);

  useEffect(() => {
    // fetch profile from backend on mount
    let cancelled = false;
    (async () => {
      const token = window.localStorage.getItem('accessToken');
      try {
        const res = await fetch('/api/admin/profile', {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          credentials: 'include',
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data) {
          setProfile(data);
          setPendingProfile(data);
        }
      } catch (err) {
        // ignore - frontend can work offline with defaults
        // console.error('Failed to load profile', err);
      }
    })();

    return () => {
      cancelled = true;
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleProfileChange = (field, value) => {
    setPendingProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitProfile = (event) => {
    event.preventDefault();
    // send to backend and then update local state
    (async () => {
      const token = window.localStorage.getItem('accessToken');
      try {
        const res = await fetch('/api/admin/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: 'include',
          body: JSON.stringify(pendingProfile),
        });
        if (!res.ok) {
          const text = await res.text();
          toast.error('Failed to save profile: ' + text);
          return;
        }
        const saved = await res.json();
        setProfile(saved);
        setPendingProfile(saved);
        toast.success('Profile saved');
      } catch (err) {
        // fallback to local update
        setProfile({ ...pendingProfile });
        toast.info('Saved locally (server unavailable)');
      }
    })();
  };

  const handleSubmitPassword = (event) => {
    event.preventDefault();
    if (passwordFields.newPassword !== passwordFields.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    (async () => {
      const token = window.localStorage.getItem('accessToken');
      try {
        const res = await fetch('/api/admin/profile/password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: 'include',
          body: JSON.stringify({
            currentPassword: passwordFields.currentPassword,
            newPassword: passwordFields.newPassword,
          }),
        });

        if (!res.ok) {
          const text = await res.text();
          toast.error('Failed to update password: ' + text);
          return;
        }

        setPasswordFields({ currentPassword: '', newPassword: '', confirmPassword: '' });
        toast.success('Password updated successfully');
      } catch (err) {
        toast.error(err.message ?? 'Failed to update password');
      }
    })();
  };

  // create a new admin account
  const [newAdmin, setNewAdmin] = useState({ email: '', fullName: '', password: '', confirm: '', location: '' });

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (!newAdmin.email || !newAdmin.fullName || !newAdmin.password) {
      toast.error('Please fill required fields');
      return;
    }
    if (newAdmin.password !== newAdmin.confirm) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const token = window.localStorage.getItem('accessToken');
      const res = await fetch('/api/auth/register/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({
          email: newAdmin.email,
          fullName: newAdmin.fullName,
          password: newAdmin.password,
          location: newAdmin.location || undefined,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        toast.error('Failed to create admin: ' + text);
        return;
      }

      const data = await res.json();
      toast.success(`Created admin ${data.data?.email ?? newAdmin.email}`);
      setNewAdmin({ email: '', fullName: '', password: '', confirm: '', location: '' });
    } catch (err) {
      toast.error(err.message ?? 'Failed to create admin');
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Profile Management</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Update your admin credentials and contact details. Changes sync across the entire platform.
        </p>
      </header>

      <section className="grid gap-8 xl:grid-cols-[320px,1fr]">
        <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="relative mx-auto h-32 w-32">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Admin avatar preview"
                className="h-32 w-32 rounded-2xl object-cover"
              />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-500 text-3xl font-semibold text-white">
                {initials || 'A'}
              </div>
            )}
            <label
              htmlFor="avatar-upload"
              className="absolute -bottom-3 -right-2 inline-flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg transition hover:bg-indigo-500"
            >
              <FiCamera className="text-xl" />
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    setAvatarFile(file);
                  }
                }}
              />
            </label>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{profile.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{profile.role}</p>
            <p className="mt-2 text-xs uppercase tracking-wide text-slate-400">Member since Jan 2022</p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-800/70 dark:text-slate-300">
            <p>
              This profile is shared with internal moderators and customer success leads. Keeping details up to date
              ensures secure access when handling disputes or high-risk transactions.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <form
            onSubmit={handleSubmitProfile}
            className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Contact Information</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Only internal admins can view this data. We never show this on public pages.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-slate-600 dark:text-slate-300">Full Name</span>
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                  <FiUser className="text-slate-400" />
                  <input
                    value={pendingProfile.name}
                    onChange={(event) => handleProfileChange('name', event.target.value)}
                    className="w-full bg-transparent text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200"
                    placeholder="Enter full name"
                  />
                </div>
              </label>

              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-slate-600 dark:text-slate-300">Email Address</span>
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                  <FiMail className="text-slate-400" />
                  <input
                    type="email"
                    value={pendingProfile.email}
                    onChange={(event) => handleProfileChange('email', event.target.value)}
                    className="w-full bg-transparent text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200"
                    placeholder="Enter email address"
                  />
                </div>
              </label>

              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-slate-600 dark:text-slate-300">Phone Number</span>
                <input
                  value={pendingProfile.phone}
                  onChange={(event) => handleProfileChange('phone', event.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 outline-none placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  placeholder="Enter phone"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-slate-600 dark:text-slate-300">Location</span>
                <input
                  value={pendingProfile.location}
                  onChange={(event) => handleProfileChange('location', event.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 outline-none placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  placeholder="City, Country"
                />
              </label>
            </div>

            <div className="flex flex-wrap justify-end gap-3 text-sm">
              <button
                type="button"
                onClick={() => setPendingProfile(profile)}
                className="rounded-lg border border-slate-200 px-4 py-2 font-medium text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-500/60"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg border border-transparent bg-indigo-600 px-4 py-2 font-medium text-white shadow-sm transition hover:bg-indigo-500"
              >
                Save Changes
              </button>
            </div>
          </form>

          <form
            onSubmit={handleCreateAdmin}
            className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Create Admin Account</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Provision an additional platform administrator. Password must be at least 12 characters.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-slate-600 dark:text-slate-300">Full name</span>
                <input
                  value={newAdmin.fullName}
                  onChange={(e) => setNewAdmin((p) => ({ ...p, fullName: e.target.value }))}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 outline-none placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  placeholder="Enter full name"
                  required
                />
              </label>

              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-slate-600 dark:text-slate-300">Email</span>
                <input
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin((p) => ({ ...p, email: e.target.value }))}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 outline-none placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  placeholder="admin@example.com"
                  required
                />
              </label>

              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-slate-600 dark:text-slate-300">Password</span>
                <input
                  type="password"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin((p) => ({ ...p, password: e.target.value }))}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 outline-none placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  placeholder="strong password"
                  minLength={12}
                  required
                />
              </label>

              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-slate-600 dark:text-slate-300">Confirm Password</span>
                <input
                  type="password"
                  value={newAdmin.confirm}
                  onChange={(e) => setNewAdmin((p) => ({ ...p, confirm: e.target.value }))}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 outline-none placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  placeholder="confirm password"
                  minLength={12}
                  required
                />
              </label>

              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-slate-600 dark:text-slate-300">Location</span>
                <input
                  value={newAdmin.location}
                  onChange={(e) => setNewAdmin((p) => ({ ...p, location: e.target.value }))}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 outline-none placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  placeholder="City, Country"
                />
              </label>
            </div>

            <div className="flex flex-wrap justify-end gap-3 text-sm">
              <button
                type="button"
                onClick={() => setNewAdmin({ email: '', fullName: '', password: '', confirm: '', location: '' })}
                className="rounded-lg border border-slate-200 px-4 py-2 font-medium text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-500/60"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg border border-transparent bg-indigo-600 px-4 py-2 font-medium text-white shadow-sm transition hover:bg-indigo-500"
              >
                Create Admin
              </button>
            </div>
          </form>

          <form
            onSubmit={handleSubmitPassword}
            className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Update Password</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Create a strong password with a minimum of 12 characters, including symbols.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm md:col-span-2">
                <span className="font-medium text-slate-600 dark:text-slate-300">Current Password</span>
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                  <FiLock className="text-slate-400" />
                  <input
                    type="password"
                    value={passwordFields.currentPassword}
                    onChange={(event) =>
                      setPasswordFields((prev) => ({ ...prev, currentPassword: event.target.value }))
                    }
                    className="w-full bg-transparent text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200"
                    placeholder="Enter current password"
                  />
                </div>
              </label>

              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-slate-600 dark:text-slate-300">New Password</span>
                <input
                  type="password"
                  value={passwordFields.newPassword}
                  onChange={(event) =>
                    setPasswordFields((prev) => ({ ...prev, newPassword: event.target.value }))
                  }
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 outline-none placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  placeholder="Enter new password"
                  minLength={12}
                  required
                />
              </label>

              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-slate-600 dark:text-slate-300">Confirm Password</span>
                <input
                  type="password"
                  value={passwordFields.confirmPassword}
                  onChange={(event) =>
                    setPasswordFields((prev) => ({ ...prev, confirmPassword: event.target.value }))
                  }
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 outline-none placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  placeholder="Confirm new password"
                  minLength={12}
                  required
                />
              </label>
            </div>

            {passwordFields.newPassword &&
              passwordFields.confirmPassword &&
              passwordFields.newPassword !== passwordFields.confirmPassword && (
                <p className="text-sm text-rose-500">Passwords do not match. Please confirm and try again.</p>
              )}

            <div className="flex flex-wrap justify-end gap-3 text-sm">
              <button
                type="button"
                onClick={() =>
                  setPasswordFields({ currentPassword: '', newPassword: '', confirmPassword: '' })
                }
                className="rounded-lg border border-slate-200 px-4 py-2 font-medium text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-500/60"
              >
                Clear
              </button>
              <button
                type="submit"
                className="rounded-lg border border-transparent bg-emerald-500 px-4 py-2 font-medium text-white shadow-sm transition hover:bg-emerald-500/90"
              >
                Update Password
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default AdminProfile;
