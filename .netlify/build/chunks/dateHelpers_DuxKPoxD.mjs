class DateHelper {
  /**
   * Formatea una fecha de manera segura para mostrar en la UI (DD/MM/YYYY)
   * Maneja múltiples formatos de entrada incluyendo timestamps de Firebase
   */
  static safeFormatDate(dateValue) {
    if (!dateValue) return "No especificada";
    try {
      if (typeof dateValue === "string" && dateValue.includes("/")) {
        return dateValue;
      }
      if (dateValue && typeof dateValue === "object" && dateValue.toDate) {
        const date2 = dateValue.toDate();
        return DateHelper.formatDateToDDMMYYYY(date2);
      }
      if (dateValue && typeof dateValue === "object" && typeof dateValue.seconds === "number") {
        const date2 = new Date(dateValue.seconds * 1e3);
        return DateHelper.formatDateToDDMMYYYY(date2);
      }
      if (typeof dateValue === "string") {
        let dateToFormat;
        if (dateValue.includes("T") || dateValue.includes("Z")) {
          dateToFormat = new Date(dateValue);
        } else {
          dateToFormat = /* @__PURE__ */ new Date(dateValue + "T12:00:00");
        }
        if (isNaN(dateToFormat.getTime())) {
          console.warn("Invalid date value:", dateValue);
          return "No especificada";
        }
        return DateHelper.formatDateToDDMMYYYY(dateToFormat);
      }
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        console.warn("Invalid date value:", dateValue);
        return "No especificada";
      }
      return DateHelper.formatDateToDDMMYYYY(date);
    } catch (error) {
      console.error("Error formatting date:", dateValue, error);
      return "No especificada";
    }
  }
  /**
   * Formatea una fecha para inputs de tipo date (YYYY-MM-DD)
   * Usado en formularios HTML
   */
  static safeFormatDateForInput(dateValue) {
    if (!dateValue) return "";
    try {
      if (typeof dateValue === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
        return dateValue;
      }
      if (dateValue && typeof dateValue === "object" && dateValue.toDate) {
        const date2 = dateValue.toDate();
        return DateHelper.formatDateToYYYYMMDD(date2);
      }
      if (dateValue && typeof dateValue === "object" && typeof dateValue.seconds === "number") {
        const date2 = new Date(dateValue.seconds * 1e3);
        return DateHelper.formatDateToYYYYMMDD(date2);
      }
      if (typeof dateValue === "string") {
        let dateToFormat;
        if (dateValue.includes("T") || dateValue.includes("Z")) {
          dateToFormat = new Date(dateValue);
        } else {
          dateToFormat = /* @__PURE__ */ new Date(dateValue + "T12:00:00");
        }
        if (isNaN(dateToFormat.getTime())) {
          console.warn("Invalid date value for input:", dateValue);
          return "";
        }
        return this.formatDateToYYYYMMDD(dateToFormat);
      }
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        console.warn("Cannot convert to valid date for input:", dateValue);
        return "";
      }
      return this.formatDateToYYYYMMDD(date);
    } catch (error) {
      console.warn("Error formatting date for input:", dateValue, error);
      return "";
    }
  }
  /**
   * Parsea una fecha de manera segura evitando problemas de timezone
   * Devuelve null si no se puede parsear
   */
  static safeParseDate(dateStr) {
    if (!dateStr) return null;
    try {
      if (dateStr instanceof Date) {
        return dateStr;
      }
      if (typeof dateStr === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return /* @__PURE__ */ new Date(dateStr + "T12:00:00");
      }
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        console.warn("Could not parse date:", dateStr);
        return null;
      }
      return date;
    } catch (e) {
      console.warn("Error parsing date:", dateStr, e);
      return null;
    }
  }
  /**
   * Calcula la duración en días entre dos fechas (inclusivo)
   * Del 24/06 al 28/06 = 5 días (24, 25, 26, 27, 28)
   */
  static calculateDurationInDays(startDate, endDate) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      const diffDays = Math.round((end.getTime() - start.getTime()) / (1e3 * 60 * 60 * 24)) + 1;
      return diffDays > 0 ? diffDays : 1;
    } catch (error) {
      console.error("Error calculating duration:", error);
      return 1;
    }
  }
  /**
   * Calcula la fecha de fin basada en la fecha de inicio y duración
   */
  static calculateEndDate(startDate, durationDays) {
    try {
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + (durationDays - 1));
      return endDate;
    } catch (error) {
      console.error("Error calculating end date:", error);
      return startDate;
    }
  }
  /**
   * Valida si una fecha de fin es posterior o igual a la fecha de inicio
   */
  static validateDateRange(startDate, endDate) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      return end.getTime() >= start.getTime();
    } catch (error) {
      console.error("Error validating date range:", error);
      return false;
    }
  }
  /**
   * Formatea una fecha a DD/MM/YYYY usando partes locales para evitar problemas de timezone
   */
  static formatDateToDDMMYYYY(date) {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
  /**
   * Formatea una fecha a YYYY-MM-DD usando partes locales para evitar problemas de timezone
   */
  static formatDateToYYYYMMDD(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  /**
   * Convierte una fecha a formato ISO string para almacenamiento
   */
  static toISOString(date) {
    try {
      return date.toISOString();
    } catch (error) {
      console.error("Error converting date to ISO string:", error);
      return (/* @__PURE__ */ new Date()).toISOString();
    }
  }
  /**
   * Obtiene la fecha actual en formato YYYY-MM-DD
   */
  static getCurrentDateString() {
    return this.formatDateToYYYYMMDD(/* @__PURE__ */ new Date());
  }
  /**
   * Obtiene la fecha actual en formato DD/MM/YYYY
   */
  static getCurrentDateFormatted() {
    return this.formatDateToDDMMYYYY(/* @__PURE__ */ new Date());
  }
}

export { DateHelper as D };
