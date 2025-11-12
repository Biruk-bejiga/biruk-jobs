import PropTypes from 'prop-types';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import Spinner from '../Comonent/Spinner';
import { resolveApiUrl } from '../lib/apiClient';

const AuthContext = createContext(undefined);
const ACCESS_TOKEN_KEY = 'accessToken';

const parseErrorResponse = async (response, fallback) => {
  try {
    const body = await response.json();
    return body?.error?.message ?? body?.message ?? fallback;
  } catch (error) {
    console.error('Failed to parse error response', error);
    return fallback;
  }
};

const getStoredToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(getStoredToken);
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const persistToken = useCallback((token) => {
    if (typeof window === 'undefined') {
      setAccessToken(token ?? null);
      return;
    }

    if (token) {
      window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
      setAccessToken(token);
    } else {
      window.localStorage.removeItem(ACCESS_TOKEN_KEY);
      setAccessToken(null);
    }
  }, []);

  const refreshAccessToken = useCallback(async () => {
    try {
  const response = await fetch(resolveApiUrl('/api/auth/refresh'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        return null;
      }

      const body = await response.json();
      const token = body?.data?.accessToken;

      if (token) {
        persistToken(token);
      }

      return token ?? null;
    } catch (error) {
      console.error('Failed to refresh access token', error);
      return null;
    }
  }, [persistToken]);

  const authFetch = useCallback(
    async (input, init = {}) => {
  const headers = new Headers(init.headers || {});
  const target = typeof input === 'string' ? resolveApiUrl(input) : input;

      if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
      }

  let response = await fetch(target, {
        ...init,
        headers,
        credentials: 'include',
      });

      if (response.status !== 401) {
        return response;
      }

      const refreshedToken = await refreshAccessToken();

      if (!refreshedToken) {
        persistToken(null);
        setUser(null);
        return response;
      }

      const retryHeaders = new Headers(init.headers || {});
      retryHeaders.set('Authorization', `Bearer ${refreshedToken}`);

  response = await fetch(target, {
        ...init,
        headers: retryHeaders,
        credentials: 'include',
      });

      return response;
    },
    [accessToken, persistToken, refreshAccessToken],
  );

  const authFetchJson = useCallback(
    async (input, init = {}, fallbackMessage = 'Request failed') => {
      const response = await authFetch(input, init);
      if (!response.ok) {
        const message = await parseErrorResponse(response, fallbackMessage);
        const error = new Error(message);
        error.status = response.status;
        throw error;
      }

      if (response.status === 204) {
        return null;
      }

      return response.json();
    },
    [authFetch],
  );

  const login = useCallback(
    async (email, password) => {
      try {
  const response = await fetch(resolveApiUrl('/api/auth/login'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const message = await parseErrorResponse(
            response,
            'Unable to log in with provided credentials.',
          );
          throw new Error(message);
        }

        const body = await response.json();
        const token = body?.data?.accessToken ?? null;
        const userData = body?.data?.user ?? null;

        if (token) {
          persistToken(token);
        }

        setUser(userData);
        return userData;
      } catch (error) {
        console.error('Login request failed', error);
        throw error;
      }
    },
    [persistToken],
  );

  const logout = useCallback(async () => {
    try {
      const headers = new Headers();
      if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
      }

  const target = resolveApiUrl('/api/auth/logout');

  await fetch(target, {
        method: 'POST',
        credentials: 'include',
        headers,
      });
    } catch (error) {
      console.error('Logout request failed', error);
    } finally {
      persistToken(null);
      setUser(null);
    }
  }, [accessToken, persistToken]);

  const loadCurrentUser = useCallback(async () => {
    if (!accessToken) {
      setInitializing(false);
      return;
    }

    try {
      const response = await authFetch('/api/auth/me');

      if (!response.ok) {
        if (response.status === 401) {
          persistToken(null);
          setUser(null);
        }
        setInitializing(false);
        return;
      }

      const body = await response.json();
      setUser(body?.data ?? null);
    } catch (error) {
      console.error('Failed to load current user', error);
    } finally {
      setInitializing(false);
    }
  }, [accessToken, authFetch, persistToken]);

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  const contextValue = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      initializing,
      login,
      logout,
      authFetch,
      authFetchJson,
      refreshAccessToken,
      persistToken,
      accessToken,
    }),
    [
      user,
      initializing,
      login,
      logout,
      authFetch,
      authFetchJson,
      refreshAccessToken,
      persistToken,
      accessToken,
    ],
  );

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Spinner loading />
      </div>
    );
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
