import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarker } from 'react-icons/fa';

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

const JobListing = ({ job }) => {
  const [expanded, setExpanded] = useState(false);

  const summary = useMemo(() => {
    const base = job.summary || job.description || '';
    if (expanded || base.length <= 180) {
      return base;
    }
    return `${base.slice(0, 180)}…`;
  }, [expanded, job.description, job.summary]);

  const employmentLabel = formatEmploymentType(job.employmentType);
  const salaryLabel = formatSalaryRange(job.salaryMin, job.salaryMax, job.salaryCurrency);

  return (
    <article className="relative rounded-xl bg-white shadow-md">
      <div className="p-5">
        <header className="mb-4">
          <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            {employmentLabel}
            {job.isRemote ? ' • Remote friendly' : ''}
          </div>
          <h3 className="mt-2 text-xl font-bold text-slate-900">{job.title}</h3>
        </header>

        <p className="mb-4 text-sm text-slate-600">{summary}</p>
        {job.summary || job.description ? (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="text-sm font-medium text-indigo-600 transition hover:text-indigo-500"
          >
            {expanded ? 'Show less' : 'Read more'}
          </button>
        ) : null}

        <div className="mt-4 text-sm font-semibold text-indigo-600">{salaryLabel}</div>

        <div className="my-4 border border-slate-100" />

        <footer className="flex flex-col items-start justify-between gap-4 text-sm text-slate-500 md:flex-row md:items-center">
          <div className="flex items-center text-orange-600">
            <FaMapMarker className="mr-2 text-lg" />
            <span>{job.location}</span>
          </div>
          <Link
            to={`/jobs/${job.id}`}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            View details
          </Link>
        </footer>
      </div>
    </article>
  );
};

JobListing.propTypes = {
  job: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    summary: PropTypes.string,
    description: PropTypes.string,
    location: PropTypes.string.isRequired,
    employmentType: PropTypes.string,
    isRemote: PropTypes.bool,
    salaryMin: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    salaryMax: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    salaryCurrency: PropTypes.string,
  }).isRequired,
};

export default JobListing;