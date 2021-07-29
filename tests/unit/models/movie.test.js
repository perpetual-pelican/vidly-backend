const mongoose = require('mongoose');
const {
  validatePost,
  validatePut,
  bounds,
} = require('../../../src/models/movie');

describe('Movie model', () => {
  let movie;

  beforeEach(() => {
    movie = {
      title: 'a'.repeat(bounds.title.min),
      dailyRentalRate: bounds.dailyRentalRate.min,
      numberInStock: bounds.numberInStock.min,
      genreIds: [mongoose.Types.ObjectId().toHexString()],
    };
  });

  describe('validatePost', () => {
    it('should return error if movie contains an invalid property', () => {
      movie.invalid = 'invalid';

      const { error } = validatePost(movie);

      expect(error.message).toMatch(/not.*allowed/);
    });

    it('should return error if title is undefined', () => {
      delete movie.title;

      const { error } = validatePost(movie);

      expect(error.message).toMatch(/title.*required/);
    });

    it('should return error if title is not a string', () => {
      movie.title = {};

      const { error } = validatePost(movie);

      expect(error.message).toMatch(/title.*string/);
    });

    it('should return error if title is empty', () => {
      movie.title = '';

      const { error } = validatePost(movie);

      expect(error.message).toMatch(/title.*empty/);
    });

    it(`should return error if title length is less than ${bounds.title.min}`, () => {
      movie.title = 'a'.repeat(bounds.title.min - 1);

      const { error } = validatePost(movie);

      expect(error.message).toMatch(new RegExp(`title.*${bounds.title.min}`));
    });

    it(`should not return error if title length is equal to ${bounds.title.min}`, () => {
      movie.title = 'a'.repeat(bounds.title.min);

      const { error } = validatePost(movie);

      expect(error).toBe(undefined);
    });

    it(`should return error if title length is greater than ${bounds.title.max}`, () => {
      movie.title = 'a'.repeat(bounds.title.max + 1);

      const { error } = validatePost(movie);

      expect(error.message).toMatch(new RegExp(`title.*${bounds.title.max}`));
    });

    it(`should not return error if title length is equal to ${bounds.title.max}`, () => {
      movie.title = 'a'.repeat(bounds.title.max);

      const { error } = validatePost(movie);

      expect(error).toBe(undefined);
    });

    it('should return error if dailyRentalRate is undefined', () => {
      delete movie.dailyRentalRate;

      const { error } = validatePost(movie);

      expect(error.message).toMatch(/dailyRentalRate.*required/);
    });

    it('should return error if dailyRentalRate is not a number', () => {
      movie.dailyRentalRate = 'not a number';

      const { error } = validatePost(movie);

      expect(error.message).toMatch(/dailyRentalRate.*number/);
    });

    it('should round dailyRentalRate to 2 decimal places', () => {
      movie.dailyRentalRate = 1.115;

      const { error, value } = validatePost(movie);

      expect(error).toBe(undefined);
      expect(value.dailyRentalRate).toEqual(1.12);
    });

    it(`should return error if dailyRentalRate is less than ${bounds.dailyRentalRate.min}`, () => {
      movie.dailyRentalRate = bounds.dailyRentalRate.min - 1;

      const { error } = validatePost(movie);

      expect(error.message).toMatch(
        new RegExp(`dailyRentalRate.*${bounds.dailyRentalRate.min}`)
      );
    });

    it(`should not return error if dailyRentalRate is equal to ${bounds.dailyRentalRate.min}`, () => {
      movie.dailyRentalRate = bounds.dailyRentalRate.min;

      const { error } = validatePost(movie);

      expect(error).toBe(undefined);
    });

    it(`should return error if dailyRentalRate is greater than ${bounds.dailyRentalRate.max}`, () => {
      movie.dailyRentalRate = bounds.dailyRentalRate.max + 1;

      const { error } = validatePost(movie);

      expect(error.message).toMatch(
        new RegExp(`dailyRentalRate.*${bounds.dailyRentalRate.max}`)
      );
    });

    it(`should not return error if dailyRentalRate is equal to ${bounds.dailyRentalRate.max}`, () => {
      movie.dailyRentalRate = bounds.dailyRentalRate.max;

      const { error } = validatePost(movie);

      expect(error).toBe(undefined);
    });

    it('should return error if numberInStock is undefined', () => {
      delete movie.numberInStock;

      const { error } = validatePost(movie);

      expect(error.message).toMatch(/numberInStock.*required/);
    });

    it('should return error if numberInStock is not a number', () => {
      movie.numberInStock = 'not a number';

      const { error } = validatePost(movie);

      expect(error.message).toMatch(/numberInStock.*number/);
    });

    it('should return error if numberInStock is not an integer', () => {
      movie.numberInStock = 1.1;

      const { error } = validatePost(movie);

      expect(error.message).toMatch(/numberInStock.*integer/);
    });

    it(`should return error if numberInStock is less than ${bounds.numberInStock.min}`, () => {
      movie.numberInStock = bounds.numberInStock.min - 1;

      const { error } = validatePost(movie);

      expect(error.message).toMatch(
        new RegExp(`numberInStock.*${bounds.numberInStock.min}`)
      );
    });

    it(`should not return error if numberInStock is equal to ${bounds.numberInStock.min}`, () => {
      movie.numberInStock = bounds.numberInStock.min;

      const { error } = validatePost(movie);

      expect(error).toBe(undefined);
    });

    it(`should return error if numberInStock is greater than ${bounds.numberInStock.max}`, () => {
      movie.numberInStock = bounds.numberInStock.max + 1;

      const { error } = validatePost(movie);

      expect(error.message).toMatch(
        new RegExp(`numberInStock.*${bounds.numberInStock.max}`)
      );
    });

    it(`should not return error if numberInStock is equal to ${bounds.numberInStock.max}`, () => {
      movie.numberInStock = bounds.numberInStock.max;

      const { error } = validatePost(movie);

      expect(error).toBe(undefined);
    });

    it('should return error if genreIds is not an array', () => {
      movie.genreIds = 'not an array';

      const { error } = validatePost(movie);

      expect(error.message).toMatch(/genreIds.*array/);
    });

    it('should return error if genreIds contains a non-string', () => {
      movie.genreIds = [mongoose.Types.ObjectId()];

      const { error } = validatePost(movie);

      expect(error.message).toMatch(/genreIds.*string/);
    });

    it('should return error if genreIds contains an empty string', () => {
      movie.genreIds = [''];

      const { error } = validatePost(movie);

      expect(error.message).toMatch(/genreIds.*empty/);
    });

    it('should return error if genreIds contains a non-hex string', () => {
      movie.genreIds = ['0aG'.repeat(8)];

      const { error } = validatePost(movie);

      expect(error.message).toMatch(/genreIds.*fails.*valid.*id/);
    });

    it('should return error if genreIds contains non-unique hex strings', () => {
      const id = mongoose.Types.ObjectId().toHexString();
      movie.genreIds = [id, id];

      const { error } = validatePost(movie);

      expect(error.message).toMatch(/genreIds.*duplicate/);
    });

    it('should not return error if genreIds contains a 24-digit hex string', () => {
      movie.genreIds = ['0aF'.repeat(8)];

      const { error } = validatePost(movie);

      expect(error).toBe(undefined);
    });

    it('should not return error if genreIds contains a valid objectId string', () => {
      movie.genreIds = [mongoose.Types.ObjectId().toHexString()];

      const { error } = validatePost(movie);

      expect(error).toBe(undefined);
    });

    it(`should return error if genreIds size is less than ${bounds.genres.min}`, () => {
      movie.genreIds = [];
      for (let i = 0; i < bounds.genres.min - 1; i += 1)
        movie.genreIds.push(mongoose.Types.ObjectId().toHexString());

      const { error } = validatePost(movie);

      expect(error.message).toMatch(
        new RegExp(`genreIds.*${bounds.genres.min}`)
      );
    });

    it(`should not return error if genreIds size is equal to ${bounds.genres.min}`, () => {
      movie.genreIds = [];
      for (let i = 0; i < bounds.genres.min; i += 1)
        movie.genreIds.push(mongoose.Types.ObjectId().toHexString());

      const { error } = validatePost(movie);

      expect(error).toBe(undefined);
    });
    it(`should return error if genreIds size is greater than ${bounds.genres.max}`, () => {
      movie.genreIds = [];
      for (let i = 0; i < bounds.genres.max + 1; i += 1)
        movie.genreIds.push(mongoose.Types.ObjectId().toHexString());

      const { error } = validatePost(movie);

      expect(error.message).toMatch(
        new RegExp(`genreIds.*${bounds.genres.max}`)
      );
    });

    it(`should not return error if genreIds size is equal to ${bounds.genres.max}`, () => {
      movie.genreIds = [];
      for (let i = 0; i < bounds.genres.max; i += 1)
        movie.genreIds.push(mongoose.Types.ObjectId().toHexString());

      const { error } = validatePost(movie);

      expect(error).toBe(undefined);
    });

    it('should not return error if genreIds is undefined', () => {
      delete movie.genreIds;

      const { error } = validatePost(movie);

      expect(error).toBe(undefined);
    });

    it('should not return error if movie is valid', () => {
      const { error } = validatePost(movie);

      expect(error).toBe(undefined);
    });
  });

  describe('validatePut', () => {
    it('should return error if movie is empty', () => {
      movie = {};

      const { error } = validatePut(movie);

      expect(error.message).toMatch(/property.*required/);
    });

    it('should return error if movie contains an invalid property', () => {
      movie.invalid = 'invalid';

      const { error } = validatePut(movie);

      expect(error.message).toMatch(/not.*allowed/);
    });

    it('should return error if title is not a string', () => {
      movie.title = {};

      const { error } = validatePut(movie);

      expect(error.message).toMatch(/title.*string/);
    });

    it('should return error if title is empty', () => {
      movie.title = '';

      const { error } = validatePut(movie);

      expect(error.message).toMatch(/title.*empty/);
    });

    it(`should return error if title length is less than ${bounds.title.min}`, () => {
      movie.title = 'a'.repeat(bounds.title.min - 1);

      const { error } = validatePut(movie);

      expect(error.message).toMatch(new RegExp(`title.*${bounds.title.min}`));
    });

    it(`should not return error if title length is equal to ${bounds.title.min}`, () => {
      movie.title = 'a'.repeat(bounds.title.min);

      const { error } = validatePut(movie);

      expect(error).toBe(undefined);
    });

    it(`should return error if title length is greater than ${bounds.title.max}`, () => {
      movie.title = 'a'.repeat(bounds.title.max + 1);

      const { error } = validatePut(movie);

      expect(error.message).toMatch(new RegExp(`title.*${bounds.title.max}`));
    });

    it(`should not return error if title length is equal to ${bounds.title.max}`, () => {
      movie.title = 'a'.repeat(bounds.title.max);

      const { error } = validatePut(movie);

      expect(error).toBe(undefined);
    });

    it('should not return error if title is undefined', () => {
      delete movie.title;

      const { error } = validatePut(movie);

      expect(error).toBe(undefined);
    });

    it('should not return error if only title is defined', () => {
      movie = { title: movie.title };

      const { error } = validatePut(movie);

      expect(error).toBe(undefined);
    });

    it('should return error if dailyRentalRate is not a number', () => {
      movie.dailyRentalRate = 'not a number';

      const { error } = validatePut(movie);

      expect(error.message).toMatch(/dailyRentalRate.*number/);
    });

    it('should round dailyRentalRate to 2 decimal places', () => {
      movie.dailyRentalRate = 1.115;

      const { error, value } = validatePut(movie);

      expect(error).toBe(undefined);
      expect(value.dailyRentalRate).toEqual(1.12);
    });

    it(`should return error if dailyRentalRate is less than ${bounds.dailyRentalRate.min}`, () => {
      movie.dailyRentalRate = bounds.dailyRentalRate.min - 1;

      const { error } = validatePut(movie);

      expect(error.message).toMatch(
        new RegExp(`dailyRentalRate.*${bounds.dailyRentalRate.min}`)
      );
    });

    it(`should not return error if dailyRentalRate is equal to ${bounds.dailyRentalRate.min}`, () => {
      movie.dailyRentalRate = bounds.dailyRentalRate.min;

      const { error } = validatePut(movie);

      expect(error).toBe(undefined);
    });

    it(`should return error if dailyRentalRate is greater than ${bounds.dailyRentalRate.max}`, () => {
      movie.dailyRentalRate = bounds.dailyRentalRate.max + 1;

      const { error } = validatePut(movie);

      expect(error.message).toMatch(
        new RegExp(`dailyRentalRate.*${bounds.dailyRentalRate.max}`)
      );
    });

    it(`should not return error if dailyRentalRate is equal to ${bounds.dailyRentalRate.max}`, () => {
      movie.dailyRentalRate = bounds.dailyRentalRate.max;

      const { error } = validatePut(movie);

      expect(error).toBe(undefined);
    });

    it('should not return error if dailyRentalRate is undefined', () => {
      delete movie.dailyRentalRate;

      const { error } = validatePut(movie);

      expect(error).toBe(undefined);
    });

    it('should not return error if only dailyRentalRate is defined', () => {
      movie = { dailyRentalRate: movie.dailyRentalRate };

      const { error } = validatePut(movie);

      expect(error).toBe(undefined);
    });

    it('should return error if numberInStock is not a number', () => {
      movie.numberInStock = 'not a number';

      const { error } = validatePut(movie);

      expect(error.message).toMatch(/numberInStock.*number/);
    });

    it('should return error if numberInStock is not an integer', () => {
      movie.numberInStock = 1.1;

      const { error } = validatePut(movie);

      expect(error.message).toMatch(/numberInStock.*integer/);
    });

    it(`should return error if numberInStock is less than ${bounds.numberInStock.min}`, () => {
      movie.numberInStock = bounds.numberInStock.min - 1;

      const { error } = validatePut(movie);

      expect(error.message).toMatch(
        new RegExp(`numberInStock.*${bounds.numberInStock.min}`)
      );
    });

    it(`should not return error if numberInStock is equal to ${bounds.numberInStock.min}`, () => {
      movie.numberInStock = bounds.numberInStock.min;

      const { error } = validatePut(movie);

      expect(error).toBe(undefined);
    });

    it(`should return error if numberInStock is greater than ${bounds.numberInStock.max}`, () => {
      movie.numberInStock = bounds.numberInStock.max + 1;

      const { error } = validatePut(movie);

      expect(error.message).toMatch(
        new RegExp(`numberInStock.*${bounds.numberInStock.max}`)
      );
    });

    it(`should not return error if numberInStock is equal to ${bounds.numberInStock.max}`, () => {
      movie.numberInStock = bounds.numberInStock.max;

      const { error } = validatePut(movie);

      expect(error).toBe(undefined);
    });

    it('should not return error if numberInStock is undefined', () => {
      delete movie.numberInStock;

      const { error } = validatePut(movie);

      expect(error).toBe(undefined);
    });

    it('should not return error if only numberInStock is defined', () => {
      movie = { numberInStock: movie.numberInStock };

      const { error } = validatePut(movie);

      expect(error).toBe(undefined);
    });

    it('should return error if genreIds is not an array', () => {
      movie.genreIds = 'not an array';

      const { error } = validatePut(movie);

      expect(error.message).toMatch(/genreIds.*array/);
    });

    it('should return error if genreIds contains a non-string', () => {
      movie.genreIds = [mongoose.Types.ObjectId()];

      const { error } = validatePut(movie);

      expect(error.message).toMatch(/genreIds.*string/);
    });

    it('should return error if genreIds contains an empty string', () => {
      movie.genreIds = [''];

      const { error } = validatePut(movie);

      expect(error.message).toMatch(/genreIds.*empty/);
    });

    it('should return error if genreIds contains a non-hex string', () => {
      movie.genreIds = ['0aG'.repeat(8)];

      const { error } = validatePut(movie);

      expect(error.message).toMatch(/genreIds.*fails.*valid.*id/);
    });

    it('should return error if genreIds are not unique', () => {
      const id = mongoose.Types.ObjectId().toHexString();
      movie.genreIds = [id, id];

      const { error } = validatePut(movie);

      expect(error.message).toMatch(/duplicate/);
    });

    it('should not return error if genreIds contains a 24-digit hex string', () => {
      movie.genreIds = ['0aF'.repeat(8)];

      const { error } = validatePut(movie);

      expect(error).toBe(undefined);
    });

    it('should not return error if genreIds contains a valid objectId string', () => {
      movie.genreIds = [mongoose.Types.ObjectId().toHexString()];

      const { error } = validatePut(movie);

      expect(error).toBe(undefined);
    });

    it(`should return error if genreIds size is less than ${bounds.genres.min}`, () => {
      movie.genreIds = [];
      for (let i = 0; i < bounds.genres.min - 1; i += 1)
        movie.genreIds.push(mongoose.Types.ObjectId().toHexString());

      const { error } = validatePut(movie);

      expect(error.message).toMatch(
        new RegExp(`genreIds.*${bounds.genres.min}`)
      );
    });

    it(`should not return error if genreIds size is equal to ${bounds.genres.min}`, () => {
      movie.genreIds = [];
      for (let i = 0; i < bounds.genres.min; i += 1)
        movie.genreIds.push(mongoose.Types.ObjectId().toHexString());

      const { error } = validatePut(movie);

      expect(error).toBe(undefined);
    });

    it(`should return error if genreIds size is greater than ${bounds.genres.max}`, () => {
      movie.genreIds = [];
      for (let i = 0; i < bounds.genres.max + 1; i += 1)
        movie.genreIds.push(mongoose.Types.ObjectId().toHexString());

      const { error } = validatePut(movie);

      expect(error.message).toMatch(
        new RegExp(`genreIds.*${bounds.genres.max}`)
      );
    });

    it(`should not return error if genreIds size is equal to ${bounds.genres.max}`, () => {
      movie.genreIds = [];
      for (let i = 0; i < bounds.genres.max; i += 1)
        movie.genreIds.push(mongoose.Types.ObjectId().toHexString());

      const { error } = validatePut(movie);

      expect(error).toBe(undefined);
    });

    it('should not return error if genreIds is undefined', () => {
      delete movie.genreIds;

      const { error } = validatePut(movie);

      expect(error).toBe(undefined);
    });

    it('should not return error if only genreIds is defined', () => {
      movie = { genreIds: movie.genreIds };

      const { error } = validatePut(movie);

      expect(error).toBe(undefined);
    });

    it('should not return error if movie is valid', () => {
      const { error } = validatePut(movie);

      expect(error).toBe(undefined);
    });
  });
});
