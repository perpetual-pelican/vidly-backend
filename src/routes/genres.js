const express = require('express');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validateObjectId = require('../middleware/validateObjectId');
const validate = require('../middleware/validate');
const find = require('../middleware/find');
const send = require('../middleware/send');
const remove = require('../middleware/remove');
const { Genre, validate: gVal } = require('../models/genre');

const router = express.Router();

router.get('/', async (req, res) => {
  const genres = await Genre.find().sort('name').lean();

  res.send(genres);
});

router.get('/:id', validateObjectId, find(Genre, 'lean'), send);

router.post('/', auth, validate(gVal), async (req, res) => {
  let genre = await Genre.findOne({ name: req.body.name });
  if (genre) return res.status(400).send('Genre name already exists');

  genre = new Genre(req.body);
  await genre.save();

  return res.send(genre);
});

router.put(
  '/:id',
  auth,
  validateObjectId,
  find(Genre),
  validate(gVal),
  async (req, res) => {
    let genre = await Genre.findOne({ name: req.body.name }).lean();
    if (genre) return res.status(400).send('Genre name already exists');

    genre = req.doc;

    genre.set(req.body);
    await genre.save();

    return res.send(genre);
  }
);

router.delete('/:id', auth, admin, validateObjectId, remove(Genre), send);

module.exports = router;
