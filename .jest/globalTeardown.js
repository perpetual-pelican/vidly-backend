module.exports = async () => {
  await global.__REPLSET__.stop();
};
