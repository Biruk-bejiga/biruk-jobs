import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { FiTrash2 } from 'react-icons/fi';
import Spinner from '../../Comonent/Spinner';
import { useAuth } from '../../context/AuthContext';

const EmployeeFavorites = () => {
  const { authFetchJson } = useAuth();
  const queryClient = useQueryClient();

  const favoritesQuery = useQuery({
    queryKey: ['employee', 'favorites'],
    queryFn: async () => {
      const response = await authFetchJson('/api/employees/favorites');
      return response?.data ?? [];
    },
  });

  const handleRemove = async (jobId) => {
    try {
      await authFetchJson(`/api/employees/favorites/${jobId}`, {
        method: 'DELETE',
      });
      toast.success('Removed from favorites');
      queryClient.invalidateQueries({ queryKey: ['employee', 'favorites'] });
    } catch (err) {
      toast.error(err.message ?? 'Failed to remove favorite');
    }
  };

  if (favoritesQuery.isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner loading />
      </div>
    );
  }

  if (favoritesQuery.isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
        {favoritesQuery.error?.message ?? 'Failed to load favorites'}
      </div>
    );
  }

  const favorites = Array.isArray(favoritesQuery.data) ? favoritesQuery.data : [];

  if (!favorites.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
        You haven’t saved any jobs yet. Tap the save icon on interesting roles to keep them handy.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {favorites.map((favorite) => (
        <article key={favorite.favorite.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{favorite.job.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{favorite.job.location}</p>
            </div>
            <button
              type="button"
              onClick={() => handleRemove(favorite.job.id)}
              className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50"
            >
              <FiTrash2 /> Remove
            </button>
          </div>
          <p className="mt-3 text-sm text-slate-600 line-clamp-3">{favorite.job.summary ?? favorite.job.description}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium">
              {favorite.job.employmentType?.replace('_', ' ')}
            </span>
            {favorite.job.isRemote ? (
              <span className="rounded-full bg-emerald-100 px-3 py-1 font-medium text-emerald-600">Remote</span>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
};

export default EmployeeFavorites;
