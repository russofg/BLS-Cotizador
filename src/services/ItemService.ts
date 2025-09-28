/**
 * ItemService - Servicio mejorado para gestión de items/productos
 * Mantiene compatibilidad con el servicio anterior pero con mejoras
 */

import { db } from '../utils/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { ValidationHelper } from '../utils/validationHelpers';
import { cache, CacheKeys, CacheTTL, invalidateRelatedCache } from '../utils/cache';

// Interfaces mejoradas
export interface Item {
  id: string;
  categoriaId: string;
  codigo?: string;
  nombre: string;
  descripcion?: string[];
  unidad: string;
  precioBase: number;
  variantes?: any;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ItemCreateData {
  categoriaId: string;
  codigo?: string;
  nombre: string;
  descripcion?: string[];
  unidad: string;
  precioBase: number;
  variantes?: any;
  activo?: boolean;
}

export interface ItemUpdateData {
  categoriaId?: string;
  codigo?: string;
  nombre?: string;
  descripcion?: string[];
  unidad?: string;
  precioBase?: number;
  variantes?: any;
  activo?: boolean;
}

export interface ItemFilters {
  categoria?: string;
  activo?: boolean;
  precioMin?: number;
  precioMax?: number;
  unidad?: string;
  search?: string;
}

export interface ItemSearchResult {
  items: Item[];
  total: number;
  hasMore: boolean;
}

export interface ItemStats {
  total: number;
  activos: number;
  inactivos: number;
  porCategoria: { [categoriaId: string]: number };
  precioPromedio: number;
  precioMinimo: number;
  precioMaximo: number;
  unidades: string[];
}

export interface ItemWithCategoria extends Item {
  categoria?: {
    id: string;
    nombre: string;
  };
}

/**
 * ItemService mejorado con validaciones, búsqueda avanzada y estadísticas
 */
export class ItemService {
  private static readonly COLLECTION_NAME = 'items';

  /**
   * Obtiene todos los items con filtros opcionales (optimizado con caché)
   */
  static async getAll(filters?: ItemFilters): Promise<Item[]> {
    try {
      // Check cache first
      const cacheKey = CacheKeys.items(filters);
      const cachedData = cache.get<Item[]>(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      let q = query(collection(db, this.COLLECTION_NAME), orderBy('nombre', 'asc'));
      
      // Aplicar filtros
      if (filters?.categoria) {
        q = query(q, where('categoriaId', '==', filters.categoria));
      }
      
      if (filters?.activo !== undefined) {
        q = query(q, where('activo', '==', filters.activo));
      }
      
      if (filters?.unidad) {
        q = query(q, where('unidad', '==', filters.unidad));
      }
      
      const snapshot = await getDocs(q);
      let items = snapshot.docs.map(doc => this.mapDocumentToItem(doc));
      
      // Aplicar filtros de precio (no se pueden hacer en Firestore directamente)
      if (filters?.precioMin !== undefined) {
        items = items.filter(item => item.precioBase >= filters.precioMin!);
      }
      
      if (filters?.precioMax !== undefined) {
        items = items.filter(item => item.precioBase <= filters.precioMax!);
      }
      
      // Aplicar filtro de búsqueda si existe
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        items = items.filter(item => 
          item.nombre.toLowerCase().includes(searchTerm) ||
          (item.codigo && item.codigo.toLowerCase().includes(searchTerm)) ||
          (item.descripcion && item.descripcion.some(desc => 
            desc.toLowerCase().includes(searchTerm)
          )) ||
          item.unidad.toLowerCase().includes(searchTerm)
        );
      }
      
      // Cache the result
      cache.set(cacheKey, items, CacheTTL.MEDIUM);
      
      return items;
    } catch (error) {
      console.error('Error getting all items:', error);
      throw new Error('Error al obtener los items');
    }
  }

  /**
   * Obtiene un item por ID (optimizado con caché)
   */
  static async getById(id: string): Promise<Item | null> {
    try {
      if (!id) {
        throw new Error('ID de item es requerido');
      }

      // Check cache first
      const cacheKey = CacheKeys.itemById(id);
      const cachedData = cache.get<Item>(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      const docSnap = await getDoc(doc(db, this.COLLECTION_NAME, id));
      if (!docSnap.exists()) {
        return null;
      }
      
      const item = this.mapDocumentToItem(docSnap);
      
      // Cache the result
      cache.set(cacheKey, item, CacheTTL.MEDIUM);
      
      return item;
    } catch (error) {
      console.error('Error getting item by ID:', error);
      throw new Error('Error al obtener el item');
    }
  }

  /**
   * Crea un nuevo item con validación
   */
  static async create(itemData: ItemCreateData): Promise<Item> {
    try {
      // Validar datos de entrada
      const validation = this.validateItemData(itemData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Verificar que el código no esté en uso (si se proporciona)
      if (itemData.codigo) {
        const existingItem = await this.getByCodigo(itemData.codigo);
        if (existingItem) {
          throw new Error('Ya existe un item con este código');
        }
      }

      const now = new Date();
      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), {
        ...itemData,
        activo: itemData.activo ?? true,
        createdAt: now,
        updatedAt: now
      });
      
      const docSnap = await getDoc(docRef);
      const newItem = this.mapDocumentToItem(docSnap);
      
      // Invalidate related cache
      invalidateRelatedCache('item');
      
      return newItem;
    } catch (error) {
      console.error('Error creating item:', error);
      throw error;
    }
  }

