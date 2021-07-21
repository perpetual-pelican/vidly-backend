const winston = require('winston');
const startServer = require('../../../startup/server');

describe('server startup', () => {
  let server;

  beforeEach(() => {
    winston.info = jest.fn();
  });

  afterEach(async () => {
    delete process.env.PORT;
    await server.close();
  });

  it('should listen on process.env.PORT if it is defined', () => {
    const app = require('../../../startup/app');
    const { listen } = app;
    app.listen = jest.fn((port) => {
      return listen(port);
    });
    process.env.PORT = 5000;

    server = startServer();

    expect(app.listen).toHaveBeenCalledWith('5000');
  });

  it('should log the server status', () => {
    server = startServer();

    expect(winston.info).toHaveBeenCalled();
    expect(winston.info.mock.calls[0][0]).toMatch(/port.*3000/);
  });

  it('should return a listening server', () => {
    server = startServer();

    expect(server).toHaveProperty('listening', true);
  });
});
