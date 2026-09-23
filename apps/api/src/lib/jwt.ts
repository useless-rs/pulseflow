import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export async function hashPassword(pw: string) {
  return bcrypt.hash(pw, 10);
}
export async function comparePassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash);
}
export function signToken(payload: object) {
  return (jwt as any).sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}
export function verifyToken(token: string): any {
  return (jwt as any).verify(token, env.JWT_SECRET);
}
