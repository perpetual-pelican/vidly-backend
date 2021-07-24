const mongoose = require('mongoose');
const moment = require('moment');
const { Rental, validate } = require('../../../models/rental');

describe('Rental model', () => {
  let rental;

  beforeEach(() => {
    rental = new Rental({
      customer: { _id: 1 },
      movie: { _id: 2, dailyRentalRate: 0.99 },
    });
    Rental.findOne = jest.fn();
    rental.save = jest.fn();
  });

  describe('Rental.lookup', () => {
    it('should return an active rental for the given customer and movie', async () => {
      Rental.lookup(rental.customer._id, rental.movie._id);

      expect(Rental.findOne).toHaveBeenCalledWith({
        'customer._id': rental.customer._id,
        'movie._id': rental.movie._id,
        dateReturned: undefined,
      });
    });
  });

  describe('rental.return', () => {
    it('should set dateReturned', async () => {
      await rental.return();

      expect(rental).toHaveProperty('dateReturned');
    });

    it('should set rentalFee', async () => {
      rental.dateOut = moment().add(-7, 'days').toDate();

      await rental.return();

      expect(rental).toHaveProperty(
        'rentalFee',
        rental.movie.dailyRentalRate * 7
      );
    });

    it('should set dateReturned and rentalFee in db', async () => {
      const session = { sessionProperties: 'session values' };

      await rental.return(session);

      expect(rental.save).toHaveBeenCalledWith(session);
    });
  });

  describe('validate', () => {
    beforeEach(() => {
      rental = {
        customerId: mongoose.Types.ObjectId().toHexString(),
        movieId: mongoose.Types.ObjectId().toHexString(),
      };
    });

    it('should return error if rental contains an invalid property', () => {
      rental.invalid = 'invalid';

      const { error } = validate(rental);

      expect(error.message).toMatch(/not.*allowed/);
    });

    it('should return error if customerId is undefined', () => {
      delete rental.customerId;

      const { error } = validate(rental);

      expect(error.message).toMatch(/customerId.*required/);
    });

    it('should return error if customerId is a not a string', () => {
      rental.customerId = mongoose.Types.ObjectId();

      const { error } = validate(rental);

      expect(error.message).toMatch(/customerId.*string/);
    });

    it('should return error if customerId is empty', () => {
      rental.customerId = '';

      const { error } = validate(rental);

      expect(error.message).toMatch(/customerId.*empty/);
    });

    it('should return error if customerId is not hexadecimal', () => {
      rental.customerId = '0aG'.repeat(8);

      const { error } = validate(rental);

      expect(error.message).toMatch(/customerId.*fails.*valid.*id/);
    });

    it('should not return error if customerId is a 24-digit hex string', () => {
      rental.customerId = '0aF'.repeat(8);

      const { error } = validate(rental);

      expect(error).toBe(undefined);
    });

    it('should not return error if customerId is a valid objectId string', () => {
      rental.customerId = mongoose.Types.ObjectId().toHexString();

      const { error } = validate(rental);

      expect(error).toBe(undefined);
    });

    it('should return error if movieId is undefined', () => {
      delete rental.movieId;

      const { error } = validate(rental);

      expect(error.message).toMatch(/movieId.*required/);
    });

    it('should return error if movieId is not a string', () => {
      rental.movieId = mongoose.Types.ObjectId();

      const { error } = validate(rental);

      expect(error.message).toMatch(/movieId.*string/);
    });

    it('should return error if movieId is empty', () => {
      rental.movieId = '';

      const { error } = validate(rental);

      expect(error.message).toMatch(/movieId.*empty/);
    });

    it('should return error if movieId is not hexadecimal', () => {
      rental.movieId = '0aG'.repeat(8);

      const { error } = validate(rental);

      expect(error.message).toMatch(/movieId.*fails.*valid.*id/);
    });

    it('should not return error if movieId is a 24-digit hex string', () => {
      rental.movieId = '0aF'.repeat(8);

      const { error } = validate(rental);

      expect(error).toBe(undefined);
    });

    it('should not return error if movieId is a valid objectId string', () => {
      rental.movieId = mongoose.Types.ObjectId().toHexString();

      const { error } = validate(rental);

      expect(error).toBe(undefined);
    });
  });
});
