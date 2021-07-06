const winston = require('winston');
require('winston-mongodb');
const { dbString } = require('./config');

const env = process.env.NODE_ENV || 'development';

if (env === 'development') {
  winston.configure({ format: winston.format.prettyPrint() });
  winston.exceptions.handle(new winston.transports.Console());
  winston.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({
          format: () => {
            return new Date().toLocaleString('en-US', {
              timeZone: 'America/Chicago',
            });
          },
        }),
        winston.format.printf(({ level, message, timestamp, stack }) => {
          if (stack)
            return `\n${level}:${message}\n date: ${timestamp}\nstack: "${stack}"\n`;
          return `${level}: ${message}`;
        })
      ),
    })
  );
}

const logFolder = env === 'production' ? 'logs' : `logs/${env}`;

winston.exceptions.handle(
  new winston.transports.File({
    filename: `${logFolder}/uncaughtExceptions.log`,
  }),
  new winston.transports.MongoDB({
    db: dbString,
    options: { useUnifiedTopology: true },
  })
);

process.on('unhandledRejection', (ex) => {
  throw ex;
});

const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

winston.add(
  new winston.transports.File({
    filename: `${logFolder}/info.log`,
    format: fileFormat,
  })
);

winston.add(
  new winston.transports.File({
    level: 'error',
    filename: `${logFolder}/error.log`,
    format: fileFormat,
  })
);

winston.loggers.add('db', {
  transports: [
    new winston.transports.MongoDB({
      db: dbString,
      options: { useUnifiedTopology: true },
    }),
  ],
});
