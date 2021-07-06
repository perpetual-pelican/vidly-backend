const express = require('express');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validateObjectId = require('../middleware/validateObjectId');
const validate = require('../middleware/validate');
const find = require('../middleware/find');
const post = require('../middleware/post');
const put = require('../middleware/put');
const remove = require('../middleware/remove');
const send = require('../middleware/send');
const { Customer, validatePost, validatePut } = require('../models/customer');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  const customers = await Customer.find().sort('name').lean();

  res.send(customers);
});

router.get('/:id', auth, validateObjectId, find(Customer, 'lean'), send);

router.post('/', auth, validate(validatePost), post(Customer), send);

router.put(
  '/:id',
  auth,
  validateObjectId,
  find(Customer),
  validate(validatePut),
  put,
  send
);

router.delete('/:id', auth, admin, validateObjectId, remove(Customer), send);

module.exports = router;
