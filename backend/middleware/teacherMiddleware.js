// Allows access to admin OR teacher role
const teacherMiddleware = (req, res, next) => {
  if (req.user && (req.user.role === "admin" || req.user.role === "teacher")) {
    return next();
  }
  return res.status(403).json({ message: "Access denied: admin or teacher only" });
};

module.exports = teacherMiddleware;
