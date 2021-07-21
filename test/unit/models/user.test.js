const mongoose = require('mongoose');
const config = require('config');
const jwt = require('jsonwebtoken');
const { User, validate, bounds } = require('../../../src/models/user');

describe('User model', () => {
  describe('user.generateAuthToken', () => {
    it('should return a valid JSON Web Token', () => {
      const user = {
        _id: mongoose.Types.ObjectId().toHexString(),
        isAdmin: true,
      };
      const token = new User(user).generateAuthToken();
      const decoded = jwt.verify(token, config.get('jwtPrivateKey'));

      expect(decoded).toMatchObject(user);
    });
  });

  describe('validate', () => {
    let user;

    beforeEach(() => {
      user = {
        name: 'a'.repeat(bounds.name.min),
        email: `${'a'.repeat(bounds.email.min - 5)}@a.io`,
        password: `${'a'.repeat(bounds.password.min - 3)}A1$`,
      };
    });

    it('should return error if user contains an invalid property', () => {
      user.invalid = 'invalid';

      const { error } = validate(user);

      expect(error.message).toMatch(/not.*allowed/);
    });

    it('should return error if name is undefined', () => {
      delete user.name;

      const { error } = validate(user);

      expect(error.message).toMatch(/name.*required/);
    });

    it('should return error if name is not a string', () => {
      user.name = {};

      const { error } = validate(user);

      expect(error.message).toMatch(/name.*string/);
    });

    it('should return error if name is empty', () => {
      user.name = '';

      const { error } = validate(user);

      expect(error.message).toMatch(/name.*empty/);
    });

    it(`should return error if name length is less than ${bounds.name.min}`, () => {
      user.name = 'a'.repeat(bounds.name.min - 1);

      const { error } = validate(user);

      expect(error.message).toMatch(new RegExp(`name.*${bounds.name.min}`));
    });

    it(`should not return error if name length is equal to ${bounds.name.min}`, () => {
      user.name = 'a'.repeat(bounds.name.min);

      const { error } = validate(user);

      expect(error).toBe(undefined);
    });

    it(`should return error if name length is greater than ${bounds.name.max}`, () => {
      user.name = 'a'.repeat(bounds.name.max + 1);

      const { error } = validate(user);

      expect(error.message).toMatch(new RegExp(`name.*${bounds.name.max}`));
    });

    it(`should not return error if name length is equal to ${bounds.name.max}`, () => {
      user.name = 'a'.repeat(bounds.name.max);

      const { error } = validate(user);

      expect(error).toBe(undefined);
    });

    it('should return error if email is undefined', () => {
      delete user.email;

      const { error } = validate(user);

      expect(error.message).toMatch(/email.*required/);
    });

    it('should return error if email is not a string', () => {
      user.email = {};

      const { error } = validate(user);

      expect(error.message).toMatch(/email.*string/);
    });

    it('should return error if email is empty', () => {
      user.email = '';

      const { error } = validate(user);

      expect(error.message).toMatch(/email.*empty/);
    });

    it('should return error if email is invalid', () => {
      user.email = 'invalid';

      const { error } = validate(user);

      expect(error.message).toMatch(/email.*valid/);
    });

    it(`should return error if email length is less than ${bounds.email.min}`, () => {
      user.email = `${'a'.repeat(bounds.email.min - 6)}@a.io`;

      const { error } = validate(user);

      expect(error.message).toMatch(new RegExp(`email.*${bounds.email.min}`));
    });

    it(`should not return error if email length is equal to ${bounds.email.min}`, () => {
      user.email = `${'a'.repeat(bounds.email.min - 5)}@a.io`;

      const { error } = validate(user);

      expect(error).toBe(undefined);
    });

    it(`should return error if email length is greater than ${bounds.email.max}`, () => {
      user.email = `${'a'.repeat(bounds.email.max - 4)}@a.io`;

      const { error } = validate(user);

      expect(error.message).toMatch(new RegExp(`email.*${bounds.email.max}`));
    });

    it(`should not return error if email length is equal to ${bounds.email.max}`, () => {
      user.email = `${'a'.repeat(bounds.email.max - 5)}@a.io`;

      const { error } = validate(user);

      expect(error).toBe(undefined);
    });

    it('should return error if password is undefined', () => {
      delete user.password;

      const { error } = validate(user);

      expect(error.message).toMatch(/password.*required/);
    });

    it('should return error if password is not a string', () => {
      user.password = {};

      const { error } = validate(user);

      expect(error.message).toMatch(/password.*string/);
    });

    it('should return error if password is empty', () => {
      user.password = '';

      const { error } = validate(user);

      expect(error.message).toMatch(/password.*empty/);
    });

    it('should return error if password does not contain a lowercase letter', () => {
      user.password = `${'A'.repeat(bounds.password.min - 2)}1$`;

      const { error } = validate(user);

      expect(error.message).toMatch(/password.*lower/);
    });

    it('should return error if password does not contain an uppercase letter', () => {
      user.password = `${'a'.repeat(bounds.password.min - 2)}1$`;

      const { error } = validate(user);

      expect(error.message).toMatch(/password.*upper/);
    });

    it('should return error if password does not contain a number', () => {
      user.password = `${'a'.repeat(bounds.password.min - 2)}A$`;

      const { error } = validate(user);

      expect(error.message).toMatch(/password.*number/);
    });

    it('should return error if password does not contain a symbol', () => {
      user.password = `${'a'.repeat(bounds.password.min - 2)}A1`;

      const { error } = validate(user);

      expect(error.message).toMatch(/password.*symbol/);
    });

    it(`should return error if password length is less than ${bounds.password.min}`, () => {
      user.password = `${'a'.repeat(bounds.password.min - 4)}A1$`;

      const { error } = validate(user);

      expect(error.message).toMatch(
        new RegExp(`password.*${bounds.password.min}`)
      );
    });

    it(`should not return error if password length is equal to ${bounds.password.min}`, () => {
      user.password = `${'a'.repeat(bounds.password.min - 3)}A1$`;

      const { error } = validate(user);

      expect(error).toBe(undefined);
    });

    it(`should return error if password length is greater than ${bounds.password.max}`, () => {
      user.password = `${'a'.repeat(bounds.password.max - 2)}A1$`;

      const { error } = validate(user);

      expect(error.message).toMatch(
        new RegExp(`password.*${bounds.password.max}`)
      );
    });

    it(`should not return error if password length is equal to ${bounds.password.max}`, () => {
      user.password = `${'a'.repeat(bounds.password.max - 3)}A1$`;

      const { error } = validate(user);

      expect(error).toBe(undefined);
    });

    it('should not return error if user is valid', () => {
      const { error } = validate(user);

      expect(error).toBe(undefined);
    });
  });
});
