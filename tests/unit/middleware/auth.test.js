const mongoose = require('mongoose');
const { User } = require('../../../src/models/user');
const auth = require('../../../src/middleware/auth');

describe('auth middleware', () => {
  let user;
  let req;
  let res;
  let next;

  beforeEach(() => {
    user = {
      _id: mongoose.Types.ObjectId().toHexString(),
      isAdmin: false,
    };
    const token = new User(user).generateAuthToken();
    req = { header: jest.fn().mockReturnValue(token) };
    res = { status: jest.fn().mockReturnValue({ send: jest.fn() }) };
    next = jest.fn();
  });

  it('should set status to 401 if no token provided', async () => {
    req.header = req.header.mockReturnValue('');

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('should set status to 400 if token is invalid', async () => {
    req.header = req.header.mockReturnValue('invalid');

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should populate req.user with user object if token is valid', () => {
    auth(req, res, next);

    expect(req.user).toMatchObject(user);
  });

  it('should call next if token is valid', () => {
    auth(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
