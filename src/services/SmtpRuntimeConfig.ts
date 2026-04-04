import type { EmailConfig } from './RealEmailService';

const REQUIRED_SMTP_ENV_KEYS = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASSWORD'] as const;
const TRUE_VALUES = new Set(['1', 'true', 'yes', 'on']);
const FALSE_VALUES = new Set(['0', 'false', 'no', 'off']);

type SmtpEnvKey = (typeof REQUIRED_SMTP_ENV_KEYS)[number] | 'SMTP_PORT' | 'SMTP_SECURE';
type RuntimeEnv = Record<string, string | undefined>;

export class SmtpConfigError extends Error {
  readonly missingKeys: SmtpEnvKey[];
  readonly invalidKeys: SmtpEnvKey[];

  constructor(
    message: string,
    {
      missingKeys = [],
      invalidKeys = [],
    }: {
      missingKeys?: SmtpEnvKey[];
      invalidKeys?: SmtpEnvKey[];
    } = {}
  ) {
    super(message);
    this.name = 'SmtpConfigError';
    this.missingKeys = missingKeys;
    this.invalidKeys = invalidKeys;
  }
}

function getImportMetaEnv(): RuntimeEnv {
  try {
    return (((import.meta as ImportMeta & { env?: RuntimeEnv }).env) ?? {}) as RuntimeEnv;
  } catch {
    return {};
  }
}

function getEnvValue(key: SmtpEnvKey): string | undefined {
  const rawValue = process.env[key] ?? getImportMetaEnv()[key];

  if (typeof rawValue !== 'string') {
    return undefined;
  }

  const value = rawValue.trim();
  return value.length > 0 ? value : undefined;
}

function getMissingKeys(): SmtpEnvKey[] {
  return REQUIRED_SMTP_ENV_KEYS.filter((key) => !getEnvValue(key));
}

function parseSmtpPort(rawPort: string | undefined): number {
  if (!rawPort) {
    return 587;
  }

  const port = Number(rawPort);

  if (!Number.isInteger(port) || port <= 0) {
    throw new SmtpConfigError('SMTP_PORT debe ser un entero positivo.', {
      invalidKeys: ['SMTP_PORT'],
    });
  }

  return port;
}

function parseSmtpSecure(rawSecure: string | undefined, port: number): boolean {
  if (!rawSecure) {
    return port === 465;
  }

  const normalized = rawSecure.toLowerCase();

  if (TRUE_VALUES.has(normalized)) {
    return true;
  }

  if (FALSE_VALUES.has(normalized)) {
    return false;
  }

  throw new SmtpConfigError('SMTP_SECURE debe ser booleano (true/false).', {
    invalidKeys: ['SMTP_SECURE'],
  });
}

function maskEmail(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  const [localPart, domain] = value.split('@');

  if (!domain) {
    return `${value.slice(0, 1)}***`;
  }

  const visiblePrefix = localPart.slice(0, 1) || '*';
  return `${visiblePrefix}***@${domain}`;
}

export function hasSmtpRuntimeConfig(): boolean {
  return getMissingKeys().length === 0;
}

export function getSmtpRuntimeConfig(): EmailConfig {
  const missingKeys = getMissingKeys();

  if (missingKeys.length > 0) {
    throw new SmtpConfigError('Faltan variables SMTP requeridas.', {
      missingKeys,
    });
  }

  const port = parseSmtpPort(getEnvValue('SMTP_PORT'));
  const secure = parseSmtpSecure(getEnvValue('SMTP_SECURE'), port);

  return {
    host: getEnvValue('SMTP_HOST')!,
    port,
    secure,
    auth: {
      user: getEnvValue('SMTP_USER')!,
      pass: getEnvValue('SMTP_PASSWORD')!,
    },
  };
}

export function getSmtpRuntimeLogContext(): {
  configured: boolean;
  host: string | null;
  port: number | null;
  secure: boolean | null;
  user: string | null;
  missingKeys: SmtpEnvKey[];
  invalidKeys: SmtpEnvKey[];
} {
  const missingKeys = getMissingKeys();
  const host = getEnvValue('SMTP_HOST') ?? null;
  const user = maskEmail(getEnvValue('SMTP_USER'));

  try {
    const port = parseSmtpPort(getEnvValue('SMTP_PORT'));
    const secure = parseSmtpSecure(getEnvValue('SMTP_SECURE'), port);

    return {
      configured: missingKeys.length === 0,
      host,
      port,
      secure,
      user,
      missingKeys,
      invalidKeys: [],
    };
  } catch (error) {
    if (error instanceof SmtpConfigError) {
      return {
        configured: false,
        host,
        port: null,
        secure: null,
        user,
        missingKeys,
        invalidKeys: error.invalidKeys,
      };
    }

    throw error;
  }
}
