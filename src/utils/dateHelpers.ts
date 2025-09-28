/**
 * Utilidades centralizadas para el manejo de fechas
 * Evita problemas de timezone y proporciona formateo consistente
 */

export class DateHelper {
  /**
   * Formatea una fecha de manera segura para mostrar en la UI (DD/MM/YYYY)
   * Maneja múltiples formatos de entrada incluyendo timestamps de Firebase
   */
  static safeFormatDate(dateValue: any): string {
    if (!dateValue) return 'No especificada';
    
    try {
      // Si ya está formateada como string con barras, devolverla
      if (typeof dateValue === 'string' && dateValue.includes('/')) {
        return dateValue;
      }
      
      // Manejar objetos Timestamp de Firebase
      if (dateValue && typeof dateValue === 'object' && dateValue.toDate) {
        const date = dateValue.toDate();
        return DateHelper.formatDateToDDMMYYYY(date);
      }
      
      // Manejar objetos Timestamp de Firebase con propiedad seconds
      if (dateValue && typeof dateValue === 'object' && typeof dateValue.seconds === 'number') {
        const date = new Date(dateValue.seconds * 1000);
        return DateHelper.formatDateToDDMMYYYY(date);
      }
      
      // Manejar strings de fecha (pueden incluir tiempo)
      if (typeof dateValue === 'string') {
        let dateToFormat: Date;
        
        // Si es un string ISO o incluye tiempo, parsear cuidadosamente
        if (dateValue.includes('T') || dateValue.includes('Z')) {
          dateToFormat = new Date(dateValue);
        } else {
          // Para strings de fecha simples, agregar tiempo para evitar problemas de timezone
          dateToFormat = new Date(dateValue + 'T12:00:00');
        }
        
        // Verificar si la fecha es válida
        if (isNaN(dateToFormat.getTime())) {
          console.warn('Invalid date value:', dateValue);
          return 'No especificada';
        }
        
        return DateHelper.formatDateToDDMMYYYY(dateToFormat);
      }
      
      // Intentar crear un objeto Date para otros tipos
      const date = new Date(dateValue);
      
      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        console.warn('Invalid date value:', dateValue);
        return 'No especificada';
      }
      
      return DateHelper.formatDateToDDMMYYYY(date);
    } catch (error) {
      console.error('Error formatting date:', dateValue, error);
      return 'No especificada';
    }
  }

  /**
   * Formatea una fecha para inputs de tipo date (YYYY-MM-DD)
   * Usado en formularios HTML
   */
  static safeFormatDateForInput(dateValue: any): string {
    if (!dateValue) return '';
    
    try {
      // Si ya está en formato YYYY-MM-DD, devolverla
      if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
        return dateValue;
      }
      
      // Manejar objetos Timestamp de Firebase
      if (dateValue && typeof dateValue === 'object' && dateValue.toDate) {
        const date = dateValue.toDate();
        return DateHelper.formatDateToYYYYMMDD(date);
      }
      
      // Manejar objetos Timestamp de Firebase con propiedad seconds
      if (dateValue && typeof dateValue === 'object' && typeof dateValue.seconds === 'number') {
        const date = new Date(dateValue.seconds * 1000);
        return DateHelper.formatDateToYYYYMMDD(date);
      }
      
      // Manejar strings de fecha
      if (typeof dateValue === 'string') {
        let dateToFormat: Date;
        
        if (dateValue.includes('T') || dateValue.includes('Z')) {
          dateToFormat = new Date(dateValue);
        } else {
          dateToFormat = new Date(dateValue + 'T12:00:00');
        }
        
        if (isNaN(dateToFormat.getTime())) {
          console.warn('Invalid date value for input:', dateValue);
          return '';
        }
        
        return this.formatDateToYYYYMMDD(dateToFormat);
      }
      
      // Intentar crear un objeto Date para otros tipos
      const date = new Date(dateValue);
      
      if (isNaN(date.getTime())) {
        console.warn('Cannot convert to valid date for input:', dateValue);
        return '';
      }
      
      return this.formatDateToYYYYMMDD(date);
    } catch (error) {
      console.warn('Error formatting date for input:', dateValue, error);
      return '';
    }
  }

  /**
   * Parsea una fecha de manera segura evitando problemas de timezone
   * Devuelve null si no se puede parsear
   */
  static safeParseDate(dateStr: any): Date | null {
    if (!dateStr) return null;
    
    try {
      // Si ya es un objeto Date, devolverlo
      if (dateStr instanceof Date) {
        return dateStr;
      }
      
      // Para formato YYYY-MM-DD, agregar tiempo para evitar conversión de timezone
      if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return new Date(dateStr + 'T12:00:00');
      }
      
      // Para otros formatos, intentar parsing normal con fallback
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        console.warn('Could not parse date:', dateStr);
        return null;
      }
      
      return date;
    } catch (e) {
      console.warn('Error parsing date:', dateStr, e);
      return null;
    }
  }

  /**
   * Calcula la duración en días entre dos fechas (inclusivo)
   * Del 24/06 al 28/06 = 5 días (24, 25, 26, 27, 28)
   */
  static calculateDurationInDays(startDate: Date, endDate: Date): number {
    try {
      // Resetear horas para contar solo días
      const start = new Date(startDate);
      const end = new Date(endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      
      // Calcular diferencia en días (inclusivo - ambas fechas incluidas)
      const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return diffDays > 0 ? diffDays : 1; // Mínimo 1 día
    } catch (error) {
      console.error('Error calculating duration:', error);
      return 1;
    }
  }

  /**
   * Calcula la fecha de fin basada en la fecha de inicio y duración
   */
  static calculateEndDate(startDate: Date, durationDays: number): Date {
    try {
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + (durationDays - 1)); // Sumar días (inclusivo)
      return endDate;
    } catch (error) {
      console.error('Error calculating end date:', error);
      return startDate;
    }
  }

  /**
   * Valida si una fecha de fin es posterior o igual a la fecha de inicio
   */
  static validateDateRange(startDate: Date, endDate: Date): boolean {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      
      return end.getTime() >= start.getTime();
    } catch (error) {
      console.error('Error validating date range:', error);
      return false;
    }
  }

  /**
   * Formatea una fecha a DD/MM/YYYY usando partes locales para evitar problemas de timezone
   */
  static formatDateToDDMMYYYY(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /**
   * Formatea una fecha a YYYY-MM-DD usando partes locales para evitar problemas de timezone
   */
  static formatDateToYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Convierte una fecha a formato ISO string para almacenamiento
   */
  static toISOString(date: Date): string {
    try {
      return date.toISOString();
    } catch (error) {
      console.error('Error converting date to ISO string:', error);
      return new Date().toISOString();
    }
  }

  /**
   * Obtiene la fecha actual en formato YYYY-MM-DD
   */
  static getCurrentDateString(): string {
    return this.formatDateToYYYYMMDD(new Date());
  }

  /**
   * Obtiene la fecha actual en formato DD/MM/YYYY
   */
  static getCurrentDateFormatted(): string {
    return this.formatDateToDDMMYYYY(new Date());
  }
}
