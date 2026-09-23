import dotenv from 'dotenv';
dotenv.config();

function fromEnv(name: string, fallback: string): string {
  const v = (process.env[name] ?? fallback).trim();
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

if (process.env['NODE_ENV'] === 'production' && !process.env['JWT_SECRET']) {
  throw new Error('JWT_SECRET must be set in production');
}

export const env = {
  PORT: Number(process.env['PORT'] ?? 3000),
  NODE_ENV: process.env['NODE_ENV'] ?? 'development',
  JWT_SECRET: fromEnv('JWT_SECRET', 'dev-secret-change-me-please-32chars'),
  JWT_EXPIRES_IN: fromEnv('JWT_EXPIRES_IN', '15m'),
  ALLOWED_ORIGINS: fromEnv('ALLOWED_ORIGINS', 'http://localhost:5173').split(','),
};
