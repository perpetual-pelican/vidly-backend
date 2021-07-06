module.exports = (Model) => async (req, res, next) => {
  const modelString = Model.inspect();
  const modelName = modelString.substring(8, modelString.length - 2);

  const doc = await Model.findByIdAndDelete(req.params.id).lean();
  if (!doc) return res.status(404).send(`${modelName} id not found`);

  req.doc = doc;

  return next();
};
