const os = require('os');

// need private key for jwt authentication
if (!process.env.vidly_jwtPrivateKey)
  throw new Error('FATAL ERROR: vidly_jwtPrivateKey is not defined.');

let dbString;
if (process.env.vidly_hosts) {
  // using custom replicaSet, use provided hosts
  // also use provided rs name or "vidly_rs" as default
  const hosts = process.env.vidly_hosts;
  const rs = process.env.vidly_rs || 'vidly_rs';
  dbString = `mongodb://${hosts}/?replicaSet=${rs}`;
} else {
  // using run-rs for replicaSet, just use defaults for OS
  const host = os.type() === 'Windows_NT' ? os.hostname() : 'localhost';
  dbString = `mongodb://${host}:27017,${host}:27018,${host}:27019/?replicaSet=rs`;
}
const env = process.env.NODE_ENV || 'development';

// export config, get log folder location from user's config if used as package
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
