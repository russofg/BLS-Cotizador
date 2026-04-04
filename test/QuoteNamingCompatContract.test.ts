/**
 * Contract guards for quote naming compatibility.
 *
 * These tests freeze the legacy snake_case/camelCase bridge without forcing
 * a production refactor. The goal is to make future changes fail fast if they
 * drop critical aliases or the date-calculation path used by quote flows.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QuoteHelper } from '../src/utils/quoteHelpers';

vi.mock('../src/utils/dateHelpers', () => ({
  DateHelper: {
    safeParseDate: vi.fn((value) => {
      if (!value) return null;
      if (value instanceof Date) return value;
      return new Date(`${value}T00:00:00Z`);
    }),
    calculateEndDate: vi.fn((startDate, durationDays) => {
      const endDate = new Date(startDate);
      endDate.setUTCDate(endDate.getUTCDate() + durationDays - 1);
      return endDate;
    }),
    safeFormatDateForInput: vi.fn((value) => {
      if (!value) return '';
      const date = value instanceof Date ? value : new Date(value);
      return date.toISOString().slice(0, 10);
    }),
    safeFormatDate: vi.fn((value) => {
      if (!value) return 'No especificada';
      return `FMT:${String(value)}`;
    }),
    validateDateRange: vi.fn((startDate, endDate) => {
      return new Date(endDate).getTime() >= new Date(startDate).getTime();
    }),
    formatDateToYYYYMMDD: vi.fn(),
    formatDateToDDMMYYYY: vi.fn(),
  },
}));

describe('quote-naming-compat-contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('normalizes legacy snake_case quote payloads into camelCase without dropping aliases', () => {
    const rawQuote = {
      id: 'quote-1',
      cliente_id: 'client-1',
      fecha_evento: '2024-01-15',
      fecha_evento_fin: '2024-01-17',
      created_at: '2024-01-15',
      lugar_evento: 'Salon Legacy',
      duracion_dias: 3,
      requiere_armado: true,
    };

    const normalized = QuoteHelper.normalizeQuoteData(rawQuote);

    expect(normalized).toMatchObject({
      cliente_id: 'client-1',
      clienteId: 'client-1',
      fecha_evento: '2024-01-15',
      fechaEvento: '2024-01-15',
      fecha_evento_fin: '2024-01-17',
      fechaEventoFin: '2024-01-17',
      created_at: '2024-01-15',
      createdAt: '2024-01-15',
      lugar_evento: 'Salon Legacy',
      duracion_dias: 3,
      requiere_armado: true,
    });
    expect(normalized).not.toBe(rawQuote);
    expect(rawQuote).toEqual({
      id: 'quote-1',
      cliente_id: 'client-1',
      fecha_evento: '2024-01-15',
      fecha_evento_fin: '2024-01-17',
      created_at: '2024-01-15',
      lugar_evento: 'Salon Legacy',
      duracion_dias: 3,
      requiere_armado: true,
    });
  });

  it('keeps camelCase payloads readable by legacy snake_case consumers', () => {
    const rawQuote = {
      id: 'quote-2',
      clienteId: 'client-2',
      fechaEvento: '2024-06-10',
      fechaEventoFin: '2024-06-12',
      createdAt: '2024-06-01',
    };

    const normalized = QuoteHelper.normalizeQuoteData(rawQuote);

    expect(normalized).toMatchObject({
      clienteId: 'client-2',
      cliente_id: 'client-2',
      fechaEvento: '2024-06-10',
      fecha_evento: '2024-06-10',
      fechaEventoFin: '2024-06-12',
      fecha_evento_fin: '2024-06-12',
      createdAt: '2024-06-01',
      created_at: '2024-06-01',
    });
  });

  it('resolves client metadata from either cliente_id or clienteId', () => {
    const clientes = [{ id: 'client-1', nombre: 'Cliente Test' }];

    const legacyResult = QuoteHelper.enrichQuoteWithClient(
      { id: 'quote-1', cliente_id: 'client-1' } as any,
      clientes
    );
    const camelResult = QuoteHelper.enrichQuoteWithClient(
      { id: 'quote-2', clienteId: 'client-1' } as any,
      clientes
    );

    expect(legacyResult.cliente).toEqual({ id: 'client-1', nombre: 'Cliente Test' });
    expect(legacyResult.cliente_nombre).toBe('Cliente Test');
    expect(camelResult.cliente).toEqual({ id: 'client-1', nombre: 'Cliente Test' });
    expect(camelResult.cliente_nombre).toBe('Cliente Test');
  });

  it('accepts legacy snake_case quote data in validation checks', () => {
    const result = QuoteHelper.validateQuoteData({
      cliente_id: 'client-1',
      titulo: 'Evento Legacy',
      fecha_evento: '2024-01-15',
      fecha_evento_fin: '2024-01-17',
    });

    expect(result).toEqual({ isValid: true, errors: [] });
  });

  it('accepts camelCase quote data in validation checks', () => {
    const result = QuoteHelper.validateQuoteData({
      clienteId: 'client-1',
      titulo: 'Evento Moderno',
      fechaEvento: '2024-06-10',
      fechaEventoFin: '2024-06-12',
    });

    expect(result).toEqual({ isValid: true, errors: [] });
  });

  it('fills missing end date from legacy duracion_dias and keeps both date aliases in sync', () => {
    const result = QuoteHelper.calculateEndDateIfMissing({
      fecha_evento: '2024-01-15',
      duracion_dias: 3,
    } as any);

    expect(result.fecha_evento_fin).toBe('2024-01-17');
    expect(result.fechaEventoFin).toBeInstanceOf(Date);
    expect((result.fechaEventoFin as Date).toISOString().slice(0, 10)).toBe('2024-01-17');
  });

  it('exports quote data using the legacy snake_case shape expected by downstream documents', () => {
    const exported = QuoteHelper.prepareQuoteForExport({
      id: 'quote-1',
      numero: '2026-0007',
      titulo: 'Evento Export',
      fecha_evento: '2024-01-15',
      fecha_evento_fin: '2024-01-17',
      lugar_evento: 'Salon Legacy',
      duracion_dias: 3,
      requiere_armado: true,
      subtotal: 1000,
      descuento: 100,
      total: 900,
      estado: 'aprobado',
      items: [],
    } as any);

    expect(exported).toMatchObject({
      numero: '2026-0007',
      titulo: 'Evento Export',
      fecha_evento: 'FMT:2024-01-15',
      fecha_evento_fin: 'FMT:2024-01-17',
      lugar_evento: 'Salon Legacy',
      duracion_dias: 3,
      requiere_armado: true,
      subtotal: 1000,
      descuento: 100,
      total: 900,
      estado: 'aprobado',
    });
  });
});
