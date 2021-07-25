const { validate, bounds } = require('../../../src/models/genre');

describe('Genre model', () => {
  describe('validate', () => {
    let genre;

    beforeEach(() => {
      genre = { name: 'a'.repeat(bounds.name.min) };
    });

    it('should return error if genre contains an invalid property', () => {
      genre.invalid = 'invalid';

      const { error } = validate(genre);

      expect(error.message).toMatch(/not.*allowed/);
    });

    it('should return error if name is undefined', () => {
      delete genre.name;

      const { error } = validate(genre);

      expect(error.message).toMatch(/name.*required/);
    });

    it('should return error if name is not a string', () => {
      genre.name = {};

      const { error } = validate(genre);

      expect(error.message).toMatch(/name.*string/);
    });

    it('should return error if name is empty', () => {
      genre.name = '';

      const { error } = validate(genre);

      expect(error.message).toMatch(/name.*empty/);
    });

    it(`should return error if name length is less than ${bounds.name.min}`, () => {
      genre.name = 'a'.repeat(bounds.name.min - 1);

      const { error } = validate(genre);

      expect(error.message).toMatch(new RegExp(`name.*${bounds.name.min}`));
    });

    it(`should not return error if name length is equal to ${bounds.name.min}`, () => {
      genre.name = 'a'.repeat(bounds.name.min);

      const { error } = validate(genre);

      expect(error).toBe(undefined);
    });

    it(`should return error if name length is greater than ${bounds.name.max}`, () => {
      genre.name = 'a'.repeat(bounds.name.max + 1);

      const { error } = validate(genre);

      expect(error.message).toMatch(new RegExp(`name.*${bounds.name.max}`));
    });

    it(`should not return error if name length is equal to ${bounds.name.max}`, () => {
      genre.name = 'a'.repeat(bounds.name.max);

      const { error } = validate(genre);

      expect(error).toBe(undefined);
    });

    it('should not return error if genre is valid', () => {
      const { error } = validate(genre);

      expect(error).toBe(undefined);
    });
  });
});
