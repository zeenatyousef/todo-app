// Wraps a Zod schema into an Express middleware. Validates req[source]
// (defaults to the request body) and returns a 400 with readable
// messages if it fails. Pass source: 'query' to validate query params.
function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    req[source] = result.data;
    next();
  };
}

module.exports = { validate };
