/**
 * Tests for ValidationHelper utility
 */

import { describe, it, expect } from 'vitest';
import { ValidationHelper } from '../src/utils/validationHelpers';

describe('ValidationHelper', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'test123@test-domain.com'
      ];

      validEmails.forEach(email => {
        const result = ValidationHelper.validateEmail(email);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        '',
        'invalid-email',
        '@example.com',
        'test@',
        'test..test@example.com',
        'test@.com',
        'test@example.'
      ];

      invalidEmails.forEach(email => {
        const result = ValidationHelper.validateEmail(email);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    it('should handle empty or null email', () => {
      const result = ValidationHelper.validateEmail('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('El email es requerido.');
    });
  });

  describe('validatePassword', () => {
    it('should validate correct passwords', () => {
      const validPasswords = [
        'password123',
        'mypassword',
        '123456',
        'verylongpassword123'
      ];

      validPasswords.forEach(password => {
        const result = ValidationHelper.validatePassword(password);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('should reject passwords that are too short', () => {
      const shortPasswords = ['', '12345', 'abc'];

      shortPasswords.forEach(password => {
        const result = ValidationHelper.validatePassword(password);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('La contraseña debe tener al menos 6 caracteres.');
      });
    });

    it('should handle empty password', () => {
      const result = ValidationHelper.validatePassword('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('La contraseña es requerida.');
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
      expect(result.errors).toContain('Las contraseñas no coinciden.');
    });
  });

  describe('validateLogin', () => {
    it('should validate correct login data', () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const result = ValidationHelper.validateLogin(loginData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid login data', () => {
      const invalidLoginData = {
        email: 'invalid-email',
        password: '123'
      };

      const result = ValidationHelper.validateLogin(invalidLoginData);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle missing fields', () => {
      const result = ValidationHelper.validateLogin({});
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateUserRegistration', () => {
    it('should validate correct registration data', () => {
      const registrationData = {
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        aceptaTerminos: true
      };

      const result = ValidationHelper.validateUserRegistration(registrationData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid registration data', () => {
      const invalidData = {
        nombre: 'A', // Too short
        email: 'invalid-email',
        password: '123', // Too short
        confirmPassword: '456', // Doesn't match
        aceptaTerminos: false
      };

      const result = ValidationHelper.validateUserRegistration(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should require terms acceptance', () => {
      const dataWithoutTerms = {
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        aceptaTerminos: false
      };

      const result = ValidationHelper.validateUserRegistration(dataWithoutTerms);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Debes aceptar los términos y condiciones.');
    });
  });

  describe('validateQuote', () => {
    it('should validate correct quote data', () => {
      const quoteData = {
        cliente_id: 'client123',
        titulo: 'Evento de prueba',
        fecha_evento: '2024-01-15',
        fecha_evento_fin: '2024-01-16',
        duracion_dias: 2,
        selectedItems: [{ id: 'item1', cantidad: 1 }]
      };

      const result = ValidationHelper.validateQuote(quoteData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject quote data without required fields', () => {
      const invalidQuoteData = {
        cliente_id: '',
        titulo: '',
        fecha_evento: '2024-01-15',
        fecha_evento_fin: '2024-01-14' // End date before start date
      };

      const result = ValidationHelper.validateQuote(invalidQuoteData);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate date ranges', () => {
      const invalidDateRange = {
        cliente_id: 'client123',
        titulo: 'Evento de prueba',
        fecha_evento: '2024-01-15',
        fecha_evento_fin: '2024-01-14' // End date before start date
      };

      const result = ValidationHelper.validateQuote(invalidDateRange);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('La fecha de fin no puede ser anterior a la fecha de inicio.');
    });
  });

  describe('validateName', () => {
    it('should validate correct names', () => {
      const validNames = [
        'Juan Pérez',
        'María José',
        'José María',
        'Ana',
        'José'
      ];

      validNames.forEach(name => {
        const result = ValidationHelper.validateName(name, 'Nombre');
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('should reject names that are too short', () => {
      const shortNames = ['', 'A', ' '];

      shortNames.forEach(name => {
        const result = ValidationHelper.validateName(name, 'Nombre');
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('validatePhone', () => {
    it('should validate correct phone numbers', () => {
      const validPhones = [
        '+1234567890',
        '1234567890',
        '(123) 456-7890',
        '123-456-7890',
        '+54 11 1234-5678'
      ];

      validPhones.forEach(phone => {
        const result = ValidationHelper.validatePhone(phone, 'Teléfono');
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('should reject invalid phone numbers', () => {
      const invalidPhones = [
        '',
        '123',
        'abc-def-ghij',
        '123-abc-7890'
      ];

      invalidPhones.forEach(phone => {
        const result = ValidationHelper.validatePhone(phone, 'Teléfono');
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });
  });
});
