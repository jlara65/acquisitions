import logger from '#config/logger.js';
import bcrypt from 'bcrypt';
import { db } from '#config/database.js';
import { eq } from 'drizzle-orm';
import { users } from '#models/user.model.js';

// Hash Password
export const hashPassword = async password => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (e) {
    logger.error(`Error hashing the password: ${e}`);
    throw new Error('Error hashing');
  }
};

// Compare Password
export const comparePassword = async (password, passwordHash) => {
  try {
    return await bcrypt.compare(password, passwordHash);
  } catch (e) {
    logger.error(`Error comparing password: ${e}`);
    throw new Error('Error comparing password');
  }
};

// Create User
export const createUser = async ({ name, email, password, role = 'user' }) => {
  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existingUser.length > 0)
      throw new Error('User with this email already exists');

    const password_hash = await hashPassword(password);
    const [newUser] = await db
      .insert(users)
      .values({ name, email, password: password_hash, role })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
      });

    logger.info(`User ${newUser.email} created successfully.`);
    return newUser;
  } catch (e) {
    logger.error(`Error creating user: ${e}`);
    throw e;
  }
};

// Authenticate User
export const authenticateUser = async ({ email, password }) => {
  try {
    const rows = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!rows || rows.length === 0) {
      throw new Error('Invalid email or password');
    }

    const user = rows[0];
    const valid = await comparePassword(password, user.password);

    if (!valid) {
      throw new Error('Invalid email or password');
    }

    // Build a sanitized user object (omit password)
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
    return safeUser;
  } catch (e) {
    logger.error(`Error authenticating user: ${e}`);
    throw e;
  }
};
