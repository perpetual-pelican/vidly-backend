const request = require('supertest');
const app = require('../../src/startup/app');

describe('home', () => {
  it('should return the home page', async () => {
    const res = await request(app).get('/');

    expect(res.status).toBe(200);
    expect(res.text).toMatch(/[Hh]ome/);
  });
});
