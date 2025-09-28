/**
 * CategoriaService - Servicio mejorado para gestión de categorías
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
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { ValidationHelper } from '../utils/validationHelpers';

// Interfaces mejoradas
export interface Categoria {
  id: string;
  nombre: string;
  descripcion?: string;
  orden: number;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CategoriaCreateData {
  nombre: string;
  descripcion?: string;
  orden?: number;
}

export interface CategoriaUpdateData {
  nombre?: string;
  descripcion?: string;
  orden?: number;
}

export interface CategoriaFilters {
  search?: string;
  ordenMin?: number;
  ordenMax?: number;
}

export interface CategoriaStats {
  total: number;
  conDescripcion: number;
  sinDescripcion: number;
  ordenPromedio: number;
  ordenMinimo: number;
  ordenMaximo: number;
}

export interface CategoriaWithItems extends Categoria {
  itemsCount: number;
  itemsActivos: number;
  itemsInactivos: number;
}

/**
 * CategoriaService mejorado con validaciones, ordenamiento automático y estadísticas
 */
export class CategoriaService {
  private static readonly COLLECTION_NAME = 'categorias';

  /**
   * Obtiene todas las categorías ordenadas por orden
   */
  static async getAll(filters?: CategoriaFilters): Promise<Categoria[]> {
    try {
      let q = query(collection(db, this.COLLECTION_NAME), orderBy('orden', 'asc'));
      
      const snapshot = await getDocs(q);
      let categorias = snapshot.docs.map(doc => this.mapDocumentToCategoria(doc));
      
      // Aplicar filtros de orden si existen
      if (filters?.ordenMin !== undefined) {
        categorias = categorias.filter(cat => cat.orden >= filters.ordenMin!);
      }
      
      if (filters?.ordenMax !== undefined) {
        categorias = categorias.filter(cat => cat.orden <= filters.ordenMax!);
      }
      
      // Aplicar filtro de búsqueda si existe
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        categorias = categorias.filter(categoria => 
          categoria.nombre.toLowerCase().includes(searchTerm) ||
          (categoria.descripcion && categoria.descripcion.toLowerCase().includes(searchTerm))
        );
      }
      
      return categorias;
    } catch (error) {
      console.error('Error getting all categories:', error);
      throw new Error('Error al obtener las categorías');
    }
  }

  /**
   * Obtiene una categoría por ID
   */
  static async getById(id: string): Promise<Categoria | null> {
    try {
      if (!id) {
        throw new Error('ID de categoría es requerido');
      }

      const docSnap = await getDoc(doc(db, this.COLLECTION_NAME, id));
      if (!docSnap.exists()) {
        return null;
      }
      
      return this.mapDocumentToCategoria(docSnap);
    } catch (error) {
      console.error('Error getting category by ID:', error);
      throw new Error('Error al obtener la categoría');
    }
  }

  /**
   * Crea una nueva categoría con validación y orden automático
   */
  static async create(categoriaData: CategoriaCreateData): Promise<Categoria> {
    try {
      // Validar datos de entrada
      const validation = this.validateCategoriaData(categoriaData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Verificar que el nombre no esté en uso
      const existingCategoria = await this.getByNombre(categoriaData.nombre);
      if (existingCategoria) {
        throw new Error('Ya existe una categoría con este nombre');
      }

      // Si no se especifica orden, asignar el siguiente disponible
      let orden = categoriaData.orden;
      if (orden === undefined) {
        const categorias = await this.getAll();
        orden = categorias.length > 0 ? Math.max(...categorias.map(c => c.orden)) + 1 : 1;
      }

      const now = new Date();
      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), {
        ...categoriaData,
        orden,
        createdAt: now,
        updatedAt: now
      });
      
      const docSnap = await getDoc(docRef);
      return this.mapDocumentToCategoria(docSnap);
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  /**
   * Actualiza una categoría existente
   */
  static async update(id: string, updates: CategoriaUpdateData): Promise<void> {
    try {
      if (!id) {
        throw new Error('ID de categoría es requerido');
      }

      // Validar datos de actualización
      const validation = this.validateCategoriaData(updates, true);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Si se está actualizando el nombre, verificar que no esté en uso
      if (updates.nombre) {
        const existingCategoria = await this.getByNombre(updates.nombre);
        if (existingCategoria && existingCategoria.id !== id) {
          throw new Error('Ya existe una categoría con este nombre');
        }
      }

      const docRef = doc(db, this.COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  /**
   * Elimina una categoría (verificar que no tenga items asociados)
   */
  static async delete(id: string): Promise<void> {
    try {
      if (!id) {
        throw new Error('ID de categoría es requerido');
      }

      // Verificar que no tenga items asociados
      const itemsCount = await this.getItemsCount(id);
      if (itemsCount > 0) {
        throw new Error(`No se puede eliminar la categoría porque tiene ${itemsCount} items asociados`);
      }

      await deleteDoc(doc(db, this.COLLECTION_NAME, id));
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  /**
   * Busca categorías por término de búsqueda
   */
  static async search(searchTerm: string, limitCount: number = 10): Promise<Categoria[]> {
    try {
      if (!searchTerm || searchTerm.trim().length < 2) {
        return [];
      }

      const allCategorias = await this.getAll();
      const term = searchTerm.toLowerCase();
      
      return allCategorias
        .filter(categoria => 
          categoria.nombre.toLowerCase().includes(term) ||
          (categoria.descripcion && categoria.descripcion.toLowerCase().includes(term))
        )
        .slice(0, limitCount);
    } catch (error) {
      console.error('Error searching categories:', error);
      throw new Error('Error al buscar categorías');
    }
  }

  /**
   * Obtiene una categoría por nombre
   */
  static async getByNombre(nombre: string): Promise<Categoria | null> {
    try {
      if (!nombre) {
        return null;
      }

      const q = query(
        collection(db, this.COLLECTION_NAME), 
        where('nombre', '==', nombre.trim()),
        limit(1)
      );
      
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return null;
      }
      
      return this.mapDocumentToCategoria(snapshot.docs[0]);
    } catch (error) {
      console.error('Error getting category by nombre:', error);
      throw new Error('Error al buscar categoría por nombre');
    }
  }

  /**
   * Obtiene estadísticas de categorías
   */
  static async getStats(): Promise<CategoriaStats> {
    try {
      const allCategorias = await this.getAll();
      
      const conDescripcion = allCategorias.filter(cat => cat.descripcion && cat.descripcion.trim().length > 0).length;
      const sinDescripcion = allCategorias.length - conDescripcion;
      
      // Estadísticas de orden
      const ordenes = allCategorias.map(cat => cat.orden);
      const ordenPromedio = ordenes.length > 0 ? ordenes.reduce((a, b) => a + b, 0) / ordenes.length : 0;
      const ordenMinimo = ordenes.length > 0 ? Math.min(...ordenes) : 0;
      const ordenMaximo = ordenes.length > 0 ? Math.max(...ordenes) : 0;
      
      return {
        total: allCategorias.length,
        conDescripcion,
        sinDescripcion,
        ordenPromedio: Math.round(ordenPromedio * 100) / 100,
        ordenMinimo,
        ordenMaximo
      };
    } catch (error) {
      console.error('Error getting category stats:', error);
      throw new Error('Error al obtener estadísticas de categorías');
    }
  }

  /**
   * Obtiene categorías con información de items
   */
  static async getWithItems(): Promise<CategoriaWithItems[]> {
    try {
      const categorias = await this.getAll();
      
      // Obtener estadísticas de items para cada categoría
      const categoriasWithItems = await Promise.all(
        categorias.map(async (categoria) => {
          const itemsCount = await this.getItemsCount(categoria.id);
          const itemsActivos = await this.getActiveItemsCount(categoria.id);
          const itemsInactivos = itemsCount - itemsActivos;
          
          return {
            ...categoria,
            itemsCount,
            itemsActivos,
            itemsInactivos
          };
        })
      );
      
      return categoriasWithItems;
    } catch (error) {
      console.error('Error getting categories with items:', error);
      throw new Error('Error al obtener categorías con items');
    }
  }

  /**
   * Reordena las categorías
   */
  static async reorder(categoriaIds: string[]): Promise<void> {
    try {
      if (!categoriaIds || categoriaIds.length === 0) {
        throw new Error('Lista de IDs de categorías es requerida');
      }

      // Actualizar el orden de cada categoría
      const updatePromises = categoriaIds.map((id, index) => {
        const docRef = doc(db, this.COLLECTION_NAME, id);
        return updateDoc(docRef, {
          orden: index + 1,
          updatedAt: new Date()
        });
      });

      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error reordering categories:', error);
      throw new Error('Error al reordenar categorías');
    }
  }

  /**
   * Mueve una categoría hacia arriba en el orden
   */
  static async moveUp(id: string): Promise<void> {
    try {
      const categorias = await this.getAll();
      const categoriaIndex = categorias.findIndex(cat => cat.id === id);
      
      if (categoriaIndex === -1) {
        throw new Error('Categoría no encontrada');
      }
      
      if (categoriaIndex === 0) {
        throw new Error('La categoría ya está en la primera posición');
      }
      
      // Intercambiar con la categoría anterior
      const categoriaIds = categorias.map(cat => cat.id);
      [categoriaIds[categoriaIndex - 1], categoriaIds[categoriaIndex]] = 
      [categoriaIds[categoriaIndex], categoriaIds[categoriaIndex - 1]];
      
      await this.reorder(categoriaIds);
    } catch (error) {
      console.error('Error moving category up:', error);
      throw error;
    }
  }

  /**
   * Mueve una categoría hacia abajo en el orden
   */
  static async moveDown(id: string): Promise<void> {
    try {
      const categorias = await this.getAll();
      const categoriaIndex = categorias.findIndex(cat => cat.id === id);
      
      if (categoriaIndex === -1) {
        throw new Error('Categoría no encontrada');
      }
      
      if (categoriaIndex === categorias.length - 1) {
        throw new Error('La categoría ya está en la última posición');
      }
      
      // Intercambiar con la categoría siguiente
      const categoriaIds = categorias.map(cat => cat.id);
      [categoriaIds[categoriaIndex], categoriaIds[categoriaIndex + 1]] = 
      [categoriaIds[categoriaIndex + 1], categoriaIds[categoriaIndex]];
      
      await this.reorder(categoriaIds);
    } catch (error) {
      console.error('Error moving category down:', error);
      throw error;
    }
  }

  /**
   * Obtiene el número de items asociados a una categoría
   */
  private static async getItemsCount(categoriaId: string): Promise<number> {
    try {
      const q = query(
        collection(db, 'items'), 
        where('categoriaId', '==', categoriaId)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting items count:', error);
      return 0;
    }
  }

  /**
   * Obtiene el número de items activos asociados a una categoría
   */
  private static async getActiveItemsCount(categoriaId: string): Promise<number> {
    try {
      const q = query(
        collection(db, 'items'), 
        where('categoriaId', '==', categoriaId),
        where('activo', '==', true)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting active items count:', error);
      return 0;
    }
  }

  /**
   * Valida los datos de una categoría
   */
  private static validateCategoriaData(data: Partial<CategoriaCreateData | CategoriaUpdateData>, isUpdate: boolean = false): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar nombre
    if (data.nombre !== undefined) {
      const nameValidation = ValidationHelper.validateName(data.nombre, 'Nombre de la categoría');
      errors.push(...nameValidation.errors);
    }

    // Validar descripción si está presente
    if (data.descripcion !== undefined && data.descripcion.trim().length > 0) {
      if (data.descripcion.length > 500) {
        errors.push('La descripción no puede tener más de 500 caracteres');
      }
    }

    // Validar orden si está presente
    if (data.orden !== undefined) {
      if (data.orden < 1) {
        errors.push('El orden debe ser mayor a 0');
      }
      if (data.orden > 1000) {
        errors.push('El orden no puede ser mayor a 1000');
      }
    }

    // Para creación, nombre es obligatorio
    if (!isUpdate) {
      if (!data.nombre) {
        errors.push('Nombre es obligatorio');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Mapea un documento de Firestore a un objeto Categoria
   */
  private static mapDocumentToCategoria(doc: QueryDocumentSnapshot): Categoria {
    const data = doc.data();
    return {
      id: doc.id,
      nombre: data.nombre || '',
      descripcion: data.descripcion || undefined,
      orden: data.orden || 1,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate()
    };
  }
}

// Exportar también las funciones individuales para compatibilidad con el código existente
export const categoriaService = {
  async getAll(): Promise<Categoria[]> {
    return CategoriaService.getAll();
  },

  async create(categoria: Omit<Categoria, 'id'>): Promise<Categoria> {
    return CategoriaService.create(categoria);
  },

  async update(id: string, updates: Partial<Categoria>): Promise<void> {
    return CategoriaService.update(id, updates);
  },

  async delete(id: string): Promise<void> {
    return CategoriaService.delete(id);
  }
};
