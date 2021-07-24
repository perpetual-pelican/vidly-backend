const mongoose = require('mongoose');
const _ = require('lodash');
const test = require('../testHelper');
const app = require('../../startup/app');
const { User } = require('../../models/user');
const { Genre } = require('../../models/genre');
const { Movie } = require('../../models/movie');

const { getAll, getOne, post, put, del } = test.request;

describe('/api/movies', () => {
  test.setup('movies', app);

  const token = new User({ isAdmin: false }).generateAuthToken();
  let genres;
  let movieObject;
  let req;

  beforeAll(async () => {
    genres = [
      await new Genre({ name: 'Genre Name' }).save(),
      await new Genre({ name: 'Genre Name 2' }).save(),
    ];
    movieObject = {
      title: 'Movie Title',
      dailyRentalRate: 1,
      numberInStock: 1,
      genres: [genres[0]],
    };
  });

  describe('GET /', () => {
    let movies;

    beforeAll(async () => {
      movies = [
        await new Movie(movieObject).save(),
        await new Movie({
          title: ' Movie Title 2',
          dailyRentalRate: 2,
          numberInStock: 2,
          genres: [genres[1]],
        }).save(),
      ];
    });

    afterAll(async () => {
      await Movie.deleteMany();
    });

    it('should return 500 if an uncaughtException is encountered', async () => {
      const { find } = Movie;
      Movie.find = jest.fn(() => {
        throw new Error('fake uncaught exception');
      });

      const res = await getAll();
      Movie.find = find;

      expect(res.status).toBe(500);
      expect(res.text).toMatch(/Something failed/);
    });

    it('should return all movies', async () => {
      const res = await getAll();

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(
        res.body.some(
          (m) =>
            m.title === movies[0].title &&
            m.dailyRentalRate === movies[0].dailyRentalRate &&
            m.numberInStock === movies[0].numberInStock &&
            m.genres[0].name === movies[0].genres[0].name
        )
      ).toBe(true);
      expect(
        res.body.some(
          (m) =>
            m.title === movies[1].title &&
            m.dailyRentalRate === movies[1].dailyRentalRate &&
            m.numberInStock === movies[1].numberInStock &&
            m.genres.some((g) => g.name === movies[1].genres[0].name)
        )
      ).toBe(true);
    });
  });

  describe('GET /:id', () => {
    let movie;

    beforeAll(async () => {
      movie = await new Movie(movieObject).save();
    });

    beforeEach(() => {
      req = { id: movie._id };
    });

    afterAll(async () => {
      await Movie.deleteMany();
    });

    it('should return 404 if id is invalid', async () => {
      await test.idInvalid(getOne, req);
    });

    it('should return 404 if id is not found', async () => {
      await test.idNotFound(getOne, req);
    });

    it('should return the movie if request is valid', async () => {
      const res = await getOne(req);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('title', movie.title);
      expect(res.body).toHaveProperty('dailyRentalRate', movie.dailyRentalRate);
      expect(res.body).toHaveProperty('numberInStock', movie.numberInStock);
      expect(res.body).toHaveProperty(
        'genres',
        expect.arrayContaining([
          expect.objectContaining({ name: movie.genres[0].name }),
        ])
      );
    });
  });

  describe('POST /', () => {
    beforeEach(async () => {
      req = {
        token,
        body: { ..._.omit(movieObject, ['genres']), genreIds: [genres[0]._id] },
      };
    });

    afterEach(async () => {
      await Movie.deleteMany();
    });

    it('should return 401 if client is not logged in', async () => {
      await test.tokenEmpty(post, req);
    });

    it('should return 400 if token is invalid', async () => {
      await test.tokenInvalid(post, req);
    });

    it('should return 400 if request body is invalid', async () => {
      await test.requestInvalid(post, req);
    });

    it('should return 400 if any genre id is not found', async () => {
      req.body.genreIds.push(mongoose.Types.ObjectId());

      const res = await post(req);

      expect(res.status).toBe(400);
      expect(res.text).toMatch(/[Gg]enre.*[Ii]d/);
    });

    it('should return 200 if genreIds is undefined', async () => {
      delete req.body.genreIds;

      const res = await post(req);

      expect(res.status).toBe(200);
      expect(res.body).not.toHaveProperty('genres');
    });

    it('should save the movie if request is valid', async () => {
      await post(req);

      const movieInDB = await Movie.findOne({
        title: movieObject.title,
      }).lean();

      expect(movieInDB).toHaveProperty('title', movieObject.title);
      expect(movieInDB).toHaveProperty(
        'dailyRentalRate',
        movieObject.dailyRentalRate
      );
      expect(movieInDB).toHaveProperty(
        'numberInStock',
        movieObject.numberInStock
      );
      expect(movieInDB).toHaveProperty(
        'genres',
        expect.arrayContaining([
          expect.objectContaining({ name: genres[0].name }),
        ])
      );
    });

    it('should return the movie if request is valid', async () => {
      const res = await post(req);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('title', movieObject.title);
      expect(res.body).toHaveProperty(
        'dailyRentalRate',
        movieObject.dailyRentalRate
      );
      expect(res.body).toHaveProperty(
        'numberInStock',
        movieObject.numberInStock
      );
      expect(res.body).toHaveProperty(
        'genres',
        expect.arrayContaining([
          expect.objectContaining({ name: genres[0].name }),
        ])
      );
    });
  });

  describe('PUT /:id', () => {
    let movie;
    let movieUpdate;

    beforeEach(async () => {
      movie = await new Movie(movieObject).save();
      movieUpdate = {
        title: 'Updated Movie Title',
        genreIds: [genres[1]._id],
      };
      req = {
        token,
        id: movie._id,
        body: movieUpdate,
      };
    });

    afterEach(async () => {
      await Movie.deleteMany();
    });

    it('should return 401 if client is not logged in', async () => {
      await test.tokenEmpty(put, req);
    });

    it('should return 400 if token is invalid', async () => {
      await test.tokenInvalid(put, req);
    });

    it('should return 404 if id is invalid', async () => {
      await test.idInvalid(put, req);
    });

    it('should return 404 if id is not found', async () => {
      await test.idNotFound(put, req);
    });

    it('should return 400 if request body is empty', async () => {
      await test.requestEmpty(put, req);
    });

    it('should return 400 if request body is invalid', async () => {
      await test.requestInvalid(put, req);
    });

    it('should return 400 if any genreId is not found', async () => {
      req.body.genreIds.push(mongoose.Types.ObjectId());

      const res = await put(req);

      expect(res.status).toBe(400);
      expect(res.text).toMatch(/[Gg]enre.*[Ii]d/);
    });

    it('should update the movie if genreIds is undefined', async () => {
      delete req.body.genreIds;

      await put(req);

      const movieInDB = await Movie.findById(movie._id).lean();

      expect(movieInDB).toHaveProperty('title', movieUpdate.title);
      expect(movieInDB).toHaveProperty(
        'dailyRentalRate',
        movie.dailyRentalRate
      );
      expect(movieInDB).toHaveProperty('numberInStock', movie.numberInStock);
      expect(movieInDB).toHaveProperty(
        'genres',
        expect.arrayContaining([
          expect.objectContaining({ name: movie.genres[0].name }),
        ])
      );
    });

    it('should update movie genres if genreIds are valid', async () => {
      delete req.body.title;

      await put(req);

      const movieInDB = await Movie.findById(movie._id).lean();

      expect(movieInDB).toHaveProperty('title', movie.title);
      expect(movieInDB).toHaveProperty(
        'dailyRentalRate',
        movie.dailyRentalRate
      );
      expect(movieInDB).toHaveProperty('numberInStock', movie.numberInStock);
      expect(movieInDB).toHaveProperty(
        'genres',
        expect.arrayContaining([
          expect.objectContaining({ name: genres[1].name }),
        ])
      );
    });

    it('should return the movie if request is valid', async () => {
      const res = await put(req);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('title', movieUpdate.title);
      expect(res.body).toHaveProperty('dailyRentalRate', movie.dailyRentalRate);
      expect(res.body).toHaveProperty('numberInStock', movie.numberInStock);
      expect(res.body).toHaveProperty(
        'genres',
        expect.arrayContaining([
          expect.objectContaining({ name: genres[1].name }),
        ])
      );
    });
  });

  describe('DELETE /:id', () => {
    let movie;

    beforeEach(async () => {
      movie = await new Movie(movieObject).save();
      req = {
        token: new User({ isAdmin: true }).generateAuthToken(),
        id: movie._id,
      };
    });

    afterEach(async () => {
      await Movie.deleteMany();
    });

    it('should return 401 if client is not logged in', async () => {
      await test.tokenEmpty(del, req);
    });

    it('should return 400 if token is invalid', async () => {
      await test.tokenInvalid(del, req);
    });

    it('should return 403 if user is not an admin', async () => {
      req.token = new User({ isAdmin: false }).generateAuthToken();

      await test.adminFalse(del, req);
    });

    it('should return 404 if id is invalid', async () => {
      await test.idInvalid(del, req);
    });

    it('should return 404 if id is not found', async () => {
      await test.idNotFound(del, req);
    });

    it('should delete the movie if request is valid', async () => {
      await del(req);

      const movieInDB = await Movie.findById(req.id).lean();

      expect(movieInDB).toBeNull();
    });

    it('should return the movie if request is valid', async () => {
      const res = await del(req);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('title', movie.title);
      expect(res.body).toHaveProperty('dailyRentalRate', movie.dailyRentalRate);
      expect(res.body).toHaveProperty('numberInStock', movie.numberInStock);
      expect(res.body).toHaveProperty(
        'genres',
        expect.arrayContaining([
          expect.objectContaining({ name: movie.genres[0].name }),
        ])
      );
    });
  });
});
