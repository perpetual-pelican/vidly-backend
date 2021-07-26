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

  it('should use dbString with process.env.vidly_hosts if set and replicaSet=vidly_rs if process.env.vidly_rs not set', () => {
    process.env.vidly_hosts = 'provided_hosts';

    const { dbString } = require('../../../src/startup/config');
    delete process.env.vidly_hosts;

    expect(dbString).toMatch(/provided_hosts\/\?replicaSet=vidly_rs/);
  });

  it('should use dbString with process.env.vidly_hosts and process.env.vidly_rs if both are set', () => {
    process.env.vidly_hosts = 'provided_hosts';
    process.env.vidly_rs = 'provided_rs';

    const { dbString } = require('../../../src/startup/config');
    delete process.env.vidly_hosts;
    delete process.env.vidly_rs;

    expect(dbString).toMatch(/provided_hosts\/\?replicaSet=provided_rs/);
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
