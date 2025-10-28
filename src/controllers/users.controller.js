import logger from '#config/logger.js';
import {
  getAllUsers,
  getUserById as getUserByIdService,
  updateUser as updateUserService,
  deleteUser as deleteUserService,
} from '#services/users.services.js';
import {
  userIdSchema,
  updateUserSchema,
} from '#validations/users.validation.js';
import { formatValidationError } from '#utils/format.js';

export const fetchAllUsers = async (req, res, next) => {
  try {
    logger.info('Getting users ...');

    const allUsers = await getAllUsers();

    res.json({
      message: 'Successfully retrieved users',
      users: allUsers,
      count: allUsers.length,
    });
  } catch (e) {
    logger.error(e);
    next(e);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const paramsValidation = userIdSchema.safeParse(req.params);
    if (!paramsValidation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(paramsValidation.error),
      });
    }

    const { id } = paramsValidation.data;
    logger.info(`Getting user by id: ${id}`);

    const user = await getUserByIdService(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Successfully retrieved user', user });
  } catch (e) {
    logger.error(e);
    next(e);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const paramsValidation = userIdSchema.safeParse(req.params);
    if (!paramsValidation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(paramsValidation.error),
      });
    }

    const bodyValidation = updateUserSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(bodyValidation.error),
      });
    }

    const { id } = paramsValidation.data;
    const updates = bodyValidation.data;

    // Auth checks
    const actor = req.user;
    if (!actor) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (updates.role && actor.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can change role' });
    }

    if (actor.role !== 'admin' && actor.id !== id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    logger.info(`Updating user id=${id}`);

    const user = await updateUserService(id, updates);
    res.json({ message: 'User updated successfully', user });
  } catch (e) {
    logger.error(e);

    if (e.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }
    if (e.message === 'No valid fields to update') {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    next(e);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const paramsValidation = userIdSchema.safeParse(req.params);
    if (!paramsValidation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(paramsValidation.error),
      });
    }

    const { id } = paramsValidation.data;
    const actor = req.user;
    if (!actor) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (actor.role !== 'admin' && actor.id !== id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    logger.info(`Deleting user id=${id}`);
    await deleteUserService(id);

    res.json({ message: 'User deleted successfully' });
  } catch (e) {
    logger.error(e);
    if (e.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }
    next(e);
  }
};
