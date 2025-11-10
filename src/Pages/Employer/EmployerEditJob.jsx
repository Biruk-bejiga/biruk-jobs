import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Spinner from '../../Comonent/Spinner';
import { useAuth } from '../../context/AuthContext';

const employmentTypes = [
  { value: 'full_time', label: 'Full time' },
  { value: 'part_time', label: 'Part time' },
  { value: 'contract', label: 'Contract' },
  { value: 'temporary', label: 'Temporary' },
  { value: 'internship', label: 'Internship' },
];

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'closed', label: 'Closed' },
];

const jobSchema = z.object({
  title: z.string().min(4, 'Title must be at least 4 characters'),
  summary: z.string().max(512).optional().or(z.literal('')),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  responsibilities: z.string().optional().or(z.literal('')),
  requirements: z.string().optional().or(z.literal('')),
  location: z.string().min(2, 'Location is required'),
  isRemote: z.boolean().optional(),
  employmentType: z.enum(['full_time', 'part_time', 'contract', 'temporary', 'internship']),
  salaryMin: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((value) => value === '' || (!Number.isNaN(Number(value)) && Number(value) >= 0), {
      message: 'Enter a valid minimum salary',
    }),
  salaryMax: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((value) => value === '' || (!Number.isNaN(Number(value)) && Number(value) >= 0), {
      message: 'Enter a valid maximum salary',
    }),
  salaryCurrency: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((value) => value === '' || /^[A-Za-z]{3}$/.test(value), {
      message: 'Currency must be a 3-letter code',
    }),
  status: z.enum(['draft', 'published', 'closed']).optional().default('draft'),
  publishedAt: z.string().optional().or(z.literal('')),
  closingDate: z.string().optional().or(z.literal('')),
});

