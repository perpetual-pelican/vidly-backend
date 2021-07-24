module.exports = (Model, lean) => async (req, res, next) => {
  const modelString = Model.inspect();
  const modelName = modelString.substring(8, modelString.length - 2);

  let doc;
  if (lean) doc = await Model.findById(req.params.id).lean();
  else doc = await Model.findById(req.params.id);
  if (!doc) return res.status(404).send(`${modelName} id not found`);

  req.doc = doc;

  return next();
};
