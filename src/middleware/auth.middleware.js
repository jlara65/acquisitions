import logger from '#config/logger.js';
import { jwttoken } from '#utils/jwt.js';
import { cookies } from '#utils/cookies.js';

const authenticateToken = (req, res, next) => {
  try {
    const cookieToken = cookies.get(req, 'token');
    const header = req.get('Authorization') || '';
    const headerToken = header.startsWith('Bearer ') ? header.slice(7) : null;
    const token = cookieToken || headerToken;

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const payload = jwttoken.verify(token);
    // Expected payload: { id, email, role, iat, exp }
    req.user = { id: payload.id, email: payload.email, role: payload.role };

    return next();
  } catch (e) {
    logger.warn('Invalid or missing auth token', e);
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

export default authenticateToken;
