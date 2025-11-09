import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { FiExternalLink, FiXCircle } from 'react-icons/fi';
import Spinner from '../../Comonent/Spinner';
import { useAuth } from '../../context/AuthContext';

const statusStyles = {
  submitted: 'bg-slate-100 text-slate-600',
  in_review: 'bg-indigo-100 text-indigo-600',
  shortlisted: 'bg-emerald-100 text-emerald-600',
  rejected: 'bg-rose-100 text-rose-600',
  withdrawn: 'bg-amber-100 text-amber-600',
  hired: 'bg-sky-100 text-sky-600',
};

const EmployeeApplications = () => {
  const { authFetchJson } = useAuth();
  const queryClient = useQueryClient();

  const applicationsQuery = useQuery({
    queryKey: ['employee', 'applications'],
    queryFn: async () => {
      const response = await authFetchJson('/api/employees/applications');
      return response?.data ?? [];
    },
  });

  const applications = Array.isArray(applicationsQuery.data) ? applicationsQuery.data : [];

  const handleWithdraw = async (applicationId) => {
    try {
      await authFetchJson(`/api/employees/applications/${applicationId}/withdraw`, {
        method: 'POST',
      });
      toast.success('Application withdrawn');
      queryClient.invalidateQueries({ queryKey: ['employee', 'applications'] });
    } catch (err) {
      toast.error(err.message ?? 'Unable to withdraw application');
    }
  };

  if (applicationsQuery.isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner loading />
      </div>
    );
  }

  if (applicationsQuery.isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
        {applicationsQuery.error?.message ?? 'Failed to load applications'}
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
        You haven’t applied to any roles yet. Browse jobs to find your next opportunity.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3 font-semibold">Job</th>
            <th className="px-4 py-3 font-semibold">Applied</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white text-sm text-slate-700">
          {applications.map((entry) => {
            const statusClass = statusStyles[entry.application.status] ?? statusStyles.submitted;
            return (
              <tr key={entry.application.id}>
                <td className="px-4 py-4">
                  <div className="font-medium text-slate-900">{entry.job.title}</div>
                  <div className="text-xs text-slate-500">{entry.job.location}</div>
                </td>
                <td className="px-4 py-4 text-slate-500">
                  {new Date(entry.application.submittedAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-4">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}>
                    {entry.application.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="inline-flex items-center gap-2">
                    {entry.application.resumeUrl ? (
                      <a
                        href={entry.application.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:border-indigo-200 hover:text-indigo-600"
                      >
                        <FiExternalLink /> Résumé
                      </a>
                    ) : null}
                    {entry.application.status === 'submitted' || entry.application.status === 'in_review' ? (
                      <button
                        type="button"
                        onClick={() => handleWithdraw(entry.application.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50"
                      >
                        <FiXCircle /> Withdraw
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeApplications;
