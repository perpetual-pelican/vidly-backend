const test = require('../testHelper');
const app = require('../../startup/app');
const { User } = require('../../models/user');
const { Genre } = require('../../models/genre');

const { getAll, getOne, post, put, del } = test.request;

describe('/api/genres', () => {
  test.setup('genres', app);

  const genreObject = { name: 'Genre Name' };
  let req;

  describe('GET /', () => {
    let genres;

    beforeAll(async () => {
      genres = [
        await new Genre(genreObject).save(),
        await new Genre({ name: 'Genre Name 2' }).save(),
      ];
    });

    afterAll(async () => {
      await Genre.deleteMany();
    });

    it('should return 500 if an uncaughtException is encountered', async () => {
      const { find } = Genre;
      Genre.find = jest.fn(() => {
        throw new Error('fake uncaught exception');
      });

      const res = await getAll();
      Genre.find = find;

      expect(res.status).toBe(500);
      expect(res.text).toMatch(/Something failed/);
    });

    it('should return all genres', async () => {
      const res = await getAll();

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      genres.forEach((genre) => {
        expect(res.body.some((g) => g.name === genre.name)).toBe(true);
      });
    });
  });

  describe('GET /:id', () => {
    let genre;

    beforeAll(async () => {
      genre = await new Genre(genreObject).save();
    });

    beforeEach(() => {
      req = { id: genre._id };
    });

    afterAll(async () => {
      await Genre.deleteMany();
    });

    it('should return 404 if id is invalid', async () => {
      await test.idInvalid(getOne, req);
    });

    it('should return 404 if id is not found', async () => {
      await test.idNotFound(getOne, req);
    });

    it('should return the genre if id is found', async () => {
      const res = await getOne(req);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', genre.name);
    });
  });

  describe('POST /', () => {
    const token = new User({ isAdmin: false }).generateAuthToken();

    beforeEach(() => {
      req = {
        token,
        body: { ...genreObject },
      };
    });

    afterEach(async () => {
      await Genre.deleteMany();
    });

    it('should return 401 if client is not logged in', async () => {
      await test.tokenEmpty(post, req);
    });

    it('should return 400 if token is invalid', async () => {
      await test.tokenInvalid(post, req);
    });

    it('should return 400 if invalid property is added', async () => {
      await test.requestInvalid(post, req);
    });

    it('should return 400 if genre name already exists', async () => {
      await Genre.create(genreObject);

      const res = await post(req);

      expect(res.status).toBe(400);
      expect(res.text).toMatch(/[Nn]ame.*[Ee]xists/);
    });

    it('should save the genre if request is valid', async () => {
      await post(req);

      const genreInDB = await Genre.findOne(genreObject).lean();

      expect(genreInDB).toHaveProperty('name', genreObject.name);
    });

    it('should return the genre if request is valid', async () => {
      const res = await post(req);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', genreObject.name);
    });
  });

  describe('PUT /:id', () => {
    let genre;
    let genreUpdate;

    beforeEach(async () => {
      genre = await new Genre(genreObject).save();
      genreUpdate = { name: 'Updated Genre Name' };
      req = {
        token: new User().generateAuthToken(),
        id: genre._id,
        body: genreUpdate,
      };
    });

    afterEach(async () => {
      await Genre.deleteMany();
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

    it('should return 400 if invalid property is added', async () => {
      await test.requestInvalid(put, req);
    });

    it('should return 400 if genre name already exists', async () => {
      req.body.name = genre.name;

      const res = await put(req);

      expect(res.status).toBe(400);
      expect(res.text).toMatch(/[Nn]ame.*[Ee]xists/);
    });

    it('should update the genre if request is valid', async () => {
      await put(req);

      const genreInDB = await Genre.findOne(genreUpdate).lean();

      expect(genreInDB).toHaveProperty('name', genreUpdate.name);
    });

    it('should return the updated genre if request is valid', async () => {
      const res = await put(req);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', genreUpdate.name);
    });
  });

  describe('DELETE /:id', () => {
    const token = new User({ isAdmin: true }).generateAuthToken();
    let genre;

    beforeEach(async () => {
      genre = await new Genre(genreObject).save();
      req = { token, id: genre._id };
    });

    afterEach(async () => {
      await Genre.deleteMany();
    });

    it('should return 401 if client is not logged in', async () => {
      await test.tokenEmpty(del, req);
    });

    it('should return 400 if token is invalid', async () => {
      await test.tokenInvalid(del, req);
    });

    it('should return 403 if client is not an admin', async () => {
      req.token = new User({ isAdmin: false }).generateAuthToken();

      await test.adminFalse(del, req);
    });

    it('should return 404 if id is invalid', async () => {
      await test.idInvalid(del, req);
    });

    it('should return 404 if id is not found', async () => {
      await test.idNotFound(del, req);
    });

    it('should delete the genre if request is valid', async () => {
      await del(req);

      const genreInDB = await Genre.findById(genre._id).lean();

      expect(genreInDB).toBeNull();
    });

    it('should return the deleted genre if request is valid', async () => {
      const res = await del(req);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', genre.name);
    });
  });
});