  /**
   * Actualiza un item existente
   */
  static async update(id: string, updates: ItemUpdateData): Promise<void> {
    try {
      if (!id) {
        throw new Error('ID de item es requerido');
      }

      // Validar datos de actualización
      const validation = this.validateItemData(updates, true);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Si se está actualizando el código, verificar que no esté en uso
      if (updates.codigo) {
        const existingItem = await this.getByCodigo(updates.codigo);
        if (existingItem && existingItem.id !== id) {
          throw new Error('Ya existe un item con este código');
        }
      }

      const docRef = doc(db, this.COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date()
      });
      
      // Invalidate related cache
      invalidateRelatedCache('item');
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  }

  /**
   * Elimina un item (soft delete marcándolo como inactivo)
   */
  static async delete(id: string): Promise<void> {
    try {
      if (!id) {
        throw new Error('ID de item es requerido');
      }

      // Soft delete - marcar como inactivo en lugar de eliminar
      await this.update(id, { activo: false });
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  }

  /**
   * Elimina un item permanentemente (solo para casos especiales)
   */
  static async deletePermanently(id: string): Promise<void> {
    try {
      if (!id) {
        throw new Error('ID de item es requerido');
      }

      await deleteDoc(doc(db, this.COLLECTION_NAME, id));
    } catch (error) {
      console.error('Error permanently deleting item:', error);
      throw error;
    }
  }

  /**
   * Busca items por término de búsqueda
   */
  static async search(searchTerm: string, limitCount: number = 10): Promise<Item[]> {
    try {
      if (!searchTerm || searchTerm.trim().length < 2) {
        return [];
      }

      const allItems = await this.getAll();
      const term = searchTerm.toLowerCase();
      
      return allItems
        .filter(item => 
          item.nombre.toLowerCase().includes(term) ||
          (item.codigo && item.codigo.toLowerCase().includes(term)) ||
          (item.descripcion && item.descripcion.some(desc => 
            desc.toLowerCase().includes(term)
          )) ||
          item.unidad.toLowerCase().includes(term)
        )
        .slice(0, limitCount);
    } catch (error) {
      console.error('Error searching items:', error);
      throw new Error('Error al buscar items');
    }
  }

  /**
   * Obtiene un item por código
   */
  static async getByCodigo(codigo: string): Promise<Item | null> {
    try {
      if (!codigo) {
        return null;
      }

      const q = query(
        collection(db, this.COLLECTION_NAME), 
        where('codigo', '==', codigo.toUpperCase()),
        limit(1)
      );
      
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return null;
      }
      
      return this.mapDocumentToItem(snapshot.docs[0]);
    } catch (error) {
      console.error('Error getting item by codigo:', error);
      throw new Error('Error al buscar item por código');
    }
  }

  /**
   * Obtiene items por categoría
   */
  static async getByCategoria(categoriaId: string, activosOnly: boolean = true): Promise<Item[]> {
    try {
      if (!categoriaId) {
        throw new Error('ID de categoría es requerido');
      }

      const filters: ItemFilters = { categoria: categoriaId };
      if (activosOnly) {
        filters.activo = true;
      }

      return this.getAll(filters);
    } catch (error) {
      console.error('Error getting items by categoria:', error);
      throw new Error('Error al obtener items por categoría');
    }
  }

  /**
   * Obtiene estadísticas de items
   */
  static async getStats(): Promise<ItemStats> {
    try {
      const allItems = await this.getAll();
      
      const activos = allItems.filter(item => item.activo);
      const inactivos = allItems.filter(item => !item.activo);
      
      // Estadísticas por categoría
      const porCategoria: { [categoriaId: string]: number } = {};
      allItems.forEach(item => {
        porCategoria[item.categoriaId] = (porCategoria[item.categoriaId] || 0) + 1;
      });
      
      // Estadísticas de precios
      const precios = allItems.map(item => item.precioBase);
      const precioPromedio = precios.length > 0 ? precios.reduce((a, b) => a + b, 0) / precios.length : 0;
      const precioMinimo = precios.length > 0 ? Math.min(...precios) : 0;
      const precioMaximo = precios.length > 0 ? Math.max(...precios) : 0;
      
      // Unidades únicas
      const unidades = [...new Set(allItems.map(item => item.unidad))];
      
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
      console.error('Error getting item stats:', error);
      throw new Error('Error al obtener estadísticas de items');
    }
  }

