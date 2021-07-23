const { MongoMemoryReplSet } = require('mongodb-memory-server');

module.exports = async () => {
  const replSet = await MongoMemoryReplSet.create({
    binary: { version: '4.4.6' },
    replSet: {
      name: 'vidly_rs_test',
      count: 3,
      storageEngine: 'wiredTiger',
    },
  });
  global.__REPLSET__ = replSet;
  process.env.MONGO_URI = replSet.getUri();
};
