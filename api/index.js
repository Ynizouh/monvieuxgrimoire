let app;
let initError = null;

try {
  app = require('../backend/app');
} catch (err) {
  initError = err;
  console.error('Failed to load backend app:', err);
}

module.exports = (req, res) => {
  if (initError) {
    return res.status(500).json({
      error: 'Backend initialization failed',
      message: initError.message,
      stack: initError.stack
    });
  }
  try {
    return app(req, res);
  } catch (err) {
    return res.status(500).json({
      error: 'Runtime invocation failed',
      message: err.message,
      stack: err.stack
    });
  }
};
