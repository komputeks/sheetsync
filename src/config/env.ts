/**
 * Centralised environment variable access with validation.
 * All env reads should go through this module so missing vars
 * are caught at startup, not at runtime in production.
 */

function getEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  /** Supabase */
  NEXT_PUBLIC_SUPABASE_URL: getEnv('NEXT_PUBLIC_SUPABASE_URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  SUPABASE_SERVICE_ROLE_KEY: getEnv('SUPABASE_SERVICE_ROLE_KEY', ''),

  /** Google Sheets API */
  GOOGLE_SERVICE_ACCOUNT_EMAIL: getEnv('GOOGLE_SERVICE_ACCOUNT_EMAIL', ''),
  GOOGLE_PRIVATE_KEY: getEnv('GOOGLE_PRIVATE_KEY', ''),

  /** Lipia M-Pesa */
  LIPIA_API_KEY: getEnv('LIPIA_API_KEY', ''),

  /** Email providers */
  RESEND_API_KEY: getEnv('RESEND_API_KEY', ''),
  BREVO_API_KEY: getEnv('BREVO_API_KEY', ''),
  MAILGUN_API_KEY: getEnv('MAILGUN_API_KEY', ''),
  MAILGUN_DOMAIN: getEnv('MAILGUN_API_SANDBOXDOMAIN', ''),
} as const;
