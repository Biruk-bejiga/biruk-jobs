import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLoaderData, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaMapMarked } from 'react-icons/fa';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { toast } from 'react-toastify';
import Spinner from '../Comonent/Spinner';
import { useAuth } from '../context/AuthContext';
import { useConfirm } from '../Comonent/ConfirmProvider';

const formatEmploymentType = (value) => {
  if (!value) return 'Unknown type';
  return value.replace(/_/g, ' ');
};

const formatSalaryRange = (min, max, currency = 'USD') => {
  const formatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  });

  const minNumber = typeof min === 'number' ? min : min ? Number(min) : undefined;
  const maxNumber = typeof max === 'number' ? max : max ? Number(max) : undefined;

  if (minNumber && maxNumber) {
    return `${formatter.format(minNumber)} – ${formatter.format(maxNumber)}`;
  }
  if (minNumber) {
    return `From ${formatter.format(minNumber)}`;
  }
  if (maxNumber) {
    return `Up to ${formatter.format(maxNumber)}`;
  }
  return 'Salary not disclosed';
};

const applicationStatusStyles = {
  submitted: 'bg-slate-100 text-slate-600',
  in_review: 'bg-indigo-100 text-indigo-600',
  shortlisted: 'bg-emerald-100 text-emerald-600',
  rejected: 'bg-rose-100 text-rose-600',
  withdrawn: 'bg-amber-100 text-amber-600',
  hired: 'bg-sky-100 text-sky-600',
};

const applyFormSchema = z.object({
  resumeUrl: z
    .string()
    .trim()
    .min(1, 'Résumé link is required')
    .url('Enter a valid résumé link')
    .max(512, 'Résumé link is too long'),
  coverLetter: z
    .string()
    .trim()
    .min(1, 'Cover letter is required')
    .max(2000, 'Cover letter must be 2000 characters or less'),
});

