/**
 * Configuración de la información de la empresa
 * Modifica estos valores con la información real de tu empresa
 */

export const COMPANY_INFO = {
  nombre: 'BLS Servicios Audiovisuales',
  direccion: 'Catamarca 809, CABA, Argentina',
  telefono: '+54 11 5183 4646',
  email: 'info@blsnet.com.ar',
  website: 'www.blsnet.com.ar',

  // Información adicional opcional
  cuit: '20-20233867-5',
  sector: 'Servicios Audiovisuales',
  descripcion: 'Empresa especializada en eventos audiovisuales'
};

// Valores por defecto para casos de emergencia
export const DEFAULT_COMPANY_INFO = {
  nombre: 'Cotizador Online',
  direccion: 'Catamarca 809, CABA, Argentina',
  telefono: '+54 11 5183 4646',
  email: 'info@blsnet.com.ar',
  website: 'www.blsnet.com.ar'
};

// Textos por defecto para cotizaciones
export const DEFAULT_QUOTE_TEXTS = {
  observaciones: `Este presupuesto incluye nuestro SISTEMA DE COBERTURA DE BACK
ESTRUCTURAL para equipo técnico.

Los importes detallados no incluyen I.V.A.`,

  condiciones: `Validez de la oferta: La validez de esta oferta es de 20 días.

NOTA IMPORTANTE

LOS VALORES ESTAN CONTEMPLADOS AL MES DE NOVIEMBRE DE 2024

SERAN AJUSTADOS MENSUALMENTE SEGÚN IPC (INDICE DE PRECIOS AL CONSUMIDOR)

Condiciones de Pago y confirmación del servicio:

El pago deberá cancelarse de la siguiente manera: 50% como reserva del equipamiento y el saldo restante a 10 días del evento. Podrá efectuarse en efectivo, transferencia bancaria o mediante la emisión de cheque.
Por favor remitir datos de la empresa y contacto de pago a proveedores para una correcta facturación.

Cancelación de los servicios:

Sin cargo hasta 48 Hs antes del evento.
Si se cancela 24 Hs. antes se deberá abonar el 50% del total del presupuesto.
Todos los adicionales que no se encuentren cotizados en el presente presupuesto serán cotizados por separado y serán incluidos en la facturación al momento del detalle final.

Condiciones de reserva:

La confirmación del evento por parte de BLS – Servicios Audiovisuales dependerá de la disponibilidad del servicio al momento de la aceptación formal del presupuesto por parte del cliente.`
};
