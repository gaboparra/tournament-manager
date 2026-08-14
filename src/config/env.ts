import 'dotenv/config';

function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

const SEVEN_DAYS_IN_SECONDS = 60 * 60 * 24 * 7;

export const env = {
  port: process.env.PORT ?? '3000',
  databaseUrl: getEnvVar('DATABASE_URL'),
  jwtSecret: getEnvVar('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN
    ? Number(process.env.JWT_EXPIRES_IN)
    : SEVEN_DAYS_IN_SECONDS,
  corsOrigin: getEnvVar('CORS_ORIGIN'),
} as const;