const JobPage = ({ deleteJob, backToPath = '/jobs', backToLabel = 'Back to Job Listings' }) => {
  const navigate = useNavigate();
  const job = useLoaderData();
  const jobId = job?.id;
  const [isDeleting, setIsDeleting] = useState(false);
  const { user, authFetchJson } = useAuth();
  const confirm = useConfirm();
  const queryClient = useQueryClient();
  const isEmployee = user?.role === 'employee';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(applyFormSchema),
    defaultValues: {
      resumeUrl: '',
      coverLetter: '',
    },
  });

  const applicationsQuery = useQuery({
    queryKey: ['employee', 'applications'],
    queryFn: async () => {
      const response = await authFetchJson('/api/employees/applications');
      return response?.data ?? [];
    },
    enabled: isEmployee,
  });

  const viewerApplication = useMemo(() => {
    if (!isEmployee || !Array.isArray(applicationsQuery.data) || !jobId) {
      return null;
    }
    const entry = applicationsQuery.data.find((item) => item.job.id === jobId);
    return entry?.application ?? null;
  }, [applicationsQuery.data, isEmployee, jobId]);

  const submitApplication = useMutation({
    mutationFn: async (payload) => {
      if (!jobId) {
        throw new Error('Job not found');
      }
      const body = {
        resumeUrl: payload.resumeUrl,
        coverLetter: payload.coverLetter,
      };
      const response = await authFetchJson(
        `/api/jobs/${jobId}/apply`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        },
        'Unable to submit application',
      );
      return response?.data ?? null;
    },
    onSuccess: () => {
      toast.success('Application submitted!');
      reset();
      queryClient.invalidateQueries({ queryKey: ['employee', 'applications'] });
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Unable to submit application');
    },
  });

  const employmentLabel = formatEmploymentType(job?.employmentType);
  const salaryLabel = formatSalaryRange(job?.salaryMin, job?.salaryMax, job?.salaryCurrency);

  const postedDate = useMemo(() => {
    if (!job?.publishedAt) return null;
    try {
      return new Date(job.publishedAt).toLocaleDateString();
    } catch (_error) {
      return null;
    }
  }, [job?.publishedAt]);

  const canManage = useMemo(() => {
    if (!user || !job) return false;
    if (user.role === 'admin') return true;
    if (user.role === 'employer' && user.id === job.employerId) return true;
    return false;
  }, [job, user]);

  const onDeleteClick = async (jobId) => {
    let ok = false;
    try {
      ok = await confirm({ title: 'Delete listing', description: 'Are you sure you want to delete this listing?', confirmText: 'Delete', cancelText: 'Cancel', destructive: true });
    } catch (e) {
      ok = false;
    }
    if (!ok) return;

    try {
      setIsDeleting(true);
  await deleteJob(jobId);
      toast.success('Job deleted successfully!');
  navigate(backToPath);
    } catch (error) {
      const message = error?.message ?? 'Failed to delete job. Please try again.';
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!job) {
    return (
      <div className="container m-auto py-10 px-6">
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500">
          Job not found.
        </div>
      </div>
    );
  }

  return (
    <>
      <section>
        <div className="container m-auto py-6 px-6">
          <Link to={backToPath} className="flex items-center text-indigo-500 transition hover:text-indigo-600">
            <FaArrowLeft className="mr-2" /> {backToLabel}
          </Link>
        </div>
      </section>

      <section className="bg-indigo-50">
        <div className="container m-auto gap-6 py-10 px-6">
          <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-[minmax(0,3fr)_minmax(0,1.2fr)]">
            <main>
              <div className="rounded-lg bg-white p-6 shadow-md">
                <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  {employmentLabel}
                  {job.isRemote ? ' • Remote friendly' : ''}
                </div>
                <h1 className="mt-2 text-3xl font-bold text-slate-900">{job.title}</h1>
                <div className="mt-4 flex items-center justify-center text-slate-500 md:justify-start">
                  <FaMapMarked className="mr-2 text-orange-700" />
                  <p className="text-orange-700">{job.location}</p>
                </div>
                {postedDate ? (
                  <p className="mt-3 text-xs uppercase tracking-wide text-slate-400">
                    Posted {postedDate}
                  </p>
                ) : null}
              </div>

              <article className="mt-6 space-y-8 rounded-lg bg-white p-6 shadow-md">
                {job.summary ? (
                  <section>
                    <h3 className="text-lg font-semibold text-slate-900">Summary</h3>
                    <p className="mt-2 break-words text-sm leading-relaxed text-slate-600">{job.summary}</p>
                  </section>
                ) : null}

                <section>
                  <h3 className="text-lg font-semibold text-slate-900">Job Description</h3>
                  <p className="mt-2 break-words whitespace-pre-line text-sm leading-relaxed text-slate-600">{job.description}</p>
                </section>

                {job.responsibilities ? (
                  <section>
                    <h3 className="text-lg font-semibold text-slate-900">Responsibilities</h3>
                    <p className="mt-2 break-words whitespace-pre-line text-sm leading-relaxed text-slate-600">{job.responsibilities}</p>
                  </section>
                ) : null}

                {job.requirements ? (
                  <section>
                    <h3 className="text-lg font-semibold text-slate-900">Requirements</h3>
                    <p className="mt-2 break-words whitespace-pre-line text-sm leading-relaxed text-slate-600">{job.requirements}</p>
                  </section>
                ) : null}

                <section>
                  <h3 className="text-lg font-semibold text-slate-900">Salary</h3>
                  <p className="mt-2 text-sm font-semibold text-indigo-600">{salaryLabel}</p>
                </section>
              </article>
            </main>

            <aside className="space-y-6">
              <div className="rounded-lg bg-white p-6 shadow-md">
                <h3 className="text-xl font-semibold text-slate-900">Application</h3>
                {!user ? (
                  <>
                    <p className="mt-3 text-sm text-slate-600">
                      Login or create an account to submit your application and track status updates in real time.
                    </p>
                    <Link
                      to="/login"
                      className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white transition hover:bg-indigo-500"
                    >
                      Sign in to apply
                    </Link>
                  </>
                ) : null}

                {user && !isEmployee ? (
                  <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    You&apos;re signed in as {user.role}. Switch to an employee account to submit applications.
                  </p>
                ) : null}

                {isEmployee ? (
                  <div className="mt-4 space-y-4">
                    {job.status !== 'published' ? (
                      <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                        This job is not currently accepting applications.
                      </p>
                    ) : null}

                    {job.status === 'published' ? (
                      <>
                        {applicationsQuery.isLoading ? (
                          <div className="flex justify-center py-4">
                            <Spinner loading />
                          </div>
                        ) : null}

                        {applicationsQuery.isError ? (
                          <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                            {applicationsQuery.error?.message ?? 'Unable to load your application status.'}
                          </p>
                        ) : null}

                        {!applicationsQuery.isLoading && !applicationsQuery.isError ? (
                          viewerApplication ? (
                            <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-600">Current status</span>
                                <span
                                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                    applicationStatusStyles[viewerApplication.status] ?? applicationStatusStyles.submitted
                                  }`}
                                >
                                  {viewerApplication.status.replace('_', ' ')}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500">
                                Applied on{' '}
                                {viewerApplication.submittedAt
                                  ? new Date(viewerApplication.submittedAt).toLocaleDateString()
                                  : 'unknown date'}
                              </p>
                              <Link
                                to="/employee/applications"
                                className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white transition hover:bg-indigo-500"
                              >
                                View application updates
                              </Link>
                            </div>
                          ) : (
                            <form className="space-y-4" onSubmit={handleSubmit((values) => submitApplication.mutate(values))}>
                              <div>
                                <label className="text-sm font-medium text-slate-700" htmlFor="resumeUrl">
                                  Résumé link (optional)
                                </label>
                                <input
                                  id="resumeUrl"
                                  type="url"
                                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                  placeholder="https://..."
                                      {...register('resumeUrl', {
                                        setValueAs: (value) =>
                                          typeof value === 'string' ? value.trim() : '',
                                      })}
                                />
                                {errors.resumeUrl ? (
                                  <p className="mt-1 text-xs text-rose-600">{errors.resumeUrl.message}</p>
                                ) : null}
                              </div>

                              <div>
                                <label className="text-sm font-medium text-slate-700" htmlFor="coverLetter">
                                  Cover letter (optional)
                                </label>
                                <textarea
                                  id="coverLetter"
                                  rows={5}
                                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                  placeholder="Share why you&apos;re a great fit..."
                                  {...register('coverLetter', {
                                    setValueAs: (value) =>
                                      typeof value === 'string' ? value.trim() : '',
                                  })}
                                />
                                {errors.coverLetter ? (
                                  <p className="mt-1 text-xs text-rose-600">{errors.coverLetter.message}</p>
                                ) : null}
                              </div>

                              <button
                                type="submit"
                                className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
                                disabled={submitApplication.isPending}
                              >
                                {submitApplication.isPending ? 'Submitting…' : 'Submit application'}
                              </button>
                              <p className="text-xs text-slate-500">
                                Track all submissions from your{' '}
                                <Link className="font-medium text-indigo-600 hover:text-indigo-500" to="/employee/applications">
                                  applications dashboard
                                </Link>
                                .
                              </p>
                            </form>
                          )
                        ) : null}
                      </>
                    ) : null}
                  </div>
                ) : null}
              </div>

              {canManage ? (
                <div className="rounded-lg bg-white p-6 shadow-md">
                  <h3 className="text-xl font-semibold text-slate-900">Manage job</h3>
                  <Link
                    to={`/employer/jobs/${job.id}/edit`}
                    className="mt-4 block rounded-full bg-indigo-500 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-indigo-600"
                  >
                    Edit job
                  </Link>
                  <button
                    type="button"
                    onClick={() => onDeleteClick(job.id)}
                    className={`mt-3 block w-full rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white transition ${
                      isDeleting ? 'cursor-not-allowed opacity-75' : 'hover:bg-red-600'
                    }`}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting…' : 'Delete job'}
                  </button>
                </div>
              ) : null}
            </aside>
          </div>
        </div>
      </section>
    </>
  );
};

JobPage.propTypes = {
  deleteJob: PropTypes.func.isRequired,
  backToPath: PropTypes.string,
  backToLabel: PropTypes.string,
};

export default JobPage;