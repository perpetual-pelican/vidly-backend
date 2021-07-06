module.exports = async (req, res, next) => {
  req.doc.set(req.body);
  await req.doc.save();

  return next();
};
