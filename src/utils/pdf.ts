// PDF Service with better error handling
import { DEFAULT_QUOTE_TEXTS } from '../config/company';

// Helper function to safely parse and format dates for PDF
function parseAndFormatDate(dateValue: string): string {
  if (!dateValue || dateValue.trim() === '') return 'Por confirmar';
  
  try {
    // If it's already in dd/mm/yyyy format, convert to a parseable format
    if (dateValue.includes('/')) {
      const parts = dateValue.split('/');
      if (parts.length === 3) {
        const [day, month, year] = parts;
        // Create date using local timezone to avoid UTC conversion issues
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('es-AR', {
            year: 'numeric',
            month: 'long', 
            day: 'numeric'
          });
        }
      }
    }
    
    // For YYYY-MM-DD format, also use local timezone
    if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      const [year, month, day] = dateValue.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('es-AR', {
          year: 'numeric',
          month: 'long', 
          day: 'numeric'
        });
      }
    }
    
    // Try to parse as is (for other formats)
    const date = new Date(dateValue);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long', 
        day: 'numeric'
      });
    }
    
    console.warn('Could not parse date value for PDF:', dateValue);
    return 'Por confirmar';
  } catch (error) {
    console.error('Error parsing date for PDF:', dateValue, error);
    return 'Por confirmar';
  }
}

let pdfMake: any = null;
let pdfInitialized = false;

async function initializePdf() {
  if (pdfInitialized) return;
  
  try {
    // Dynamic import to handle SSR
    if (typeof window !== 'undefined') {
      const pdfMakeModule = await import('pdfmake/build/pdfmake');
      const pdfFontsModule = await import('pdfmake/build/vfs_fonts');
      
      pdfMake = pdfMakeModule.default || pdfMakeModule;
      
      // Try different ways to access the fonts
      const fonts: any = pdfFontsModule.default || pdfFontsModule;
      
      if (fonts.pdfMake?.vfs) {
        pdfMake.vfs = fonts.pdfMake.vfs;
      } else if (fonts.vfs) {
        pdfMake.vfs = fonts.vfs;
      } else {
        console.warn('Could not load pdfMake fonts, using basic configuration');
        pdfMake.vfs = {};
      }
      
      pdfInitialized = true;
    }
  } catch (error) {
    console.error('❌ Error initializing PDF service:', error);
    throw new Error('No se pudo inicializar el servicio de PDF');
  }
}

export interface CotizacionPDFData {
  cotizacion: {
    numero: string
    titulo: string
    descripcion?: string
    fecha_evento?: string
    fecha_evento_fin?: string
    lugar_evento?: string
    duracion_horas?: number
    duracion_dias?: number
    requiere_armado?: boolean
    subtotal: number
    descuento: number
    total: number
    observaciones?: string
    condiciones?: string
    vigencia_dias: number
    created_at: string
    estado?: string
  }
  cliente: {
    nombre: string
    empresa?: string
    email?: string
    telefono?: string
    direccion?: string
  }
  venue?: {
    nombre: string
    direccion?: string
    capacidad?: number
  }
  items: Array<{
    nombre: string
    descripcion?: string[]
    cantidad: number
    precio_unitario: number
    descuento: number
    subtotal: number
    unidad: string
    observaciones?: string
  }>
  empresa: {
    nombre: string
    direccion: string
    telefono: string
    email: string
    website?: string
  }
}

