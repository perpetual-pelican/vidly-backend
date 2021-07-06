const express = require('express');
require('express-async-errors');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const loadRoutes = require('./routes');
const error = require('../middleware/error');

const app = express();

app.use(express.json());
loadRoutes(app);
app.use(error);

module.exports = app;
