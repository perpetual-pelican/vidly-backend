const express = require('express');
const mongoose = require('mongoose');
const winston = require('winston');
const _ = require('lodash');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validateObjectId = require('../middleware/validateObjectId');
const validate = require('../middleware/validate');
const find = require('../middleware/find');
const send = require('../middleware/send');
const { Rental, validate: rVal } = require('../models/rental');
const { Customer } = require('../models/customer');
const { Movie } = require('../models/movie');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  const rentals = await Rental.find().sort('-dateOut').lean();

  res.send(rentals);
});

router.get('/:id', auth, validateObjectId, find(Rental, 'lean'), send);

router.post('/', auth, validate(rVal), async (req, res) => {
  const customer = await Customer.findById(req.body.customerId).lean();
  if (!customer) return res.status(400).send('Invalid customer id');

  let rental;

  let success = false;
  await mongoose.connection
    .transaction(async (session) => {
      const movie = await Movie.findById(req.body.movieId).session(session);
      if (!movie) {
        res.status(400).send('Invalid movie id');
        return session.abortTransaction();
      }
      if (movie.numberInStock < 1) {
        res.status(400).send('Movie out of stock');
        return session.abortTransaction();
      }
      movie.set({ numberInStock: movie.numberInStock - 1 });
      await movie.save();

      rental = await Rental.lookup(
        req.body.customerId,
        req.body.movieId
      ).lean();
      if (rental) {
        res.status(400).send('Customer is already renting this movie');
        return session.abortTransaction();
      }
      rental = new Rental({
        customer: _.pick(customer, ['_id', 'name', 'phone', 'isGold']),
        movie: _.pick(movie, ['_id', 'title', 'dailyRentalRate']),
      });
      await rental.save({ session });

      success = true;
      return success;
    })
    .catch((err) => {
      winston.error(err.message, { metadata: { error: err } });
      return res.status(500).send('Transaction failed. Data unchanged.');
    });

  if (success) return res.send(rental.toObject());
});

router.delete(
  '/:id',
  auth,
  admin,
  validateObjectId,
  find(Rental),
  async (req, res) => {
    let rental = req.doc;

    let success = false;
    if (rental.dateReturned) {
      rental = await rental.remove();
      success = true;
    } else {
      await mongoose.connection
        .transaction(async (session) => {
          rental = await rental.remove({ session });

          await Movie.updateOne(
            { _id: rental.movie._id },
            { $inc: { numberInStock: 1 } },
            { session }
          );

          success = true;
        })
        .catch((err) => {
          winston.error(err.message, { metadata: { error: err } });
          return res.status(500).send('Transaction failed. Data unchanged.');
        });
    }

    if (success) return res.send(rental.toObject());
  }
);

module.exports = router;