export const pdfService = {
  async generateCotizacionPDF(data: CotizacionPDFData): Promise<Blob> {
    // Initialize PDF service
    await initializePdf();
    
    if (!pdfMake) {
      throw new Error('PDF service not initialized');
    }
    const currentDate = new Date().toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const fechaEvento = data.cotizacion.fecha_evento 
      ? parseAndFormatDate(data.cotizacion.fecha_evento)
      : 'Por confirmar';

    const fechaEventoFin = data.cotizacion.fecha_evento_fin 
      ? parseAndFormatDate(data.cotizacion.fecha_evento_fin)
      : (data.cotizacion.fecha_evento 
          ? parseAndFormatDate(data.cotizacion.fecha_evento)
          : 'Por confirmar');

    const duracionEvento = data.cotizacion.duracion_dias 
      ? `${data.cotizacion.duracion_dias} día(s)${data.cotizacion.requiere_armado ? ' + armado previo' : ''}`
      : (data.cotizacion.duracion_horas 
        ? `${data.cotizacion.duracion_horas} horas`
        : 'Por definir');

    // Calculate totals
    const subtotal = data.items.reduce((sum, item) => sum + item.subtotal, 0);
    const totalDescuentos = data.items.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario * item.descuento / 100), 0);
    const total = subtotal - totalDescuentos;

    const docDefinition: any = {
      pageSize: 'A4',
      pageMargins: [50, 80, 50, 80],
      
      header: {
        columns: [
          {
            width: '*',
            text: data.empresa.nombre,
            style: 'companyHeader',
            margin: [50, 20, 0, 0]
          },
          {
            width: 'auto',
            stack: [
              { text: 'COTIZACIÓN', style: 'documentType', alignment: 'right' },
              { text: data.cotizacion.numero, style: 'documentNumber', alignment: 'right' }
            ],
            margin: [0, 20, 50, 0]
          }
        ]
      },

      footer: function(currentPage: number, pageCount: number) {
        return {
          columns: [
            {
              width: '*',
              text: `${data.empresa.direccion} | Tel: ${data.empresa.telefono} | Email: ${data.empresa.email}${data.empresa.website ? ` | ${data.empresa.website}` : ''}`,
              style: 'footer'
            },
            {
              width: 'auto',
              text: `Página ${currentPage} de ${pageCount}`,
              style: 'footer',
              alignment: 'right'
            }
          ],
          margin: [50, 0, 50, 20]
        };
      },
      
      content: [
        // Company and client info section
        {
          columns: [
            {
              width: '50%',
              stack: [
                { text: 'INFORMACIÓN DE LA EMPRESA', style: 'sectionHeader' },
                { text: data.empresa.nombre, style: 'companyName' },
                { text: data.empresa.direccion, style: 'companyInfo' },
                { text: `Tel: ${data.empresa.telefono}`, style: 'companyInfo' },
                { text: `Email: ${data.empresa.email}`, style: 'companyInfo' },
                ...(data.empresa.website ? [{ text: `Web: ${data.empresa.website}`, style: 'companyInfo' }] : [])
              ]
            },
            {
              width: '50%',
              stack: [
                { text: 'INFORMACIÓN DEL CLIENTE', style: 'sectionHeader' },
                { text: data.cliente.nombre, style: 'clientName' },
                ...(data.cliente.empresa ? [{ text: data.cliente.empresa, style: 'clientInfo' }] : []),
                ...(data.cliente.email ? [{ text: data.cliente.email, style: 'clientInfo' }] : []),
                ...(data.cliente.telefono ? [{ text: data.cliente.telefono, style: 'clientInfo' }] : []),
                ...(data.cliente.direccion ? [{ text: data.cliente.direccion, style: 'clientInfo' }] : [])
              ]
            }
          ],
          margin: [0, 0, 0, 30]
        },

        // Event details section
        {
          table: {
            widths: ['20%', '20%', '20%', '20%', '20%'],
            headerRows: 1,
            body: [
              [
                { text: 'EVENTO', style: 'tableHeader' },
                { text: 'FECHA INICIO', style: 'tableHeader' },
                { text: 'FECHA FIN', style: 'tableHeader' },
                { text: 'DURACIÓN', style: 'tableHeader' },
                { text: 'ESTADO', style: 'tableHeader' }
              ],
              [
                { text: data.cotizacion.titulo, style: 'tableCell' },
                { text: fechaEvento, style: 'tableCell' },
                { text: fechaEventoFin, style: 'tableCell' },
                { text: duracionEvento, style: 'tableCell' },
                { text: (data.cotizacion.estado || 'Borrador').toUpperCase(), style: 'tableCell' }
              ],
              [
                { text: 'LUGAR', style: 'tableHeader' },
                { text: data.cotizacion.lugar_evento || 'No especificado', style: 'tableCell', colSpan: 4 },
                {},
                {},
                {}
              ]
            ]
          },
          layout: {
            fillColor: function (rowIndex: number) {
              return rowIndex === 0 ? '#f8f9fa' : null;
            },
            hLineWidth: function() { return 1; },
            vLineWidth: function() { return 1; },
            hLineColor: function() { return '#dee2e6'; },
            vLineColor: function() { return '#dee2e6'; }
          },
          margin: [0, 0, 0, 30]
        },

        // Description section (if exists)
        ...(data.cotizacion.descripcion ? [
          { text: 'DESCRIPCIÓN DEL EVENTO', style: 'sectionHeader' },
          { text: data.cotizacion.descripcion, style: 'description', margin: [0, 0, 0, 30] }
        ] : []),

        // Items table
        { text: 'DETALLE DE SERVICIOS', style: 'sectionHeader' },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'DESCRIPCIÓN', style: 'tableHeader' },
                { text: 'CANT.', style: 'tableHeader', alignment: 'center' },
                { text: 'UNIDAD', style: 'tableHeader', alignment: 'center' },
                { text: 'PRECIO UNIT.', style: 'tableHeader', alignment: 'right' },
                { text: 'DESC.', style: 'tableHeader', alignment: 'center' },
                { text: 'SUBTOTAL', style: 'tableHeader', alignment: 'right' }
              ],
              ...data.items.map(item => [
                {
                  stack: [
                    { text: item.nombre, style: 'itemName' },
                    ...(item.descripcion && item.descripcion.length > 0 ? 
                      item.descripcion.map(desc => ({ text: `• ${desc}`, style: 'itemDescription' })) : []
                    ),
                    ...(item.observaciones ? [{ text: `Obs: ${item.observaciones}`, style: 'itemObservations' }] : [])
                  ]
                },
                { text: item.cantidad.toString(), style: 'tableCell', alignment: 'center' },
                { text: item.unidad || 'und', style: 'tableCell', alignment: 'center' },
                { text: `$${item.precio_unitario.toLocaleString('es-AR')}`, style: 'tableCell', alignment: 'right' },
                { text: item.descuento > 0 ? `${item.descuento}%` : '-', style: 'tableCell', alignment: 'center' },
                { text: `$${item.subtotal.toLocaleString('es-AR')}`, style: 'tableCell', alignment: 'right', bold: true }
              ])
            ]
          },
          layout: {
            fillColor: function (rowIndex: number) {
              return rowIndex === 0 ? '#f8f9fa' : (rowIndex % 2 === 0 ? '#ffffff' : '#f9f9f9');
            },
            hLineWidth: function() { return 1; },
            vLineWidth: function() { return 1; },
            hLineColor: function() { return '#dee2e6'; },
            vLineColor: function() { return '#dee2e6'; }
          },
          margin: [0, 0, 0, 20]
        },

        // Totals section
        {
          columns: [
            { width: '*', text: '' },
            {
              width: '40%',
              table: {
                widths: ['*', 'auto'],
                body: [
                  [
                    { text: 'Subtotal:', style: 'totalLabel' },
                    { text: `$${subtotal.toLocaleString('es-AR')}`, style: 'totalValue' }
                  ],
                  ...(totalDescuentos > 0 ? [[
                    { text: 'Descuentos:', style: 'totalLabel' },
                    { text: `-$${totalDescuentos.toLocaleString('es-AR')}`, style: 'totalValue', color: '#dc3545' }
                  ]] : []),
                  [
                    { text: 'TOTAL:', style: 'finalTotalLabel' },
                    { text: `$${total.toLocaleString('es-AR')}`, style: 'finalTotalValue' }
                  ]
                ]
              },
              layout: 'noBorders'
            }
          ],
          margin: [0, 0, 0, 30]
        },

        // Terms and conditions
        {
          table: {
            widths: ['50%', '50%'],
            body: [
              [
                {
                  stack: [
                    { text: 'CONDICIONES COMERCIALES', style: 'sectionHeader' },
                   
                    { text: `• Fecha de emisión: ${currentDate}`, style: 'conditions' },
                    ,
                    ...(data.cotizacion.condiciones ? 
                      data.cotizacion.condiciones.split('.').filter(c => c.trim()).map(condicion => ({
                        text: `• ${condicion.trim()}`, style: 'conditions'
                      })) : 
                      DEFAULT_QUOTE_TEXTS.condiciones.split('.').filter(c => c.trim()).map(condicion => ({
                        text: `• ${condicion.trim()}`, style: 'conditions'
                      }))
                    )
                  ]
                },
                {
                  stack: [
                    { text: 'OBSERVACIONES', style: 'sectionHeader' },
                    { text: data.cotizacion.observaciones || DEFAULT_QUOTE_TEXTS.observaciones, style: 'conditions' }
                  ]
                }
              ]
            ]
          },
          layout: 'noBorders',
          margin: [0, 0, 0, 20]
        },

        // Venue information (if exists)
        ...(data.venue ? [
          {
            text: 'INFORMACIÓN DEL LUGAR', style: 'sectionHeader'
          },
          {
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    stack: [
                      { text: data.venue.nombre, style: 'venueName' },
                      ...(data.venue.direccion ? [{ text: data.venue.direccion, style: 'venueInfo' }] : []),
                      ...(data.venue.capacidad ? [{ text: `Capacidad: ${data.venue.capacidad} personas`, style: 'venueInfo' }] : [])
                    ]
                  }
                ]
              ]
            },
            layout: {
              fillColor: '#f8f9fa',
              hLineWidth: function() { return 1; },
              vLineWidth: function() { return 1; },
              hLineColor: function() { return '#dee2e6'; },
              vLineColor: function() { return '#dee2e6'; }
            }
          }
        ] : [])
      ],

      styles: {
        // Header styles
        companyHeader: {
          fontSize: 20,
          bold: true,
          color: '#1f2937'
        },
        documentType: {
          fontSize: 16,
          bold: true,
          color: '#1f2937'
        },
        documentNumber: {
          fontSize: 14,
          bold: true,
          color: '#6b7280'
        },

        // Section styles
        sectionHeader: {
          fontSize: 12,
          bold: true,
          color: '#374151',
          margin: [0, 0, 0, 8]
        },

        // Company styles
        companyName: {
          fontSize: 14,
          bold: true,
          color: '#1f2937',
          margin: [0, 0, 0, 4]
        },
        companyInfo: {
          fontSize: 10,
          color: '#6b7280',
          margin: [0, 0, 0, 2]
        },

        // Client styles
        clientName: {
          fontSize: 14,
          bold: true,
          color: '#1f2937',
          margin: [0, 0, 0, 4]
        },
        clientInfo: {
          fontSize: 10,
          color: '#6b7280',
          margin: [0, 0, 0, 2]
        },

        // Table styles
        tableHeader: {
          fontSize: 10,
          bold: true,
          color: '#374151',
          margin: [4, 8, 4, 8]
        },
        tableCell: {
          fontSize: 10,
          color: '#4b5563',
          margin: [4, 6, 4, 6]
        },

        // Item styles
        itemName: {
          fontSize: 11,
          bold: true,
          color: '#1f2937',
          margin: [0, 0, 0, 2]
        },
        itemDescription: {
          fontSize: 9,
          color: '#6b7280',
          margin: [0, 1, 0, 1]
        },
        itemObservations: {
          fontSize: 9,
          italics: true,
          color: '#9ca3af',
          margin: [0, 2, 0, 0]
        },

        // Total styles
        totalLabel: {
          fontSize: 11,
          color: '#374151',
          alignment: 'right',
          margin: [0, 4, 8, 4]
        },
        totalValue: {
          fontSize: 11,
          bold: true,
          color: '#1f2937',
          alignment: 'right',
          margin: [0, 4, 0, 4]
        },
        finalTotalLabel: {
          fontSize: 13,
          bold: true,
          color: '#1f2937',
          alignment: 'right',
          margin: [0, 8, 8, 8]
        },
        finalTotalValue: {
          fontSize: 13,
          bold: true,
          color: '#059669',
          alignment: 'right',
          margin: [0, 8, 0, 8]
        },

        // Other styles
        description: {
          fontSize: 10,
          color: '#4b5563',
          lineHeight: 1.4
        },
        conditions: {
          fontSize: 9,
          color: '#6b7280',
          margin: [0, 2, 0, 2]
        },
        venueName: {
          fontSize: 12,
          bold: true,
          color: '#1f2937',
          margin: [8, 8, 8, 4]
        },
        venueInfo: {
          fontSize: 10,
          color: '#6b7280',
          margin: [8, 2, 8, 8]
        },
        footer: {
          fontSize: 8,
          color: '#9ca3af'
        }
      }
    };

    return new Promise((resolve, reject) => {
      try {
        const pdfDoc = pdfMake.createPdf(docDefinition);
        pdfDoc.getBlob((blob: Blob) => {
          resolve(blob);
        });
      } catch (error) {
        reject(error);
      }
    });
  },

  // Download PDF
  async downloadCotizacionPDF(data: CotizacionPDFData): Promise<void> {
    try {
      const blob = await this.generateCotizacionPDF(data)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Cotizacion_${data.cotizacion.numero}_${data.cliente.nombre.replace(/\s+/g, '_')}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error generating PDF:', error)
      throw error
    }
  },

  // Preview PDF in new window
  async previewCotizacionPDF(data: CotizacionPDFData): Promise<void> {
    try {
      const blob = await this.generateCotizacionPDF(data)
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
    } catch (error) {
      console.error('Error generating PDF:', error)
      throw error
    }
  }
}
