import { a as adminDb } from './firebaseAdmin_DoQo1nZX.mjs';
import { D as DateHelper } from './dateHelpers_DuxKPoxD.mjs';
import { a as CacheKeys, c as cache, C as CacheTTL, i as invalidateRelatedCache } from './cache_0UIU9YOL.mjs';

class ValidationHelper {
  /**
   * Valida un email
   */
  static validateEmail(email) {
    const errors = [];
    if (!email) {
      errors.push("Email es obligatorio");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push("Email no tiene un formato válido");
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
  static validatePassword(password, minLength = 6) {
    const errors = [];
    if (!password) {
      errors.push("Contraseña es obligatoria");
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
  static validatePasswordMatch(password, confirmPassword) {
    const errors = [];
    if (password !== confirmPassword) {
      errors.push("Las contraseñas no coinciden");
    }
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  /**
   * Valida un nombre (no vacío, longitud mínima)
   */
  static validateName(name, fieldName = "Nombre") {
    const errors = [];
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
  static validatePositiveNumber(value, fieldName = "Valor") {
    const errors = [];
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
  static validatePositiveInteger(value, fieldName = "Valor") {
    const errors = [];
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
  static validatePercentage(value, fieldName = "Porcentaje") {
    const errors = [];
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
  static validateDateRange(startDate, endDate) {
    const errors = [];
    const start = DateHelper.safeParseDate(startDate);
    const end = DateHelper.safeParseDate(endDate);
    if (!start) {
      errors.push("Fecha de inicio no es válida");
    }
    if (!end) {
      errors.push("Fecha de fin no es válida");
    }
    if (start && end && !DateHelper.validateDateRange(start, end)) {
      errors.push("La fecha de fin debe ser posterior o igual a la fecha de inicio");
    }
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  /**
   * Valida datos de un cliente
   */
  static validateClient(clientData) {
    const errors = [];
    const nameValidation = this.validateName(clientData.nombre, "Nombre del cliente");
    errors.push(...nameValidation.errors);
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
  static validateQuoteItem(itemData) {
    const errors = [];
    if (!itemData.descripcion || itemData.descripcion.trim().length === 0) {
      errors.push("Descripción del item es obligatoria");
    }
    const cantidadValidation = this.validatePositiveNumber(itemData.cantidad, "Cantidad");
    errors.push(...cantidadValidation.errors);
    const precioValidation = this.validatePositiveNumber(itemData.precio_unitario, "Precio unitario");
    errors.push(...precioValidation.errors);
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  /**
   * Valida datos básicos de una cotización
   */
  static validateQuote(quoteData) {
    const errors = [];
    if (!quoteData.cliente_id && !quoteData.clienteId) {
      errors.push("Cliente es obligatorio");
    }
    const titleValidation = this.validateName(quoteData.titulo, "Título de la cotización");
    errors.push(...titleValidation.errors);
    if (quoteData.fecha_evento || quoteData.fechaEvento) {
      const dateValidation = this.validateDateRange(
        quoteData.fecha_evento || quoteData.fechaEvento,
        quoteData.fecha_evento_fin || quoteData.fechaEventoFin
      );
      errors.push(...dateValidation.errors);
    }
    if (quoteData.descuento !== void 0 && quoteData.descuento !== null) {
      const descuentoValidation = this.validatePercentage(quoteData.descuento, "Descuento");
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
  static validateUserRegistration(userData) {
    const errors = [];
    const nameValidation = this.validateName(userData.nombre, "Nombre completo");
    errors.push(...nameValidation.errors);
    const emailValidation = this.validateEmail(userData.email);
    errors.push(...emailValidation.errors);
    const passwordValidation = this.validatePassword(userData.password);
    errors.push(...passwordValidation.errors);
    const confirmValidation = this.validatePasswordMatch(userData.password, userData.confirmPassword);
    errors.push(...confirmValidation.errors);
    if (!userData.aceptaTerminos) {
      errors.push("Debe aceptar los términos y condiciones");
    }
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  /**
   * Valida datos de login
   */
  static validateLogin(loginData) {
    const errors = [];
    const emailValidation = this.validateEmail(loginData.email);
    errors.push(...emailValidation.errors);
    if (!loginData.password) {
      errors.push("Contraseña es obligatoria");
    }
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  /**
   * Valida un teléfono (formato básico)
   */
  static validatePhone(phone, fieldName = "Teléfono") {
    const errors = [];
    if (phone && phone.trim().length > 0) {
      const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
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
  static validateCUIT(cuit) {
    const errors = [];
    if (cuit && cuit.trim().length > 0) {
      const cleanCuit = cuit.replace(/-/g, "");
      if (!/^[0-9]{11}$/.test(cleanCuit)) {
        errors.push("CUIT debe tener 11 dígitos");
      } else {
        const digits = cleanCuit.split("").map(Number);
        const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
        let sum = 0;
        for (let i = 0; i < 10; i++) {
          sum += digits[i] * multipliers[i];
        }
        const remainder = sum % 11;
        const checkDigit = remainder < 2 ? remainder : 11 - remainder;
        if (checkDigit !== digits[10]) {
          errors.push("CUIT no es válido (dígito verificador incorrecto)");
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
  static combineValidationResults(...results) {
    const allErrors = [];
    const allWarnings = [];
    results.forEach((result) => {
      allErrors.push(...result.errors);
      if (result.warnings) {
        allWarnings.push(...result.warnings);
      }
    });
    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings.length > 0 ? allWarnings : void 0
    };
  }
  /**
   * Sanitiza un string para prevenir XSS
   */
  static sanitizeString(input) {
    if (typeof input !== "string") return "";
    return input.replace(/[<>]/g, "").trim();
  }
  /**
   * Sanitiza un objeto de datos
   */
  static sanitizeObject(obj) {
    if (typeof obj !== "object" || obj === null) return obj;
    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item));
    }
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === "string") {
        sanitized[key] = this.sanitizeString(value);
      } else if (typeof value === "object" && value !== null) {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
}

class ItemService {
  static COLLECTION_NAME = "items";
  /**
   * Obtiene todos los items con filtros opcionales (optimizado con caché)
   */
  static async getAll(filters) {
    try {
      const cacheKey = CacheKeys.items(filters);
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }
      let q = adminDb.collection(this.COLLECTION_NAME).orderBy("nombre", "asc");
      if (filters?.categoria) {
        q = q.where("categoriaId", "==", filters.categoria);
      }
      if (filters?.activo !== void 0) {
        q = q.where("activo", "==", filters.activo);
      }
      if (filters?.unidad) {
        q = q.where("unidad", "==", filters.unidad);
      }
      const snapshot = await q.get();
      let items = snapshot.docs.map((doc) => this.mapDocumentToItem(doc));
      if (filters?.precioMin !== void 0) {
        items = items.filter((item) => item.precioBase >= filters.precioMin);
      }
      if (filters?.precioMax !== void 0) {
        items = items.filter((item) => item.precioBase <= filters.precioMax);
      }
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        items = items.filter(
          (item) => item.nombre.toLowerCase().includes(searchTerm) || item.codigo && item.codigo.toLowerCase().includes(searchTerm) || item.descripcion && item.descripcion.some(
            (desc) => desc.toLowerCase().includes(searchTerm)
          ) || item.unidad.toLowerCase().includes(searchTerm)
        );
      }
      cache.set(cacheKey, items, CacheTTL.MEDIUM);
      return items;
    } catch (error) {
      console.error("Error getting all items:", error);
      throw error;
    }
  }
  /**
   * Obtiene un item por ID (optimizado con caché)
   */
  static async getById(id) {
    try {
      if (!id) {
        throw new Error("ID de item es requerido");
      }
      const cacheKey = CacheKeys.itemById(id);
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }
      const docSnap = await adminDb.collection(this.COLLECTION_NAME).doc(id).get();
      if (!docSnap.exists) {
        return null;
      }
      const item = this.mapDocumentToItem(docSnap);
      cache.set(cacheKey, item, CacheTTL.MEDIUM);
      return item;
    } catch (error) {
      console.error("Error getting item by ID:", error);
      throw error;
    }
  }
  /**
   * Crea un nuevo item con validación
   */
  static async create(itemData) {
    try {
      const validation = this.validateItemData(itemData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(", "));
      }
      if (itemData.codigo) {
        const existingItem = await this.getByCodigo(itemData.codigo);
        if (existingItem) {
          throw new Error("Ya existe un item con este código");
        }
      }
      const now = /* @__PURE__ */ new Date();
      const docRef = await adminDb.collection(this.COLLECTION_NAME).add({
        ...itemData,
        activo: itemData.activo ?? true,
        createdAt: now,
        updatedAt: now
      });
      const docSnap = await docRef.get();
      const newItem = this.mapDocumentToItem(docSnap);
      invalidateRelatedCache("item");
      return newItem;
    } catch (error) {
      console.error("Error creating item:", error);
      throw error;
    }
  }
  /**
   * Actualiza un item existente
   */
  static async update(id, updates) {
    try {
      if (!id) {
        throw new Error("ID de item es requerido");
      }
      const validation = this.validateItemData(updates, true);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(", "));
      }
      if (updates.codigo) {
        const existingItem = await this.getByCodigo(updates.codigo);
        if (existingItem && existingItem.id !== id) {
          throw new Error("Ya existe un item con este código");
        }
      }
      await adminDb.collection(this.COLLECTION_NAME).doc(id).update({
        ...updates,
        updatedAt: /* @__PURE__ */ new Date()
      });
      invalidateRelatedCache("item");
    } catch (error) {
      console.error("Error updating item:", error);
      throw error;
    }
  }
  /**
   * Elimina un item (soft delete marcándolo como inactivo)
   */
  static async delete(id) {
    try {
      if (!id) {
        throw new Error("ID de item es requerido");
      }
      await this.update(id, { activo: false });
    } catch (error) {
      console.error("Error deleting item:", error);
      throw error;
    }
  }
  /**
   * Elimina un item permanentemente (solo para casos especiales)
   */
  static async deletePermanently(id) {
    try {
      if (!id) {
        throw new Error("ID de item es requerido");
      }
      await adminDb.collection(this.COLLECTION_NAME).doc(id).delete();
    } catch (error) {
      console.error("Error permanently deleting item:", error);
      throw error;
    }
  }
  /**
   * Busca items por término de búsqueda
   */
  static async search(searchTerm, limitCount = 10) {
    try {
      if (!searchTerm || searchTerm.trim().length < 2) {
        return [];
      }
      const allItems = await this.getAll();
      const term = searchTerm.toLowerCase();
      return allItems.filter(
        (item) => item.nombre.toLowerCase().includes(term) || item.codigo && item.codigo.toLowerCase().includes(term) || item.descripcion && item.descripcion.some(
          (desc) => desc.toLowerCase().includes(term)
        ) || item.unidad.toLowerCase().includes(term)
      ).slice(0, limitCount);
    } catch (error) {
      console.error("Error searching items:", error);
      throw error;
    }
  }
  /**
   * Obtiene un item por código
   */
  static async getByCodigo(codigo) {
    try {
      if (!codigo) {
        return null;
      }
      const snapshot = await adminDb.collection(this.COLLECTION_NAME).where("codigo", "==", codigo.toUpperCase()).limit(1).get();
      if (snapshot.empty) {
        return null;
      }
      return this.mapDocumentToItem(snapshot.docs[0]);
    } catch (error) {
      console.error("Error getting item by codigo:", error);
      throw error;
    }
  }
  /**
   * Obtiene items por categoría
   */
  static async getByCategoria(categoriaId, activosOnly = true) {
    try {
      if (!categoriaId) {
        throw new Error("ID de categoría es requerido");
      }
      const filters = { categoria: categoriaId };
      if (activosOnly) {
        filters.activo = true;
      }
      return this.getAll(filters);
    } catch (error) {
      console.error("Error getting items by categoria:", error);
      throw error;
    }
  }
  /**
   * Obtiene estadísticas de items
   */
  static async getStats() {
    try {
      const allItems = await this.getAll();
      const activos = allItems.filter((item) => item.activo);
      const inactivos = allItems.filter((item) => !item.activo);
      const porCategoria = {};
      allItems.forEach((item) => {
        porCategoria[item.categoriaId] = (porCategoria[item.categoriaId] || 0) + 1;
      });
      const precios = allItems.map((item) => item.precioBase);
      const precioPromedio = precios.length > 0 ? precios.reduce((a, b) => a + b, 0) / precios.length : 0;
      const precioMinimo = precios.length > 0 ? Math.min(...precios) : 0;
      const precioMaximo = precios.length > 0 ? Math.max(...precios) : 0;
      const unidades = [...new Set(allItems.map((item) => item.unidad))];
      return {
        total: allItems.length,
        activos: activos.length,
        inactivos: inactivos.length,
        porCategoria,
        precioPromedio: Math.round(precioPromedio * 100) / 100,
        precioMinimo,
        precioMaximo,
        unidades
      };
    } catch (error) {
      console.error("Error getting item stats:", error);
      throw error;
    }
  }
  /**
   * Obtiene items activos únicamente
   */
  static async getActive() {
    return this.getAll({ activo: true });
  }
  /**
   * Reactiva un item (marca como activo)
   */
  static async reactivate(id) {
    await this.update(id, { activo: true });
  }
  /**
   * Obtiene items con información de categoría
   */
  static async getWithCategoria(filters) {
    try {
      const items = await this.getAll(filters);
      const categoriaIds = [...new Set(items.map((item) => item.categoriaId))];
      const categorias = await Promise.all(
        categoriaIds.map(async (categoriaId) => {
          try {
            const categoriaDoc = await adminDb.collection("categorias").doc(categoriaId).get();
            if (categoriaDoc.exists) {
              return {
                id: categoriaDoc.id,
                nombre: categoriaDoc.data()?.nombre || "Sin categoría"
              };
            }
          } catch (error) {
            console.error(`Error getting categoria ${categoriaId}:`, error);
          }
          return { id: categoriaId, nombre: "Sin categoría" };
        })
      );
      return items.map((item) => ({
        ...item,
        categoria: categorias.find((cat) => cat.id === item.categoriaId)
      }));
    } catch (error) {
      console.error("Error getting items with categoria:", error);
      throw error;
    }
  }
  /**
   * Valida los datos de un item
   */
  static validateItemData(data, isUpdate = false) {
    const errors = [];
    if (data.nombre !== void 0) {
      const nameValidation = ValidationHelper.validateName(data.nombre, "Nombre del item");
      errors.push(...nameValidation.errors);
    }
    if (data.categoriaId !== void 0) {
      if (!data.categoriaId || data.categoriaId.trim().length === 0) {
        errors.push("Categoría es obligatoria");
      }
    }
    if (data.precioBase !== void 0) {
      if (data.precioBase < 0) {
        errors.push("El precio base no puede ser negativo");
      }
      if (data.precioBase > 1e6) {
        errors.push("El precio base es demasiado alto");
      }
    }
    if (data.unidad !== void 0) {
      if (!data.unidad || data.unidad.trim().length === 0) {
        errors.push("Unidad es obligatoria");
      }
    }
    if (data.codigo !== void 0 && data.codigo.trim().length > 0) {
      if (data.codigo.length > 20) {
        errors.push("El código no puede tener más de 20 caracteres");
      }
    }
    if (!isUpdate) {
      if (!data.nombre) {
        errors.push("Nombre es obligatorio");
      }
      if (!data.categoriaId) {
        errors.push("Categoría es obligatoria");
      }
      if (!data.unidad) {
        errors.push("Unidad es obligatoria");
      }
      if (data.precioBase === void 0) {
        errors.push("Precio base es obligatorio");
      }
    }
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  /**
   * Mapea un documento de Firestore a un objeto Item
   */
  static mapDocumentToItem(doc) {
    const data = doc.data() || {};
    return {
      id: doc.id,
      categoriaId: data.categoriaId || "",
      codigo: data.codigo || void 0,
      nombre: data.nombre || "",
      descripcion: data.descripcion || void 0,
      unidad: data.unidad || "",
      precioBase: data.precioBase || 0,
      variantes: data.variantes || void 0,
      activo: data.activo !== false,
      // Default to true if not specified
      createdAt: data.createdAt?.toDate() || /* @__PURE__ */ new Date(),
      updatedAt: data.updatedAt?.toDate() || /* @__PURE__ */ new Date()
    };
  }
}

class ClienteService {
  static COLLECTION_NAME = "clientes";
  /**
   * Obtiene todos los clientes con filtros opcionales (optimizado con caché)
   */
  static async getAll(filters) {
    try {
      const cacheKey = CacheKeys.clients(filters);
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }
      let q = adminDb.collection(this.COLLECTION_NAME).orderBy("nombre", "asc");
      if (filters?.activo !== void 0) {
        q = q.where("activo", "==", filters.activo);
      }
      if (filters?.empresa) {
        q = q.where("empresa", "==", filters.empresa);
      }
      const snapshot = await q.get();
      let clientes = snapshot.docs.map((doc) => this.mapDocumentToCliente(doc));
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        clientes = clientes.filter(
          (cliente) => cliente.nombre.toLowerCase().includes(searchTerm) || cliente.email.toLowerCase().includes(searchTerm) || cliente.empresa && cliente.empresa.toLowerCase().includes(searchTerm) || cliente.telefono && cliente.telefono.includes(searchTerm)
        );
      }
      cache.set(cacheKey, clientes, CacheTTL.MEDIUM);
      return clientes;
    } catch (error) {
      console.error("Error getting all clients:", error);
      throw error;
    }
  }
  /**
   * Obtiene un cliente por ID (optimizado con caché)
   */
  static async getById(id) {
    try {
      if (!id) {
        throw new Error("ID de cliente es requerido");
      }
      const cacheKey = CacheKeys.clientById(id);
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }
      const docSnap = await adminDb.collection(this.COLLECTION_NAME).doc(id).get();
      if (!docSnap.exists) {
        return null;
      }
      const cliente = this.mapDocumentToCliente(docSnap);
      cache.set(cacheKey, cliente, CacheTTL.MEDIUM);
      return cliente;
    } catch (error) {
      console.error("Error getting client by ID:", error);
      throw error;
    }
  }
  /**
   * Crea un nuevo cliente con validación
   */
  static async create(clienteData) {
    try {
      const validation = this.validateClienteData(clienteData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(", "));
      }
      if (clienteData.email && clienteData.email.trim().length > 0) {
        const existingClient = await this.getByEmail(clienteData.email);
        if (existingClient) {
          throw new Error("Ya existe un cliente con este email");
        }
      }
      const now = /* @__PURE__ */ new Date();
      const docRef = await adminDb.collection(this.COLLECTION_NAME).add({
        ...clienteData,
        activo: clienteData.activo ?? true,
        createdAt: now,
        updatedAt: now
      });
      const docSnap = await docRef.get();
      const newCliente = this.mapDocumentToCliente(docSnap);
      invalidateRelatedCache("client");
      return newCliente;
    } catch (error) {
      console.error("Error creating client:", error);
      throw error;
    }
  }
  /**
   * Actualiza un cliente existente
   */
  static async update(id, updates) {
    try {
      if (!id) {
        throw new Error("ID de cliente es requerido");
      }
      const validation = this.validateClienteData(updates, true);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(", "));
      }
      if (updates.email && updates.email.trim().length > 0) {
        const currentClient = await this.getById(id);
        if (!currentClient) {
          throw new Error("Cliente no encontrado");
        }
        if (currentClient.email !== updates.email) {
          const existingClient = await this.getByEmail(updates.email);
          if (existingClient && existingClient.id !== id) {
            throw new Error("Ya existe un cliente con este email");
          }
        }
      }
      await adminDb.collection(this.COLLECTION_NAME).doc(id).update({
        ...updates,
        updatedAt: /* @__PURE__ */ new Date()
      });
      invalidateRelatedCache("client");
    } catch (error) {
      console.error("Error updating client:", error);
      throw error;
    }
  }
  /**
   * Elimina un cliente permanentemente de Firebase
   */
  static async delete(id) {
    try {
      if (!id) {
        throw new Error("ID de cliente es requerido");
      }
      const existingClient = await this.getById(id);
      if (!existingClient) {
        throw new Error("Cliente no encontrado");
      }
      await adminDb.collection(this.COLLECTION_NAME).doc(id).delete();
      invalidateRelatedCache("client");
    } catch (error) {
      console.error("Error deleting client:", error);
      throw error;
    }
  }
  /**
   * Elimina un cliente permanentemente (solo para casos especiales)
   */
  static async deletePermanently(id) {
    try {
      if (!id) {
        throw new Error("ID de cliente es requerido");
      }
      await adminDb.collection(this.COLLECTION_NAME).doc(id).delete();
    } catch (error) {
      console.error("Error permanently deleting client:", error);
      throw error;
    }
  }
  /**
   * Busca clientes por término de búsqueda
   */
  static async search(searchTerm, limitCount = 10) {
    try {
      if (!searchTerm || searchTerm.trim().length < 2) {
        return [];
      }
      const allClients = await this.getAll();
      const term = searchTerm.toLowerCase();
      return allClients.filter(
        (cliente) => cliente.nombre.toLowerCase().includes(term) || cliente.email.toLowerCase().includes(term) || cliente.empresa && cliente.empresa.toLowerCase().includes(term) || cliente.telefono && cliente.telefono.includes(term)
      ).slice(0, limitCount);
    } catch (error) {
      console.error("Error searching clients:", error);
      throw error;
    }
  }
  /**
   * Obtiene un cliente por email
   */
  static async getByEmail(email) {
    try {
      if (!email) {
        return null;
      }
      const snapshot = await adminDb.collection(this.COLLECTION_NAME).where("email", "==", email.toLowerCase()).limit(1).get();
      if (snapshot.empty) {
        return null;
      }
      return this.mapDocumentToCliente(snapshot.docs[0]);
    } catch (error) {
      console.error("Error getting client by email:", error);
      throw error;
    }
  }
  /**
   * Obtiene estadísticas de clientes
   */
  static async getStats() {
    try {
      const allClients = await this.getAll();
      return {
        total: allClients.length,
        activos: allClients.filter((c) => c.activo).length,
        inactivos: allClients.filter((c) => !c.activo).length,
        conEmpresa: allClients.filter((c) => c.empresa && c.empresa.trim().length > 0).length,
        sinEmpresa: allClients.filter((c) => !c.empresa || c.empresa.trim().length === 0).length
      };
    } catch (error) {
      console.error("Error getting client stats:", error);
      throw error;
    }
  }
  /**
   * Obtiene clientes activos únicamente
   */
  static async getActive() {
    return this.getAll({ activo: true });
  }
  /**
   * Reactiva un cliente (marca como activo)
   */
  static async reactivate(id) {
    await this.update(id, { activo: true });
  }
  /**
   * Valida los datos de un cliente
   */
  static validateClienteData(data, isUpdate = false) {
    const errors = [];
    if (data.nombre !== void 0) {
      const nameValidation = ValidationHelper.validateName(data.nombre, "Nombre del cliente");
      errors.push(...nameValidation.errors);
    }
    if (data.email !== void 0 && data.email.trim().length > 0) {
      const emailValidation = ValidationHelper.validateEmail(data.email);
      errors.push(...emailValidation.errors);
    }
    if (data.telefono !== void 0 && data.telefono.trim().length > 0) {
      const phoneValidation = ValidationHelper.validatePhone(data.telefono, "Teléfono");
      errors.push(...phoneValidation.errors);
    }
    if (!isUpdate) {
      if (!data.nombre) {
        errors.push("Nombre es obligatorio");
      }
    }
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  /**
   * Mapea un documento de Firestore a un objeto Cliente
   */
  static mapDocumentToCliente(doc) {
    const data = doc.data() || {};
    return {
      id: doc.id,
      nombre: data.nombre || "",
      empresa: data.empresa || void 0,
      email: data.email || "",
      telefono: data.telefono || void 0,
      direccion: data.direccion || void 0,
      activo: data.activo !== false,
      // Default to true if not specified
      createdAt: data.createdAt?.toDate() || /* @__PURE__ */ new Date(),
      updatedAt: data.updatedAt?.toDate()
    };
  }
}

class CotizacionService {
  static COLLECTION_NAME = "cotizaciones";
  static async getAll() {
    try {
      const snapshot = await adminDb.collection(this.COLLECTION_NAME).orderBy("createdAt", "desc").get();
      return snapshot.docs.map((doc) => this.mapDocumentToCotizacion(doc));
    } catch (error) {
      console.error("Error getting all quotes:", error);
      throw error;
    }
  }
  static async getById(id) {
    try {
      const docSnap = await adminDb.collection(this.COLLECTION_NAME).doc(id).get();
      if (!docSnap.exists) return null;
      return this.mapDocumentToCotizacion(docSnap);
    } catch (error) {
      console.error("Error getting quote by ID:", error);
      throw error;
    }
  }
  static async create(cotizacion) {
    try {
      const now = /* @__PURE__ */ new Date();
      const docRef = await adminDb.collection(this.COLLECTION_NAME).add({
        ...cotizacion,
        createdAt: now,
        updatedAt: now
      });
      const docSnap = await docRef.get();
      return this.mapDocumentToCotizacion(docSnap);
    } catch (error) {
      console.error("Error creating quote:", error);
      throw error;
    }
  }
  static async update(id, updates) {
    try {
      await adminDb.collection(this.COLLECTION_NAME).doc(id).update({
        ...updates,
        updatedAt: /* @__PURE__ */ new Date()
      });
    } catch (error) {
      console.error("Error updating quote:", error);
      throw error;
    }
  }
  static async delete(id) {
    try {
      await adminDb.collection(this.COLLECTION_NAME).doc(id).delete();
    } catch (error) {
      console.error("Error deleting quote:", error);
      throw error;
    }
  }
  static mapDocumentToCotizacion(doc) {
    const data = doc.data() || {};
    return {
      id: doc.id,
      ...data,
      fecha: data.fecha?.toDate?.() || (data.fecha ? new Date(data.fecha) : /* @__PURE__ */ new Date()),
      fechaEvento: data.fechaEvento?.toDate?.() || (data.fechaEvento ? new Date(data.fechaEvento) : null),
      fechaEventoFin: data.fechaEventoFin?.toDate?.() || (data.fechaEventoFin ? new Date(data.fechaEventoFin) : null),
      validoHasta: data.validoHasta?.toDate?.() || (data.validoHasta ? new Date(data.validoHasta) : null),
      createdAt: data.createdAt?.toDate?.() || (data.createdAt ? new Date(data.createdAt) : /* @__PURE__ */ new Date()),
      updatedAt: data.updatedAt?.toDate?.() || (data.updatedAt ? new Date(data.updatedAt) : /* @__PURE__ */ new Date())
    };
  }
}

const itemService = {
  async getAll(filters) {
    return ItemService.getAll(filters);
  },
  async getById(id) {
    return ItemService.getById(id);
  },
  async create(item) {
    return ItemService.create(item);
  },
  async update(id, updates) {
    return ItemService.update(id, updates);
  },
  async delete(id) {
    return ItemService.delete(id);
  },
  async search(searchTerm) {
    return ItemService.search(searchTerm);
  }
};
const clienteService = {
  async getAll() {
    return ClienteService.getAll();
  },
  async getById(id) {
    return ClienteService.getById(id);
  },
  async create(cliente) {
    return ClienteService.create(cliente);
  },
  async update(id, updates) {
    return ClienteService.update(id, updates);
  },
  async delete(id) {
    return ClienteService.delete(id);
  }
};
const cotizacionService = {
  async getAll() {
    return CotizacionService.getAll();
  },
  async getById(id) {
    return CotizacionService.getById(id);
  },
  async create(cotizacion) {
    return CotizacionService.create(cotizacion);
  },
  async update(id, updates) {
    return CotizacionService.update(id, updates);
  },
  async delete(id) {
    return CotizacionService.delete(id);
  }
};
const statsService = {
  async getDashboardStats() {
    try {
      console.log("Starting getDashboardStats with Admin SDK...");
      const cotizacionesSnapshot = await adminDb.collection("cotizaciones").get();
      const totalCotizaciones = cotizacionesSnapshot.size;
      const pendingSnapshot = await adminDb.collection("cotizaciones").where("estado", "in", ["borrador", "enviada"]).get();
      const cotizacionesPendientes = pendingSnapshot.size;
      const activeItemsSnapshot = await adminDb.collection("items").where("activo", "==", true).get();
      const itemsActivos = activeItemsSnapshot.size;
      const clientesSnapshot = await adminDb.collection("clientes").get();
      const totalClientes = clientesSnapshot.size;
      const recentSnapshot = await adminDb.collection("cotizaciones").orderBy("createdAt", "desc").limit(5).get();
      const cotizacionesRecientes = await Promise.all(
        recentSnapshot.docs.map(async (docSnap) => {
          const data = docSnap.data() || {};
          const cotizacion = {
            id: docSnap.id,
            ...data,
            fecha: data.fecha?.toDate?.() || (data.fecha ? new Date(data.fecha) : null),
            fechaEvento: data.fechaEvento?.toDate?.() || (data.fechaEvento ? new Date(data.fechaEvento) : null),
            validoHasta: data.validoHasta?.toDate?.() || (data.validoHasta ? new Date(data.validoHasta) : null),
            createdAt: data.createdAt?.toDate?.() || (data.createdAt ? new Date(data.createdAt) : null),
            updatedAt: data.updatedAt?.toDate?.() || (data.updatedAt ? new Date(data.updatedAt) : null)
          };
          const clientId = data.cliente_id || data.clienteId;
          if (clientId) {
            const clienteDoc = await adminDb.collection("clientes").doc(clientId).get();
            if (clienteDoc.exists) {
              cotizacion.cliente = {
                id: clienteDoc.id,
                ...clienteDoc.data()
              };
            }
          }
          return cotizacion;
        })
      );
      const result = {
        totalCotizaciones,
        cotizacionesPendientes,
        itemsActivos,
        totalClientes,
        cotizacionesRecientes
      };
      console.log("Dashboard stats result:", result);
      return result;
    } catch (error) {
      console.error("Error in getDashboardStats:", error);
      return {
        totalCotizaciones: 0,
        cotizacionesPendientes: 0,
        itemsActivos: 0,
        totalClientes: 0,
        cotizacionesRecientes: []
      };
    }
  }
};

const database = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  clienteService,
  cotizacionService,
  itemService,
  statsService
}, Symbol.toStringTag, { value: 'Module' }));

export { ValidationHelper as V, cotizacionService as a, clienteService as c, database as d, itemService as i };
