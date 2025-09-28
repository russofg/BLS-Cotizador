-- Insert categories and items from parsed data
-- This script should be run after the schema.sql

-- Insert categories first (removed ON CONFLICT since there's no UNIQUE constraint on nombre)
INSERT INTO categorias (nombre, descripcion, orden) VALUES
('Sistema de Sonido', 'Equipos y servicios de audio para eventos', 1),
('Equipos de Video', 'Proyección, pantallas y equipos audiovisuales', 2),
('Iluminación', 'Sistemas de iluminación para eventos', 3),
('Streaming y Grabación', 'Servicios de transmisión en vivo y grabación', 4),
('Plataformas y Escenarios', 'Estructuras para eventos', 5),
('Generación Eléctrica', 'Equipos de energía y alimentación', 6),
('Mobiliario', 'Mesas, sillas y mobiliario para eventos', 7),
('Personal Técnico', 'Recursos humanos especializados', 8),
('Servicios Adicionales', 'Servicios complementarios', 9),
('Equipos de Comunicación', 'Sistemas de intercomunicación', 10),
('Control y Automatización', 'Sistemas de control remoto', 11),
('Transporte', 'Logística y transporte de equipos', 12),
('Seguros', 'Cobertura de equipos y responsabilidad civil', 13),
('Alimentación y Catering', 'Servicios de alimentación', 14),
('Hospedaje', 'Alojamiento para personal técnico', 15),
('Decoración', 'Elementos decorativos y ambientación', 16);

-- Get category IDs for reference
DO $$
DECLARE
    cat_sonido UUID;
    cat_video UUID;
    cat_iluminacion UUID;
    cat_streaming UUID;
    cat_plataformas UUID;
    cat_generacion UUID;
    cat_mobiliario UUID;
    cat_personal UUID;
    cat_servicios UUID;
    cat_comunicacion UUID;
    cat_control UUID;
    cat_transporte UUID;
    cat_seguros UUID;
    cat_catering UUID;
    cat_hospedaje UUID;
    cat_decoracion UUID;
BEGIN
    SELECT id INTO cat_sonido FROM categorias WHERE nombre = 'Sistema de Sonido';
    SELECT id INTO cat_video FROM categorias WHERE nombre = 'Equipos de Video';
    SELECT id INTO cat_iluminacion FROM categorias WHERE nombre = 'Iluminación';
    SELECT id INTO cat_streaming FROM categorias WHERE nombre = 'Streaming y Grabación';
    SELECT id INTO cat_plataformas FROM categorias WHERE nombre = 'Plataformas y Escenarios';
    SELECT id INTO cat_generacion FROM categorias WHERE nombre = 'Generación Eléctrica';
    SELECT id INTO cat_mobiliario FROM categorias WHERE nombre = 'Mobiliario';
    SELECT id INTO cat_personal FROM categorias WHERE nombre = 'Personal Técnico';
    SELECT id INTO cat_servicios FROM categorias WHERE nombre = 'Servicios Adicionales';
    SELECT id INTO cat_comunicacion FROM categorias WHERE nombre = 'Equipos de Comunicación';
    SELECT id INTO cat_control FROM categorias WHERE nombre = 'Control y Automatización';
    SELECT id INTO cat_transporte FROM categorias WHERE nombre = 'Transporte';
    SELECT id INTO cat_seguros FROM categorias WHERE nombre = 'Seguros';
    SELECT id INTO cat_catering FROM categorias WHERE nombre = 'Alimentación y Catering';
    SELECT id INTO cat_hospedaje FROM categorias WHERE nombre = 'Hospedaje';
    SELECT id INTO cat_decoracion FROM categorias WHERE nombre = 'Decoración';

    -- Insert items with actual data from parsed_items.json
    INSERT INTO items (categoria_id, nombre, descripcion, precio_base, unidad) VALUES
    -- Sistema de Sonido
    (cat_sonido, 'Sistema de Sonido para Cocktail', ARRAY[
        'Procesamiento de sonido',
        '2 Cajas acústicas JBL Control 28',
        '1 Micrófono inalámbrico de mano SENNHEISER - UHF',
        'Consola de sonido con múltiples entradas',
        'Reproductor para música funcional',
        'Instalación'
    ], 310000, 'servicio'),
    
    (cat_sonido, 'Sistema de Sonido como Refuerzo de Palabra', ARRAY[
        'Procesamiento de sonido',
        '4 Cajas acústicas JBL EON – 305 15"',
        '2 Micrófonos para Podio GOOSENECK',
        '2 Micrófonos inalámbricos de mano SENNHEISER - UHF',
        'Rack de potencias incluyendo Potencias CROWN XLS 2500',
        'Rack de procesadores incluyendo Ecualizadores DBX 231',
        'Consola de sonido SOUNDCRAFT con múltiples entradas',
        'Reproductor para música funcional',
        'Conexión de audio Balanceada / Direct Box (Input video / Notebook disertante)',
        'Operador responsable, uniformado, durante todo el evento'
    ], 924190, 'servicio'),
    
    (cat_sonido, 'Sistema de Sonido para Conferencia', ARRAY[
        'Procesamiento de sonido',
        'Sistema de sonido 4.1 – LD 28 Line Array',
        '2 Cajas acústicas Subwoofer 2 x 8" Bass Reflex',
        '2 Cajas acústicas Vertical Array 8 x 3" + 2 Driver 1"',
        '4 Cajas acústicas JBL EON – 305 15¨ para sonido perimetral',
        '2 Micrófonos para Podio GOOSENECK',
        '2 Micrófonos inalámbricos de mano SENNHEISER - UHF',
        '2 Micrófonos inalámbricos corbateros / Head Set SENNHEISER -UHF',
        '1 Splitter / Distribuidor de Antenas RF',
        'Rack de potencias incluyendo Potencias CROWN XLS 2500',
        'Consola de sonido DIGITAL MIDAS 32 R LIVE',
        'Reproductor para música funcional',
        'Conexión de audio Balanceada / Direct Box (Input video / Notebook disertante)',
        'Operador responsable, uniformado, durante todo el evento'
    ], 1848380, 'servicio'),
    
    -- Equipos de Video
    (cat_video, 'Proyector Full HD 6000 ANSI', ARRAY[
        'Proyector de alta luminosidad',
        'Resolución Full HD 1920x1080',
        '6000 ANSI lumens',
        'Conexiones HDMI, VGA, USB',
        'Control remoto incluido'
    ], 185000, 'unidad'),
    
    (cat_video, 'Pantalla de Proyección 300x225cm', ARRAY[
        'Pantalla trípode portátil',
        'Superficie blanca mate',
        '300x225cm (4:3)',
        'Fácil instalación',
        'Incluye estuche de transporte'
    ], 92500, 'unidad'),
    
    (cat_video, 'Smart TV 65" 4K', ARRAY[
        'Televisor LED 65 pulgadas',
        'Resolución 4K Ultra HD',
        'Smart TV con WiFi',
        'Múltiples entradas HDMI/USB',
        'Soporte incluido'
    ], 277500, 'unidad'),
    
    -- Iluminación
    (cat_iluminacion, 'Kit de Iluminación LED RGB', ARRAY[
        '8 Reflectores LED RGB',
        'Control DMX 512',
        'Controladora de iluminación',
        'Cables y accesorios',
        'Configuración automática'
    ], 462500, 'kit'),
    
    (cat_iluminacion, 'Iluminación Perimetral Básica', ARRAY[
        '4 Reflectores LED blancos',
        'Trípodes ajustables',
        'Control básico on/off',
        'Cables de alimentación',
        'Instalación incluida'
    ], 185000, 'servicio'),
    
    -- Streaming y Grabación
    (cat_streaming, 'Servicio de Streaming HD', ARRAY[
        'Transmisión en vivo HD',
        'Plataformas: YouTube, Facebook, Zoom',
        'Hasta 1000 espectadores',
        'Técnico especializado',
        'Configuración previa'
    ], 555000, 'servicio'),
    
    (cat_streaming, 'Grabación Multiproceso', ARRAY[
        'Grabación de múltiples cámaras',
        'Edición básica incluida',
        'Entrega en formato MP4',
        'Copia de seguridad',
        'Técnico audiovisual'
    ], 740000, 'servicio'),
    
    -- Plataformas y Escenarios
    (cat_plataformas, 'Tarima 6x4m', ARRAY[
        'Plataforma modular',
        'Dimensiones: 6x4 metros',
        'Altura: 40cm',
        'Estructura metálica',
        'Alfombra negra incluida'
    ], 370000, 'unidad'),
    
    (cat_plataformas, 'Escenario Premium 8x6m', ARRAY[
        'Escenario modular profesional',
        'Dimensiones: 8x6 metros',
        'Altura ajustable',
        'Escalones de acceso',
        'Barandas de seguridad',
        'Instalación especializada'
    ], 925000, 'unidad'),
    
    -- Personal Técnico
    (cat_personal, 'Operador de Sonido', ARRAY[
        'Técnico especializado en audio',
        'Uniformado',
        'Disponible durante todo el evento',
        'Experiencia en eventos corporativos'
    ], 92500, 'jornada'),
    
    (cat_personal, 'Operador de Video', ARRAY[
        'Técnico especializado en video',
        'Manejo de proyectores y pantallas',
        'Uniformado',
        'Disponible durante todo el evento'
    ], 92500, 'jornada'),
    
    (cat_personal, 'Operador de Luces', ARRAY[
        'Técnico en iluminación',
        'Programación de efectos',
        'Uniformado',
        'Control durante el evento'
    ], 92500, 'jornada'),
    
    -- Mobiliario
    (cat_mobiliario, 'Mesa Cocktail 80cm', ARRAY[
        'Mesa alta para cocktail',
        'Diámetro: 80cm',
        'Altura: 110cm',
        'Base metálica',
        'Tapa en melamina blanca'
    ], 18500, 'unidad'),
    
    (cat_mobiliario, 'Silla Apilable Negra', ARRAY[
        'Silla plástica apilable',
        'Color negro',
        'Resistente para eventos',
        'Fácil limpieza'
    ], 7400, 'unidad'),
    
    -- Servicios Adicionales
    (cat_servicios, 'Coordinación General', ARRAY[
        'Coordinador de evento',
        'Planificación previa',
        'Supervisión durante el evento',
        'Resolución de contingencias'
    ], 185000, 'servicio'),
    
    (cat_servicios, 'Limpieza Post-Evento', ARRAY[
        'Limpieza completa del espacio',
        'Retiro de equipos',
        'Personal especializado',
        'Materiales de limpieza incluidos'
    ], 92500, 'servicio'),
    
    -- Generación Eléctrica
    (cat_generacion, 'Grupo Electrógeno 15KVA', ARRAY[
        'Generador eléctrico',
        'Potencia: 15KVA',
        'Combustible: Gasoil',
        'Arranque automático',
        'Operador incluido'
    ], 277500, 'jornada'),
    
    -- Equipos de Comunicación
    (cat_comunicacion, 'Kit Handy 6 Equipos', ARRAY[
        '6 Equipos handy profesionales',
        'Alcance: 5km',
        'Cargadores incluidos',
        'Auriculares',
        'Estuche de transporte'
    ], 111000, 'kit'),
    
    -- Transporte
    (cat_transporte, 'Flete Urbano', ARRAY[
        'Transporte de equipos',
        'Carga y descarga',
        'Dentro de CABA',
        'Seguro incluido'
    ], 74000, 'viaje'),
    
    (cat_transporte, 'Flete Interurbano', ARRAY[
        'Transporte de equipos',
        'Fuera de CABA',
        'Hasta 100km',
        'Carga y descarga',
        'Seguro incluido'
    ], 148000, 'viaje');
    
END $$;
