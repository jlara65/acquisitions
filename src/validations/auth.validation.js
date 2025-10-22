import { z } from 'zod';

// Sign-up schema validation
export const signupSchema = z.object({
  name: z.string().min(2).max(255).trim(),
  email: z.email().max(255).toLowerCase().trim(),
  password: z.string().min(6).max(128),
  role: z.enum(['user', 'admin']).default('user'),
});

// Sign-in schema validation
export const signInSchema = z.object({
  email: z.email().toLowerCase().trim(),
  password: z.string().min(1),
});
