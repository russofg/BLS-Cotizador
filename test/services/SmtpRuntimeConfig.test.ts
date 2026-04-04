import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  SmtpConfigError,
  getSmtpRuntimeConfig,
  getSmtpRuntimeLogContext,
} from '../../src/services/SmtpRuntimeConfig';

const ENV_KEYS = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_SECURE', 'SMTP_USER', 'SMTP_PASSWORD'] as const;

afterEach(() => {
  vi.unstubAllEnvs();
  for (const key of ENV_KEYS) {
    delete process.env[key];
  }
});

describe('SmtpRuntimeConfig', () => {
  it('resolves SMTP config from environment with safe defaults', () => {
    process.env.SMTP_HOST = 'smtp.example.com';
    process.env.SMTP_USER = 'mailer@example.com';
    process.env.SMTP_PASSWORD = 'super-secret';

    expect(getSmtpRuntimeConfig()).toEqual({
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      auth: {
        user: 'mailer@example.com',
        pass: 'super-secret',
      },
    });
  });

  it('throws an explicit error when required SMTP env vars are missing', () => {
    process.env.SMTP_HOST = 'smtp.example.com';

    expect(() => getSmtpRuntimeConfig()).toThrowError(SmtpConfigError);

    try {
      getSmtpRuntimeConfig();
    } catch (error) {
      expect(error).toBeInstanceOf(SmtpConfigError);
      expect((error as SmtpConfigError).missingKeys).toEqual(['SMTP_USER', 'SMTP_PASSWORD']);
    }
  });

  it('exposes a masked log context without leaking the SMTP password', () => {
    process.env.SMTP_HOST = 'smtp.example.com';
    process.env.SMTP_PORT = '465';
    process.env.SMTP_USER = 'mailer@example.com';
    process.env.SMTP_PASSWORD = 'super-secret';

    expect(getSmtpRuntimeLogContext()).toEqual({
      configured: true,
      host: 'smtp.example.com',
      port: 465,
      secure: true,
      user: 'm***@example.com',
      missingKeys: [],
      invalidKeys: [],
    });
  });
});
