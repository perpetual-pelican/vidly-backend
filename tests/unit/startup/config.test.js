describe('config startup', () => {
  const vidlyKey = process.env.vidly_jwtPrivateKey;
  const { NODE_ENV } = process.env;

  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    process.env.vidly_jwtPrivateKey = vidlyKey;
    process.env.NODE_ENV = NODE_ENV;
  });

  it('should throw if jwtPrivateKey env variable is not set', () => {
    delete process.env.vidly_jwtPrivateKey;

    expect(() => {
      require('../../../src/startup/config');
    }).toThrow();
  });

  it('should not throw if jwtPrivateKey env variable is set', () => {
    expect(() => {
      require('../../../src/startup/config');
    }).not.toThrow();
  });

  it('should use localhost for dbString if os type is not Windows', () => {
    const os = require('os');
    os.type = jest.fn().mockReturnValue('Linux');

    const { dbString } = require('../../../src/startup/config');

    expect(dbString).toMatch(/localhost/);
  });

  it('should use hostname for dbString if os type is Windows', () => {
    const os = require('os');
    os.type = jest.fn().mockReturnValue('Windows_NT');

    const { dbString } = require('../../../src/startup/config');

    expect(dbString).toMatch(new RegExp(os.hostname()));
  });

  it('should add "development" to dbName if NODE_ENV is undefined', () => {
    delete process.env.NODE_ENV;

    const { dbOptions } = require('../../../src/startup/config');

    expect(dbOptions.dbName).toMatch(/development/);
  });

  it('should add NODE_ENV to dbName if it is defined', () => {
    const { dbOptions } = require('../../../src/startup/config');

    expect(dbOptions.dbName).toMatch(/test/);
  });
});
