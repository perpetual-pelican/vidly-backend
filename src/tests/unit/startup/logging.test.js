const { dbString } = require('../../../startup/config');

jest.mock('winston-mongodb', () => {
  const winston = require('winston');
  winston.transports.MongoDB = jest.fn(() => {
    return new winston.transports.Console();
  });
});

describe('logging startup', () => {
  afterEach(() => {
    jest.resetModules();
  });

  describe('error handlers', () => {
    it('should log if an uncaughtException event is encountered', () => {
      require('../../../startup/logging');

      const winston = require('winston');
      winston.exitOnError = false;
      winston.exceptions.logger.log = jest.fn();

      const uncaughtException = new Error('fake uncaught exception');

      expect(() => {
        process.emit('uncaughtException', uncaughtException);
      }).not.toThrow();
      expect(winston.exceptions.logger.log).toHaveBeenCalledWith(
        expect.objectContaining({ error: uncaughtException })
      );
    });

    it('should throw an error if an unhandledRejection event is encountered', async () => {
      require('../../../startup/logging');

      const unhandledRejection = new Error('fake unhandled rejection');

      expect(() => {
        process.emit('unhandledRejection', unhandledRejection);
      }).toThrow(unhandledRejection);
    });
  });

  describe('loggers', () => {
    let winston;
    let NODE_ENV;

    beforeAll(() => {
      jest.mock('winston', () => {
        const format = {
          prettyPrint: jest.fn().mockReturnValue('prettyPrint'),
          combine: jest.fn().mockReturnValue('combine'),
          colorize: jest.fn().mockReturnValue('colorize'),
          timestamp: jest.fn().mockReturnValue('timestamp'),
          json: jest.fn().mockReturnValue('json'),
          printf: jest.fn(),
        };
        const configure = jest.fn();
        const transports = {
          Console: jest.fn(),
          File: jest.fn(),
        };
        const exceptions = { handle: jest.fn() };
        const add = jest.fn();
        const loggers = { add: jest.fn() };
        return { format, configure, transports, exceptions, add, loggers };
      });
    });

    beforeEach(() => {
      winston = require('winston');
      NODE_ENV = process.env.NODE_ENV;
    });

    afterEach(() => {
      process.env.NODE_ENV = NODE_ENV;
    });

    describe('setup', () => {
      let on;

      beforeEach(() => {
        on = process.on;
        process.on = jest.fn();
      });

      afterEach(() => {
        process.on = on;
        process.env.NODE_ENV = NODE_ENV;
      });

      it('should use logFolder if it is provided as an npm config key', () => {
        process.env.npm_package_config_vidlyBackend_logFolder = 'logFolder';

        require('../../../startup/logging');
        delete process.env.npm_package_config_vidlyBackend_logFolder;

        expect(winston.transports.File).toHaveBeenCalledTimes(3);
        expect(winston.transports.File).toHaveBeenCalledWith(
          expect.objectContaining({
            filename: 'logFolder/logs/uncaughtExceptions.log',
          })
        );
        expect(winston.transports.File).toHaveBeenCalledWith(
          expect.objectContaining({
            filename: 'logFolder/logs/info.log',
          })
        );
        expect(winston.transports.File).toHaveBeenCalledWith(
          expect.objectContaining({
            filename: 'logFolder/logs/error.log',
          })
        );
      });

      it('should add Console transports if NODE_ENV is development or not set', () => {
        delete process.env.NODE_ENV;

        require('../../../startup/logging');

        expect(winston.configure).toHaveBeenCalledWith(
          expect.objectContaining({ format: 'prettyPrint' })
        );
        expect(winston.format.prettyPrint).toHaveBeenCalledTimes(1);
        expect(winston.exceptions.handle).toHaveBeenCalledTimes(2);
        expect(winston.add).toHaveBeenCalledTimes(3);
        expect(winston.transports.Console).toHaveBeenCalledTimes(4);
        expect(winston.format.timestamp.mock.calls[0][0].format()).toMatch(
          /\d{1,2}\/\d{1,2}\/\d{4}, \d{1,2}:\d{2}:\d{2} [AP]M/
        );
      });

      it('should not use Console transports if NODE_ENV is production', () => {
        process.env.NODE_ENV = 'production';

        require('../../../startup/logging');

        expect(winston.configure).not.toHaveBeenCalled();
        expect(winston.format.prettyPrint).not.toHaveBeenCalled();
        expect(winston.exceptions.handle).toHaveBeenCalledTimes(1);
        expect(winston.add).toHaveBeenCalledTimes(2);
        expect(winston.transports.Console).toHaveBeenCalledTimes(2);
        expect(winston.transports.MongoDB).toHaveBeenCalledTimes(2);
        expect(winston.transports.MongoDB.mock.calls[0][0]).toMatchObject({
          db: dbString,
          options: { useUnifiedTopology: true },
        });
        expect(winston.transports.MongoDB.mock.calls[1][0]).toMatchObject({
          db: dbString,
          options: { useUnifiedTopology: true },
        });
        expect(process.on).toHaveBeenCalledWith(
          'unhandledRejection',
          expect.any(Function)
        );
      });
    });

    describe('default logger', () => {
      let mockLog;

      beforeEach(() => {
        mockLog = {
          level: 'logtype',
          message: 'text',
          timestamp: 'date and time',
        };
      });

      it('should include error stack in log if stack is provided', () => {
        process.env.NODE_ENV = 'development';

        require('../../../startup/logging');

        mockLog.stack = 'error info';

        expect(winston.format.printf.mock.calls[0][0](mockLog)).toMatch(
          /logtype/,
          /text/,
          /date and time/,
          /error info/
        );
      });

      it('should not include stack in log if stack is not provided', () => {
        process.env.NODE_ENV = 'development';

        require('../../../startup/logging');

        expect(winston.format.printf.mock.calls[0][0](mockLog)).toMatch(
          /logtype/,
          /text/,
          /date and time$/
        );
      });
    });
  });
});
