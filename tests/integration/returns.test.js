const moment = require('moment');
const test = require('../testHelper');
const app = require('../../src/startup/app');
const { User } = require('../../src/models/user');
const { Movie } = require('../../src/models/movie');
const { Rental } = require('../../src/models/rental');

const { post } = test.request;

describe('/api/returns', () => {
  test.setup('returns', app);

  const token = new User({ isAdmin: false }).generateAuthToken();
  let movie;
  let rental;
  let returnObject;
  let req;

  beforeEach(async () => {
    movie = await new Movie({
      title: 'Movie Title',
      numberInStock: 0,
      dailyRentalRate: 2,
    }).save();
    rental = await new Rental({
      customer: {
        name: 'Customer Name',
        phone: '12345',
      },
      movie: {
        _id: movie._id,
        title: movie.title,
        dailyRentalRate: movie.dailyRentalRate,
      },
    }).save();
    returnObject = {
      customerId: rental.customer._id,
      movieId: rental.movie._id,
    };
    req = { token, body: returnObject };
  });

  afterEach(async () => {
    await Movie.deleteMany();
    await Rental.deleteMany();
  });

  it('should return 401 if client is not logged in', async () => {
    await test.tokenEmpty(post, req);
  });

  it('should return 400 if customerId is undefined', async () => {
    delete req.body.customerId;

    const res = await post(req);

    expect(res.status).toBe(400);
    expect(res.text).toMatch(/customerId.*required/);
  });

  it('should return 400 if movieId is undefined', async () => {
    delete req.body.movieId;

    const res = await post(req);

    expect(res.status).toBe(400);
    expect(res.text).toMatch(/movieId.*required/);
  });

  it('should return 404 if no rental found for customer/movie', async () => {
    await Rental.deleteMany();

    const res = await post(req);

    expect(res.status).toBe(404);
    expect(res.text).toMatch(/[Rr]ental.*[Cc]ustomer.*[Mm]ovie/);
  });

  it('should not delete rental in db if transaction fails after delete', async () => {
    const { lookup } = Rental;
    Rental.lookup = jest.fn(() => {
      throw Error('fake error in return transaction');
    });

    const res = await post(req);
    Rental.lookup = lookup;

    const rentalInDB = await Rental.findById(rental._id).lean();

    expect(res.status).toBe(500);
    expect(res.text).toMatch(/[Tt]ransaction.*[Ff]ail/);
    expect(rentalInDB).toHaveProperty('dateOut');
    expect(rentalInDB).toHaveProperty('dateReturned', undefined);
    expect(rentalInDB).toHaveProperty('rentalFee', undefined);
  });

  it('should set return date if request is valid', async () => {
    await post(req);

    const rentalInDB = await Rental.findById(rental._id).lean();
    const diff = Date.now() - rentalInDB.dateReturned;

    expect(diff).toBeLessThan(10 * 1000);
  });

  it('should calculate rental fee if request is valid', async () => {
    rental.dateOut = moment().add(-7, 'days').toDate();
    await rental.save();

    await post(req);

    const rentalInDB = await Rental.findById(rental._id).lean();

    expect(rentalInDB.rentalFee).toBe(7 * rental.movie.dailyRentalRate);
  });

  it('should return the rental and increase the movie stock if request is valid', async () => {
    await post(req);

    const rentalInDB = await Rental.findById(rental._id).lean();
    const movieInDB = await Movie.findById(returnObject.movieId).lean();

    expect(rentalInDB).toHaveProperty('dateReturned');
    expect(rentalInDB).toHaveProperty('rentalFee');
    expect(movieInDB.numberInStock).toBe(movie.numberInStock + 1);
  });

  it('should return the rental if request is valid', async () => {
    const res = await post(req);

    expect(res.status).toBe(200);
    expect(Object.keys(res.body)).toEqual(
      expect.arrayContaining([
        'customer',
        'movie',
        'dateOut',
        'dateReturned',
        'rentalFee',
      ])
    );
  });
});
