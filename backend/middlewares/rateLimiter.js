const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per `window`
  standardHeaders: true, 
  legacyHeaders: false, 
  message: {
    message: '🚀 Whoa there! Too many requests. Please take a small breather and try again in a few minutes.'
  }
});

module.exports = apiLimiter;
