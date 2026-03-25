/**
 * Tests for ItemService
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ItemService } from '../../src/services/ItemService';

const mockFirestore = vi.hoisted(() => ({
  collection: vi.fn().mockReturnThis(),
  doc: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  get: vi.fn(),
  add: vi.fn(),
  update: vi.fn(),
  delete: vi.fn()
}));

vi.mock('../../src/utils/firebaseAdmin', () => ({
  adminDb: mockFirestore
}));

// Mock ValidationHelper
vi.mock('../../src/utils/validationHelpers', () => ({
  ValidationHelper: {
    validateName: vi.fn(() => ({ isValid: true, errors: [] })),
    validateEmail: vi.fn(() => ({ isValid: true, errors: [] })),
    validatePhone: vi.fn(() => ({ isValid: true, errors: [] }))
  }
}));

describe('ItemService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all items', async () => {
      const mockItems = [
        {
          id: 'item1',
          data: () => ({
            nombre: 'Item 1',
            categoriaId: 'cat1',
            precioBase: 100,
            activo: true,
            createdAt: { toDate: () => new Date('2024-01-15') },
            updatedAt: { toDate: () => new Date('2024-01-15') }
          })
        }
      ];

      mockFirestore.get.mockResolvedValue({
        docs: mockItems
      });

      const result = await ItemService.getAll();

      expect(result).toHaveLength(1);
      expect(result[0].nombre).toBe('Item 1');
      expect(result[0].precioBase).toBe(100);
    });

    it('should apply filters correctly', async () => {
      const mockItems = [
        {
          id: 'item1',
          data: () => ({
            nombre: 'Item Activo',
            categoriaId: 'cat1',
            precioBase: 100,
            activo: true,
            createdAt: { toDate: () => new Date('2024-01-15') },
            updatedAt: { toDate: () => new Date('2024-01-15') }
          })
        }
      ];

      mockFirestore.get.mockResolvedValue({
        docs: mockItems
      });

      const result = await ItemService.getAll({ activo: true });

      expect(mockFirestore.where).toHaveBeenCalledWith('activo', '==', true);
      expect(result).toHaveLength(1);
    });

    it('should handle price filters', async () => {
      const mockItems = [
        {
          id: 'item1',
          data: () => ({
            nombre: 'Item Caro',
            categoriaId: 'cat1',
            precioBase: 500,
            activo: true,
            createdAt: { toDate: () => new Date('2024-01-15') },
            updatedAt: { toDate: () => new Date('2024-01-15') }
          })
        },
        {
          id: 'item2',
          data: () => ({
            nombre: 'Item Barato',
            categoriaId: 'cat1',
            precioBase: 50,
            activo: true,
            createdAt: { toDate: () => new Date('2024-01-15') },
            updatedAt: { toDate: () => new Date('2024-01-15') }
          })
        }
      ];

      mockFirestore.get.mockResolvedValue({
        docs: mockItems
      });

      const result = await ItemService.getAll({ precioMin: 100 });

      expect(result).toHaveLength(1);
      expect(result[0].nombre).toBe('Item Caro');
    });

    it('should handle search filter', async () => {
      const mockItems = [
        {
          id: 'item1',
          data: () => ({
            nombre: 'Micrófono Test',
            categoriaId: 'cat1',
            precioBase: 100,
            activo: true,
            createdAt: { toDate: () => new Date('2024-01-15') },
            updatedAt: { toDate: () => new Date('2024-01-15') }
          })
        },
        {
          id: 'item2',
          data: () => ({
            nombre: 'Altavoz',
            categoriaId: 'cat1',
            precioBase: 200,
            activo: true,
            createdAt: { toDate: () => new Date('2024-01-15') },
            updatedAt: { toDate: () => new Date('2024-01-15') }
          })
        }
      ];

      mockFirestore.get.mockResolvedValue({
        docs: mockItems
      });

      const result = await ItemService.getAll({ search: 'Micrófono' });

      expect(result).toHaveLength(1);
      expect(result[0].nombre).toBe('Micrófono Test');
    });
  });

  describe('getById', () => {
    it('should return item by ID', async () => {
      const mockItem = {
        id: 'item1',
        exists: true,
        data: () => ({
          nombre: 'Item Test',
          categoriaId: 'cat1',
          precioBase: 100,
          activo: true,
          createdAt: { toDate: () => new Date('2024-01-15') },
          updatedAt: { toDate: () => new Date('2024-01-15') }
        })
      };

      mockFirestore.get.mockResolvedValue(mockItem);

      const result = await ItemService.getById('item1');

      expect(result).toBeDefined();
      expect(result?.nombre).toBe('Item Test');
      expect(result?.precioBase).toBe(100);
    });

    it('should return null for non-existent item', async () => {
      const mockItem = {
        id: 'item1',
        exists: false,
        data: () => ({})
      };

      mockFirestore.get.mockResolvedValue(mockItem);

      const result = await ItemService.getById('nonexistent');

      expect(result).toBeNull();
    });

    it('should handle missing ID', async () => {
      await expect(ItemService.getById('')).rejects.toThrow('ID de item es requerido');
    });
  });

  describe('create', () => {
    it('should create new item', async () => {
      const itemData = {
        nombre: 'Nuevo Item',
        categoriaId: 'cat1',
        precioBase: 150,
        unidad: 'unidad',
        activo: true
      };

      const mockDocSnap = {
        id: 'new-item-id',
        exists: true,
        data: () => ({
          ...itemData,
          createdAt: { toDate: () => new Date('2024-01-15') },
          updatedAt: { toDate: () => new Date('2024-01-15') }
        })
      };

      const mockDocRef = { 
        id: 'new-item-id',
        get: vi.fn().mockResolvedValue(mockDocSnap)
      };

      mockFirestore.add.mockResolvedValue(mockDocRef);
      mockFirestore.get.mockResolvedValue(mockDocSnap);

      // Mock getByCodigo to return null (no existing item)
      vi.spyOn(ItemService, 'getByCodigo').mockResolvedValue(null);

      const result = await ItemService.create(itemData);

      expect(result).toBeDefined();
      expect(result.nombre).toBe('Nuevo Item');
      expect(result.precioBase).toBe(150);
    });

    it('should reject creation with existing code', async () => {
      const itemData = {
        nombre: 'Nuevo Item',
        categoriaId: 'cat1',
        codigo: 'EXISTING',
        precioBase: 150,
        unidad: 'unidad',
        activo: true
      };

      const existingItem = {
        id: 'existing-item',
        codigo: 'EXISTING',
        nombre: 'Existing Item',
        categoriaId: 'cat1',
        precioBase: 100,
        unidad: 'unidad',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      vi.spyOn(ItemService, 'getByCodigo').mockResolvedValue(existingItem);

      await expect(ItemService.create(itemData)).rejects.toThrow('Ya existe un item con este código');
    });

    it('should validate item data', async () => {
      const { ValidationHelper } = await import('../../src/utils/validationHelpers');
      vi.mocked(ValidationHelper.validateName).mockReturnValue({
        isValid: false,
        errors: ['Nombre es requerido']
      });

      const itemData = {
        nombre: '',
        categoriaId: 'cat1',
        precioBase: 150,
        unidad: 'unidad',
        activo: true
      };

      await expect(ItemService.create(itemData)).rejects.toThrow('Nombre es requerido');
    });
  });

  describe('update', () => {
    beforeEach(async () => {
      const { ValidationHelper } = await import('../../src/utils/validationHelpers');
      vi.mocked(ValidationHelper.validateName).mockReturnValue({ isValid: true, errors: [] });
    });

    it('should update existing item', async () => {
      const updates = {
        nombre: 'Item Actualizado',
        precioBase: 200
      };

      await expect(ItemService.update('item1', updates)).resolves.not.toThrow();
      expect(mockFirestore.update).toHaveBeenCalled();

      // Mock getByCodigo to return null (no conflict)
      vi.spyOn(ItemService, 'getByCodigo').mockResolvedValue(null);

      await expect(ItemService.update('item1', updates)).resolves.not.toThrow();
      expect(mockFirestore.update).toHaveBeenCalled();
    });

    it('should reject update with existing code', async () => {
      const updates = {
        codigo: 'EXISTING'
      };

      const existingItem = {
        id: 'other-item',
        codigo: 'EXISTING',
        nombre: 'Other Item',
        categoriaId: 'cat1',
        precioBase: 100,
        unidad: 'unidad',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      vi.spyOn(ItemService, 'getByCodigo').mockResolvedValue(existingItem);

      await expect(ItemService.update('item1', updates)).rejects.toThrow('Ya existe un item con este código');
    });

    it('should handle missing ID', async () => {
      await expect(ItemService.update('', {})).rejects.toThrow('ID de item es requerido');
    });
  });

  describe('delete', () => {
    it('should soft delete item', async () => {
      await expect(ItemService.delete('item1')).resolves.not.toThrow();
      expect(mockFirestore.update).toHaveBeenCalledWith({
        activo: false,
        updatedAt: expect.any(Date)
      });
    });

    it('should handle missing ID', async () => {
      await expect(ItemService.delete('')).rejects.toThrow('ID de item es requerido');
    });
  });

  describe('search', () => {
    it('should search items by term', async () => {
      const mockItems = [
        {
          id: 'item1',
          data: () => ({
            nombre: 'Micrófono Test',
            categoriaId: 'cat1',
            precioBase: 100,
            activo: true,
            createdAt: { toDate: () => new Date('2024-01-15') },
            updatedAt: { toDate: () => new Date('2024-01-15') }
          })
        },
        {
          id: 'item2',
          data: () => ({
            nombre: 'Altavoz',
            categoriaId: 'cat1',
            precioBase: 200,
            activo: true,
            createdAt: { toDate: () => new Date('2024-01-15') },
            updatedAt: { toDate: () => new Date('2024-01-15') }
          })
        }
      ];

      mockFirestore.get.mockResolvedValue({
        docs: mockItems
      });

      const result = await ItemService.search('Micrófono');

      expect(result).toHaveLength(1);
      expect(result[0].nombre).toBe('Micrófono Test');
    });

    it('should return empty array for short search terms', async () => {
      const result = await ItemService.search('a');
      expect(result).toEqual([]);
    });
  });

  describe('getStats', () => {
    it('should return item statistics', async () => {
      const mockItems = [
        {
          id: 'item1',
          data: () => ({
            nombre: 'Item 1',
            categoriaId: 'cat1',
            precioBase: 100,
            activo: true,
            createdAt: { toDate: () => new Date('2024-01-15') },
            updatedAt: { toDate: () => new Date('2024-01-15') }
          })
        },
        {
          id: 'item2',
          data: () => ({
            nombre: 'Item 2',
            categoriaId: 'cat2',
            precioBase: 200,
            activo: false,
            createdAt: { toDate: () => new Date('2024-01-15') },
            updatedAt: { toDate: () => new Date('2024-01-15') }
          })
        }
      ];

      mockFirestore.get.mockResolvedValue({
        docs: mockItems
      });

      const result = await ItemService.getStats();

      // Ensure cache was clear so it used our mockItems
      expect(result.total).toBe(2);
      expect(result.activos).toBe(1);
      expect(result.inactivos).toBe(1);
      expect(result.precioPromedio).toBe(150);
      expect(result.precioMinimo).toBe(100);
      expect(result.precioMaximo).toBe(200);
    });
  });
});
