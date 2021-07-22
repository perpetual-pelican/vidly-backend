const winston = require('winston');
const app = require('./app');

module.exports = () => {
  const port = process.env.PORT || 4000;
  const server = app.listen(port);

  winston.info(`Listening on port ${port}...`);

  return server;
};
