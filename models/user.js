const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const passwordComplexity = require('joi-password-complexity');
const { jwtPrivateKey } = require('../startup/config');

const name = { min: 3, max: 128 };
const email = { min: 7, max: 69 };
const password = { min: 8, max: 72 };

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: name.min,
    maxLength: name.max,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    minLength: email.min,
    maxLength: email.max,
  },
  password: {
    type: String,
    required: true,
    minLength: password.min,
    maxLength: password.max,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

userSchema.methods.generateAuthToken = function generateAuthToken() {
  return jwt.sign({ _id: this.id, isAdmin: this.isAdmin }, jwtPrivateKey);
};

const User = mongoose.model('User', userSchema);

const joiSchema = Joi.object({
  name: Joi.string().min(name.min).max(name.max).required(),
  email: Joi.string().min(email.min).max(email.max).email().required(),
  password: passwordComplexity({
    min: password.min,
    max: password.max,
    lowerCase: 1,
    upperCase: 1,
    numeric: 1,
    symbol: 1,
    requirementCount: 4,
  }).required(),
});

function validate(user) {
  return joiSchema.validate(user);
}

exports.bounds = { name, email, password };
exports.User = User;
exports.validate = validate;
