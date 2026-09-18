import "dotenv/config";

/**
 * Central place to read process.env. Import this instead of reading
 * process.env directly elsewhere, so env handling stays in one spot
 * once real validation (e.g. zod) gets added.
 */
export const env = {
  port: Number(process.env.PORT ?? 3000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  corsOrigin: process.env.CORS_ORIGIN ?? "*",

  jwtSecret: process.env.JWT_SECRET ?? "change-me",
  jwtExpiresInSeconds: Number(process.env.JWT_EXPIRES_IN_SECONDS ?? 86400),
  jwtRefreshExpiresInDays: Number(process.env.JWT_REFRESH_EXPIRES_IN_DAYS ?? 7),
} as const;

export const isProduction = env.nodeEnv === "production";
