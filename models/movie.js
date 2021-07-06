const mongoose = require('mongoose');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const { genreSchema } = require('./genre');

const title = { min: 3, max: 128 };
const dailyRentalRate = { min: 0, max: 20 };
const numberInStock = { min: 0, max: 1000 };
const genres = { min: 1, max: 10 };

const movieSchemaBase = {
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: title.min,
    maxlength: title.max,
  },
  dailyRentalRate: {
    type: Number,
    required: true,
    min: dailyRentalRate.min,
    max: dailyRentalRate.max,
  },
};

const movieSchema = new mongoose.Schema({
  title: movieSchemaBase.title,
  dailyRentalRate: movieSchemaBase.dailyRentalRate,
  numberInStock: {
    type: Number,
    required: true,
    min: numberInStock.min,
    max: numberInStock.max,
  },
  genres: {
    type: [genreSchema],
    default: undefined,
    unique: true,
    min: genres.min,
    max: genres.max,
  },
});

const Movie = mongoose.model('Movie', movieSchema);

const joiSchema = {
  title: Joi.string().min(title.min).max(title.max),
  dailyRentalRate: Joi.number()
    .precision(2)
    .min(dailyRentalRate.min)
    .max(dailyRentalRate.max),
  numberInStock: Joi.number()
    .integer()
    .min(numberInStock.min)
    .max(numberInStock.max),
  genreIds: Joi.array()
    .items(Joi.objectId())
    .min(genres.min)
    .max(genres.max)
    .unique(),
};

const joiPostSchema = Joi.object({
  title: joiSchema.title.required(),
  dailyRentalRate: joiSchema.dailyRentalRate.required(),
  numberInStock: joiSchema.numberInStock.required(),
  genreIds: joiSchema.genreIds,
});

function validatePost(movie) {
  return joiPostSchema.validate(movie);
}

const joiPutSchema = Joi.object(joiSchema);

function validatePut(movie) {
  if (Object.keys(movie).length === 0) {
    const message = 'At least one property is required to update movie';
    return { error: new Error(message) };
  }
  return joiPutSchema.validate(movie);
}

exports.bounds = { title, genres, numberInStock, dailyRentalRate };
exports.movieSchemaBase = movieSchemaBase;
exports.Movie = Movie;
exports.validatePost = validatePost;
exports.validatePut = validatePut;
