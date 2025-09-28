/**
 * ConfiguracionService - Servicio mejorado para gestión de configuración de la aplicación
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
export interface Configuracion {
  id: string;
  clave: string;
  valor: string;
  descripcion?: string;
  updatedAt: Date;
  createdAt?: Date;
}

export interface ConfiguracionCreateData {
  clave: string;
  valor: string;
  descripcion?: string;
}

export interface ConfiguracionUpdateData {
  valor?: string;
  descripcion?: string;
}

export interface ConfiguracionFilters {
  search?: string;
  categoria?: string;
}

export interface ConfiguracionStats {
  total: number;
  conDescripcion: number;
  sinDescripcion: number;
  ultimaActualizacion: Date | null;
}

export interface ConfiguracionGrouped {
  [categoria: string]: Configuracion[];
}

// Tipos de configuración comunes
export type ConfiguracionTipo = 
  | 'string'
  | 'number'
  | 'boolean'
  | 'json'
  | 'email'
  | 'url'
  | 'color'
  | 'date';

export interface ConfiguracionConTipo extends Configuracion {
  tipo: ConfiguracionTipo;
  valorParseado: any;
}

/**
 * ConfiguracionService mejorado con validaciones, tipos de datos y agrupación
 */
export class ConfiguracionService {
  private static readonly COLLECTION_NAME = 'configuracion';

