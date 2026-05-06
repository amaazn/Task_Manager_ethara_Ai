export function notFound(req, res) {
  res.status(404).json({ error: { message: 'Route not found' } });
}

export function errorHandler(err, req, res, next) {
  console.error('[error]', err);
  if (err?.name === 'ZodError') {
    return res.status(400).json({ error: { message: 'Validation failed', details: err.issues } });
  }
  if (err?.name === 'ValidationError') {
    return res.status(400).json({ error: { message: err.message } });
  }
  if (err?.code === 11000) {
    return res.status(409).json({ error: { message: 'Duplicate value', details: err.keyValue } });
  }
  res.status(err.status || 500).json({ error: { message: err.message || 'Server error' } });
}
