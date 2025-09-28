-- BLS Cotizador Database Schema
-- Create all tables for the audiovisual events quote management system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create categorias table
CREATE TABLE IF NOT EXISTS categorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    orden INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create items table
CREATE TABLE IF NOT EXISTS items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    categoria_id UUID NOT NULL REFERENCES categorias(id) ON DELETE CASCADE,
    codigo VARCHAR(50),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT[],
    unidad VARCHAR(50) NOT NULL DEFAULT 'unidad',
    precio_base DECIMAL(10,2) NOT NULL,
    variantes JSONB,
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clientes table
CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    empresa VARCHAR(255),
    email VARCHAR(255),
    telefono VARCHAR(50),
    direccion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create venues table
CREATE TABLE IF NOT EXISTS venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    direccion TEXT,
    capacidad INTEGER,
    caracteristicas JSONB,
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cotizaciones table
CREATE TABLE IF NOT EXISTS cotizaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero VARCHAR(50) NOT NULL UNIQUE,
    cliente_id UUID NOT NULL REFERENCES clientes(id),
    venue_id UUID REFERENCES venues(id),
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_evento DATE,
    duracion_horas INTEGER,
    estado VARCHAR(50) NOT NULL DEFAULT 'borrador',
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    descuento DECIMAL(5,2) NOT NULL DEFAULT 0,
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    observaciones TEXT,
    vigencia_dias INTEGER NOT NULL DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cotizacion_items table
CREATE TABLE IF NOT EXISTS cotizacion_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cotizacion_id UUID NOT NULL REFERENCES cotizaciones(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items(id),
    cantidad INTEGER NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(10,2) NOT NULL,
    descuento DECIMAL(5,2) NOT NULL DEFAULT 0,
    subtotal DECIMAL(10,2) NOT NULL,
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create configuracion table
CREATE TABLE IF NOT EXISTS configuracion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clave VARCHAR(100) NOT NULL UNIQUE,
    valor TEXT NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(50) NOT NULL DEFAULT 'string',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table for authentication
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    nombre VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL DEFAULT 'usuario',
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_items_categoria_id ON items(categoria_id);
CREATE INDEX IF NOT EXISTS idx_items_activo ON items(activo);
CREATE INDEX IF NOT EXISTS idx_venues_cliente_id ON venues(cliente_id);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_cliente_id ON cotizaciones(cliente_id);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_estado ON cotizaciones(estado);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_numero ON cotizaciones(numero);
CREATE INDEX IF NOT EXISTS idx_cotizacion_items_cotizacion_id ON cotizacion_items(cotizacion_id);
CREATE INDEX IF NOT EXISTS idx_cotizacion_items_item_id ON cotizacion_items(item_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cotizaciones_updated_at BEFORE UPDATE ON cotizaciones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_configuracion_updated_at BEFORE UPDATE ON configuracion
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default configuration values
INSERT INTO configuracion (clave, valor, descripcion, tipo) VALUES
('empresa_nombre', 'BLS - Servicios Audiovisuales', 'Nombre de la empresa', 'string'),
('empresa_direccion', 'Buenos Aires, Argentina', 'Dirección de la empresa', 'string'),
('empresa_telefono', '+54 11 1234-5678', 'Teléfono de contacto', 'string'),
('empresa_email', 'info@bls.com.ar', 'Email de contacto', 'string'),
('cotizacion_vigencia_default', '30', 'Días de vigencia por defecto para cotizaciones', 'number'),
('inflacion_anual', '120', 'Porcentaje de inflación anual estimado', 'number'),
('ultima_actualizacion_precios', NOW()::text, 'Fecha de última actualización de precios', 'datetime'),
('margen_ganancia_default', '40', 'Margen de ganancia por defecto (%)', 'number')
ON CONFLICT (clave) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE cotizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE cotizacion_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Create policies (for now, allow all authenticated users)
-- In production, these should be more restrictive based on user roles

CREATE POLICY "Allow authenticated users to view categorias" ON categorias
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage categorias" ON categorias
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to view items" ON items
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage items" ON items
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to view clientes" ON clientes
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage clientes" ON clientes
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to view venues" ON venues
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage venues" ON venues
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to view cotizaciones" ON cotizaciones
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage cotizaciones" ON cotizaciones
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to view cotizacion_items" ON cotizacion_items
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage cotizacion_items" ON cotizacion_items
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to view configuracion" ON configuracion
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage configuracion" ON configuracion
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to view usuarios" ON usuarios
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage usuarios" ON usuarios
    FOR ALL USING (auth.role() = 'authenticated');
