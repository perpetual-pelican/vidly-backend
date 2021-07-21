const { User } = require('../../../src/models/user');
const admin = require('../../../src/middleware/admin');

describe('admin middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {};
    res = { status: jest.fn().mockReturnValue({ send: jest.fn() }) };
    next = jest.fn();
  });

  it('should set status to 403 if user is not admin', async () => {
    req.user = new User({ isAdmin: false });

    admin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('should call next if user is admin', () => {
    req.user = new User({ isAdmin: true });

    admin(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
