import * as XLSX from 'xlsx';
import { DEFAULT_QUOTE_TEXTS } from '../config/company';
import type { CotizacionPDFData } from './pdf';

export interface ExcelExportData extends CotizacionPDFData {}

export const excelService = {
  /**
   * Generate Excel file with multiple sheets for a quote
   */
  async generateCotizacionExcel(data: ExcelExportData): Promise<Blob> {
    try {
      // Create a new workbook
      const workbook = XLSX.utils.book_new();

      // Sheet 1: Quote Summary
      const summaryData = [
        ['INFORMACIÓN DE LA COTIZACIÓN'],
        [''],
        ['Número de Cotización', data.cotizacion.numero],
        ['Título del Evento', data.cotizacion.titulo],
        ['Descripción', data.cotizacion.descripcion || 'Sin descripción'],
        ['Estado', data.cotizacion.estado || 'Borrador'],
        ['Fecha del Evento', data.cotizacion.fecha_evento || 'Por confirmar'],
        ['Duración (horas)', data.cotizacion.duracion_horas || 'Por definir'],
        ['Vigencia (días)', data.cotizacion.vigencia_dias],
        ['Fecha de Creación', new Date(data.cotizacion.created_at).toLocaleDateString('es-AR')],
        [''],
        ['INFORMACIÓN DEL CLIENTE'],
        [''],
        ['Nombre', data.cliente.nombre],
        ['Empresa', data.cliente.empresa || 'N/A'],
        ['Email', data.cliente.email || 'N/A'],
        ['Teléfono', data.cliente.telefono || 'N/A'],
        ['Dirección', data.cliente.direccion || 'N/A'],
        [''],
        ['INFORMACIÓN DE LA EMPRESA'],
        [''],
        ['Nombre', data.empresa.nombre],
        ['Dirección', data.empresa.direccion],
        ['Teléfono', data.empresa.telefono],
        ['Email', data.empresa.email],
        ['Website', data.empresa.website || 'N/A']
      ];

      // Add venue information if exists
      if (data.venue) {
        summaryData.push(
          [''],
          ['INFORMACIÓN DEL LUGAR'],
          [''],
          ['Nombre del Venue', data.venue.nombre],
          ['Dirección', data.venue.direccion || 'N/A'],
          ['Capacidad', data.venue.capacidad ? `${data.venue.capacidad} personas` : 'N/A']
        );
      }

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      
      // Style the summary sheet
      summarySheet['!cols'] = [{ wch: 25 }, { wch: 40 }];
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen');

      // Sheet 2: Items Detail
      const itemsHeader = [
        'Descripción',
        'Cantidad',
        'Unidad',
        'Precio Unitario',
        'Descuento (%)',
        'Subtotal',
        'Observaciones'
      ];

      const itemsData = data.items.map(item => [
        item.nombre,
        item.cantidad,
        item.unidad || 'und',
        item.precio_unitario,
        item.descuento,
        item.subtotal,
        item.observaciones || ''
      ]);

      // Add descriptions as additional rows for each item
      const detailedItemsData: any[][] = [];
      data.items.forEach(item => {
        detailedItemsData.push([
          item.nombre,
          item.cantidad,
          item.unidad || 'und',
          item.precio_unitario,
          item.descuento,
          item.subtotal,
          item.observaciones || ''
        ]);

        // Add description lines if they exist
        if (item.descripcion && item.descripcion.length > 0) {
          item.descripcion.forEach(desc => {
            detailedItemsData.push([
              `  • ${desc}`,
              '',
              '',
              '',
              '',
              '',
              ''
            ]);
          });
        }
      });

      // Calculate totals
      const subtotal = data.items.reduce((sum, item) => sum + item.subtotal, 0);
      const totalDescuentos = data.items.reduce((sum, item) => 
        sum + (item.cantidad * item.precio_unitario * item.descuento / 100), 0);
      const total = subtotal - totalDescuentos;

      // Add totals
      detailedItemsData.push(
        ['', '', '', '', '', '', ''],
        ['', '', '', '', 'SUBTOTAL:', subtotal, ''],
        ...(totalDescuentos > 0 ? [['', '', '', '', 'DESCUENTOS:', -totalDescuentos, '']] : []),
        ['', '', '', '', 'TOTAL:', total, '']
      );

      const itemsSheetData = [itemsHeader, ...detailedItemsData];
      const itemsSheet = XLSX.utils.aoa_to_sheet(itemsSheetData);
      
      // Style the items sheet
      itemsSheet['!cols'] = [
        { wch: 35 }, // Descripción
        { wch: 10 }, // Cantidad
        { wch: 10 }, // Unidad
        { wch: 15 }, // Precio Unitario
        { wch: 12 }, // Descuento
        { wch: 15 }, // Subtotal
        { wch: 30 }  // Observaciones
      ];

      XLSX.utils.book_append_sheet(workbook, itemsSheet, 'Detalle de Items');

      // Sheet 3: Financial Summary
      const financialData = [
        ['RESUMEN FINANCIERO'],
        [''],
        ['Concepto', 'Cantidad', 'Precio Unit.', 'Descuento', 'Subtotal'],
        ...data.items.map(item => [
          item.nombre,
          item.cantidad,
          item.precio_unitario,
          `${item.descuento}%`,
          item.subtotal
        ]),
        ['', '', '', '', ''],
        ['', '', '', 'SUBTOTAL:', subtotal],
        ...(totalDescuentos > 0 ? [['', '', '', 'DESCUENTOS:', -totalDescuentos]] : []),
        ['', '', '', 'TOTAL FINAL:', total],
        [''],
        ['CONDICIONES'],
        ['Validez de cotización', `${data.cotizacion.vigencia_dias} días`],
        ['Observaciones', data.cotizacion.observaciones || DEFAULT_QUOTE_TEXTS.observaciones]
      ];

      const financialSheet = XLSX.utils.aoa_to_sheet(financialData);
      financialSheet['!cols'] = [{ wch: 30 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(workbook, financialSheet, 'Resumen Financiero');

      // Generate the Excel file
      const excelBuffer = XLSX.write(workbook, { 
        bookType: 'xlsx', 
        type: 'array',
        cellStyles: true 
      });

      return new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
    } catch (error) {
      console.error('Error generating Excel:', error);
      throw error;
    }
  },

  /**
   * Download Excel file
   */
  async downloadCotizacionExcel(data: ExcelExportData): Promise<void> {
    try {
      const blob = await this.generateCotizacionExcel(data);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Cotizacion_${data.cotizacion.numero}_${data.cliente.nombre.replace(/\s+/g, '_')}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading Excel:', error);
      throw error;
    }
  },

  /**
   * Generate simple items list Excel for quick export
   */
  async generateItemsListExcel(items: ExcelExportData['items'], filename?: string): Promise<Blob> {
    try {
      const workbook = XLSX.utils.book_new();
      
      const header = ['Descripción', 'Cantidad', 'Unidad', 'Precio Unitario', 'Descuento %', 'Subtotal'];
      const data = items.map(item => [
        item.nombre,
        item.cantidad,
        item.unidad || 'und',
        item.precio_unitario,
        item.descuento,
        item.subtotal
      ]);

      const total = items.reduce((sum, item) => sum + item.subtotal, 0);
      data.push(['', '', '', '', 'TOTAL:', total]);

      const sheetData = [header, ...data];
      const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
      worksheet['!cols'] = [{ wch: 30 }, { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 12 }, { wch: 15 }];
      
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Items');

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      return new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
    } catch (error) {
      console.error('Error generating items Excel:', error);
      throw error;
    }
  }
};
