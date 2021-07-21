const put = require('../../../src/middleware/put');

describe('put middleware', () => {
  let doc;
  let req;
  let res;
  let next;

  beforeEach(async () => {
    doc = { set: jest.fn(), save: jest.fn() };
    req = { body: {}, doc };
    res = { status: jest.fn().mockReturnValue({ send: jest.fn() }) };
    next = jest.fn();
  });

  it('should set req.doc with the requested update values', async () => {
    await put(req, res, next);

    expect(req.doc.set).toHaveBeenCalledWith(req.body);
  });

  it('should save the document to the database', async () => {
    await put(req, res, next);

    expect(req.doc.save).toHaveBeenCalled();
  });

  it('should call next after the document is saved', async () => {
    await put(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
