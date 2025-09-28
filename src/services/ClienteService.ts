/**
 * ClienteService - Servicio mejorado para gestión de clientes
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
export interface Cliente {
  id: string;
  nombre: string;
  empresa?: string;
  email: string;
  telefono?: string;
  direccion?: string;
  activo: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface ClienteCreateData {
  nombre: string;
  empresa?: string;
  email: string;
  telefono?: string;
  direccion?: string;
  activo?: boolean;
}

export interface ClienteUpdateData {
  nombre?: string;
  empresa?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  activo?: boolean;
}

export interface ClienteFilters {
  activo?: boolean;
  empresa?: string;
  search?: string;
}

export interface ClienteSearchResult {
  clientes: Cliente[];
  total: number;
  hasMore: boolean;
}

export interface ClienteStats {
  total: number;
  activos: number;
  inactivos: number;
  conEmpresa: number;
  sinEmpresa: number;
}

/**
 * ClienteService mejorado con validaciones, búsqueda avanzada y estadísticas
 */
export class ClienteService {
  private static readonly COLLECTION_NAME = 'clientes';

  /**
   * Obtiene todos los clientes con filtros opcionales (optimizado con caché)
   */
  static async getAll(filters?: ClienteFilters): Promise<Cliente[]> {
    try {
      // Check cache first
      const cacheKey = CacheKeys.clients(filters);
      const cachedData = cache.get<Cliente[]>(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      let q = query(collection(db, this.COLLECTION_NAME), orderBy('nombre', 'asc'));
      
      // Aplicar filtros
      if (filters?.activo !== undefined) {
        q = query(q, where('activo', '==', filters.activo));
      }
      
      if (filters?.empresa) {
        q = query(q, where('empresa', '==', filters.empresa));
      }
      
      const snapshot = await getDocs(q);
      let clientes = snapshot.docs.map(doc => this.mapDocumentToCliente(doc));
      
      // Aplicar filtro de búsqueda si existe
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        clientes = clientes.filter(cliente => 
          cliente.nombre.toLowerCase().includes(searchTerm) ||
          cliente.email.toLowerCase().includes(searchTerm) ||
          (cliente.empresa && cliente.empresa.toLowerCase().includes(searchTerm)) ||
          (cliente.telefono && cliente.telefono.includes(searchTerm))
        );
      }
      
      // Cache the result
      cache.set(cacheKey, clientes, CacheTTL.MEDIUM);
      
      return clientes;
    } catch (error) {
      console.error('Error getting all clients:', error);
      throw new Error('Error al obtener los clientes');
    }
  }

