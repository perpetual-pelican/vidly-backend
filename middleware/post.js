module.exports = (Model) => async (req, res, next) => {
  req.doc = new Model(req.body);
  await req.doc.save();

  return next();
};
