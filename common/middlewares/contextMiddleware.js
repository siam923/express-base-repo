// src/middlewares/contextMiddleware.js
export const contextMiddleware = async (req, res, next) => {
  req.context = {};
  if (req.user) {
    if (req.user.role === 'vendor') {
      req.context.vendorId = req.user.vendorId;
      req.context.accessLevel = 'vendor';
    } else if (req.user.role === 'admin') {
      req.context.accessLevel = 'admin';
    } else {
      req.context.accessLevel = 'public';
    }
  } else {
    req.context.accessLevel = 'public';
  }
  next();
};

export const assignUserIdMiddleware = (req, res, next) => {
  if (req.user && req.user._id) {
    req.body.userId = req.user._id.toString();
  }
  next();
};

export const assignVendorIdMiddleware = (req, res, next) => {
  if (req.user && req.user._id) {
    req.body.vendorId = req.user._id.toString();
  }
  next();
};
