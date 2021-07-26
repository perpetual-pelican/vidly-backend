/* istanbul ignore file */

const request = require('supertest');
const mongoose = require('mongoose');
const winston = require('winston');

let route;
let app;

module.exports.setup = function setup(routeName, appToTest) {
  if (routeName && typeof routeName !== 'string')
    throw new Error('routeName must be a string');
  if (appToTest && typeof appToTest !== 'function')
    throw new Error('appToTest must be an express app');

  route = routeName;
  app = appToTest;

  jest.setTimeout(30 * 1000);

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: `vidly_test_${route}`,
      useCreateIndex: true,
      useFindAndModify: false,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    winston.loggers.get = jest.fn().mockReturnValue({ error: jest.fn() });
    winston.error = jest.fn();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });
};

const checkSetup = () => {
  if (!app || !route)
    throw new Error(
      'setup must be called with route and app before using request functions'
    );
};

module.exports.request = {
  getAll(req) {
    checkSetup();
    if (!req || !req.token) return request(app).get(`/api/${route}`);
    return request(app).get(`/api/${route}`).set('x-auth-token', req.token);
  },
  getOne(req) {
    checkSetup();
    if (!req.token) return request(app).get(`/api/${route}/${req.id}`);
    return request(app)
      .get(`/api/${route}/${req.id}`)
      .set('x-auth-token', req.token);
  },
  post(req) {
    checkSetup();
    if (!req.token) {
      return request(app).post(`/api/${route}`).send(req.body);
    }
    return request(app)
      .post(`/api/${route}`)
      .set('x-auth-token', req.token)
      .send(req.body);
  },
  put(req) {
    checkSetup();
    if (!req.token) {
      return request(app).put(`/api/${route}/${req.id}`).send(req.body);
    }
    return request(app)
      .put(`/api/${route}/${req.id}`)
      .set('x-auth-token', req.token)
      .send(req.body);
  },
  del(req) {
    checkSetup();
    if (!req.token) {
      return request(app).delete(`/api/${route}/${req.id}`);
    }
    return request(app)
      .delete(`/api/${route}/${req.id}`)
      .set('x-auth-token', req.token);
  },
};

module.exports.tokenEmpty = async function tokenEmpty(exec, req) {
  req.token = '';

  const res = await exec(req);

  expect(res.status).toBe(401);
  expect(res.text).toMatch(/[Dd]enied/);
};

module.exports.tokenInvalid = async function tokenInvalid(exec, req) {
  req.token = 'invalid';

  const res = await exec(req);

  expect(res.status).toBe(400);
  expect(res.text).toMatch(/[Ii]nvalid.*[Tt]oken/);
};

module.exports.adminFalse = async function adminFalse(exec, req) {
  const res = await exec(req);

  expect(res.status).toBe(403);
  expect(res.text).toMatch(/[Dd]enied/);
};

module.exports.idInvalid = async function idInvalid(exec, req) {
  req.id = 'invalid';

  const res = await exec(req);

  expect(res.status).toBe(404);
  expect(res.text).toMatch(/[Ii]nvalid.*[Ii][Dd]/);
};

module.exports.idNotFound = async function idNotFound(exec, req) {
  req.id = mongoose.Types.ObjectId().toHexString();

  const res = await exec(req);

  expect(res.status).toBe(404);
  expect(res.text).toMatch(/[Ii][Dd].*[Nn]ot.*[Ff]ound/);
};

module.exports.requestEmpty = async function requestEmpty(exec, req) {
  req.body = {};

  const res = await exec(req);

  expect(res.status).toBe(400);
  expect(res.text).toMatch(/[Pp]roperty.*[Rr]equired/);
};

module.exports.requestInvalid = async function requestInvalid(exec, req) {
  if (req.body) req.body.invalidProperty = 'invalid';
  else req.body = { invalidProperty: 'invalid' };

  const res = await exec(req);

  expect(res.status).toBe(400);
  expect(res.text).toMatch(/[Nn]ot.*[Aa]llowed/);
};
