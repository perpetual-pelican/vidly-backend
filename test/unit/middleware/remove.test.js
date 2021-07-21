const remove = require('../../../middleware/remove');

describe('remove middleware', () => {
  const modelName = 'Document';
  const doc = { _id: 1 };
  let Model;
  let lean;
  let req;
  let res;
  let send;
  let next;

  beforeEach(async () => {
    lean = jest.fn().mockReturnValue(doc);
    Model = {
      inspect() {
        return `Model { ${modelName} }`;
      },
      findByIdAndDelete: jest.fn((id) => {
        if (id === doc._id) return { lean };
        return { lean: jest.fn() };
      }),
    };
    req = { params: { id: doc._id } };
    send = jest.fn();
    res = { status: jest.fn().mockReturnValue({ send }) };
    next = jest.fn();
  });

  it('should delete the document from the database', async () => {
    await remove(Model)(req, res, next);

    expect(Model.findByIdAndDelete).toHaveBeenCalled();
    expect(lean).toHaveBeenCalled();
  });

  it('should set status to 404 if id is not found', async () => {
    req.params.id = 2;

    await remove(Model)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('should set a message with modelName if id is not found', async () => {
    req.params.id = 2;

    await remove(Model)(req, res, next);

    expect(send.mock.calls[0][0]).toMatch(new RegExp(modelName));
  });

  it('should populate req.doc with the deleted document', async () => {
    await remove(Model)(req, res, next);

    expect(req).toHaveProperty('doc');
  });

  it('should call next if document is found', async () => {
    await remove(Model)(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
