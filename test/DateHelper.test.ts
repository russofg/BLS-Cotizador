/**
 * Tests for DateHelper utility
 */

import { describe, it, expect } from 'vitest';
import { DateHelper } from '../src/utils/dateHelpers';

describe('DateHelper', () => {
  describe('safeParseDate', () => {
    it('should parse valid date strings', () => {
      const testDate = new Date('2024-01-15');
      const result = DateHelper.safeParseDate('2024-01-15');
      
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2024);
      expect(result?.getMonth()).toBe(0); // January is 0
      expect(result?.getDate()).toBe(15);
    });

    it('should parse ISO date strings', () => {
      const isoString = '2024-01-15T10:30:00Z';
      const result = DateHelper.safeParseDate(isoString);
      
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2024);
    });

    it('should parse Date objects', () => {
      const testDate = new Date('2024-01-15');
      const result = DateHelper.safeParseDate(testDate);
      
      expect(result).toBe(testDate);
    });

    it('should parse Firebase Timestamp objects', () => {
      const timestamp = {
        seconds: 1705320000, // 2024-01-15
        toDate: () => new Date(1705320000 * 1000)
      };
      
      const result = DateHelper.safeParseDate(timestamp);
      
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2024);
    });

    it('should handle invalid dates', () => {
      const invalidInputs = [
        'invalid-date',
        '2024-13-45', // Invalid month/day
        null,
        undefined,
        '',
        'not-a-date'
      ];

      invalidInputs.forEach(input => {
        const result = DateHelper.safeParseDate(input);
        expect(result).toBeNull();
      });
    });

    it('should handle empty or null input', () => {
      expect(DateHelper.safeParseDate(null)).toBeNull();
      expect(DateHelper.safeParseDate(undefined)).toBeNull();
      expect(DateHelper.safeParseDate('')).toBeNull();
    });
  });

  describe('safeFormatDate', () => {
    it('should format dates correctly', () => {
      const testDate = new Date('2024-01-15');
      const result = DateHelper.safeFormatDate(testDate);
      
      expect(result).toMatch(/15 ene 2024|15 jan 2024/); // Spanish or English locale
    });

    it('should handle invalid dates', () => {
      const result = DateHelper.safeFormatDate('invalid-date');
      expect(result).toBe('No especificada');
    });

    it('should handle null/undefined input', () => {
      expect(DateHelper.safeFormatDate(null)).toBe('No especificada');
      expect(DateHelper.safeFormatDate(undefined)).toBe('No especificada');
    });
  });

  describe('safeFormatDateForInput', () => {
    it('should format dates for HTML input fields', () => {
      const testDate = new Date('2024-01-15');
      const result = DateHelper.safeFormatDateForInput(testDate);
      
      expect(result).toBe('2024-01-15');
    });

    it('should handle invalid dates', () => {
      const result = DateHelper.safeFormatDateForInput('invalid-date');
      expect(result).toBe('');
    });

    it('should handle null/undefined input', () => {
      expect(DateHelper.safeFormatDateForInput(null)).toBe('');
      expect(DateHelper.safeFormatDateForInput(undefined)).toBe('');
    });
  });

  describe('calculateDurationInDays', () => {
    it('should calculate duration correctly', () => {
      const startDate = new Date('2024-01-15');
      const endDate = new Date('2024-01-17');
      
      const result = DateHelper.calculateDurationInDays(startDate, endDate);
      expect(result).toBe(3); // Inclusive: 15, 16, 17
    });

    it('should handle same start and end date', () => {
      const date = new Date('2024-01-15');
      const result = DateHelper.calculateDurationInDays(date, date);
      expect(result).toBe(1);
    });

    it('should handle invalid dates', () => {
      const result = DateHelper.calculateDurationInDays(null as any, null as any);
      expect(result).toBe(0);
    });
  });

  describe('calculateEndDate', () => {
    it('should calculate end date correctly', () => {
      const startDate = new Date('2024-01-15');
      const endDate = DateHelper.calculateEndDate(startDate, 3);
      
      expect(endDate.getFullYear()).toBe(2024);
      expect(endDate.getMonth()).toBe(0); // January
      expect(endDate.getDate()).toBe(17); // 15 + 3 - 1
    });

    it('should handle single day duration', () => {
      const startDate = new Date('2024-01-15');
      const endDate = DateHelper.calculateEndDate(startDate, 1);
      
      expect(endDate.getDate()).toBe(15);
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
      
      expect(result).toBe('15/01/2024');
    });

    it('should handle single digit days and months', () => {
      const testDate = new Date('2024-01-05');
      const result = DateHelper.formatDateToDDMMYYYY(testDate);
      
      expect(result).toBe('05/01/2024');
    });
  });

  describe('formatDateToYYYYMMDD', () => {
    it('should format dates to YYYY-MM-DD', () => {
      const testDate = new Date('2024-01-15');
      const result = DateHelper.formatDateToYYYYMMDD(testDate);
      
      expect(result).toBe('2024-01-15');
    });

    it('should handle single digit days and months', () => {
      const testDate = new Date('2024-01-05');
      const result = DateHelper.formatDateToYYYYMMDD(testDate);
      
      expect(result).toBe('2024-01-05');
    });
  });

  describe('Integration tests', () => {
    it('should handle complete date workflow', () => {
      // Parse a date string
      const parsedDate = DateHelper.safeParseDate('2024-01-15');
      expect(parsedDate).toBeInstanceOf(Date);

      // Format for display
      const displayFormat = DateHelper.safeFormatDate(parsedDate);
      expect(displayFormat).toMatch(/15 ene 2024|15 jan 2024/);

      // Format for input
      const inputFormat = DateHelper.safeFormatDateForInput(parsedDate);
      expect(inputFormat).toBe('2024-01-15');

      // Calculate duration
      const endDate = DateHelper.calculateEndDate(parsedDate!, 3);
      const duration = DateHelper.calculateDurationInDays(parsedDate!, endDate);
      expect(duration).toBe(3);

      // Validate range
      const isValidRange = DateHelper.validateDateRange(parsedDate!, endDate);
      expect(isValidRange).toBe(true);
    });
  });
});
