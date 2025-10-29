const AdminDisputes = () => {
  return (
    <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Dispute Center</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Track and resolve disputes between clients and talent. Workflow automation will be connected soon.
        </p>
      </header>
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400">
        Detailed dispute triage tools are in progress. In the meantime, escalate urgent cases directly to the Trust & Safety team.
      </div>
    </div>
  );
};

export default AdminDisputes;
