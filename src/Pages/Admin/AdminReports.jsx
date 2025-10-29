const AdminReports = () => {
  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Reports &amp; Analytics</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Visualize platform performance, growth trends, and financial signals. Custom dashboards are coming soon.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        {["Revenue", "User Acquisition", "Job Lifecycle"].map((title) => (
          <article
            key={title}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
          >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title} Dashboard</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Configure KPIs, time ranges, and automated exports. Data connectors will sync with BI tooling.
            </p>
            <div className="mt-5 h-32 rounded-xl bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-800 dark:via-slate-900 dark:to-slate-900">
              <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                Analytics Preview
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
};

export default AdminReports;
