import createHttpError from 'http-errors';

export function notFound(_req, _res, next) {
  next(createHttpError(404, 'Resource not found'));
}

export function errorHandler(err, _req, res, _next) {
  void _next;
  const status = err.status ?? 500;
  const message = status === 500 ? 'Unexpected server error' : err.message;
  res.status(status).json({
    error: {
      message,
      status,
    },
  });
}
