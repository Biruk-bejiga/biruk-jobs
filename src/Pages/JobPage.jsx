import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import { Link, useLoaderData, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaMapMarked } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

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

const JobPage = ({ deleteJob }) => {
  const navigate = useNavigate();
  const job = useLoaderData();
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();

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
    if (!window.confirm('Are you sure you want to delete this listing?')) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteJob(jobId);
      toast.success('Job deleted successfully!');
      navigate('/jobs');
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
          <Link to="/jobs" className="flex items-center text-indigo-500 transition hover:text-indigo-600">
            <FaArrowLeft className="mr-2" /> Back to Job Listings
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
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{job.summary}</p>
                  </section>
                ) : null}

                <section>
                  <h3 className="text-lg font-semibold text-slate-900">Job Description</h3>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">{job.description}</p>
                </section>

                {job.responsibilities ? (
                  <section>
                    <h3 className="text-lg font-semibold text-slate-900">Responsibilities</h3>
                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">{job.responsibilities}</p>
                  </section>
                ) : null}

                {job.requirements ? (
                  <section>
                    <h3 className="text-lg font-semibold text-slate-900">Requirements</h3>
                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">{job.requirements}</p>
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
                <h3 className="text-xl font-semibold text-slate-900">How to apply</h3>
                <p className="mt-3 text-sm text-slate-600">
                  Login or create an account to submit your application and track status updates in real time.
                </p>
                <Link
                  to={user ? '/employee/applications' : '/login'}
                  className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white transition hover:bg-indigo-500"
                >
                  {user ? 'View your applications' : 'Sign in to apply'}
                </Link>
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
};

export default JobPage;