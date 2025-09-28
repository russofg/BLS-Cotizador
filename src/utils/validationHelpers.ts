/**
 * Utilidades centralizadas para validación de datos
 * Proporciona validaciones consistentes en toda la aplicación
 */

import { DateHelper } from './dateHelpers';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export class ValidationHelper {
  /**
   * Valida un email
   */
  static validateEmail(email: string): ValidationResult {
    const errors: string[] = [];
    
    if (!email) {
      errors.push('Email es obligatorio');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push('Email no tiene un formato válido');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida una contraseña
   */
  static validatePassword(password: string, minLength: number = 6): ValidationResult {
    const errors: string[] = [];
    
    if (!password) {
      errors.push('Contraseña es obligatoria');
    } else {
      if (password.length < minLength) {
        errors.push(`La contraseña debe tener al menos ${minLength} caracteres`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida que dos contraseñas coincidan
   */
  static validatePasswordMatch(password: string, confirmPassword: string): ValidationResult {
    const errors: string[] = [];
    
    if (password !== confirmPassword) {
      errors.push('Las contraseñas no coinciden');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida un nombre (no vacío, longitud mínima)
   */
  static validateName(name: string, fieldName: string = 'Nombre'): ValidationResult {
    const errors: string[] = [];
    
    if (!name || name.trim().length === 0) {
      errors.push(`${fieldName} es obligatorio`);
    } else if (name.trim().length < 2) {
      errors.push(`${fieldName} debe tener al menos 2 caracteres`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida un número positivo
   */
  static validatePositiveNumber(value: any, fieldName: string = 'Valor'): ValidationResult {
    const errors: string[] = [];
    
    const numValue = parseFloat(value);
    
    if (isNaN(numValue)) {
      errors.push(`${fieldName} debe ser un número válido`);
    } else if (numValue < 0) {
      errors.push(`${fieldName} debe ser mayor o igual a 0`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida un número entero positivo
   */
  static validatePositiveInteger(value: any, fieldName: string = 'Valor'): ValidationResult {
    const errors: string[] = [];
    
    const numValue = parseInt(value);
    
    if (isNaN(numValue)) {
      errors.push(`${fieldName} debe ser un número entero válido`);
    } else if (numValue < 0) {
      errors.push(`${fieldName} debe ser mayor o igual a 0`);
    } else if (!Number.isInteger(parseFloat(value))) {
      errors.push(`${fieldName} debe ser un número entero`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida un porcentaje (0-100)
   */
  static validatePercentage(value: any, fieldName: string = 'Porcentaje'): ValidationResult {
    const errors: string[] = [];
    
    const numValue = parseFloat(value);
    
    if (isNaN(numValue)) {
      errors.push(`${fieldName} debe ser un número válido`);
    } else if (numValue < 0) {
      errors.push(`${fieldName} debe ser mayor o igual a 0`);
    } else if (numValue > 100) {
      errors.push(`${fieldName} no puede ser mayor a 100`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida un rango de fechas
   */
  static validateDateRange(startDate: any, endDate: any): ValidationResult {
    const errors: string[] = [];
    
    const start = DateHelper.safeParseDate(startDate);
    const end = DateHelper.safeParseDate(endDate);
    
    if (!start) {
      errors.push('Fecha de inicio no es válida');
    }
    
    if (!end) {
      errors.push('Fecha de fin no es válida');
    }
    
    if (start && end && !DateHelper.validateDateRange(start, end)) {
      errors.push('La fecha de fin debe ser posterior o igual a la fecha de inicio');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida datos de un cliente
   */
  static validateClient(clientData: any): ValidationResult {
    const errors: string[] = [];
    
    // Validar nombre
    const nameValidation = this.validateName(clientData.nombre, 'Nombre del cliente');
    errors.push(...nameValidation.errors);
    
    // Validar email si está presente
    if (clientData.email) {
      const emailValidation = this.validateEmail(clientData.email);
      errors.push(...emailValidation.errors);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida datos de un item de cotización
   */
  static validateQuoteItem(itemData: any): ValidationResult {
    const errors: string[] = [];
    
    // Validar descripción
    if (!itemData.descripcion || itemData.descripcion.trim().length === 0) {
      errors.push('Descripción del item es obligatoria');
    }
    
    // Validar cantidad
    const cantidadValidation = this.validatePositiveNumber(itemData.cantidad, 'Cantidad');
    errors.push(...cantidadValidation.errors);
    
    // Validar precio
    const precioValidation = this.validatePositiveNumber(itemData.precio_unitario, 'Precio unitario');
    errors.push(...precioValidation.errors);
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida datos básicos de una cotización
   */
  static validateQuote(quoteData: any): ValidationResult {
    const errors: string[] = [];
    
    // Validar cliente
    if (!quoteData.cliente_id && !quoteData.clienteId) {
      errors.push('Cliente es obligatorio');
    }
    
    // Validar título
    const titleValidation = this.validateName(quoteData.titulo, 'Título de la cotización');
    errors.push(...titleValidation.errors);
    
    // Validar fechas si están presentes
    if (quoteData.fecha_evento || quoteData.fechaEvento) {
      const dateValidation = this.validateDateRange(
        quoteData.fecha_evento || quoteData.fechaEvento,
        quoteData.fecha_evento_fin || quoteData.fechaEventoFin
      );
      errors.push(...dateValidation.errors);
    }
    
    // Validar descuento si está presente
    if (quoteData.descuento !== undefined && quoteData.descuento !== null) {
      const descuentoValidation = this.validatePercentage(quoteData.descuento, 'Descuento');
      errors.push(...descuentoValidation.errors);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida datos de registro de usuario
   */
  static validateUserRegistration(userData: any): ValidationResult {
    const errors: string[] = [];
    
    // Validar nombre
    const nameValidation = this.validateName(userData.nombre, 'Nombre completo');
    errors.push(...nameValidation.errors);
    
    // Validar email
    const emailValidation = this.validateEmail(userData.email);
    errors.push(...emailValidation.errors);
    
    // Validar contraseña
    const passwordValidation = this.validatePassword(userData.password);
    errors.push(...passwordValidation.errors);
    
    // Validar confirmación de contraseña
    const confirmValidation = this.validatePasswordMatch(userData.password, userData.confirmPassword);
    errors.push(...confirmValidation.errors);
    
    // Validar términos y condiciones
    if (!userData.aceptaTerminos) {
      errors.push('Debe aceptar los términos y condiciones');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida datos de login
   */
  static validateLogin(loginData: any): ValidationResult {
    const errors: string[] = [];
    
    // Validar email
    const emailValidation = this.validateEmail(loginData.email);
    errors.push(...emailValidation.errors);
    
    // Validar contraseña
    if (!loginData.password) {
      errors.push('Contraseña es obligatoria');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida un teléfono (formato básico)
   */
  static validatePhone(phone: string, fieldName: string = 'Teléfono'): ValidationResult {
    const errors: string[] = [];
    
    if (phone && phone.trim().length > 0) {
      // Remover espacios, guiones y paréntesis para validar
      const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
      
      // Validar que solo contenga números y el símbolo +
      if (!/^\+?[0-9]+$/.test(cleanPhone)) {
        errors.push(`${fieldName} debe contener solo números y el símbolo +`);
      } else if (cleanPhone.length < 8) {
        errors.push(`${fieldName} debe tener al menos 8 dígitos`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida un CUIT (formato argentino)
   */
  static validateCUIT(cuit: string): ValidationResult {
    const errors: string[] = [];
    
    if (cuit && cuit.trim().length > 0) {
      // Remover guiones
      const cleanCuit = cuit.replace(/-/g, '');
      
      // Validar formato: XX-XXXXXXXX-X
      if (!/^[0-9]{11}$/.test(cleanCuit)) {
        errors.push('CUIT debe tener 11 dígitos');
      } else {
        // Validar dígito verificador (algoritmo básico)
        const digits = cleanCuit.split('').map(Number);
        const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
        
        let sum = 0;
        for (let i = 0; i < 10; i++) {
          sum += digits[i] * multipliers[i];
        }
        
        const remainder = sum % 11;
        const checkDigit = remainder < 2 ? remainder : 11 - remainder;
        
        if (checkDigit !== digits[10]) {
          errors.push('CUIT no es válido (dígito verificador incorrecto)');
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Combina múltiples resultados de validación
   */
  static combineValidationResults(...results: ValidationResult[]): ValidationResult {
    const allErrors: string[] = [];
    const allWarnings: string[] = [];
    
    results.forEach(result => {
      allErrors.push(...result.errors);
      if (result.warnings) {
        allWarnings.push(...result.warnings);
      }
    });
    
    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings.length > 0 ? allWarnings : undefined
    };
  }

  /**
   * Sanitiza un string para prevenir XSS
   */
  static sanitizeString(input: string): string {
    if (typeof input !== 'string') return '';
    
    return input
      .replace(/[<>]/g, '') // Remover < y >
      .trim();
  }

  /**
   * Sanitiza un objeto de datos
   */
  static sanitizeObject(obj: any): any {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }
    
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }
}
