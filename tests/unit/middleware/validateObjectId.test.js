const mongoose = require('mongoose');
const validateObjectId = require('../../../src/middleware/validateObjectId');

describe('validateObjectId middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = { params: { id: mongoose.Types.ObjectId() } };
    res = { status: jest.fn().mockReturnValue({ send: jest.fn() }) };
    next = jest.fn();
  });

  it('should set status to 404 if id is invalid', async () => {
    req.params.id = 'invalid';

    validateObjectId(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('should call next if id is valid', async () => {
    validateObjectId(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