  /**
   * Obtiene una configuración por clave
   */
  static async get(clave: string): Promise<string | null> {
    try {
      if (!clave) {
        throw new Error('Clave de configuración es requerida');
      }

      const q = query(
        collection(db, this.COLLECTION_NAME), 
        where('clave', '==', clave), 
        limit(1)
      );
      
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return null;
      }
      
      return snapshot.docs[0].data().valor;
    } catch (error) {
      console.error('Error getting configuration:', error);
      throw new Error('Error al obtener la configuración');
    }
  }

  /**
   * Obtiene una configuración completa por clave
   */
  static async getComplete(clave: string): Promise<Configuracion | null> {
    try {
      if (!clave) {
        throw new Error('Clave de configuración es requerida');
      }

      const q = query(
        collection(db, this.COLLECTION_NAME), 
        where('clave', '==', clave), 
        limit(1)
      );
      
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return null;
      }
      
      return this.mapDocumentToConfiguracion(snapshot.docs[0]);
    } catch (error) {
      console.error('Error getting complete configuration:', error);
      throw new Error('Error al obtener la configuración completa');
    }
  }

  /**
   * Establece una configuración (crea o actualiza)
   */
  static async set(clave: string, valor: string, descripcion?: string): Promise<void> {
    try {
      // Validar datos de entrada
      const validation = this.validateConfiguracionData({ clave, valor, descripcion });
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const q = query(
        collection(db, this.COLLECTION_NAME), 
        where('clave', '==', clave), 
        limit(1)
      );
      
      const snapshot = await getDocs(q);
      const now = new Date();
      
      if (snapshot.empty) {
        // Crear nueva configuración
        await addDoc(collection(db, this.COLLECTION_NAME), {
          clave,
          valor,
          descripcion,
          createdAt: now,
          updatedAt: now
        });
      } else {
        // Actualizar configuración existente
        const docRef = doc(db, this.COLLECTION_NAME, snapshot.docs[0].id);
        await updateDoc(docRef, {
          valor,
          descripcion,
          updatedAt: now
        });
      }
    } catch (error) {
      console.error('Error setting configuration:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las configuraciones
   */
  static async getAll(filters?: ConfiguracionFilters): Promise<Configuracion[]> {
    try {
      const snapshot = await getDocs(collection(db, this.COLLECTION_NAME));
      let configuraciones = snapshot.docs.map(doc => this.mapDocumentToConfiguracion(doc));
      
      // Aplicar filtro de búsqueda si existe
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        configuraciones = configuraciones.filter(config => 
          config.clave.toLowerCase().includes(searchTerm) ||
          config.valor.toLowerCase().includes(searchTerm) ||
          (config.descripcion && config.descripcion.toLowerCase().includes(searchTerm))
        );
      }
      
      // Ordenar por clave
      configuraciones.sort((a, b) => a.clave.localeCompare(b.clave));
      
      return configuraciones;
    } catch (error) {
      console.error('Error getting all configurations:', error);
      throw new Error('Error al obtener las configuraciones');
    }
  }

  /**
   * Elimina una configuración
   */
  static async delete(clave: string): Promise<void> {
    try {
      if (!clave) {
        throw new Error('Clave de configuración es requerida');
      }

      const q = query(
        collection(db, this.COLLECTION_NAME), 
        where('clave', '==', clave), 
        limit(1)
      );
      
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        throw new Error('Configuración no encontrada');
      }
      
      await deleteDoc(doc(db, this.COLLECTION_NAME, snapshot.docs[0].id));
    } catch (error) {
      console.error('Error deleting configuration:', error);
      throw error;
    }
  }

  /**
   * Obtiene configuraciones agrupadas por categoría
   */
  static async getGrouped(): Promise<ConfiguracionGrouped> {
    try {
      const configuraciones = await this.getAll();
      const grouped: ConfiguracionGrouped = {};
      
      configuraciones.forEach(config => {
        const categoria = this.extractCategoria(config.clave);
        if (!grouped[categoria]) {
          grouped[categoria] = [];
        }
        grouped[categoria].push(config);
      });
      
      return grouped;
    } catch (error) {
      console.error('Error getting grouped configurations:', error);
      throw new Error('Error al obtener configuraciones agrupadas');
    }
  }

  /**
   * Obtiene configuraciones con tipos de datos inferidos
   */
  static async getWithTypes(): Promise<ConfiguracionConTipo[]> {
    try {
      const configuraciones = await this.getAll();
      
      return configuraciones.map(config => {
        const tipo = this.inferTipo(config.clave, config.valor);
        const valorParseado = this.parseValor(config.valor, tipo);
        
        return {
          ...config,
          tipo,
          valorParseado
        };
      });
    } catch (error) {
      console.error('Error getting configurations with types:', error);
      throw new Error('Error al obtener configuraciones con tipos');
    }
  }

  /**
   * Obtiene estadísticas de configuraciones
   */
  static async getStats(): Promise<ConfiguracionStats> {
    try {
      const configuraciones = await this.getAll();
      
      const conDescripcion = configuraciones.filter(config => 
        config.descripcion && config.descripcion.trim().length > 0
      ).length;
      
      const sinDescripcion = configuraciones.length - conDescripcion;
      
      const ultimaActualizacion = configuraciones.length > 0 
        ? new Date(Math.max(...configuraciones.map(c => c.updatedAt.getTime())))
        : null;
      
      return {
        total: configuraciones.length,
        conDescripcion,
        sinDescripcion,
        ultimaActualizacion
      };
    } catch (error) {
      console.error('Error getting configuration stats:', error);
      throw new Error('Error al obtener estadísticas de configuración');
    }
  }

  /**
   * Obtiene múltiples configuraciones por claves
   */
  static async getMultiple(claves: string[]): Promise<{ [clave: string]: string | null }> {
    try {
      if (!claves || claves.length === 0) {
        return {};
      }

      const result: { [clave: string]: string | null } = {};
      
      // Obtener todas las configuraciones de una vez
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('clave', 'in', claves)
      );
      
      const snapshot = await getDocs(q);
      
      // Inicializar todas las claves como null
      claves.forEach(clave => {
        result[clave] = null;
      });
      
      // Asignar valores encontrados
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        result[data.clave] = data.valor;
      });
      
      return result;
    } catch (error) {
      console.error('Error getting multiple configurations:', error);
      throw new Error('Error al obtener múltiples configuraciones');
    }
  }

  /**
   * Establece múltiples configuraciones
   */
  static async setMultiple(configuraciones: { [clave: string]: { valor: string; descripcion?: string } }): Promise<void> {
    try {
      const promises = Object.entries(configuraciones).map(([clave, data]) => 
        this.set(clave, data.valor, data.descripcion)
      );
      
      await Promise.all(promises);
    } catch (error) {
      console.error('Error setting multiple configurations:', error);
      throw new Error('Error al establecer múltiples configuraciones');
    }
  }

  /**
   * Busca configuraciones por término de búsqueda
   */
  static async search(searchTerm: string, limitCount: number = 10): Promise<Configuracion[]> {
    try {
      if (!searchTerm || searchTerm.trim().length < 2) {
        return [];
      }

      const allConfigs = await this.getAll();
      const term = searchTerm.toLowerCase();
      
      return allConfigs
        .filter(config => 
          config.clave.toLowerCase().includes(term) ||
          config.valor.toLowerCase().includes(term) ||
          (config.descripcion && config.descripcion.toLowerCase().includes(term))
        )
        .slice(0, limitCount);
    } catch (error) {
      console.error('Error searching configurations:', error);
      throw new Error('Error al buscar configuraciones');
    }
  }

  /**
   * Valida los datos de una configuración
   */
  private static validateConfiguracionData(data: { clave: string; valor: string; descripcion?: string }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar clave
    if (!data.clave || data.clave.trim().length === 0) {
      errors.push('Clave es obligatoria');
    } else if (data.clave.length > 100) {
      errors.push('La clave no puede tener más de 100 caracteres');
    } else if (!/^[a-zA-Z0-9._-]+$/.test(data.clave)) {
      errors.push('La clave solo puede contener letras, números, puntos, guiones y guiones bajos');
    }

    // Validar valor
    if (data.valor === undefined || data.valor === null) {
      errors.push('Valor es obligatorio');
    } else if (data.valor.length > 10000) {
      errors.push('El valor no puede tener más de 10000 caracteres');
    }

    // Validar descripción si está presente
    if (data.descripcion !== undefined && data.descripcion.trim().length > 0) {
      if (data.descripcion.length > 500) {
        errors.push('La descripción no puede tener más de 500 caracteres');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Extrae la categoría de una clave de configuración
   */
  private static extractCategoria(clave: string): string {
    const parts = clave.split('.');
    return parts.length > 1 ? parts[0] : 'general';
  }

  /**
   * Infiere el tipo de dato de una configuración
   */
  private static inferTipo(clave: string, valor: string): ConfiguracionTipo {
    const claveLower = clave.toLowerCase();
    
    // Inferir por clave
    if (claveLower.includes('email')) return 'email';
    if (claveLower.includes('url') || claveLower.includes('link')) return 'url';
    if (claveLower.includes('color')) return 'color';
    if (claveLower.includes('date') || claveLower.includes('fecha')) return 'date';
    if (claveLower.includes('json')) return 'json';
    
    // Inferir por valor
    if (valor === 'true' || valor === 'false') return 'boolean';
    if (!isNaN(Number(valor)) && valor !== '') return 'number';
    if (valor.startsWith('{') || valor.startsWith('[')) return 'json';
    if (/^#[0-9A-Fa-f]{6}$/.test(valor)) return 'color';
    if (/^\d{4}-\d{2}-\d{2}/.test(valor)) return 'date';
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) return 'email';
    if (/^https?:\/\//.test(valor)) return 'url';
    
    return 'string';
  }

  /**
   * Parsea un valor según su tipo
   */
  private static parseValor(valor: string, tipo: ConfiguracionTipo): any {
    try {
      switch (tipo) {
        case 'boolean':
          return valor === 'true';
        case 'number':
          return Number(valor);
        case 'json':
          return JSON.parse(valor);
        case 'date':
          return new Date(valor);
        default:
          return valor;
      }
    } catch (error) {
      return valor; // Retornar valor original si falla el parsing
    }
  }

  /**
   * Mapea un documento de Firestore a un objeto Configuracion
   */
  private static mapDocumentToConfiguracion(doc: QueryDocumentSnapshot): Configuracion {
    const data = doc.data();
    return {
      id: doc.id,
      clave: data.clave || '',
      valor: data.valor || '',
      descripcion: data.descripcion || undefined,
      updatedAt: data.updatedAt?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate()
    };
  }
}

// Exportar también las funciones individuales para compatibilidad con el código existente
export const configuracionService = {
  async get(clave: string): Promise<string | null> {
    return ConfiguracionService.get(clave);
  },

  async set(clave: string, valor: string, descripcion?: string): Promise<void> {
    return ConfiguracionService.set(clave, valor, descripcion);
  },

  async getAll(): Promise<Configuracion[]> {
    return ConfiguracionService.getAll();
  }
};
