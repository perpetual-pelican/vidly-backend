const mongoose = require('mongoose');
const winston = require('winston');
const { dbString, dbOptions } = require('../../../src/startup/config');
const connectToDB = require('../../../src/startup/db');

describe('db startup', () => {
  beforeEach(() => {
    mongoose.connect = jest.fn();
    winston.info = jest.fn();
  });

  it('should connect to vidly_test mongodb', async () => {
    await connectToDB();

    expect(mongoose.connect).toHaveBeenCalledWith(dbString, dbOptions);
  });

  it('should log the connection status to winston', async () => {
    await connectToDB();

    expect(winston.info).toHaveBeenCalled();
    expect(winston.info.mock.calls[0][0]).toMatch(dbString);
  });
});
