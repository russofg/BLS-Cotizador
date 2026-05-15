import { describe, it, expect, vi, beforeEach } from 'vitest';

// vi.mock factories run before imports but CANNOT close over variables declared
// in the module scope. Use vi.hoisted() to create the shared reference.
const { mockAuth } = vi.hoisted(() => ({
  mockAuth: { currentUser: null as null | { getIdToken: ReturnType<typeof vi.fn> } }
}));

vi.mock('../../src/utils/firebase', () => ({
  auth: mockAuth,
  db: {}
}));

vi.mock('../../src/utils/firebaseAdmin', () => ({
  getAdminAuth: vi.fn(),
  getAdminDb: vi.fn(),
  adminDb: {},
  adminAuth: {}
}));

// Import AFTER mocks are registered.
import { getIdToken } from '../../src/utils/auth';

describe('getIdToken()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.currentUser = null;
  });

  it('returns null when there is no current user', async () => {
    mockAuth.currentUser = null;
    const token = await getIdToken();
    expect(token).toBeNull();
  });

  it('returns the token string when a user is signed in', async () => {
    const mockGetIdToken = vi.fn().mockResolvedValue('id-token-abc');
    mockAuth.currentUser = { getIdToken: mockGetIdToken };

    const token = await getIdToken();

    expect(token).toBe('id-token-abc');
    expect(mockGetIdToken).toHaveBeenCalledWith(false);
  });

  it('calls getIdToken(true) when forceRefresh is requested', async () => {
    const mockGetIdToken = vi.fn().mockResolvedValue('fresh-token-xyz');
    mockAuth.currentUser = { getIdToken: mockGetIdToken };

    const token = await getIdToken(true);

    expect(token).toBe('fresh-token-xyz');
    expect(mockGetIdToken).toHaveBeenCalledWith(true);
  });
});
