const config = require('config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const test = require('../testHelper');
const app = require('../../startup/app');
const { User } = require('../../models/user');

const { post } = test.request;

describe('/api/login', () => {
  test.setup('login', app);

  describe('POST /', () => {
    const login = {
      email: 'userEmail@domain.com',
      password: 'abcdeF1$',
    };
    let user;
    let req;

    beforeAll(async () => {
      user = await new User({
        name: 'User Name',
        email: login.email,
        password: await bcrypt.hash(login.password, 10),
        isAdmin: false,
      }).save();
    });

    beforeEach(() => {
      req = { body: { ...login } };
    });

    it('should return 400 if request body is invalid', async () => {
      await test.requestInvalid(post, req);
    });

    it('should return 400 if email is not found', async () => {
      req.body.email = 'not found';

      const res = await post(req);

      expect(res.status).toBe(400);
      expect(res.text).toMatch(/email.*password/);
    });

    it('should return 400 if password is incorrect', async () => {
      req.body.password = 'incorrect';

      const res = await post(req);

      expect(res.status).toBe(400);
      expect(res.text).toMatch(/email.*password/);
    });

    it('should return 500 if an uncaughtException is encountered', async () => {
      const { findOne } = User;
      User.findOne = jest.fn(() => {
        throw new Error('fake uncaught exception');
      });

      const res = await post(req);
      User.findOne = findOne;

      expect(res.status).toBe(500);
      expect(res.text).toMatch(/Something failed/);
    });

    it('should return a valid token if request is valid', async () => {
      const res = await post(req);

      const decoded = jwt.verify(res.text, config.get('jwtPrivateKey'));

      expect(res.status).toBe(200);
      expect(decoded).toHaveProperty('_id');
      expect(decoded).toHaveProperty('isAdmin', user.isAdmin);
    });
  });
});
