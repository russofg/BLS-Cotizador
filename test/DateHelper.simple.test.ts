/**
 * Simple tests for DateHelper utility
 */

import { describe, it, expect } from 'vitest';
import { DateHelper } from '../src/utils/dateHelpers';

describe('DateHelper - Simple Tests', () => {
  describe('safeParseDate', () => {
    it('should parse valid date strings', () => {
      const result = DateHelper.safeParseDate('2024-01-15');
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2024);
    });

    it('should parse Date objects', () => {
      const testDate = new Date('2024-01-15');
      const result = DateHelper.safeParseDate(testDate);
      expect(result).toBe(testDate);
    });

    it('should handle null input', () => {
      const result = DateHelper.safeParseDate(null);
      expect(result).toBeNull();
    });

    it('should handle undefined input', () => {
      const result = DateHelper.safeParseDate(undefined);
      expect(result).toBeNull();
    });

    it('should handle empty string', () => {
      const result = DateHelper.safeParseDate('');
      expect(result).toBeNull();
    });
  });

  describe('safeFormatDate', () => {
    it('should format dates correctly', () => {
      const testDate = new Date('2024-01-15');
      const result = DateHelper.safeFormatDate(testDate);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle invalid dates', () => {
      const result = DateHelper.safeFormatDate('invalid-date');
      expect(result).toBe('No especificada');
    });

    it('should handle null input', () => {
      const result = DateHelper.safeFormatDate(null);
      expect(result).toBe('No especificada');
    });
  });

  describe('safeFormatDateForInput', () => {
    it('should format dates for HTML input fields', () => {
      const testDate = new Date('2024-01-15');
      const result = DateHelper.safeFormatDateForInput(testDate);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle invalid dates', () => {
      const result = DateHelper.safeFormatDateForInput('invalid-date');
      expect(result).toBe('');
    });

    it('should handle null input', () => {
      const result = DateHelper.safeFormatDateForInput(null);
      expect(result).toBe('');
    });
  });

  describe('calculateDurationInDays', () => {
    it('should calculate duration correctly', () => {
      const startDate = new Date('2024-01-15');
      const endDate = new Date('2024-01-17');
      const result = DateHelper.calculateDurationInDays(startDate, endDate);
      expect(result).toBeGreaterThan(0);
    });

    it('should handle same start and end date', () => {
      const date = new Date('2024-01-15');
      const result = DateHelper.calculateDurationInDays(date, date);
      expect(result).toBeGreaterThan(0);
    });
  });

  describe('validateDateRange', () => {
    it('should validate correct date ranges', () => {
      const startDate = new Date('2024-01-15');
      const endDate = new Date('2024-01-17');
      const result = DateHelper.validateDateRange(startDate, endDate);
      expect(result).toBe(true);
    });

    it('should validate same start and end date', () => {
      const date = new Date('2024-01-15');
      const result = DateHelper.validateDateRange(date, date);
      expect(result).toBe(true);
    });

    it('should reject invalid date ranges', () => {
      const startDate = new Date('2024-01-17');
      const endDate = new Date('2024-01-15');
      const result = DateHelper.validateDateRange(startDate, endDate);
      expect(result).toBe(false);
    });
  });

  describe('formatDateToDDMMYYYY', () => {
    it('should format dates to DD/MM/YYYY', () => {
      const testDate = new Date('2024-01-15');
      const result = DateHelper.formatDateToDDMMYYYY(testDate);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain('/');
    });
  });

  describe('formatDateToYYYYMMDD', () => {
    it('should format dates to YYYY-MM-DD', () => {
      const testDate = new Date('2024-01-15');
      const result = DateHelper.formatDateToYYYYMMDD(testDate);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain('-');
    });
  });
});
