const mongoose = require('mongoose');
const Joi = require('joi');
const moment = require('moment');
const { customerSchema } = require('./customer');
const { movieSchemaBase } = require('./movie');

const rentalSchema = new mongoose.Schema({
  customer: {
    type: customerSchema,
    required: true,
  },
  movie: {
    type: new mongoose.Schema(movieSchemaBase),
    required: true,
  },
  dateOut: {
    type: Date,
    required: true,
    default: Date.now,
  },
  dateReturned: {
    type: Date,
  },
  rentalFee: {
    type: Number,
    min: 0,
  },
});

rentalSchema.statics.lookup = function lookup(customerId, movieId) {
  return this.findOne({
    'customer._id': customerId,
    'movie._id': movieId,
    dateReturned: undefined,
  });
};

rentalSchema.methods.return = async function returnRental(session) {
  this.dateReturned = Date.now();

  const daysOut = moment(this.dateReturned).diff(this.dateOut, 'days');
  this.rentalFee = daysOut * this.movie.dailyRentalRate;

  await this.save(session);
};

const Rental = mongoose.model('Rental', rentalSchema);

const joiSchema = Joi.object({
  customerId: Joi.objectId().required(),
  movieId: Joi.objectId().required(),
});

function validate(rental) {
  return joiSchema.validate(rental);
}

exports.Rental = Rental;
exports.validate = validate;
