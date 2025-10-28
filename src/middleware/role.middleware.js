import logger from '#config/logger.js';

const requireRole =
  (...roles) =>
  (req, res, next) => {
    try {
      const role = req.user?.role;
      if (!role) return res.status(401).json({ error: 'Unauthorized' });
      if (!roles.includes(role)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      return next();
    } catch (e) {
      logger.error('requireRole middleware error', e);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

export default requireRole;
