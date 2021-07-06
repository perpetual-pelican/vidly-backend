const find = require('../../../middleware/find');

describe('find middleware', () => {
  const modelName = 'Document';
  const doc = { _id: 1 };
  let Model;
  let lean;
  let req;
  let res;
  let send;
  let next;

  beforeEach(async () => {
    lean = jest.fn();
    Model = {
      inspect() {
        return `Model { ${modelName} }`;
      },
      findById: jest.fn((id) => {
        if (id === doc._id) return { doc, lean };
        return undefined;
      }),
    };
    req = { params: { id: doc._id } };
    send = jest.fn();
    res = { status: jest.fn().mockReturnValue({ send }) };
    next = jest.fn();
  });

  it('should fetch a document with the given id', async () => {
    await find(Model)(req, res, next);

    expect(Model.findById).toHaveBeenCalled();
  });

  it('should fetch a lean document if lean parameter is truthy', async () => {
    await find(Model, true)(req, res, next);

    expect(Model.findById).toHaveBeenCalled();
    expect(lean).toHaveBeenCalled();
  });

  it('should set status to 404 if id is not found', async () => {
    req.params.id = 2;

    await find(Model)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('should send a message with modelName if id is not found', async () => {
    req.params.id = 2;

    await find(Model)(req, res, next);

    expect(send.mock.calls[0][0]).toMatch(
      new RegExp(`${modelName}.*not.*found`)
    );
  });

  it('should populate req.doc with the requested document', async () => {
    await find(Model)(req, res, next);

    expect(req).toHaveProperty('doc');
  });

  it('should call next if document is found', async () => {
    await find(Model)(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
