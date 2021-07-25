const {
  validatePost,
  validatePut,
  bounds,
} = require('../../../src/models/customer');

describe('Customer model', () => {
  let customer;

  beforeEach(() => {
    customer = {
      name: 'a'.repeat(bounds.name.min),
      phone: '0'.repeat(bounds.phone.min),
      isGold: false,
    };
  });

  describe('validatePost', () => {
    it('should return error if customer contains an invalid property', () => {
      customer.invalid = 'invalid';

      const { error } = validatePost(customer);

      expect(error.message).toMatch(/not.*allowed/);
    });

    it('should return error if name is undefined', () => {
      delete customer.name;

      const { error } = validatePost(customer);

      expect(error.message).toMatch(/name.*required/);
    });

    it('should return error if name is not a string', () => {
      customer.name = {};

      const { error } = validatePost(customer);

      expect(error.message).toMatch(/name.*string/);
    });

    it('should return error if name is empty', () => {
      customer.name = '';

      const { error } = validatePost(customer);

      expect(error.message).toMatch(/name.*empty/);
    });

    it(`should return error if name length is less than ${bounds.name.min}`, () => {
      customer.name = 'a'.repeat(bounds.name.min - 1);

      const { error } = validatePost(customer);

      expect(error.message).toMatch(new RegExp(`name.*${bounds.name.min}`));
    });

    it(`should not return error if name length is equal to ${bounds.name.min}`, () => {
      customer.name = 'a'.repeat(bounds.name.min);

      const { error } = validatePost(customer);

      expect(error).toBe(undefined);
    });

    it(`should return error if name length is greater than ${bounds.name.max}`, () => {
      customer.name = 'a'.repeat(bounds.name.max + 1);

      const { error } = validatePost(customer);

      expect(error.message).toMatch(new RegExp(`name.*${bounds.name.max}`));
    });

    it(`should not return error if name length is equal to ${bounds.name.max}`, () => {
      customer.name = 'a'.repeat(bounds.name.max);

      const { error } = validatePost(customer);

      expect(error).toBe(undefined);
    });

    it('should return error if phone is undefined', () => {
      delete customer.phone;

      const { error } = validatePost(customer);

      expect(error.message).toMatch(/phone.*required/);
    });

    it('should return error if phone is not a string', () => {
      customer.phone = {};

      const { error } = validatePost(customer);

      expect(error.message).toMatch(/phone.*string/);
    });

    it('should return error if phone is empty', () => {
      customer.phone = '';

      const { error } = validatePost(customer);

      expect(error.message).toMatch(/phone.*empty/);
    });

    it(`should return error if phone length is less than ${bounds.phone.min}`, () => {
      customer.phone = '0'.repeat(bounds.phone.min - 1);

      const { error } = validatePost(customer);

      expect(error.message).toMatch(new RegExp(`phone.*${bounds.phone.min}`));
    });

    it(`should not return error if phone length is equal to ${bounds.phone.min}`, () => {
      customer.phone = '0'.repeat(bounds.phone.min);

      const { error } = validatePost(customer);

      expect(error).toBe(undefined);
    });

    it(`should return error if phone length is greater than ${bounds.phone.max}`, () => {
      customer.phone = '0'.repeat(bounds.phone.max + 1);

      const { error } = validatePost(customer);

      expect(error.message).toMatch(new RegExp(`phone.*${bounds.phone.max}`));
    });

    it(`should not return error if phone length is equal to ${bounds.phone.max}`, () => {
      customer.phone = '0'.repeat(bounds.phone.max);

      const { error } = validatePost(customer);

      expect(error).toBe(undefined);
    });

    it('should return error if isGold is not a boolean', () => {
      customer.isGold = 'not a boolean';

      const { error } = validatePost(customer);

      expect(error.message).toMatch(/isGold.*boolean/);
    });

    it('should not return error if isGold is undefined', () => {
      delete customer.isGold;

      const { error } = validatePost(customer);

      expect(error).toBe(undefined);
    });

    it('should not return error if customer is valid', () => {
      const { error } = validatePost(customer);

      expect(error).toBe(undefined);
    });
  });

  describe('validatePut', () => {
    it('should return error if customer is empty', () => {
      customer = {};

      const { error } = validatePut(customer);

      expect(error.message).toMatch(/property.*required/);
    });

    it('should return error if customer contains an invalid property', () => {
      customer.invalid = 'invalid';

      const { error } = validatePut(customer);

      expect(error.message).toMatch(/not.*allowed/);
    });

    it('should return error if name is not a string', () => {
      customer.name = {};

      const { error } = validatePut(customer);

      expect(error.message).toMatch(/name.*string/);
    });

    it('should return error if name is empty', () => {
      customer.name = '';

      const { error } = validatePut(customer);

      expect(error.message).toMatch(/name.*empty/);
    });

    it(`should return error if name length is less than ${bounds.name.min}`, () => {
      customer.name = 'a'.repeat(bounds.name.min - 1);

      const { error } = validatePut(customer);

      expect(error.message).toMatch(new RegExp(`name.*${bounds.name.min}`));
    });

    it(`should not return error if name length is equal to ${bounds.name.min}`, () => {
      customer.name = 'a'.repeat(bounds.name.min);

      const { error } = validatePut(customer);

      expect(error).toBe(undefined);
    });

    it(`should return error if name length is greater than ${bounds.name.max}`, () => {
      customer.name = 'a'.repeat(bounds.name.max + 1);

      const { error } = validatePut(customer);

      expect(error.message).toMatch(new RegExp(`name.*${bounds.name.max}`));
    });

    it(`should not return error if name length is equal to ${bounds.name.max}`, () => {
      customer.name = 'a'.repeat(bounds.name.max);

      const { error } = validatePut(customer);

      expect(error).toBe(undefined);
    });

    it('should not return error if name is undefined', () => {
      delete customer.name;

      const { error } = validatePut(customer);

      expect(error).toBe(undefined);
    });

    it('should not return error if only name is defined', () => {
      customer = { name: customer.name };

      const { error } = validatePut(customer);

      expect(error).toBe(undefined);
    });

    it('should return error if phone is not a string', () => {
      customer.phone = {};

      const { error } = validatePut(customer);

      expect(error.message).toMatch(/phone.*string/);
    });

    it('should return error if phone is empty', () => {
      customer.phone = '';

      const { error } = validatePut(customer);

      expect(error.message).toMatch(/phone.*empty/);
    });

    it(`should return error if phone length is less than ${bounds.phone.min}`, () => {
      customer.phone = '0'.repeat(bounds.phone.min - 1);

      const { error } = validatePut(customer);

      expect(error.message).toMatch(new RegExp(`phone.*${bounds.phone.min}`));
    });

    it(`should not return error if phone length is equal to ${bounds.phone.min}`, () => {
      customer.phone = '0'.repeat(bounds.phone.min);

      const { error } = validatePut(customer);

      expect(error).toBe(undefined);
    });

    it(`should return error if phone length is greater than ${bounds.phone.max}`, () => {
      customer.phone = '0'.repeat(bounds.phone.max + 1);

      const { error } = validatePut(customer);

      expect(error.message).toMatch(new RegExp(`phone.*${bounds.phone.max}`));
    });

    it(`should not return error if phone length is equal to ${bounds.phone.max}`, () => {
      customer.phone = '0'.repeat(bounds.phone.max);

      const { error } = validatePut(customer);

      expect(error).toBe(undefined);
    });

    it('should not return error if phone is undefined', () => {
      delete customer.phone;

      const { error } = validatePut(customer);

      expect(error).toBe(undefined);
    });

    it('should not return error if only phone is defined', () => {
      customer = { phone: customer.phone };

      const { error } = validatePut(customer);

      expect(error).toBe(undefined);
    });

    it('should return error if isGold is not a boolean', () => {
      customer.isGold = 'not a boolean';

      const { error } = validatePut(customer);

      expect(error.message).toMatch(/isGold.*boolean/);
    });

    it('should not return error if isGold is undefined', () => {
      delete customer.isGold;

      const { error } = validatePut(customer);

      expect(error).toBe(undefined);
    });

    it('should not return error if only isGold is defined', () => {
      customer = { isGold: customer.IsGold };

      const { error } = validatePut(customer);

      expect(error).toBe(undefined);
    });

    it('should not return error if customer is valid', () => {
      const { error } = validatePut(customer);

      expect(error).toBe(undefined);
    });
  });
});
