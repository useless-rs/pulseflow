import bcrypt from 'bcryptjs';
import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface TokenClaims extends JwtPayload {
  sub: string;
  email: string;
  role: 'admin' | 'user';
}

export async function hashPassword(pw: string): Promise<string> {
  return bcrypt.hash(pw, 10);
}
export async function comparePassword(pw: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pw, hash);
}
export function signToken(payload: Omit<TokenClaims, 'iat' | 'exp'>): string {
  const opts: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] };
  return jwt.sign(payload, env.JWT_SECRET, opts);
}
export function verifyToken(token: string): TokenClaims {
  return jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] }) as TokenClaims;
}
