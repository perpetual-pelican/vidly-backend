const express = require('express');
const mongoose = require('mongoose');
const winston = require('winston');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { Rental } = require('../models/rental');
const { Movie } = require('../models/movie');
const { validate: rVal } = require('../models/rental');

const router = express.Router();

router.post('/', auth, validate(rVal), async (req, res) => {
  let rental;

  let success = false;
  await mongoose.connection
    .transaction(async (session) => {
      rental = await Rental.lookup(
        req.body.customerId,
        req.body.movieId
      ).session(session);
      if (!rental) {
        res.status(404).send('No active rental for customer and movie');
        return session.abortTransaction();
      }
      await rental.return();

      await Movie.updateOne(
        { _id: rental.movie.id },
        { $inc: { numberInStock: 1 } },
        { session }
      );

      success = true;
      return success;
    })
    .catch((err) => {
      winston.error(err.message, { metadata: { error: err } });
      return res.status(500).send('Transaction failed. Data unchanged.');
    });

  if (success) return res.send(rental);
});

module.exports = router;
