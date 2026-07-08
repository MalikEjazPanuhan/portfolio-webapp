// F:\portfolio-webapp\backend\middleware\audit.js
module.exports = (supabase) => {
  return async (req, res, next) => {
    // Skip audit for health checks
    if (req.path === '/api/health') {
      return next();
    }

    const originalJson = res.json;
    const originalSend = res.send;

    // Track response
    let responseSent = false;

    const logAction = (success) => {
      if (responseSent) return;
      responseSent = true;

      // Don't log login attempts separately (already logged)
      if (req.path.includes('/auth/login')) return;

      supabase.from('audit_logs').insert({
        user_id: req.user?.id || null,
        action: `${req.method} ${req.path}`,
        ip: req.ip || req.connection?.remoteAddress || 'unknown',
        user_agent: req.headers['user-agent'] || 'unknown',
        success: success,
        timestamp: new Date().toISOString()
      }).then(() => {}).catch(() => {});
    };

    res.json = function(data) {
      logAction(res.statusCode < 400);
      originalJson.call(this, data);
    };

    res.send = function(data) {
      logAction(res.statusCode < 400);
      originalSend.call(this, data);
    };

    // On error
    res.on('finish', () => {
      logAction(res.statusCode < 400);
    });

    next();
  };
};
