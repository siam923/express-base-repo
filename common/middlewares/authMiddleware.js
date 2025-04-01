// src/middlewares/authMiddleware.js
import User from "#src/models/User.js";
import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).send("Access denied");

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(decoded);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (err) {
    res.status(403).send("Invalid token");
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (req.user.role === 'admin') return next();
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: 'Forbidden: You do not have access to this resource' });
    }
    next();
  };
};


export default authMiddleware;
export { authorize };
