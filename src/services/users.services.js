import logger from '../config/logger.js';
import { db } from '#config/database.js';
import { users } from '#models/user.model.js';
import { eq } from 'drizzle-orm';

export const getAllUsers = async () => {
  try {
    const result = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      })
      .from(users);

    return result;
  } catch (e) {
    logger.error('Error getting users', e);
    throw e;
  }
};

export const getUserById = async id => {
  try {
    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return rows[0] || null;
  } catch (e) {
    logger.error('Error getting user by id', e);
    throw e;
  }
};

export const updateUser = async (id, updates) => {
  try {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    if (!existing || existing.length === 0) {
      throw new Error('User not found');
    }

    const allowed = {};
    if (typeof updates.name === 'string') allowed.name = updates.name;
    if (typeof updates.email === 'string') allowed.email = updates.email;
    if (typeof updates.role === 'string') allowed.role = updates.role;
    if (Object.keys(allowed).length === 0) {
      throw new Error('No valid fields to update');
    }
    allowed.updated_at = new Date();

    const [updated] = await db
      .update(users)
      .set(allowed)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      });

    return updated;
  } catch (e) {
    logger.error('Error updating user', e);
    throw e;
  }
};

export const deleteUser = async id => {
  try {
    const [deleted] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id });

    if (!deleted) {
      throw new Error('User not found');
    }

    return deleted;
  } catch (e) {
    logger.error('Error deleting user', e);
    throw e;
  }
};
