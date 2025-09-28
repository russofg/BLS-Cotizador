import { db } from './firebase'
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
  limit
} from 'firebase/firestore'

// Types
export interface Categoria {
  id: string
  nombre: string
  descripcion?: string
  orden: number
  createdAt: Date
}

export interface Item {
  id: string
  categoriaId: string
  codigo?: string
  nombre: string
  descripcion?: string[]
  unidad: string
  precioBase: number
  variantes?: any
  activo: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Cliente {
  id: string
  nombre: string
  empresa?: string
  email: string
  telefono?: string
  direccion?: string
  activo: boolean
  createdAt: Date
}

export interface Venue {
  id: string
  clienteId: string
  nombre: string
  direccion: string
  capacidad?: number
  contacto?: string
  telefono?: string
  email?: string
  notas?: string
  activo: boolean
  createdAt: Date
}

export interface Cotizacion {
  id: string
  clienteId: string
  venueId?: string | null
  numero: string
  fecha: Date
  fechaEvento?: Date | null
  fechaEventoFin?: Date | null
  estado: 'borrador' | 'enviada' | 'aprobada' | 'rechazada' | 'vencida'
  titulo: string
  descripcion?: string | null
  subtotal: number
  impuestos: number
  total: number
  validoHasta?: Date | null
  notas?: string | null
  duracion_dias?: number
  duracion_horas?: number
  requiere_armado?: boolean
  items?: CotizacionItemData[] // Agregamos el campo items como opcional
  createdAt: Date
  updatedAt: Date
}

// Interfaz para items dentro de cotizaciones (más simple que CotizacionItem)
export interface CotizacionItemData {
  descripcion: string
  cantidad: number
  precio_unitario: number
  total: number
  descuento?: number
  observaciones?: string
}

export interface CotizacionItem {
  id: string
  cotizacionId: string
  itemId: string
  cantidad: number
  precioUnitario: number
  descuento?: number
  subtotal: number
  descripcionPersonalizada?: string
}

export interface Configuracion {
  id: string
  clave: string
  valor: string
  descripcion?: string
  updatedAt: Date
}

// Categorías Service - Mantener compatibilidad mientras migramos gradualmente
export const categoriaService = {
  async getAll(): Promise<Categoria[]> {
    // Usar el nuevo servicio mejorado internamente
    const { CategoriaService } = await import('../services/CategoriaService');
    return CategoriaService.getAll();
  },

  async create(categoria: Omit<Categoria, 'id'>): Promise<Categoria> {
    // Usar el nuevo servicio mejorado internamente
    const { CategoriaService } = await import('../services/CategoriaService');
    return CategoriaService.create(categoria);
  },

  async update(id: string, updates: Partial<Categoria>): Promise<void> {
    // Usar el nuevo servicio mejorado internamente
    const { CategoriaService } = await import('../services/CategoriaService');
    return CategoriaService.update(id, updates);
  },

  async delete(id: string): Promise<void> {
    // Usar el nuevo servicio mejorado internamente
    const { CategoriaService } = await import('../services/CategoriaService');
    return CategoriaService.delete(id);
  }
}

// Items Service - Mantener compatibilidad mientras migramos gradualmente
export const itemService = {
  async getAll(filters?: { categoria?: string; activo?: boolean }): Promise<Item[]> {
    // Usar el nuevo servicio mejorado internamente
    const { ItemService } = await import('../services/ItemService');
    return ItemService.getAll(filters);
  },

  async getById(id: string): Promise<Item | null> {
    // Usar el nuevo servicio mejorado internamente
    const { ItemService } = await import('../services/ItemService');
    return ItemService.getById(id);
  },

  async create(item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>): Promise<Item> {
    // Usar el nuevo servicio mejorado internamente
    const { ItemService } = await import('../services/ItemService');
    return ItemService.create(item);
  },

  async update(id: string, updates: Partial<Item>): Promise<void> {
    // Usar el nuevo servicio mejorado internamente
    const { ItemService } = await import('../services/ItemService');
    return ItemService.update(id, updates);
  },

  async delete(id: string): Promise<void> {
    // Usar el nuevo servicio mejorado internamente
    const { ItemService } = await import('../services/ItemService');
    return ItemService.delete(id);
  },

  async search(searchTerm: string): Promise<Item[]> {
    // Usar el nuevo servicio mejorado internamente
    const { ItemService } = await import('../services/ItemService');
    return ItemService.search(searchTerm);
  }
}

// Clientes Service - Mantener compatibilidad mientras migramos gradualmente
import { ClienteService } from '../services/ClienteService';

export const clienteService = {
  async getAll(): Promise<Cliente[]> {
    // Usar el nuevo servicio mejorado internamente
    return ClienteService.getAll();
  },

  async getById(id: string): Promise<Cliente | null> {
    // Usar el nuevo servicio mejorado internamente
    return ClienteService.getById(id);
  },

  async create(cliente: Omit<Cliente, 'id'>): Promise<Cliente> {
    // Usar el nuevo servicio mejorado internamente
    return ClienteService.create(cliente);
  },

  async update(id: string, updates: Partial<Cliente>): Promise<void> {
    // Usar el nuevo servicio mejorado internamente
    return ClienteService.update(id, updates);
  },

  async delete(id: string): Promise<void> {
    // Usar el nuevo servicio mejorado internamente
    return ClienteService.delete(id);
  }
}

// Cotizaciones Service
export const cotizacionService = {
  async getAll(): Promise<Cotizacion[]> {
    const q = query(collection(db, 'cotizaciones'), orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      fecha: doc.data().fecha?.toDate(),
      fechaEvento: doc.data().fechaEvento?.toDate(),
      validoHasta: doc.data().validoHasta?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    })) as Cotizacion[]
  },

  async getById(id: string): Promise<Cotizacion | null> {
    const docSnap = await getDoc(doc(db, 'cotizaciones', id))
    if (!docSnap.exists()) return null
    
    return {
      id: docSnap.id,
      ...docSnap.data(),
      fecha: docSnap.data().fecha?.toDate(),
      fechaEvento: docSnap.data().fechaEvento?.toDate(),
      validoHasta: docSnap.data().validoHasta?.toDate(),
      createdAt: docSnap.data().createdAt?.toDate(),
      updatedAt: docSnap.data().updatedAt?.toDate()
    } as Cotizacion
  },

  async create(cotizacion: Omit<Cotizacion, 'id' | 'createdAt' | 'updatedAt'>): Promise<Cotizacion> {
    const now = new Date()
    const docRef = await addDoc(collection(db, 'cotizaciones'), {
      ...cotizacion,
      createdAt: now,
      updatedAt: now
    })
    
    const docSnap = await getDoc(docRef)
    return {
      id: docRef.id,
      ...docSnap.data(),
      fecha: docSnap.data()?.fecha?.toDate(),
      fechaEvento: docSnap.data()?.fechaEvento?.toDate(),
      validoHasta: docSnap.data()?.validoHasta?.toDate(),
      createdAt: docSnap.data()?.createdAt?.toDate(),
      updatedAt: docSnap.data()?.updatedAt?.toDate()
    } as Cotizacion
  },

  async update(id: string, updates: Partial<Cotizacion>): Promise<void> {
    const docRef = doc(db, 'cotizaciones', id)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date()
    })
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, 'cotizaciones', id))
  }
}

