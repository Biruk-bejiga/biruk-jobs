export const jobLoader = async ({ params }) => {
  const res = await fetch(`/api/jobs/${params.id}`);
  if (!res.ok) {
    throw new Response('Job not found', { status: res.status });
  }
  const body = await res.json();
  return body?.data ?? null;
};
