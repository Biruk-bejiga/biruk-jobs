const rawBaseUrl = import.meta.env.VITE_API_URL ?? '';
const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '');

const ABSOLUTE_URL_REGEX = /^https?:\/\//i;

export const resolveApiUrl = (input) => {
	if (typeof input !== 'string') {
		return input;
	}

	if (!API_BASE_URL || ABSOLUTE_URL_REGEX.test(input)) {
		return input;
	}

	if (input.startsWith('/')) {
		return `${API_BASE_URL}${input}`;
	}

	return `${API_BASE_URL}/${input}`;
};

export { API_BASE_URL };
