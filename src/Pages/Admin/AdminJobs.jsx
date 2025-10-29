import { useMemo, useState } from 'react';
import { FiFilter, FiSearch, FiEye, FiFileText } from 'react-icons/fi';

const jobRecords = [
  {
    id: 'job-420',
    title: 'SaaS Dashboard Redesign',
    employer: 'LaunchPad Labs',
    category: 'UI/UX Design',
    budgetType: 'Fixed',
    posted: 'Oct 22, 2024',
    status: 'Pending',
    proposals: 18,
    budgetRange: '$4k - $6k',
    attachments: ['CreativeBrief.pdf'],
    description:
      'Seeking a senior product designer to modernize our analytics dashboard. Deliverables include a responsive component system in Figma and developer-ready specifications.',
  },
  {
    id: 'job-421',
    title: 'Marketing Automation Specialist',
    employer: 'Bright Media',
    category: 'Digital Marketing',
    budgetType: 'Hourly',
    posted: 'Oct 20, 2024',
    status: 'Approved',
    proposals: 37,
    budgetRange: '$55/hr',
    attachments: [],
    description:
      'Ongoing engagement to optimize HubSpot workflows, lead scoring, and lifecycle email nurture programs. Weekly reporting expected.',
  },
  {
    id: 'job-422',
    title: 'Kotlin Android Engineer',
    employer: 'Orbit Finance',
    category: 'Mobile Development',
    budgetType: 'Hourly',
    posted: 'Oct 19, 2024',
    status: 'Active',
    proposals: 22,
    budgetRange: '$70/hr',
    attachments: ['TechSpec.docx', 'Wireframes.fig'],
    description:
      'Build new features for our consumer investing app. Experience with biometric authentication and Jetpack Compose required.',
  },
  {
    id: 'job-423',
    title: 'B2B Content Strategist',
    employer: 'Northbound',
    category: 'Copywriting',
    budgetType: 'Fixed',
    posted: 'Oct 17, 2024',
    status: 'Rejected',
    proposals: 11,
    budgetRange: '$2k - $3k',
    attachments: [],
    description:
      'Looking for expert-level writer with fintech background to produce long-form case studies and gated assets. Pitch timeline and distribution plan.',
  },
  {
    id: 'job-424',
    title: 'Salesforce Integration Lead',
    employer: 'Atlas Ops',
    category: 'CRM & ERP',
    budgetType: 'Fixed',
    posted: 'Oct 15, 2024',
    status: 'Closed',
    proposals: 45,
    budgetRange: '$18k',
    attachments: ['Requirements.pdf'],
    description:
      'Enterprise-grade rollout connecting Salesforce with NetSuite. Requires security review and compliance documentation in final delivery.',
  },
];

const statusBadge = {
  Pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  Approved: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  Rejected: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  Active: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  Closed: 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

const AdminJobs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedJob, setSelectedJob] = useState(null);

  const filteredJobs = useMemo(() => {
    return jobRecords.filter((job) => {
      const matchesSearch = `${job.title} ${job.employer}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase().trim());
      const matchesStatus = statusFilter === 'All' || job.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  return (
    <div className="space-y-8">
      <header className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Job Management</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Approve new listings, monitor active contracts, and keep quality standards high.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-500/60"
        >
          <FiFilter className="text-base" />
          Bulk actions
        </button>
      </header>

      <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 dark:border-slate-700 dark:bg-slate-900 lg:max-w-md">
            <FiSearch className="text-lg text-slate-400" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search job title or employer"
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              {['All', 'Pending', 'Approved', 'Rejected', 'Active', 'Closed'].map((statusOption) => (
                <option key={statusOption}>{statusOption}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="-mx-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-900/60">
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <th scope="col" className="px-4 py-3">Job Title</th>
                <th scope="col" className="px-4 py-3">Employer</th>
                <th scope="col" className="px-4 py-3">Category</th>
                <th scope="col" className="px-4 py-3">Budget Type</th>
                <th scope="col" className="px-4 py-3">Date Posted</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredJobs.map((job) => (
                <tr
                  key={job.id}
                  className="transition hover:bg-slate-50/60 dark:hover:bg-slate-800/70"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900 dark:text-white">{job.title}</div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{job.id}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{job.employer}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{job.category}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{job.budgetType}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{job.posted}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        statusBadge[job.status] || statusBadge.Pending
                      }`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex flex-wrap items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedJob(job)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-500/60"
                      >
                        <FiEye className="text-base" />
                        Details
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-transparent bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-600 transition hover:bg-emerald-500/20 dark:text-emerald-400"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-transparent bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-500/20 dark:text-rose-400"
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-transparent bg-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredJobs.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400">
            No job postings match your filters. Try broadening the search criteria.
          </div>
        )}
      </section>

      {selectedJob && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 px-4 py-6 backdrop-blur"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{selectedJob.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {selectedJob.employer} · {selectedJob.category}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                className="self-start rounded-full border border-transparent bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Close
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-800/60">
                <p className="text-xs uppercase tracking-wide text-slate-400">Budget Type</p>
                <p className="mt-2 font-medium text-slate-900 dark:text-white">{selectedJob.budgetType}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{selectedJob.budgetRange}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-800/60">
                <p className="text-xs uppercase tracking-wide text-slate-400">Proposals</p>
                <p className="mt-2 font-medium text-slate-900 dark:text-white">{selectedJob.proposals}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Active submissions awaiting review</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-800/60">
                <p className="text-xs uppercase tracking-wide text-slate-400">Date Posted</p>
                <p className="mt-2 font-medium text-slate-900 dark:text-white">{selectedJob.posted}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-800/60">
                <p className="text-xs uppercase tracking-wide text-slate-400">Status</p>
                <span
                  className={`mt-2 inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium ${
                    statusBadge[selectedJob.status] || statusBadge.Pending
                  }`}
                >
                  {selectedJob.status}
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-3 text-sm">
              <p className="text-xs uppercase tracking-wide text-slate-400">Brief</p>
              <p className="leading-relaxed text-slate-600 dark:text-slate-300">{selectedJob.description}</p>
            </div>

            {selectedJob.attachments.length > 0 && (
              <div className="mt-6">
                <p className="text-xs uppercase tracking-wide text-slate-400">Attachments</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedJob.attachments.map((fileName) => (
                    <span
                      key={fileName}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                    >
                      <FiFileText className="text-base text-indigo-500" />
                      {fileName}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-wrap justify-end gap-3 text-sm">
              <button
                type="button"
                className="rounded-lg border border-slate-200 px-4 py-2 font-medium text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-500/60"
              >
                Request edits
              </button>
              <button
                type="button"
                className="rounded-lg border border-transparent bg-emerald-500 px-4 py-2 font-medium text-white shadow-sm transition hover:bg-emerald-500/90"
              >
                Mark as approved
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJobs;
