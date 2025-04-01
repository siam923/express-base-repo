// src/utils/catchAsync.js

/**
 * Wraps an async controller function to catch errors and send consistent error responses
 * @param {Function} fn The async controller function to wrap
 * @returns {Function} Express middleware function
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((error) => {
    console.log('Error caught in catchAsync:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Internal Server Error',
      status: 'fail'
    });
  });
};

export default catchAsync;
