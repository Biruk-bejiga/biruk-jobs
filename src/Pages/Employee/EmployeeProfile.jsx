import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import Spinner from '../../Comonent/Spinner';
import { useAuth } from '../../context/AuthContext';

const profileSchema = z.object({
  fullName: z.string().min(3, 'Full name is required').max(255),
  phone: z.string().max(30).optional().or(z.literal('')),
  location: z.string().max(255).optional().or(z.literal('')),
  headline: z.string().max(255).optional().or(z.literal('')),
  yearsExperience: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((value) => value === '' || (!Number.isNaN(Number(value)) && Number(value) >= 0 && Number(value) <= 80), {
      message: 'Years of experience must be between 0 and 80',
    }),
  resumeUrl: z.string().url('Provide a valid URL').optional().or(z.literal('')),
  portfolioUrl: z.string().url('Provide a valid URL').optional().or(z.literal('')),
  bio: z.string().max(5000).optional().or(z.literal('')),
});

const EmployeeProfile = () => {
  const { authFetchJson } = useAuth();
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ['employee', 'me'],
    queryFn: async () => {
      const response = await authFetchJson('/api/employees/me');
      return response?.data ?? {};
    },
  });

  const mutation = useMutation({
    mutationFn: async (values) => {
      const payload = {
        ...values,
        yearsExperience: values.yearsExperience ? Number(values.yearsExperience) : undefined,
        phone: values.phone || null,
        location: values.location || null,
        headline: values.headline || null,
        resumeUrl: values.resumeUrl || null,
        portfolioUrl: values.portfolioUrl || null,
        bio: values.bio || null,
      };
      const response = await authFetchJson('/api/employees/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', 'me'] });
      toast.success('Profile updated');
    },
    onError: (err) => {
      toast.error(err.message ?? 'Failed to update profile');
    },
  });

  const { register, handleSubmit, reset, formState } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      location: '',
      headline: '',
      yearsExperience: '',
      resumeUrl: '',
      portfolioUrl: '',
      bio: '',
    },
  });

  const { errors } = formState;
  const profile = profileQuery.data;

  useEffect(() => {
    if (profile) {
      reset({
        fullName: profile.fullName ?? '',
        phone: profile.phone ?? '',
        location: profile.profileLocation ?? profile.location ?? '',
        headline: profile.headline ?? '',
        yearsExperience: profile.yearsExperience ? String(profile.yearsExperience) : '',
        resumeUrl: profile.resumeUrl ?? '',
        portfolioUrl: profile.portfolioUrl ?? '',
        bio: profile.bio ?? '',
      });
    }
  }, [profile, reset]);

  if (profileQuery.isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner loading />
      </div>
    );
  }

  if (profileQuery.isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
        {profileQuery.error?.message ?? 'Failed to load profile'}
      </div>
    );
  }

  const onSubmit = (values) => {
    mutation.mutate(values);
  };

  const handleReset = () => {
    if (profile) {
      reset({
        fullName: profile.fullName ?? '',
        phone: profile.phone ?? '',
        location: profile.profileLocation ?? profile.location ?? '',
        headline: profile.headline ?? '',
        yearsExperience: profile.yearsExperience ? String(profile.yearsExperience) : '',
        resumeUrl: profile.resumeUrl ?? '',
        portfolioUrl: profile.portfolioUrl ?? '',
        bio: profile.bio ?? '',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <header>
          <h2 className="text-xl font-semibold text-slate-900">Your profile</h2>
          <p className="mt-1 text-sm text-slate-500">Tell employers who you are and what you can do.</p>
        </header>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="fullName">
              Full name
            </label>
            <input
              id="fullName"
              type="text"
              {...register('fullName')}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            {errors.fullName ? <p className="mt-1 text-xs text-rose-500">{errors.fullName.message}</p> : null}
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="location">
              Location
            </label>
            <input
              id="location"
              type="text"
              {...register('location')}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            {errors.location ? <p className="mt-1 text-xs text-rose-500">{errors.location.message}</p> : null}
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="phone">
              Phone (optional)
            </label>
            <input
              id="phone"
              type="tel"
              {...register('phone')}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            {errors.phone ? <p className="mt-1 text-xs text-rose-500">{errors.phone.message}</p> : null}
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="headline">
              Professional headline
            </label>
            <input
              id="headline"
              type="text"
              {...register('headline')}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            {errors.headline ? <p className="mt-1 text-xs text-rose-500">{errors.headline.message}</p> : null}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <header>
          <h3 className="text-lg font-semibold text-slate-900">Experience & links</h3>
          <p className="mt-1 text-sm text-slate-500">Add supporting details for employers reviewing your profile.</p>
        </header>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="yearsExperience">
              Years of experience
            </label>
            <input
              id="yearsExperience"
              type="number"
              inputMode="numeric"
              {...register('yearsExperience')}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            {errors.yearsExperience ? (
              <p className="mt-1 text-xs text-rose-500">{errors.yearsExperience.message}</p>
            ) : null}
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="resumeUrl">
              Résumé URL
            </label>
            <input
              id="resumeUrl"
              type="url"
              {...register('resumeUrl')}
              placeholder="https://"
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            {errors.resumeUrl ? <p className="mt-1 text-xs text-rose-500">{errors.resumeUrl.message}</p> : null}
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="portfolioUrl">
              Portfolio URL
            </label>
            <input
              id="portfolioUrl"
              type="url"
              {...register('portfolioUrl')}
              placeholder="https://"
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            {errors.portfolioUrl ? <p className="mt-1 text-xs text-rose-500">{errors.portfolioUrl.message}</p> : null}
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="bio">
              Bio
            </label>
            <textarea
              id="bio"
              rows={4}
              {...register('bio')}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            {errors.bio ? <p className="mt-1 text-xs text-rose-500">{errors.bio.message}</p> : null}
          </div>
        </div>
      </section>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={handleReset}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:border-indigo-200 hover:text-indigo-600"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={mutation.isLoading}
          className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
        >
          {mutation.isLoading ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  );
};

export default EmployeeProfile;