  /**
   * Obtiene un cliente por ID (optimizado con caché)
   */
  static async getById(id: string): Promise<Cliente | null> {
    try {
      if (!id) {
        throw new Error('ID de cliente es requerido');
      }

      // Check cache first
      const cacheKey = CacheKeys.clientById(id);
      const cachedData = cache.get<Cliente>(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      const docSnap = await getDoc(doc(db, this.COLLECTION_NAME, id));
      if (!docSnap.exists()) {
        return null;
      }
      
      const cliente = this.mapDocumentToCliente(docSnap);
      
      // Cache the result
      cache.set(cacheKey, cliente, CacheTTL.MEDIUM);
      
      return cliente;
    } catch (error) {
      console.error('Error getting client by ID:', error);
      throw new Error('Error al obtener el cliente');
    }
  }

  /**
   * Crea un nuevo cliente con validación
   */
  static async create(clienteData: ClienteCreateData): Promise<Cliente> {
    try {
      // Validar datos de entrada
      const validation = this.validateClienteData(clienteData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Verificar que el email no esté en uso
      const existingClient = await this.getByEmail(clienteData.email);
      if (existingClient) {
        throw new Error('Ya existe un cliente con este email');
      }

      const now = new Date();
      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), {
        ...clienteData,
        activo: clienteData.activo ?? true,
        createdAt: now,
        updatedAt: now
      });
      
      const docSnap = await getDoc(docRef);
      const newCliente = this.mapDocumentToCliente(docSnap);
      
      // Invalidate related cache
      invalidateRelatedCache('client');
      
      return newCliente;
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  }

  /**
   * Actualiza un cliente existente
   */
  static async update(id: string, updates: ClienteUpdateData): Promise<void> {
    try {
      if (!id) {
        throw new Error('ID de cliente es requerido');
      }

      // Validar datos de actualización
      const validation = this.validateClienteData(updates, true);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Si se está actualizando el email, verificar que no esté en uso
      if (updates.email) {
        // Primero obtener el cliente actual para comparar emails
        const currentClient = await this.getById(id);
        if (!currentClient) {
          throw new Error('Cliente no encontrado');
        }
        
        // Solo validar si el email está cambiando
        if (currentClient.email !== updates.email) {
          const existingClient = await this.getByEmail(updates.email);
          if (existingClient && existingClient.id !== id) {
            throw new Error('Ya existe un cliente con este email');
          }
        }
      }

      const docRef = doc(db, this.COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date()
      });
      
      // Invalidate related cache
      invalidateRelatedCache('client');
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  }

  /**
   * Elimina un cliente (soft delete marcándolo como inactivo)
   */
  static async delete(id: string): Promise<void> {
    try {
      if (!id) {
        throw new Error('ID de cliente es requerido');
      }

      // Soft delete - marcar como inactivo en lugar de eliminar
      await this.update(id, { activo: false });
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  }

  /**
   * Elimina un cliente permanentemente (solo para casos especiales)
   */
  static async deletePermanently(id: string): Promise<void> {
    try {
      if (!id) {
        throw new Error('ID de cliente es requerido');
      }

      await deleteDoc(doc(db, this.COLLECTION_NAME, id));
    } catch (error) {
      console.error('Error permanently deleting client:', error);
      throw error;
    }
  }

  /**
   * Busca clientes por término de búsqueda
   */
  static async search(searchTerm: string, limitCount: number = 10): Promise<Cliente[]> {
    try {
      if (!searchTerm || searchTerm.trim().length < 2) {
        return [];
      }

      const allClients = await this.getAll();
      const term = searchTerm.toLowerCase();
      
      return allClients
        .filter(cliente => 
          cliente.nombre.toLowerCase().includes(term) ||
          cliente.email.toLowerCase().includes(term) ||
          (cliente.empresa && cliente.empresa.toLowerCase().includes(term)) ||
          (cliente.telefono && cliente.telefono.includes(term))
        )
        .slice(0, limitCount);
    } catch (error) {
      console.error('Error searching clients:', error);
      throw new Error('Error al buscar clientes');
    }
  }

  /**
   * Obtiene un cliente por email
   */
  static async getByEmail(email: string): Promise<Cliente | null> {
    try {
      if (!email) {
        return null;
      }

      const q = query(
        collection(db, this.COLLECTION_NAME), 
        where('email', '==', email.toLowerCase()),
        limit(1)
      );
      
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return null;
      }
      
      return this.mapDocumentToCliente(snapshot.docs[0]);
    } catch (error) {
      console.error('Error getting client by email:', error);
      throw new Error('Error al buscar cliente por email');
    }
  }

  /**
   * Obtiene estadísticas de clientes
   */
  static async getStats(): Promise<ClienteStats> {
    try {
      const allClients = await this.getAll();
      
      return {
        total: allClients.length,
        activos: allClients.filter(c => c.activo).length,
        inactivos: allClients.filter(c => !c.activo).length,
        conEmpresa: allClients.filter(c => c.empresa && c.empresa.trim().length > 0).length,
        sinEmpresa: allClients.filter(c => !c.empresa || c.empresa.trim().length === 0).length
      };
    } catch (error) {
      console.error('Error getting client stats:', error);
      throw new Error('Error al obtener estadísticas de clientes');
    }
  }

  /**
   * Obtiene clientes activos únicamente
   */
  static async getActive(): Promise<Cliente[]> {
    return this.getAll({ activo: true });
  }

  /**
   * Reactiva un cliente (marca como activo)
   */
  static async reactivate(id: string): Promise<void> {
    await this.update(id, { activo: true });
  }

  /**
   * Valida los datos de un cliente
   */
  private static validateClienteData(data: Partial<ClienteCreateData | ClienteUpdateData>, isUpdate: boolean = false): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar nombre
    if (data.nombre !== undefined) {
      const nameValidation = ValidationHelper.validateName(data.nombre, 'Nombre del cliente');
      errors.push(...nameValidation.errors);
    }

    // Validar email
    if (data.email !== undefined) {
      const emailValidation = ValidationHelper.validateEmail(data.email);
      errors.push(...emailValidation.errors);
    }

    // Validar teléfono si está presente
    if (data.telefono !== undefined && data.telefono.trim().length > 0) {
      const phoneValidation = ValidationHelper.validatePhone(data.telefono, 'Teléfono');
      errors.push(...phoneValidation.errors);
    }

    // Para creación, nombre y email son obligatorios
    if (!isUpdate) {
      if (!data.nombre) {
        errors.push('Nombre es obligatorio');
      }
      if (!data.email) {
        errors.push('Email es obligatorio');
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
  private static mapDocumentToCliente(doc: QueryDocumentSnapshot): Cliente {
    const data = doc.data();
    return {
      id: doc.id,
      nombre: data.nombre || '',
      empresa: data.empresa || undefined,
      email: data.email || '',
      telefono: data.telefono || undefined,
      direccion: data.direccion || undefined,
      activo: data.activo !== false, // Default to true if not specified
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate()
    };
  }
}

// Exportar también las funciones individuales para compatibilidad con el código existente
export const clienteService = {
  async getAll(): Promise<Cliente[]> {
    return ClienteService.getAll();
  },

  async getById(id: string): Promise<Cliente | null> {
    return ClienteService.getById(id);
  },

  async create(cliente: Omit<Cliente, 'id'>): Promise<Cliente> {
    return ClienteService.create(cliente);
  },

  async update(id: string, updates: Partial<Cliente>): Promise<void> {
    return ClienteService.update(id, updates);
  },

  async delete(id: string): Promise<void> {
    return ClienteService.delete(id);
  }
};
