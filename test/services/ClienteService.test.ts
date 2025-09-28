/**
 * Tests for ClienteService
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClienteService } from '../../src/services/ClienteService';

// Mock Firebase
const mockFirestore = {
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn()
};

vi.mock('../../src/utils/firebase', () => ({
  db: mockFirestore
}));

// Mock ValidationHelper
vi.mock('../../src/utils/validationHelpers', () => ({
  ValidationHelper: {
    validateName: vi.fn(() => ({ isValid: true, errors: [] })),
    validateEmail: vi.fn(() => ({ isValid: true, errors: [] })),
    validatePhone: vi.fn(() => ({ isValid: true, errors: [] }))
  }
}));

describe('ClienteService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all clients', async () => {
      const mockClients = [
        {
          id: 'client1',
          data: () => ({
            nombre: 'Cliente 1',
            email: 'cliente1@test.com',
            activo: true,
            createdAt: { toDate: () => new Date('2024-01-15') }
          })
        }
      ];

      mockFirestore.collection.mockReturnValue('collection');
      mockFirestore.query.mockReturnValue('query');
      mockFirestore.orderBy.mockReturnValue('orderBy');
      mockFirestore.getDocs.mockResolvedValue({
        docs: mockClients
      });

      const result = await ClienteService.getAll();

      expect(result).toHaveLength(1);
      expect(result[0].nombre).toBe('Cliente 1');
      expect(result[0].email).toBe('cliente1@test.com');
    });

    it('should apply filters correctly', async () => {
      const mockClients = [
        {
          id: 'client1',
          data: () => ({
            nombre: 'Cliente Activo',
            email: 'cliente1@test.com',
            activo: true,
            createdAt: { toDate: () => new Date('2024-01-15') }
          })
        }
      ];

      mockFirestore.collection.mockReturnValue('collection');
      mockFirestore.query.mockReturnValue('query');
      mockFirestore.orderBy.mockReturnValue('orderBy');
      mockFirestore.where.mockReturnValue('where');
      mockFirestore.getDocs.mockResolvedValue({
        docs: mockClients
      });

      const result = await ClienteService.getAll({ activo: true });

      expect(mockFirestore.where).toHaveBeenCalledWith('activo', '==', true);
      expect(result).toHaveLength(1);
    });

    it('should handle search filter', async () => {
      const mockClients = [
        {
          id: 'client1',
          data: () => ({
            nombre: 'Cliente Test',
            email: 'cliente@test.com',
            activo: true,
            createdAt: { toDate: () => new Date('2024-01-15') }
          })
        },
        {
          id: 'client2',
          data: () => ({
            nombre: 'Otro Cliente',
            email: 'otro@test.com',
            activo: true,
            createdAt: { toDate: () => new Date('2024-01-15') }
          })
        }
      ];

      mockFirestore.collection.mockReturnValue('collection');
      mockFirestore.query.mockReturnValue('query');
      mockFirestore.orderBy.mockReturnValue('orderBy');
      mockFirestore.getDocs.mockResolvedValue({
        docs: mockClients
      });

      const result = await ClienteService.getAll({ search: 'Test' });

      expect(result).toHaveLength(1);
      expect(result[0].nombre).toBe('Cliente Test');
    });

    it('should handle errors gracefully', async () => {
      mockFirestore.collection.mockImplementation(() => {
        throw new Error('Firebase error');
      });

      await expect(ClienteService.getAll()).rejects.toThrow('Error al obtener los clientes');
    });
  });

  describe('getById', () => {
    it('should return client by ID', async () => {
      const mockClient = {
        id: 'client1',
        exists: () => true,
        data: () => ({
          nombre: 'Cliente Test',
          email: 'cliente@test.com',
          activo: true,
          createdAt: { toDate: () => new Date('2024-01-15') }
        })
      };

      mockFirestore.collection.mockReturnValue('collection');
      mockFirestore.doc.mockReturnValue('doc');
      mockFirestore.getDoc.mockResolvedValue(mockClient);

      const result = await ClienteService.getById('client1');

      expect(result).toBeDefined();
      expect(result?.nombre).toBe('Cliente Test');
      expect(result?.email).toBe('cliente@test.com');
    });

    it('should return null for non-existent client', async () => {
      const mockClient = {
        id: 'client1',
        exists: () => false
      };

      mockFirestore.collection.mockReturnValue('collection');
      mockFirestore.doc.mockReturnValue('doc');
      mockFirestore.getDoc.mockResolvedValue(mockClient);

      const result = await ClienteService.getById('nonexistent');

      expect(result).toBeNull();
    });

    it('should handle missing ID', async () => {
      await expect(ClienteService.getById('')).rejects.toThrow('ID de cliente es requerido');
    });
  });

  describe('create', () => {
    it('should create new client', async () => {
      const clientData = {
        nombre: 'Nuevo Cliente',
        email: 'nuevo@test.com',
        activo: true
      };

      const mockDocRef = { id: 'new-client-id' };
      const mockDocSnap = {
        id: 'new-client-id',
        data: () => ({
          ...clientData,
          createdAt: { toDate: () => new Date('2024-01-15') }
        })
      };

      mockFirestore.collection.mockReturnValue('collection');
      mockFirestore.addDoc.mockResolvedValue(mockDocRef);
      mockFirestore.doc.mockReturnValue('doc');
      mockFirestore.getDoc.mockResolvedValue(mockDocSnap);

      // Mock getByEmail to return null (no existing client)
      vi.spyOn(ClienteService, 'getByEmail').mockResolvedValue(null);

      const result = await ClienteService.create(clientData);

      expect(result).toBeDefined();
      expect(result.nombre).toBe('Nuevo Cliente');
      expect(result.email).toBe('nuevo@test.com');
    });

    it('should reject creation with existing email', async () => {
      const clientData = {
        nombre: 'Nuevo Cliente',
        email: 'existing@test.com',
        activo: true
      };

      const existingClient = {
        id: 'existing-client',
        nombre: 'Existing Client',
        email: 'existing@test.com'
      };

      vi.spyOn(ClienteService, 'getByEmail').mockResolvedValue(existingClient);

      await expect(ClienteService.create(clientData)).rejects.toThrow('Ya existe un cliente con este email');
    });

    it('should validate client data', async () => {
      const { ValidationHelper } = await import('../../src/utils/validationHelpers');
      vi.mocked(ValidationHelper.validateName).mockReturnValue({
        isValid: false,
        errors: ['Nombre es requerido']
      });

      const clientData = {
        nombre: '',
        email: 'test@test.com',
        activo: true
      };

      await expect(ClienteService.create(clientData)).rejects.toThrow('Nombre es requerido');
    });
  });

  describe('update', () => {
    it('should update existing client', async () => {
      const updates = {
        nombre: 'Cliente Actualizado',
        email: 'actualizado@test.com'
      };

      mockFirestore.collection.mockReturnValue('collection');
      mockFirestore.doc.mockReturnValue('doc');
      mockFirestore.updateDoc.mockResolvedValue(undefined);

      // Mock getByEmail to return null (no conflict)
      vi.spyOn(ClienteService, 'getByEmail').mockResolvedValue(null);

      await expect(ClienteService.update('client1', updates)).resolves.not.toThrow();
      expect(mockFirestore.updateDoc).toHaveBeenCalled();
    });

    it('should reject update with existing email', async () => {
      const updates = {
        email: 'existing@test.com'
      };

      const existingClient = {
        id: 'other-client',
        email: 'existing@test.com'
      };

      vi.spyOn(ClienteService, 'getByEmail').mockResolvedValue(existingClient);

      await expect(ClienteService.update('client1', updates)).rejects.toThrow('Ya existe un cliente con este email');
    });

    it('should handle missing ID', async () => {
      await expect(ClienteService.update('', {})).rejects.toThrow('ID de cliente es requerido');
    });
  });

  describe('delete', () => {
    it('should soft delete client', async () => {
      mockFirestore.collection.mockReturnValue('collection');
      mockFirestore.doc.mockReturnValue('doc');
      mockFirestore.updateDoc.mockResolvedValue(undefined);

      await expect(ClienteService.delete('client1')).resolves.not.toThrow();
      expect(mockFirestore.updateDoc).toHaveBeenCalledWith('doc', {
        activo: false,
        updatedAt: expect.any(Date)
      });
    });

    it('should handle missing ID', async () => {
      await expect(ClienteService.delete('')).rejects.toThrow('ID de cliente es requerido');
    });
  });

  describe('search', () => {
    it('should search clients by term', async () => {
      const mockClients = [
        {
          id: 'client1',
          data: () => ({
            nombre: 'Cliente Test',
            email: 'cliente@test.com',
            activo: true,
            createdAt: { toDate: () => new Date('2024-01-15') }
          })
        },
        {
          id: 'client2',
          data: () => ({
            nombre: 'Otro Cliente',
            email: 'otro@test.com',
            activo: true,
            createdAt: { toDate: () => new Date('2024-01-15') }
          })
        }
      ];

      mockFirestore.collection.mockReturnValue('collection');
      mockFirestore.query.mockReturnValue('query');
      mockFirestore.orderBy.mockReturnValue('orderBy');
      mockFirestore.getDocs.mockResolvedValue({
        docs: mockClients
      });

      const result = await ClienteService.search('Test');

      expect(result).toHaveLength(1);
      expect(result[0].nombre).toBe('Cliente Test');
    });

    it('should return empty array for short search terms', async () => {
      const result = await ClienteService.search('a');
      expect(result).toEqual([]);
    });
  });

  describe('getStats', () => {
    it('should return client statistics', async () => {
      const mockClients = [
        {
          id: 'client1',
          data: () => ({
            nombre: 'Cliente 1',
            email: 'cliente1@test.com',
            activo: true,
            empresa: 'Empresa 1',
            createdAt: { toDate: () => new Date('2024-01-15') }
          })
        },
        {
          id: 'client2',
          data: () => ({
            nombre: 'Cliente 2',
            email: 'cliente2@test.com',
            activo: false,
            empresa: '',
            createdAt: { toDate: () => new Date('2024-01-15') }
          })
        }
      ];

      mockFirestore.collection.mockReturnValue('collection');
      mockFirestore.query.mockReturnValue('query');
      mockFirestore.orderBy.mockReturnValue('orderBy');
      mockFirestore.getDocs.mockResolvedValue({
        docs: mockClients
      });

      const result = await ClienteService.getStats();

      expect(result.total).toBe(2);
      expect(result.activos).toBe(1);
      expect(result.inactivos).toBe(1);
      expect(result.conEmpresa).toBe(1);
      expect(result.sinEmpresa).toBe(1);
    });
  });
});
