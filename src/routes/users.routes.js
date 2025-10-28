import express from 'express';
import {
  fetchAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '#controllers/users.controller.js';
import authenticateToken from '#middleware/auth.middleware.js';
import requireRole from '#middleware/role.middleware.js';

const router = express.Router();

// Protect all user routes with JWT auth
router.use(authenticateToken);

// Only admins can list all users
router.get('/', requireRole('admin'), fetchAllUsers);

// Get user by ID
router.get('/:id', getUserById);

// Update user by ID
router.put('/:id', updateUser);

// Only admins can delete users by ID
router.delete('/:id', requireRole('admin'), deleteUser);

export default router;
