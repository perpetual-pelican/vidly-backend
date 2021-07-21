const request = require('supertest');
const bcrypt = require('bcryptjs');
const test = require('../testHelper');
const app = require('../../src/startup/app');
const { User } = require('../../src/models/user');

const { getAll, post } = test.request;

describe('/api/users', () => {
  test.setup('users', app);

  const userObject = {
    name: 'User Name',
    email: 'userEmail@domain.com',
    password: 'abcdeF1$',
  };
  let user;
  let req;

  describe('GET /', () => {
    let token;
    let adminUser;

    beforeAll(async () => {
      user = await new User(userObject).save();
      adminUser = await new User({
        name: 'Admin Name',
        email: 'adminEmail@domain.com',
        password: 'abcdeF1$',
        isAdmin: true,
      }).save();
      token = adminUser.generateAuthToken();
    });

    beforeEach(async () => {
      req = { token };
    });

    afterAll(async () => {
      await User.deleteMany();
    });

    it('should return 401 if client is not logged in', async () => {
      await test.tokenEmpty(getAll, req);
    });

    it('should return 400 if token is invalid', async () => {
      await test.tokenInvalid(getAll, req);
    });

    it('should return 403 if user is not an admin', async () => {
      req.token = new User({ isAdmin: false }).generateAuthToken();

      await test.adminFalse(getAll, req);
    });

    it('should return 500 if an uncaughtException is encountered', async () => {
      const { find } = User;
      User.find = jest.fn(() => {
        throw new Error('fake uncaught exception');
      });

      const res = await getAll(req);
      User.find = find;

      expect(res.status).toBe(500);
      expect(res.text).toMatch(/Something failed/);
    });

    it('should return all users if request is valid', async () => {
      const res = await getAll(req);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(
        res.body.some(
          (u) =>
            u.name === user.name &&
            u.email === user.email &&
            u.password === undefined &&
            u.isAdmin === user.isAdmin
        )
      ).toBe(true);
      expect(
        res.body.some(
          (u) =>
            u.name === adminUser.name &&
            u.email === adminUser.email &&
            u.password === undefined &&
            u.isAdmin === adminUser.isAdmin
        )
      ).toBe(true);
    });
  });

  describe('GET /me', () => {
    beforeEach(async () => {
      user = await new User(userObject).save();
      req = { token: user.generateAuthToken() };
    });

    afterEach(async () => {
      await User.deleteMany();
    });

    const getUser = (data) => {
      return request(app).get('/api/users/me').set('x-auth-token', data.token);
    };

    it('should return 401 if client is not logged in', async () => {
      await test.tokenEmpty(getUser, req);
    });

    it('should return 400 if token is invalid', async () => {
      await test.tokenInvalid(getUser, req);
    });

    it('should return 400 if user is not found', async () => {
      await User.deleteMany();

      const res = await getUser(req);

      expect(res.status).toBe(400);
      expect(res.text).toMatch(/[Nn]ot.*[Ff]ound/);
    });

    it('should return the user if request is valid', async () => {
      const res = await getUser(req);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', user.name);
      expect(res.body).toHaveProperty('email', user.email);
      expect(res.body).toHaveProperty('isAdmin', user.isAdmin);
    });
  });

  describe('POST /', () => {
    beforeEach(() => {
      req = { body: { ...userObject } };
    });

    afterEach(async () => {
      await User.deleteMany();
    });

    it('should return 400 if request body is invalid', async () => {
      await test.requestInvalid(post, req);
    });

    it('should return 400 if email is already in use', async () => {
      await User.create(userObject);

      const res = await post(req);

      expect(res.status).toBe(400);
      expect(res.text).toMatch(/[Ee]mail.*[Aa]lready/);
    });

    it('should save the user with hash if request is valid', async () => {
      await post(req);

      const userInDB = await User.findOne({ email: userObject.email }).lean();

      const isEqual = await bcrypt.compare(
        userObject.password,
        userInDB.password
      );

      expect(isEqual).toBe(true);
    });

    it('should add token to header if request is valid', async () => {
      const res = await post(req);

      expect(res.header).toHaveProperty('x-auth-token');
    });

    it('should return _id, name, and email if request is valid', async () => {
      const res = await post(req);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', userObject.name);
      expect(res.body).toHaveProperty('email', userObject.email);
    });
  });
});