const EmployerEditJob = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { authFetchJson } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: '',
      summary: '',
      description: '',
      responsibilities: '',
      requirements: '',
      location: '',
      isRemote: false,
      employmentType: 'full_time',
      salaryMin: '',
      salaryMax: '',
      salaryCurrency: 'USD',
      status: 'draft',
      publishedAt: '',
      closingDate: '',
    },
  });

  const statusValue = watch('status');
  const salaryMinValue = watch('salaryMin');
  const salaryMaxValue = watch('salaryMax');

  const jobQuery = useQuery({
    queryKey: ['employer', 'jobs', jobId],
    enabled: Boolean(jobId),
    queryFn: async () => {
      const response = await authFetchJson(`/api/jobs/${jobId}`);
      return response?.data;
    },
  });

  useEffect(() => {
    if (jobQuery.data) {
      const initial = jobQuery.data;
      reset({
        title: initial.title ?? '',
        summary: initial.summary ?? '',
        description: initial.description ?? '',
        responsibilities: initial.responsibilities ?? '',
        requirements: initial.requirements ?? '',
        location: initial.location ?? '',
        isRemote: Boolean(initial.isRemote),
        employmentType: initial.employmentType ?? 'full_time',
        salaryMin: initial.salaryMin ? String(initial.salaryMin) : '',
        salaryMax: initial.salaryMax ? String(initial.salaryMax) : '',
        salaryCurrency: initial.salaryCurrency ?? 'USD',
        status: initial.status ?? 'draft',
        publishedAt: initial.publishedAt ? initial.publishedAt.slice(0, 16) : '',
        closingDate: initial.closingDate ? initial.closingDate.slice(0, 10) : '',
      });
    }
  }, [jobQuery.data, reset]);

  const mutation = useMutation({
    mutationFn: async (values) => {
      const payload = {
        title: values.title.trim(),
        summary: values.summary?.trim() || undefined,
        description: values.description.trim(),
        responsibilities: values.responsibilities?.trim() || undefined,
        requirements: values.requirements?.trim() || undefined,
        location: values.location.trim(),
        isRemote: Boolean(values.isRemote),
        employmentType: values.employmentType,
        salaryMin: values.salaryMin ? Number(values.salaryMin) : undefined,
        salaryMax: values.salaryMax ? Number(values.salaryMax) : undefined,
        salaryCurrency: values.salaryCurrency ? values.salaryCurrency.toUpperCase() : undefined,
        status: values.status ?? 'draft',
        publishedAt: values.publishedAt ? new Date(values.publishedAt).toISOString() : undefined,
        closingDate: values.closingDate ? new Date(values.closingDate).toISOString() : undefined,
      };

      const response = await authFetchJson(
        `/api/jobs/${jobId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
        'Failed to update job',
      );

      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employer', 'jobs'] });
      queryClient.invalidateQueries({ queryKey: ['employer', 'jobs', jobId] });
      toast.success('Job updated');
      navigate('/employer/jobs');
    },
    onError: (error) => {
      toast.error(error.message ?? 'Failed to update job');
    },
  });

  const onSubmit = (values) => {
    if (values.salaryMin && values.salaryMax && Number(values.salaryMin) > Number(values.salaryMax)) {
      toast.error('Minimum salary cannot be greater than maximum salary');
      return;
    }
    mutation.mutate(values);
  };

  const salaryHint = useMemo(() => {
    if (!salaryMinValue && !salaryMaxValue) return 'Optional — leave blank if salary is not public.';
    if (salaryMinValue && salaryMaxValue) return 'Displayed as a range to candidates.';
    if (salaryMinValue && !salaryMaxValue) return 'Displayed as "from" salary to candidates.';
    if (!salaryMinValue && salaryMaxValue) return 'Displayed as "up to" salary to candidates.';
    return '';
  }, [salaryMinValue, salaryMaxValue]);

  if (jobQuery.isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner loading />
      </div>
    );
  }

  if (jobQuery.isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
        {jobQuery.error?.message ?? 'Unable to load job'}
      </div>
    );
  }

  if (!jobQuery.data) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500">
        Job not found or you do not have permission to edit it.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <header>
          <h2 className="text-xl font-semibold text-slate-900">Update role</h2>
          <p className="mt-1 text-sm text-slate-500">Change job details before re-publishing or closing the role.</p>
        </header>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="title">
              Job title
            </label>
            <input
              id="title"
              type="text"
              {...register('title')}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            {errors.title ? <p className="mt-1 text-xs text-rose-500">{errors.title.message}</p> : null}
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
            <label className="text-sm font-medium text-slate-700" htmlFor="employmentType">
              Employment type
            </label>
            <select
              id="employmentType"
              {...register('employmentType')}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              {employmentTypes.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.employmentType ? (
              <p className="mt-1 text-xs text-rose-500">{errors.employmentType.message}</p>
            ) : null}
          </div>
          <label className="mt-7 flex items-center gap-2 text-sm text-slate-600" htmlFor="isRemote">
            <input id="isRemote" type="checkbox" {...register('isRemote')} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
            Remote friendly role
          </label>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="summary">
              Summary
            </label>
            <textarea
              id="summary"
              rows={2}
              {...register('summary')}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            {errors.summary ? <p className="mt-1 text-xs text-rose-500">{errors.summary.message}</p> : null}
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              rows={6}
              {...register('description')}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            {errors.description ? <p className="mt-1 text-xs text-rose-500">{errors.description.message}</p> : null}
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="responsibilities">
              Key responsibilities
            </label>
            <textarea
              id="responsibilities"
              rows={4}
              {...register('responsibilities')}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            {errors.responsibilities ? (
              <p className="mt-1 text-xs text-rose-500">{errors.responsibilities.message}</p>
            ) : null}
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="requirements">
              Requirements
            </label>
            <textarea
              id="requirements"
              rows={4}
              {...register('requirements')}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            {errors.requirements ? <p className="mt-1 text-xs text-rose-500">{errors.requirements.message}</p> : null}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <header>
          <h3 className="text-lg font-semibold text-slate-900">Compensation & visibility</h3>
          <p className="mt-1 text-sm text-slate-500">Adjust salary bands or scheduling details for this posting.</p>
        </header>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="salaryMin">
              Salary minimum
            </label>
            <input
              id="salaryMin"
              type="number"
              min={0}
              step="0.01"
              {...register('salaryMin')}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            {errors.salaryMin ? <p className="mt-1 text-xs text-rose-500">{errors.salaryMin.message}</p> : null}
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="salaryMax">
              Salary maximum
            </label>
            <input
              id="salaryMax"
              type="number"
              min={0}
              step="0.01"
              {...register('salaryMax')}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            {errors.salaryMax ? <p className="mt-1 text-xs text-rose-500">{errors.salaryMax.message}</p> : null}
            <p className="mt-1 text-xs text-slate-500">{salaryHint}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="salaryCurrency">
              Currency
            </label>
            <input
              id="salaryCurrency"
              type="text"
              {...register('salaryCurrency')}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 uppercase text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              placeholder="USD"
            />
            {errors.salaryCurrency ? (
              <p className="mt-1 text-xs text-rose-500">{errors.salaryCurrency.message}</p>
            ) : null}
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="status">
              Job status
            </label>
            <select
              id="status"
              {...register('status')}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.status ? <p className="mt-1 text-xs text-rose-500">{errors.status.message}</p> : null}
          </div>
          {statusValue === 'published' ? (
            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="publishedAt">
                Published at
              </label>
              <input
                id="publishedAt"
                type="datetime-local"
                {...register('publishedAt')}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              {errors.publishedAt ? <p className="mt-1 text-xs text-rose-500">{errors.publishedAt.message}</p> : null}
            </div>
          ) : null}
          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="closingDate">
              Closing date
            </label>
            <input
              id="closingDate"
              type="date"
              {...register('closingDate')}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            {errors.closingDate ? <p className="mt-1 text-xs text-rose-500">{errors.closingDate.message}</p> : null}
          </div>
        </div>
      </section>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => navigate('/employer/jobs')}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:border-indigo-200 hover:text-indigo-600"
        >
          Cancel
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

export default EmployerEditJob;
