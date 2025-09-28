/**
 * Simple tests for ValidationHelper utility
 */

import { describe, it, expect } from 'vitest';
import { ValidationHelper } from '../src/utils/validationHelpers';

describe('ValidationHelper - Simple Tests', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      const result = ValidationHelper.validateEmail('test@example.com');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty email', () => {
      const result = ValidationHelper.validateEmail('');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject invalid email format', () => {
      const result = ValidationHelper.validateEmail('invalid-email');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validatePassword', () => {
    it('should validate correct passwords', () => {
      const result = ValidationHelper.validatePassword('password123');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject short passwords', () => {
      const result = ValidationHelper.validatePassword('123');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject empty password', () => {
      const result = ValidationHelper.validatePassword('');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validatePasswordMatch', () => {
    it('should validate matching passwords', () => {
      const result = ValidationHelper.validatePasswordMatch('password123', 'password123');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject non-matching passwords', () => {
      const result = ValidationHelper.validatePasswordMatch('password123', 'password456');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateName', () => {
    it('should validate correct names', () => {
      const result = ValidationHelper.validateName('Juan Pérez', 'Nombre');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject short names', () => {
      const result = ValidationHelper.validateName('A', 'Nombre');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject empty names', () => {
      const result = ValidationHelper.validateName('', 'Nombre');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
