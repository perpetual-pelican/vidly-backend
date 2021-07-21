const validate = require('../../../src/middleware/validate');

describe('validate middleware', () => {
  let validator;
  let req;
  let res;
  let next;

  beforeEach(() => {
    const error = { details: [{ message: 'error message' }] };
    validator = jest.fn().mockReturnValue({ error });
    req = {};
    res = { status: jest.fn().mockReturnValue({ send: jest.fn() }) };
    next = jest.fn();
  });

  it('should return a validator middleware function', async () => {
    const ret = validate(validator);

    expect(typeof ret).toBe('function');
  });

  it('should set status to 400 if validator returns error', async () => {
    validate(validator)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should call next if input is valid', async () => {
    validator = jest.fn().mockReturnValue({});

    validate(validator)(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
