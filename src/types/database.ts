export interface Database {
  public: {
    Tables: {
      categorias: {
        Row: {
          id: string
          nombre: string
          descripcion: string | null
          orden: number
          created_at: string
        }
        Insert: {
          id?: string
          nombre: string
          descripcion?: string | null
          orden?: number
          created_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          descripcion?: string | null
          orden?: number
          created_at?: string
        }
      }
      items: {
        Row: {
          id: string
          categoria_id: string
          codigo: string | null
          nombre: string
          descripcion: string[] | null
          unidad: string
          precio_base: number
          variantes: any | null
          activo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          categoria_id: string
          codigo?: string | null
          nombre: string
          descripcion?: string[] | null
          unidad?: string
          precio_base: number
          variantes?: any | null
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          categoria_id?: string
          codigo?: string | null
          nombre?: string
          descripcion?: string[] | null
          unidad?: string
          precio_base?: number
          variantes?: any | null
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      clientes: {
        Row: {
          id: string
          nombre: string
          empresa: string | null
          email: string | null
          telefono: string | null
          direccion: string | null
          created_at: string
        }
        Insert: {
          id?: string
          nombre: string
          empresa?: string | null
          email?: string | null
          telefono?: string | null
          direccion?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          empresa?: string | null
          email?: string | null
          telefono?: string | null
          direccion?: string | null
          created_at?: string
        }
      }
      venues: {
        Row: {
          id: string
          nombre: string
          direccion: string | null
          capacidad: number | null
          caracteristicas: any | null
          cliente_id: string
        }
        Insert: {
          id?: string
          nombre: string
          direccion?: string | null
          capacidad?: number | null
          caracteristicas?: any | null
          cliente_id: string
        }
        Update: {
          id?: string
          nombre?: string
          direccion?: string | null
          capacidad?: number | null
          caracteristicas?: any | null
          cliente_id?: string
        }
      }
      cotizaciones: {
        Row: {
          id: string
          numero: string
          cliente_id: string
          venue_id: string | null
          titulo: string
          descripcion: string | null
          fecha_evento: string | null
          lugar_evento: string | null
          duracion_horas: number | null
          estado: string
          subtotal: number
          descuento: number
          total: number
          observaciones: string | null
          condiciones: string | null
          vigencia_dias: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          numero?: string
          cliente_id: string
          venue_id?: string | null
          titulo: string
          descripcion?: string | null
          fecha_evento?: string | null
          lugar_evento?: string | null
          duracion_horas?: number | null
          estado?: string
          subtotal?: number
          descuento?: number
          total?: number
          observaciones?: string | null
          condiciones?: string | null
          vigencia_dias?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          numero?: string
          cliente_id?: string
          venue_id?: string | null
          titulo?: string
          descripcion?: string | null
          fecha_evento?: string | null
          lugar_evento?: string | null
          duracion_horas?: number | null
          estado?: string
          subtotal?: number
          descuento?: number
          total?: number
          observaciones?: string | null
          condiciones?: string | null
          vigencia_dias?: number
          created_at?: string
          updated_at?: string
        }
      }
      cotizacion_items: {
        Row: {
          id: string
          cotizacion_id: string
          item_id: string
          cantidad: number
          precio_unitario: number
          descuento: number
          subtotal: number
          observaciones: string | null
          created_at: string
        }
        Insert: {
          id?: string
          cotizacion_id: string
          item_id: string
          cantidad?: number
          precio_unitario: number
          descuento?: number
          subtotal: number
          observaciones?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          cotizacion_id?: string
          item_id?: string
          cantidad?: number
          precio_unitario?: number
          descuento?: number
          subtotal?: number
          observaciones?: string | null
          created_at?: string
        }
      }
      configuracion: {
        Row: {
          clave: string
          valor: any
          descripcion: string | null
          updated_at: string
        }
        Insert: {
          clave: string
          valor: any
          descripcion?: string | null
          updated_at?: string
        }
        Update: {
          clave?: string
          valor?: any
          descripcion?: string | null
          updated_at?: string
        }
      }
    }
  }
}

export interface Item {
  id: string
  categoria_id: string
  codigo?: string
  nombre: string
  descripcion?: string[]
  unidad: string
  precio_base: number
  variantes?: any
  activo: boolean
  categoria?: Categoria
}

export interface Categoria {
  id: string
  nombre: string
  descripcion?: string
  orden: number
}

export interface Cliente {
  id: string
  nombre: string
  empresa?: string
  email?: string
  telefono?: string
  direccion?: string
}

export interface Venue {
  id: string
  nombre: string
  direccion?: string
  capacidad?: number
  caracteristicas?: any
  cliente_id: string
}

export interface Cotizacion {
  id: string
  numero: string
  cliente_id: string
  venue_id?: string
  fecha_evento?: string
  estado: string
  subtotal?: number
  iva?: number
  total?: number
  observaciones?: string
  created_at: string
  updated_at: string
  cliente?: Cliente
  venue?: Venue
  items?: CotizacionItem[]
}

export interface CotizacionItem {
  id: string
  cotizacion_id: string
  item_id: string
  cantidad: number
  precio_unitario: number
  precio_total: number
  notas?: string
  item?: Item
}
