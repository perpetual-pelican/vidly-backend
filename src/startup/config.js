const os = require('os');

if (!process.env.vidly_jwtPrivateKey)
  throw new Error('FATAL ERROR: vidly_jwtPrivateKey is not defined.');

const host = os.type() === 'Windows_NT' ? os.hostname() : 'localhost';
const dbString = `mongodb://${host}:27017,${host}:27018,${host}:27019?replicaSet=rs`;
const env = process.env.NODE_ENV || 'development';

module.exports = {
  jwtPrivateKey: process.env.vidly_jwtPrivateKey,
  logDir: process.env.npm_package_config_vidlyBackend_logFolder,
  dbString,
  dbOptions: {
    dbName: `vidly_${env}`,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  },
};
