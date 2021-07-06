const mongoose = require('mongoose');
const Joi = require('joi');

const name = { min: 3, max: 128 };

const genreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: name.min,
    maxlength: name.max,
  },
});

const Genre = mongoose.model('Genre', genreSchema);

const joiSchema = Joi.object({
  name: Joi.string().min(name.min).max(name.max).required(),
});

function validate(genre) {
  return joiSchema.validate(genre);
}

exports.bounds = { name };
exports.genreSchema = genreSchema;
exports.Genre = Genre;
exports.validate = validate;
