const home = require('../routes/home');
const customers = require('../routes/customers');
const genres = require('../routes/genres');
const movies = require('../routes/movies');
const rentals = require('../routes/rentals');
const returns = require('../routes/returns');
const users = require('../routes/users');
const login = require('../routes/login');

module.exports = (app) => {
  app.use('/', home);
  app.use('/api/login', login);
  app.use('/api/users', users);
  app.use('/api/customers', customers);
  app.use('/api/genres', genres);
  app.use('/api/movies', movies);
  app.use('/api/rentals', rentals);
  app.use('/api/returns', returns);
};
