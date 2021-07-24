const express = require('express');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validateObjectId = require('../middleware/validateObjectId');
const validate = require('../middleware/validate');
const find = require('../middleware/find');
const send = require('../middleware/send');
const remove = require('../middleware/remove');
const { Movie, validatePost, validatePut } = require('../models/movie');
const { Genre } = require('../models/genre');

const router = express.Router();

router.get('/', async (req, res) => {
  const movies = await Movie.find().sort('title').lean();

  res.send(movies);
});

router.get('/:id', validateObjectId, find(Movie, 'lean'), send);

router.post('/', auth, validate(validatePost), async (req, res) => {
  if (req.body.genreIds) {
    // Begin retrieving all genres matching genreIds
    const genres = req.body.genreIds.map((genreId) => {
      return Genre.findById(genreId).lean();
    });
    // Await all genres from db
    req.body.genres = await Promise.all(genres);
    // Check if any genreId was not found
    if (req.body.genres.some((genre) => !genre))
      return res.status(400).send('Invalid genre id');
  }

  const movie = new Movie(req.body);
  await movie.save();

  return res.send(movie);
});

router.put(
  '/:id',
  auth,
  validateObjectId,
  find(Movie),
  validate(validatePut),
  async (req, res) => {
    const movie = req.doc;

    if (req.body.genreIds) {
      // Begin retrieving all genres matching genreIds
      const genres = req.body.genreIds.map((genreId) => {
        return Genre.findById(genreId).lean();
      });
      // Await all genres from db
      movie.genres = await Promise.all(genres);
      // Check if any genreId was not found
      if (movie.genres.some((genre) => !genre))
        return res.status(400).send('Invalid genre id');
    }

    movie.set(req.body);
    await movie.save();

    return res.send(movie);
  }
);

router.delete('/:id', auth, admin, validateObjectId, remove(Movie), send);

module.exports = router;
