const post = require('../../../src/middleware/post');

describe('post middleware', () => {
  let doc;
  let Model;
  let req;
  let res;
  let next;

  beforeEach(async () => {
    doc = { save: jest.fn() };
    Model = jest.fn().mockReturnValue(doc);
    req = { body: doc };
    res = {};
    next = jest.fn();
  });

  it('should create a new document with the given Model', async () => {
    await post(Model)(req, res, next);

    expect(Model).toHaveBeenCalledWith(req.body);
  });

  it('should populate req.doc with the created document', async () => {
    await post(Model)(req, res, next);

    expect(req).toHaveProperty('doc');
  });

  it('should save the document to the database', async () => {
    await post(Model)(req, res, next);

    expect(doc.save).toHaveBeenCalled();
  });

  it('should call next after document is saved', async () => {
    await post(Model)(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
