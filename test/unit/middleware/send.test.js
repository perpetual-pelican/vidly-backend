const send = require('../../../src/middleware/send');

describe('send middleware', () => {
  it('should call next if document is found', async () => {
    const req = { doc: 'some document' };
    const res = { send: jest.fn().mockReturnValue(req.doc) };
    await send(req, res);

    expect(res.send).toHaveBeenCalledWith(req.doc);
  });
});
