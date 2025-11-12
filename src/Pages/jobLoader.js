import { resolveApiUrl } from '../lib/apiClient';

export const jobLoader = async ({ params }) => {
  const res = await fetch(resolveApiUrl(`/api/jobs/${params.id}`));

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Response('Failed to load job', { status: res.status });
  }

  const body = await res.json();
  return body?.data ?? null;
};
