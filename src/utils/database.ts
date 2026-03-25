import { adminDb } from './firebaseAdmin';
import { CategoriaService } from '../services/CategoriaService';
import { ItemService } from '../services/ItemService';
import { ConfiguracionService } from '../services/ConfiguracionService';
import { ClienteService } from '../services/ClienteService';
import { CotizacionService } from '../services/CotizacionService';

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

// Categorías Service
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
}

// Items Service
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
}

// Clientes Service

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
    return CotizacionService.getAll() as unknown as Promise<Cotizacion[]>;
  },

  async getById(id: string): Promise<Cotizacion | null> {
    return CotizacionService.getById(id) as unknown as Promise<Cotizacion | null>;
  },

  async create(cotizacion: Omit<Cotizacion, 'id' | 'createdAt' | 'updatedAt'>): Promise<Cotizacion> {
    return CotizacionService.create(cotizacion) as unknown as Promise<Cotizacion>;
  },

  async update(id: string, updates: Partial<Cotizacion>): Promise<void> {
    return CotizacionService.update(id, updates);
  },

  async delete(id: string): Promise<void> {
    return CotizacionService.delete(id);
  }
}

// Configuración Service
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
}

// Estadísticas Service
export const statsService = {
  async getDashboardStats() {
    try {
      console.log('Starting getDashboardStats with Admin SDK...')
      
      // Get total quotes
      const cotizacionesSnapshot = await adminDb.collection('cotizaciones').get()
      const totalCotizaciones = cotizacionesSnapshot.size
      
      // Get pending quotes
      const pendingSnapshot = await adminDb.collection('cotizaciones')
        .where('estado', 'in', ['borrador', 'enviada'])
        .get()
      const cotizacionesPendientes = pendingSnapshot.size
      
      // Get active items
      const activeItemsSnapshot = await adminDb.collection('items')
        .where('activo', '==', true)
        .get()
      const itemsActivos = activeItemsSnapshot.size
      
      // Get total clients
      const clientesSnapshot = await adminDb.collection('clientes').get()
      const totalClientes = clientesSnapshot.size
      
      // Get recent quotes with client data
      const recentSnapshot = await adminDb.collection('cotizaciones')
        .orderBy('createdAt', 'desc')
        .limit(5)
        .get()
      
      const cotizacionesRecientes = await Promise.all(
        recentSnapshot.docs.map(async (docSnap) => {
          const data = docSnap.data() || {}
          const cotizacion: any = {
            id: docSnap.id,
            ...data,
            fecha: data.fecha?.toDate?.() || (data.fecha ? new Date(data.fecha) : null),
            fechaEvento: data.fechaEvento?.toDate?.() || (data.fechaEvento ? new Date(data.fechaEvento) : null),
            validoHasta: data.validoHasta?.toDate?.() || (data.validoHasta ? new Date(data.validoHasta) : null),
            createdAt: data.createdAt?.toDate?.() || (data.createdAt ? new Date(data.createdAt) : null),
            updatedAt: data.updatedAt?.toDate?.() || (data.updatedAt ? new Date(data.updatedAt) : null)
          }
          
          // Get client data
          const clientId = data.cliente_id || data.clienteId;
          if (clientId) {
            const clienteDoc = await adminDb.collection('clientes').doc(clientId).get()
            if (clienteDoc.exists) {
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