  /**
   * Obtiene items activos únicamente
   */
  static async getActive(): Promise<Item[]> {
    return this.getAll({ activo: true });
  }

  /**
   * Reactiva un item (marca como activo)
   */
  static async reactivate(id: string): Promise<void> {
    await this.update(id, { activo: true });
  }

  /**
   * Obtiene items con información de categoría
   */
  static async getWithCategoria(filters?: ItemFilters): Promise<ItemWithCategoria[]> {
    try {
      const items = await this.getAll(filters);
      
      // Obtener todas las categorías únicas
      const categoriaIds = [...new Set(items.map(item => item.categoriaId))];
      
      // Obtener información de categorías
      const categorias = await Promise.all(
        categoriaIds.map(async (categoriaId) => {
          try {
            const categoriaDoc = await getDoc(doc(db, 'categorias', categoriaId));
            if (categoriaDoc.exists()) {
              return {
                id: categoriaDoc.id,
                nombre: categoriaDoc.data().nombre || 'Sin categoría'
              };
            }
          } catch (error) {
            console.error(`Error getting categoria ${categoriaId}:`, error);
          }
          return { id: categoriaId, nombre: 'Sin categoría' };
        })
      );
      
      // Combinar items con información de categoría
      return items.map(item => ({
        ...item,
        categoria: categorias.find(cat => cat.id === item.categoriaId)
      }));
    } catch (error) {
      console.error('Error getting items with categoria:', error);
      throw new Error('Error al obtener items con categoría');
    }
  }

  /**
   * Valida los datos de un item
   */
  private static validateItemData(data: Partial<ItemCreateData | ItemUpdateData>, isUpdate: boolean = false): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar nombre
    if (data.nombre !== undefined) {
      const nameValidation = ValidationHelper.validateName(data.nombre, 'Nombre del item');
      errors.push(...nameValidation.errors);
    }

    // Validar categoría
    if (data.categoriaId !== undefined) {
      if (!data.categoriaId || data.categoriaId.trim().length === 0) {
        errors.push('Categoría es obligatoria');
      }
    }

    // Validar precio
    if (data.precioBase !== undefined) {
      if (data.precioBase < 0) {
        errors.push('El precio base no puede ser negativo');
      }
      if (data.precioBase > 1000000) {
        errors.push('El precio base es demasiado alto');
      }
    }

    // Validar unidad
    if (data.unidad !== undefined) {
      if (!data.unidad || data.unidad.trim().length === 0) {
        errors.push('Unidad es obligatoria');
      }
    }

    // Validar código si está presente
    if (data.codigo !== undefined && data.codigo.trim().length > 0) {
      if (data.codigo.length > 20) {
        errors.push('El código no puede tener más de 20 caracteres');
      }
    }

    // Para creación, campos obligatorios
    if (!isUpdate) {
      if (!data.nombre) {
        errors.push('Nombre es obligatorio');
      }
      if (!data.categoriaId) {
        errors.push('Categoría es obligatoria');
      }
      if (!data.unidad) {
        errors.push('Unidad es obligatoria');
      }
      if (data.precioBase === undefined) {
        errors.push('Precio base es obligatorio');
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
  private static mapDocumentToItem(doc: QueryDocumentSnapshot): Item {
    const data = doc.data();
    return {
      id: doc.id,
      categoriaId: data.categoriaId || '',
      codigo: data.codigo || undefined,
      nombre: data.nombre || '',
      descripcion: data.descripcion || undefined,
      unidad: data.unidad || '',
      precioBase: data.precioBase || 0,
      variantes: data.variantes || undefined,
      activo: data.activo !== false, // Default to true if not specified
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    };
  }
}

// Exportar también las funciones individuales para compatibilidad con el código existente
export const itemService = {
  async getAll(filters?: { categoria?: string; activo?: boolean }): Promise<Item[]> {
    return ItemService.getAll(filters);
  },

  async getById(id: string): Promise<Item | null> {
    return ItemService.getById(id);
  },

  async create(item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>): Promise<Item> {
    return ItemService.create(item);
  },

  async update(id: string, updates: Partial<Item>): Promise<void> {
    return ItemService.update(id, updates);
  },

  async delete(id: string): Promise<void> {
    return ItemService.delete(id);
  },

  async search(searchTerm: string): Promise<Item[]> {
    return ItemService.search(searchTerm);
  }
};