// Configuración Service - Mantener compatibilidad mientras migramos gradualmente
export const configuracionService = {
  async get(clave: string): Promise<string | null> {
    // Usar el nuevo servicio mejorado internamente
    const { ConfiguracionService } = await import('../services/ConfiguracionService');
    return ConfiguracionService.get(clave);
  },

  async set(clave: string, valor: string, descripcion?: string): Promise<void> {
    // Usar el nuevo servicio mejorado internamente
    const { ConfiguracionService } = await import('../services/ConfiguracionService');
    return ConfiguracionService.set(clave, valor, descripcion);
  },

  async getAll(): Promise<Configuracion[]> {
    // Usar el nuevo servicio mejorado internamente
    const { ConfiguracionService } = await import('../services/ConfiguracionService');
    return ConfiguracionService.getAll();
  }
}

// Estadísticas Service
export const statsService = {
  async getDashboardStats() {
    try {
      console.log('Starting getDashboardStats...')
      
      // Get total quotes
      const cotizacionesSnapshot = await getDocs(collection(db, 'cotizaciones'))
      const totalCotizaciones = cotizacionesSnapshot.size
      
      // Get pending quotes
      const pendingQuery = query(
        collection(db, 'cotizaciones'), 
        where('estado', 'in', ['borrador', 'enviada'])
      )
      const pendingSnapshot = await getDocs(pendingQuery)
      const cotizacionesPendientes = pendingSnapshot.size
      
      // Get active items
      const activeItemsQuery = query(
        collection(db, 'items'), 
        where('activo', '==', true)
      )
      const activeItemsSnapshot = await getDocs(activeItemsQuery)
      const itemsActivos = activeItemsSnapshot.size
      
      // Get total clients
      const clientesSnapshot = await getDocs(collection(db, 'clientes'))
      const totalClientes = clientesSnapshot.size
      
      // Get recent quotes with client data
      const recentQuery = query(
        collection(db, 'cotizaciones'),
        orderBy('createdAt', 'desc'),
        limit(5)
      )
      const recentSnapshot = await getDocs(recentQuery)
      
      const cotizacionesRecientes = await Promise.all(
        recentSnapshot.docs.map(async (docSnap) => {
          const data = docSnap.data()
          const cotizacion: any = {
            id: docSnap.id,
            ...data,
            fecha: data.fecha?.toDate(),
            fechaEvento: data.fechaEvento?.toDate(),
            validoHasta: data.validoHasta?.toDate(),
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate()
          }
          
          // Get client data
          // Check both cliente_id and clienteId fields for compatibility
          const clientId = data.cliente_id || data.clienteId;
          if (clientId) {
            const clienteDoc = await getDoc(doc(db, 'clientes', clientId))
            if (clienteDoc.exists()) {
              cotizacion.cliente = {
                id: clienteDoc.id,
                ...clienteDoc.data()
              }
            }
          }
          
          return cotizacion
        })
      )
      
      const result = {
        totalCotizaciones,
        cotizacionesPendientes,
        itemsActivos,
        totalClientes,
        cotizacionesRecientes
      }
      
      console.log('Dashboard stats result:', result)
      return result
      
    } catch (error) {
      console.error('Error in getDashboardStats:', error)
      return {
        totalCotizaciones: 0,
        cotizacionesPendientes: 0,
        itemsActivos: 0,
        totalClientes: 0,
        cotizacionesRecientes: []
      }
    }
  }
}
