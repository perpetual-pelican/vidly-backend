const winston = require('winston');

module.exports = (err, req, res, next) => {
  if (process.env.NODE_ENV !== 'production') winston.error('', err);
  winston.loggers.get('db').error(err.message, { metadata: { error: err } });

  res.status(500).send('Something failed');

  return next(err);
};
