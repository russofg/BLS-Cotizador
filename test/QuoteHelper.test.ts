/**
 * Tests for QuoteHelper utility
 */

import { describe, it, expect, vi } from 'vitest';
import { QuoteHelper } from '../src/utils/quoteHelpers';

// Mock DateHelper
vi.mock('../src/utils/dateHelpers', () => ({
  DateHelper: {
    safeParseDate: vi.fn((date) => date ? new Date(date) : null),
    formatDateToYYYYMMDD: vi.fn((date) => {
      if (!date) return '';
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    })
  }
}));

describe('QuoteHelper', () => {
  describe('generateQuoteNumber', () => {
    it('should generate quote number with existing number', () => {
      const cotizacion = {
        numero: 'COT-001-20240115-CLIENTE-EVENTO',
        created_at: '2024-01-15'
      };
      const cliente = { nombre: 'Cliente Test' };

      const result = QuoteHelper.generateQuoteNumber(cotizacion, cliente);
      expect(result).toBe('COT-001-20240115-CLIENTE-EVENTO');
    });

    it('should generate new quote number when none exists', () => {
      const cotizacion = {
        titulo: 'Evento Test',
        created_at: '2024-01-15'
      };
      const cliente = { nombre: 'Cliente Test' };

      const result = QuoteHelper.generateQuoteNumber(cotizacion, cliente);
      expect(result).toMatch(/^COT-001-20240115-CLIENTETEST-EVENTOTEST$/);
    });

    it('should handle missing client data', () => {
      const cotizacion = {
        titulo: 'Evento Test',
        created_at: '2024-01-15'
      };

      const result = QuoteHelper.generateQuoteNumber(cotizacion, null);
      expect(result).toMatch(/^COT-001-20240115-CLIENTE-EVENTOTEST$/);
    });

    it('should handle missing quote title', () => {
      const cotizacion = {
        created_at: '2024-01-15'
      };
      const cliente = { nombre: 'Cliente Test' };

      const result = QuoteHelper.generateQuoteNumber(cotizacion, cliente);
      expect(result).toMatch(/^COT-001-20240115-CLIENTETEST-EVENTO$/);
    });

    it('should handle error in generation', () => {
      const cotizacion = null;
      const cliente = null;

      const result = QuoteHelper.generateQuoteNumber(cotizacion, cliente);
      expect(result).toMatch(/^COT-ERROR-/);
    });
  });

  describe('normalizeQuoteData', () => {
    it('should normalize quote data with different field names', () => {
      const cotizacion = {
        id: 'quote1',
        cliente_id: 'client1',
        fecha_evento: '2024-01-15',
        fecha_evento_fin: '2024-01-17',
        created_at: '2024-01-15',
        updated_at: '2024-01-15'
      };

      const result = QuoteHelper.normalizeQuoteData(cotizacion);
      
      expect(result.clienteId).toBe('client1');
      expect(result.fechaEvento).toBe('2024-01-15');
      expect(result.fechaEventoFin).toBe('2024-01-17');
      expect(result.createdAt).toBe('2024-01-15');
      expect(result.updatedAt).toBe('2024-01-15');
    });

    it('should preserve existing normalized fields', () => {
      const cotizacion = {
        id: 'quote1',
        clienteId: 'client1',
        fechaEvento: '2024-01-15',
        fechaEventoFin: '2024-01-17',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15'
      };

      const result = QuoteHelper.normalizeQuoteData(cotizacion);
      
      expect(result.clienteId).toBe('client1');
      expect(result.fechaEvento).toBe('2024-01-15');
      expect(result.fechaEventoFin).toBe('2024-01-17');
      expect(result.createdAt).toBe('2024-01-15');
      expect(result.updatedAt).toBe('2024-01-15');
    });
  });

  describe('enrichQuoteWithClient', () => {
    it('should enrich quote with client data', () => {
      const cotizacion = {
        id: 'quote1',
        clienteId: 'client1'
      };
      const clientes = [
        { id: 'client1', nombre: 'Cliente Test' },
        { id: 'client2', nombre: 'Otro Cliente' }
      ];

      const result = QuoteHelper.enrichQuoteWithClient(cotizacion, clientes);
      
      expect(result.cliente).toEqual({ id: 'client1', nombre: 'Cliente Test' });
    });

    it('should handle missing client', () => {
      const cotizacion = {
        id: 'quote1',
        clienteId: 'nonexistent'
      };
      const clientes = [
        { id: 'client1', nombre: 'Cliente Test' }
      ];

      const result = QuoteHelper.enrichQuoteWithClient(cotizacion, clientes);
      
      expect(result.cliente).toBeNull();
    });

    it('should handle empty clients array', () => {
      const cotizacion = {
        id: 'quote1',
        clienteId: 'client1'
      };
      const clientes: any[] = [];

      const result = QuoteHelper.enrichQuoteWithClient(cotizacion, clientes);
      
      expect(result.cliente).toBeNull();
    });
  });

  describe('normalizeItems', () => {
    it('should normalize array of items', () => {
      const items = [
        { id: 'item1', nombre: 'Item 1' },
        { id: 'item2', nombre: 'Item 2' }
      ];

      const result = QuoteHelper.normalizeItems(items);
      
      expect(result).toEqual(items);
      expect(result).toHaveLength(2);
    });

    it('should normalize object of items', () => {
      const items = {
        item1: { id: 'item1', nombre: 'Item 1' },
        item2: { id: 'item2', nombre: 'Item 2' }
      };

      const result = QuoteHelper.normalizeItems(items);
      
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ id: 'item1', nombre: 'Item 1' });
      expect(result[1]).toEqual({ id: 'item2', nombre: 'Item 2' });
    });

    it('should handle null or undefined items', () => {
      expect(QuoteHelper.normalizeItems(null)).toEqual([]);
      expect(QuoteHelper.normalizeItems(undefined)).toEqual([]);
    });

    it('should handle empty array', () => {
      const result = QuoteHelper.normalizeItems([]);
      expect(result).toEqual([]);
    });
  });

  describe('calculateTotals', () => {
    it('should calculate totals correctly', () => {
      const items = [
        { cantidad: 2, precioBase: 100 },
        { cantidad: 1, precioBase: 50 },
        { cantidad: 3, precioBase: 25 }
      ];

      const result = QuoteHelper.calculateTotals(items);
      
      expect(result.subtotal).toBe(325); // (2*100) + (1*50) + (3*25)
      expect(result.descuentoMonto).toBe(0);
      expect(result.total).toBe(325);
    });

    it('should calculate totals with discount', () => {
      const items = [
        { cantidad: 2, precioBase: 100 },
        { cantidad: 1, precioBase: 50 }
      ];

      const result = QuoteHelper.calculateTotals(items, 10); // 10% discount
      
      expect(result.subtotal).toBe(250);
      expect(result.descuentoMonto).toBe(25); // 10% of 250
      expect(result.total).toBe(225); // 250 - 25
    });

    it('should handle empty items array', () => {
      const result = QuoteHelper.calculateTotals([]);
      
      expect(result.subtotal).toBe(0);
      expect(result.descuentoMonto).toBe(0);
      expect(result.total).toBe(0);
    });

    it('should handle items with missing quantities or prices', () => {
      const items = [
        { cantidad: 2, precioBase: 100 },
        { cantidad: null, precioBase: 50 },
        { cantidad: 1, precioBase: null }
      ];

      const result = QuoteHelper.calculateTotals(items);
      
      expect(result.subtotal).toBe(200); // Only (2*100)
      expect(result.total).toBe(200);
    });
  });

  describe('calculateEndDateIfMissing', () => {
    it('should calculate end date when missing', () => {
      const cotizacion = {
        fechaEvento: '2024-01-15',
        duracion_dias: 3
      };

      const result = QuoteHelper.calculateEndDateIfMissing(cotizacion);
      
      expect(result.fechaEventoFin).toBeDefined();
    });

    it('should not modify existing end date', () => {
      const cotizacion = {
        fechaEvento: '2024-01-15',
        fechaEventoFin: '2024-01-17',
        duracion_dias: 3
      };

      const result = QuoteHelper.calculateEndDateIfMissing(cotizacion);
      
      expect(result.fechaEventoFin).toBe('2024-01-17');
    });

    it('should handle missing start date', () => {
      const cotizacion = {
        duracion_dias: 3
      };

      const result = QuoteHelper.calculateEndDateIfMissing(cotizacion);
      
      expect(result.fechaEventoFin).toBeUndefined();
    });

    it('should handle error in calculation', () => {
      const cotizacion = {
        fechaEvento: 'invalid-date',
        duracion_dias: 3
      };

      const result = QuoteHelper.calculateEndDateIfMissing(cotizacion);
      
      expect(result.fechaEventoFin).toBeUndefined();
    });
  });

  describe('Integration tests', () => {
    it('should handle complete quote processing workflow', () => {
      const rawQuote = {
        id: 'quote1',
        cliente_id: 'client1',
        titulo: 'Evento Test',
        fecha_evento: '2024-01-15',
        created_at: '2024-01-15',
        items: {
          item1: { id: 'item1', cantidad: 2, precioBase: 100 },
          item2: { id: 'item2', cantidad: 1, precioBase: 50 }
        }
      };

      const clientes = [
        { id: 'client1', nombre: 'Cliente Test' }
      ];

      // Normalize quote data
      const normalizedQuote = QuoteHelper.normalizeQuoteData(rawQuote);
      expect(normalizedQuote.clienteId).toBe('client1');

      // Enrich with client
      const enrichedQuote = QuoteHelper.enrichQuoteWithClient(normalizedQuote, clientes);
      expect(enrichedQuote.cliente).toBeDefined();

      // Normalize items
      const normalizedItems = QuoteHelper.normalizeItems(enrichedQuote.items);
      expect(normalizedItems).toHaveLength(2);

      // Calculate totals
      const totals = QuoteHelper.calculateTotals(normalizedItems);
      expect(totals.subtotal).toBe(250);
      expect(totals.total).toBe(250);

      // Generate quote number
      const quoteNumber = QuoteHelper.generateQuoteNumber(enrichedQuote, enrichedQuote.cliente);
      expect(quoteNumber).toMatch(/^COT-/);
    });
  });
});
