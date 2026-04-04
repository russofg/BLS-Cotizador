// PDF Service with better error handling
import { DEFAULT_QUOTE_TEXTS } from '../config/company';
import { QuoteHelper } from './quoteHelpers';

/** Paleta y tokens de diseño — documento tipo propuesta comercial premium */
const PDF_THEME = {
  ink: '#0f172a',
  inkMuted: '#334155',
  text: '#475569',
  textLight: '#64748b',
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  surface: '#f8fafc',
  surfaceAlt: '#f1f5f9',
  headerBg: '#1e293b',
  headerInk: '#ffffff',
  accent: '#0f766e',
  accentSoft: '#ccfbf1',
  danger: '#b91c1c',
  pageMarginH: 48,
  pageMarginTop: 88,
  pageMarginBottom: 64,
} as const;

function estadoPresupuestoColor(estado: string): string {
  const s = (estado || '').toLowerCase();
  if (s.includes('aprob')) return '#047857';
  if (s.includes('enviad')) return '#0369a1';
  if (s.includes('rechaz')) return PDF_THEME.danger;
  if (s.includes('venc')) return '#b45309';
  return PDF_THEME.textLight;
}

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
    id?: string
    numero: string
    titulo: string
    descripcion?: string
    fechaEvento?: string | Date
    fechaEventoFin?: string | Date
    lugarEvento?: string
    duracionHoras?: number
    duracionDias?: number
    requiereArmado?: boolean
    subtotal: number
    descuento: number
    total: number
    observaciones?: string
    condiciones?: string
    vigenciaDias: number
    createdAt: string | Date
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
    precioUnitario: number
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

    const fechaEvento = data.cotizacion.fechaEvento 
      ? parseAndFormatDate(String(data.cotizacion.fechaEvento))
      : 'Por confirmar';

    const fechaEventoFin = data.cotizacion.fechaEventoFin 
      ? parseAndFormatDate(String(data.cotizacion.fechaEventoFin))
      : (data.cotizacion.fechaEvento 
          ? parseAndFormatDate(String(data.cotizacion.fechaEvento))
          : 'Por confirmar');

    const duracionEvento = data.cotizacion.duracionDias 
      ? `${data.cotizacion.duracionDias} día(s)${data.cotizacion.requiereArmado ? ' + armado previo' : ''}`
      : (data.cotizacion.duracionHoras 
        ? `${data.cotizacion.duracionHoras} horas`
        : 'Por definir');

    // Calculate totals
    const subtotal = data.items.reduce((sum, item) => sum + item.subtotal, 0);
    const totalDescuentos = data.items.reduce((sum, item) => sum + (item.cantidad * item.precioUnitario * item.descuento / 100), 0);
    const total = subtotal - totalDescuentos;

    const contentWidth = 595.28 - PDF_THEME.pageMarginH * 2;
    const estadoLabel = (data.cotizacion.estado || 'borrador').toUpperCase();
    const estadoColor = estadoPresupuestoColor(data.cotizacion.estado || '');

    const numeroCotizacionPdf = QuoteHelper.getDisplayQuoteNumber(data.cotizacion);

    const condicionesSource =
      data.cotizacion.condiciones && String(data.cotizacion.condiciones).trim()
        ? data.cotizacion.condiciones
        : DEFAULT_QUOTE_TEXTS.condiciones;
    const condicionesLines = QuoteHelper.getCondicionesLines(condicionesSource);

    const layoutEventBlock = {
      fillColor: (rowIndex: number) => {
        if (rowIndex === 0) return PDF_THEME.headerBg;
        if (rowIndex === 2) return PDF_THEME.surfaceAlt;
        return null;
      },
      hLineWidth: (i: number, node: any) =>
        i === 0 || i === node.table.body.length ? 0 : 0.4,
      vLineWidth: () => 0.4,
      hLineColor: () => PDF_THEME.border,
      vLineColor: () => PDF_THEME.border,
      paddingLeft: () => 10,
      paddingRight: () => 10,
      paddingTop: (i: number) => (i === 0 ? 10 : 9),
      paddingBottom: (i: number) => (i === 0 ? 10 : 9),
    };

    const layoutItemsTable = {
      fillColor: (rowIndex: number) => {
        if (rowIndex === 0) return PDF_THEME.headerBg;
        return rowIndex % 2 === 1 ? null : PDF_THEME.surface;
      },
      hLineWidth: (i: number, node: any) =>
        i === 0 || i === node.table.body.length ? 0 : 0.35,
      vLineWidth: () => 0.35,
      hLineColor: () => PDF_THEME.border,
      vLineColor: () => PDF_THEME.border,
      paddingLeft: () => 12,
      paddingRight: () => 12,
      paddingTop: (i: number) => (i === 0 ? 10 : 8),
      paddingBottom: (i: number) => (i === 0 ? 10 : 8),
    };

    const headerCell = (text: string, align?: string) => ({
      text,
      style: 'tableHeaderOnDark',
      alignment: align || 'left',
    });

    const bodyCell = (text: string, opts: Record<string, unknown> = {}) => ({
      text,
      style: 'tableBody',
      ...opts,
    });

    const docDefinition: any = {
      pageSize: 'A4',
      pageMargins: [
        PDF_THEME.pageMarginH,
        PDF_THEME.pageMarginTop,
        PDF_THEME.pageMarginH,
        PDF_THEME.pageMarginBottom,
      ],
      defaultStyle: {
        fontSize: 10,
        color: PDF_THEME.text,
        lineHeight: 1.35,
      },

      header: {
        stack: [
          {
            canvas: [
              {
                type: 'rect',
                x: 0,
                y: 0,
                w: contentWidth,
                h: 3,
                color: PDF_THEME.accent,
              },
            ],
            width: contentWidth,
            margin: [PDF_THEME.pageMarginH, 18, PDF_THEME.pageMarginH, 0],
          },
          {
            columns: [
              {
                width: '*',
                stack: [
                  { text: data.empresa.nombre.toUpperCase(), style: 'brandWordmark' },
                  { text: 'Propuesta comercial', style: 'brandTagline' },
                ],
              },
              {
                width: 'auto',
                table: {
                  widths: ['auto'],
                  body: [
                    [
                      {
                        stack: [
                          {
                            text: 'COTIZACIÓN',
                            style: 'docBadgeLabel',
                            alignment: 'center',
                          },
                          {
                            text: numeroCotizacionPdf,
                            style: 'docBadgeNumber',
                            alignment: 'center',
                          },
                        ],
                        margin: [14, 10, 14, 10],
                      },
                    ],
                  ],
                },
                layout: {
                  fillColor: () => PDF_THEME.ink,
                  hLineWidth: () => 0,
                  vLineWidth: () => 0,
                },
              },
            ],
            margin: [PDF_THEME.pageMarginH, 14, PDF_THEME.pageMarginH, 16],
          },
        ],
      },

      footer(currentPage: number, pageCount: number) {
        const contact = [
          data.empresa.direccion,
          `Tel. ${data.empresa.telefono}`,
          data.empresa.email,
          data.empresa.website,
        ]
          .filter(Boolean)
          .join('  ·  ');
        return {
          stack: [
            {
              canvas: [
                {
                  type: 'line',
                  x1: 0,
                  y1: 0,
                  x2: contentWidth,
                  y2: 0,
                  lineWidth: 0.5,
                  lineColor: PDF_THEME.border,
                },
              ],
              margin: [PDF_THEME.pageMarginH, 0, PDF_THEME.pageMarginH, 8],
            },
            {
              columns: [
                { width: '*', text: contact, style: 'footerContact' },
                {
                  width: 'auto',
                  text: `${currentPage} / ${pageCount}`,
                  style: 'footerPage',
                  alignment: 'right',
                },
              ],
              margin: [PDF_THEME.pageMarginH, 0, PDF_THEME.pageMarginH, 12],
            },
          ],
        };
      },

      content: [
        {
          table: {
            widths: ['*', '*'],
            body: [
              [
                {
                  stack: [
                    { text: 'EMISOR', style: 'cardLabel' },
                    { text: data.empresa.nombre, style: 'cardTitle' },
                    { text: data.empresa.direccion, style: 'cardLine' },
                    { text: `Tel. ${data.empresa.telefono}`, style: 'cardLine' },
                    { text: data.empresa.email, style: 'cardLine' },
                    ...(data.empresa.website
                      ? [{ text: data.empresa.website, style: 'cardLine' }]
                      : []),
                  ],
                },
                {
                  stack: [
                    { text: 'CLIENTE', style: 'cardLabel' },
                    { text: data.cliente.nombre, style: 'cardTitle' },
                    ...(data.cliente.empresa
                      ? [{ text: data.cliente.empresa, style: 'cardLine' }]
                      : []),
                    ...(data.cliente.email
                      ? [{ text: data.cliente.email, style: 'cardLine' }]
                      : []),
                    ...(data.cliente.telefono
                      ? [{ text: data.cliente.telefono, style: 'cardLine' }]
                      : []),
                    ...(data.cliente.direccion
                      ? [{ text: data.cliente.direccion, style: 'cardLine' }]
                      : []),
                  ],
                },
              ],
            ],
          },
          layout: {
            fillColor: () => PDF_THEME.surface,
            hLineWidth: () => 0,
            vLineWidth: (i: number) => (i === 1 ? 0.5 : 0),
            vLineColor: () => PDF_THEME.border,
            paddingLeft: () => 16,
            paddingRight: () => 16,
            paddingTop: () => 16,
            paddingBottom: () => 16,
          },
          margin: [0, 0, 0, 28],
        },

        { text: 'DETALLE DEL EVENTO', style: 'sectionTitle', margin: [0, 0, 0, 10] },
        {
          table: {
            widths: ['19%', '19%', '19%', '19%', '24%'],
            headerRows: 1,
            body: [
              [
                headerCell('EVENTO'),
                headerCell('INICIO'),
                headerCell('FIN'),
                headerCell('DURACIÓN'),
                headerCell('ESTADO', 'center'),
              ],
              [
                bodyCell(data.cotizacion.titulo, { bold: true, color: PDF_THEME.ink }),
                bodyCell(fechaEvento),
                bodyCell(fechaEventoFin),
                bodyCell(duracionEvento),
                {
                  text: estadoLabel,
                  style: 'tableBody',
                  alignment: 'center',
                  bold: true,
                  color: estadoColor,
                },
              ],
              [
                {
                  text: 'LUGAR DEL EVENTO',
                  style: 'tableSubLabel',
                  fillColor: PDF_THEME.surfaceAlt,
                },
                {
                  text: data.cotizacion.lugarEvento || 'No especificado',
                  style: 'tableBody',
                  colSpan: 4,
                  fillColor: PDF_THEME.surfaceAlt,
                },
                {},
                {},
                {},
              ],
            ],
          },
          layout: layoutEventBlock,
          margin: [0, 0, 0, 28],
        },

        ...(data.cotizacion.descripcion
          ? [
              { text: 'DESCRIPCIÓN DEL EVENTO', style: 'sectionTitle', margin: [0, 0, 0, 10] },
              {
                text: data.cotizacion.descripcion,
                style: 'prose',
                margin: [0, 0, 0, 28],
              },
            ]
          : []),

        { text: 'DETALLE DE SERVICIOS', style: 'sectionTitle', margin: [0, 0, 0, 10] },
        {
          table: {
            headerRows: 1,
            // Sin columna UNIDAD: el ~8% pasa a DESCRIPCIÓN (53%); resto como referencia impresa
            widths: ['53%', '7%', '15%', '10%', '15%'],
            body: [
              [
                headerCell('DESCRIPCIÓN'),
                headerCell('CANT.', 'center'),
                {
                  stack: [
                    { text: 'PRECIO', style: 'tableHeaderOnDark', alignment: 'center' },
                    { text: 'UNIT.', style: 'tableHeaderOnDark', alignment: 'center' },
                  ],
                  alignment: 'center',
                },
                headerCell('DTO.', 'center'),
                headerCell('SUBTOTAL', 'center'),
              ],
              ...data.items.map((item) => [
                {
                  stack: [
                    { text: item.nombre, style: 'itemName' },
                    ...((): { text: string; style: string }[] => {
                      const lines = QuoteHelper.getDescriptionAsArray(item.descripcion as any);
                      return lines.map((desc) => {
                        const clean = String(desc)
                          .replace(/^[•\u2022\-*]\s*/u, '')
                          .trim();
                        return { text: `·  ${clean}`, style: 'itemBullet' };
                      });
                    })(),
                    ...(item.observaciones
                      ? [{ text: `Nota: ${item.observaciones}`, style: 'itemObservations' }]
                      : []),
                  ],
                },
                bodyCell(item.cantidad.toString(), { alignment: 'center' }),
                {
                  text: `$${item.precioUnitario.toLocaleString('es-AR')}`,
                  style: 'tableBody',
                  alignment: 'center',
                },
                bodyCell(item.descuento > 0 ? `${item.descuento}%` : '—', {
                  alignment: 'center',
                  color: item.descuento > 0 ? PDF_THEME.danger : PDF_THEME.textLight,
                }),
                {
                  text: `$${item.subtotal.toLocaleString('es-AR')}`,
                  style: 'tableBody',
                  alignment: 'center',
                  bold: true,
                  color: PDF_THEME.ink,
                },
              ]),
            ],
          },
          layout: layoutItemsTable,
          margin: [0, 0, 0, 22],
        },

        {
          columns: [
            { width: '*', text: '' },
            {
              width: 220,
              table: {
                widths: ['*', 88],
                body: [
                  [
                    { text: 'Subtotal', style: 'totalRowLabel' },
                    {
                      text: `$${subtotal.toLocaleString('es-AR')}`,
                      style: 'totalRowValue',
                    },
                  ],
                  ...(totalDescuentos > 0
                    ? [
                        [
                          { text: 'Descuentos', style: 'totalRowLabel' },
                          {
                            text: `− $${totalDescuentos.toLocaleString('es-AR')}`,
                            style: 'totalRowValue',
                            color: PDF_THEME.danger,
                          },
                        ],
                      ]
                    : []),
                  [
                    { text: 'Total estimado', style: 'totalGrandLabel' },
                    {
                      text: `$${total.toLocaleString('es-AR')}`,
                      style: 'totalGrandValue',
                    },
                  ],
                ],
              },
              layout: {
                fillColor: (rowIndex: number, node: any) =>
                  rowIndex === node.table.body.length - 1
                    ? PDF_THEME.accentSoft
                    : null,
                hLineWidth: (i: number, node: any) =>
                  i === 0 || i === node.table.body.length ? 0 : 0.35,
                vLineWidth: () => 0,
                hLineColor: () => PDF_THEME.border,
                paddingLeft: () => 12,
                paddingRight: () => 12,
                paddingTop: (i: number, node: any) =>
                  i === node.table.body.length - 1 ? 12 : 6,
                paddingBottom: (i: number, node: any) =>
                  i === node.table.body.length - 1 ? 12 : 6,
              },
            },
          ],
          margin: [0, 0, 0, 32],
        },

        { text: 'TÉRMINOS Y NOTAS', style: 'sectionTitle', margin: [0, 0, 0, 12] },
        {
          table: {
            widths: ['*', '*'],
            body: [
              [
                {
                  stack: [
                    { text: 'Condiciones comerciales', style: 'legalBoxTitle' },
                    {
                      text: `Emitido el ${currentDate}`,
                      style: 'legalMeta',
                      margin: [0, 0, 0, 8],
                    },
                    ...condicionesLines.map((line) => ({
                      text: `·  ${line}`,
                      style: 'legalLine',
                      margin: [0, 0, 0, 4],
                    })),
                  ],
                },
                {
                  stack: [
                    { text: 'Observaciones', style: 'legalBoxTitle' },
                    {
                      text:
                        data.cotizacion.observaciones ||
                        DEFAULT_QUOTE_TEXTS.observaciones,
                      style: 'legalProse',
                    },
                  ],
                },
              ],
            ],
          },
          layout: {
            fillColor: () => PDF_THEME.surface,
            hLineWidth: () => 0,
            vLineWidth: (i: number) => (i === 1 ? 0.5 : 0),
            vLineColor: () => PDF_THEME.border,
            paddingLeft: () => 16,
            paddingRight: () => 16,
            paddingTop: () => 16,
            paddingBottom: () => 16,
          },
          margin: [0, 0, 0, 24],
        },

        ...(data.venue
          ? [
              { text: 'LUGAR / VENUE', style: 'sectionTitle', margin: [0, 8, 0, 10] },
              {
                table: {
                  widths: ['*'],
                  body: [
                    [
                      {
                        stack: [
                          { text: data.venue.nombre, style: 'venueTitle' },
                          ...(data.venue.direccion
                            ? [{ text: data.venue.direccion, style: 'venueLine' }]
                            : []),
                          ...(data.venue.capacidad
                            ? [
                                {
                                  text: `Capacidad aproximada: ${data.venue.capacidad} personas`,
                                  style: 'venueLine',
                                },
                              ]
                            : []),
                        ],
                      },
                    ],
                  ],
                },
                layout: {
                  fillColor: () => PDF_THEME.surface,
                  hLineWidth: () => 0,
                  vLineWidth: () => 0,
                  paddingLeft: () => 16,
                  paddingRight: () => 16,
                  paddingTop: () => 14,
                  paddingBottom: () => 14,
                },
              },
            ]
          : []),
      ],

      styles: {
        brandWordmark: {
          fontSize: 11,
          bold: true,
          color: PDF_THEME.ink,
          characterSpacing: 1.2,
        },
        brandTagline: {
          fontSize: 8.5,
          color: PDF_THEME.textLight,
          margin: [0, 4, 0, 0],
        },
        docBadgeLabel: {
          fontSize: 8,
          bold: true,
          color: '#94a3b8',
          characterSpacing: 2,
        },
        docBadgeNumber: {
          fontSize: 12,
          bold: true,
          color: PDF_THEME.headerInk,
          margin: [0, 4, 0, 0],
        },
        sectionTitle: {
          fontSize: 9.5,
          bold: true,
          color: PDF_THEME.accent,
          characterSpacing: 1.5,
        },
        cardLabel: {
          fontSize: 8,
          bold: true,
          color: PDF_THEME.textLight,
          characterSpacing: 1.2,
          margin: [0, 0, 0, 8],
        },
        cardTitle: {
          fontSize: 12,
          bold: true,
          color: PDF_THEME.ink,
          margin: [0, 0, 0, 6],
        },
        cardLine: {
          fontSize: 9,
          color: PDF_THEME.text,
          margin: [0, 0, 0, 3],
        },
        tableHeaderOnDark: {
          fontSize: 8.5,
          bold: true,
          color: PDF_THEME.headerInk,
          characterSpacing: 0.8,
        },
        tableSubLabel: {
          fontSize: 8.5,
          bold: true,
          color: PDF_THEME.inkMuted,
        },
        tableBody: {
          fontSize: 9.5,
          color: PDF_THEME.text,
        },
        itemName: {
          fontSize: 10,
          bold: true,
          color: PDF_THEME.ink,
          margin: [0, 0, 0, 4],
        },
        itemBullet: {
          fontSize: 8.5,
          color: PDF_THEME.textLight,
          margin: [0, 1.5, 0, 0],
        },
        itemObservations: {
          fontSize: 8.5,
          italics: true,
          color: PDF_THEME.textLight,
          margin: [0, 6, 0, 0],
        },
        prose: {
          fontSize: 9.5,
          color: PDF_THEME.text,
          lineHeight: 1.45,
        },
        totalRowLabel: {
          fontSize: 10,
          color: PDF_THEME.textLight,
          alignment: 'right',
        },
        totalRowValue: {
          fontSize: 10,
          bold: true,
          color: PDF_THEME.ink,
          alignment: 'right',
        },
        totalGrandLabel: {
          fontSize: 11,
          bold: true,
          color: PDF_THEME.ink,
          alignment: 'right',
        },
        totalGrandValue: {
          fontSize: 14,
          bold: true,
          color: PDF_THEME.accent,
          alignment: 'right',
        },
        legalBoxTitle: {
          fontSize: 9,
          bold: true,
          color: PDF_THEME.ink,
          margin: [0, 0, 0, 4],
        },
        legalMeta: {
          fontSize: 8.5,
          color: PDF_THEME.textLight,
        },
        legalLine: {
          fontSize: 8.5,
          color: PDF_THEME.text,
          lineHeight: 1.4,
        },
        legalProse: {
          fontSize: 8.5,
          color: PDF_THEME.text,
          lineHeight: 1.45,
        },
        venueTitle: {
          fontSize: 11,
          bold: true,
          color: PDF_THEME.ink,
          margin: [0, 0, 0, 4],
        },
        venueLine: {
          fontSize: 9.5,
          color: PDF_THEME.text,
        },
        footerContact: {
          fontSize: 7.5,
          color: PDF_THEME.textLight,
        },
        footerPage: {
          fontSize: 7.5,
          color: PDF_THEME.textLight,
        },
      },
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
