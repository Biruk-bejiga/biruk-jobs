import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
  companyName: z.string().min(2, 'Company name is required'),
  companyWebsite: z.string().url('Provide a valid URL').max(255).optional().or(z.literal('')),
  companyDescription: z.string().max(5000).optional().or(z.literal('')),
  companySize: z.string().max(64).optional().or(z.literal('')),
  industry: z.string().max(120).optional().or(z.literal('')),
  headquarters: z.string().max(255).optional().or(z.literal('')),
  foundedYear: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((value) => value === '' || (/^\d{4}$/.test(value) && Number(value) >= 1800 && Number(value) <= new Date().getFullYear()), {
      message: 'Enter a year between 1800 and today',
    }),
});

const EmployerProfile = () => {
  const { authFetchJson } = useAuth();
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ['employer', 'me'],
    queryFn: async () => {
      const response = await authFetchJson('/api/employers/me');
      return response?.data ?? {};
    },
  });

  const mutation = useMutation({
    mutationFn: async (values) => {
      const payload = {
        ...values,
        foundedYear: values.foundedYear ? Number(values.foundedYear) : undefined,
        phone: values.phone || null,
        location: values.location || null,
        companyWebsite: values.companyWebsite || null,
        companyDescription: values.companyDescription || null,
        companySize: values.companySize || null,
        industry: values.industry || null,
        headquarters: values.headquarters || null,
      };
      const response = await authFetchJson('/api/employers/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return response?.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['employer', 'me'] });
      toast.success('Profile updated');
      return data;
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
      companyName: '',
      companyWebsite: '',
      companyDescription: '',
      companySize: '',
      industry: '',
      headquarters: '',
      foundedYear: '',
    },
  });

  const { errors } = formState;

  const profile = profileQuery.data?.profile;

  useEffect(() => {
    if (profile) {
      reset({
        fullName: profile.fullName ?? '',
        phone: profile.phone ?? '',
        location: profile.location ?? '',
        companyName: profile.companyName ?? '',
        companyWebsite: profile.companyWebsite ?? '',
        companyDescription: profile.companyDescription ?? '',
        companySize: profile.companySize ?? '',
        industry: profile.industry ?? '',
        headquarters: profile.headquarters ?? '',
        foundedYear: profile.foundedYear ? String(profile.foundedYear) : '',
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
    reset({
      fullName: profile?.fullName ?? '',
      phone: profile?.phone ?? '',
      location: profile?.location ?? '',
      companyName: profile?.companyName ?? '',
      companyWebsite: profile?.companyWebsite ?? '',
      companyDescription: profile?.companyDescription ?? '',
      companySize: profile?.companySize ?? '',
      industry: profile?.industry ?? '',
      headquarters: profile?.headquarters ?? '',
      foundedYear: profile?.foundedYear ? String(profile.foundedYear) : '',
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <header>
          <h2 className="text-xl font-semibold text-slate-900">Profile</h2>
          <p className="mt-1 text-sm text-slate-500">Keep your company presence consistent across job postings.</p>
        </header>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="fullName">
              Your name
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
            <label className="text-sm font-medium text-slate-700" htmlFor="phone">
              Phone
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
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <header>
          <h3 className="text-lg font-semibold text-slate-900">Company details</h3>
          <p className="mt-1 text-sm text-slate-500">These details appear on job listings and candidate outreach.</p>
        </header>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="companyName">
              Company name
            </label>
            <input
              id="companyName"
              type="text"
              {...register('companyName')}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            {errors.companyName ? (
              <p className="mt-1 text-xs text-rose-500">{errors.companyName.message}</p>
            ) : null}
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="companyWebsite">
              Website
            </label>
            <input
              id="companyWebsite"
              type="url"
              {...register('companyWebsite')}
              placeholder="https://"
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            {errors.companyWebsite ? (
              <p className="mt-1 text-xs text-rose-500">{errors.companyWebsite.message}</p>
            ) : null}
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="companyDescription">
              About your company
            </label>
            <textarea
              id="companyDescription"
              rows={4}
              {...register('companyDescription')}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            {errors.companyDescription ? (
              <p className="mt-1 text-xs text-rose-500">{errors.companyDescription.message}</p>
            ) : null}
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="companySize">
              Company size
            </label>
            <input
              id="companySize"
              type="text"
              {...register('companySize')}
              placeholder="e.g. 51-200"
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            {errors.companySize ? (
              <p className="mt-1 text-xs text-rose-500">{errors.companySize.message}</p>
            ) : null}
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="industry">
              Industry
            </label>
            <input
              id="industry"
              type="text"
              {...register('industry')}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            {errors.industry ? <p className="mt-1 text-xs text-rose-500">{errors.industry.message}</p> : null}
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="headquarters">
              Headquarters
            </label>
            <input
              id="headquarters"
              type="text"
              {...register('headquarters')}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            {errors.headquarters ? (
              <p className="mt-1 text-xs text-rose-500">{errors.headquarters.message}</p>
            ) : null}
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="foundedYear">
              Founded year
            </label>
            <input
              id="foundedYear"
              type="number"
              inputMode="numeric"
              {...register('foundedYear')}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            {errors.foundedYear ? (
              <p className="mt-1 text-xs text-rose-500">{errors.foundedYear.message}</p>
            ) : null}
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

export default EmployerProfile;
