const winston = require('winston');
const errorMiddleware = require('../../../src/middleware/error');

winston.error = jest.fn();

describe('error middleware', () => {
  let err;
  let req;
  let res;
  let next;
  let winstonDBLogger;

  beforeEach(() => {
    err = Error('fake error message');
    req = { header: jest.fn().mockReturnValue() };
    res = { status: jest.fn().mockReturnValue({ send: jest.fn() }) };
    next = jest.fn();

    winston.error = jest.fn();
    winstonDBLogger = { error: jest.fn() };
    winston.loggers.get = jest.fn(() => winstonDBLogger);
  });

  it('should only log the error to the db if NODE_ENV is production', async () => {
    const { NODE_ENV } = process.env;
    process.env.NODE_ENV = 'production';

    errorMiddleware(err, req, res, next);
    process.env.NODE_ENV = NODE_ENV;

    expect(winston.error).not.toHaveBeenCalled();
    expect(winston.loggers.get).toHaveBeenCalledWith('db');
    expect(winstonDBLogger.error).toHaveBeenCalledWith(err.message, {
      metadata: { error: err },
    });
  });

  it('should log the error with winston', async () => {
    errorMiddleware(err, req, res, next);

    expect(winston.error).toHaveBeenCalledWith('', err);
    expect(winston.loggers.get).toHaveBeenCalledWith('db');
    expect(winstonDBLogger.error).toHaveBeenCalledWith(err.message, {
      metadata: { error: err },
    });
  });

  it('should return 500 if an unexpected error occurs', async () => {
    errorMiddleware(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
