import { apiClient, checkBackendHealth } from '../api/client';
import { CreateDamageInput, DamageFilter, DamageRecord } from '../../types/damage';
import { SEED_DEMO_DAMAGES } from '../../mocks/seedData';

const LOCAL_STORAGE_KEY = 'roadsense_damages_v1';

export interface DamageServiceResult<T> {
  data: T;
  isLiveBackend: boolean;
  message?: string;
}

/**
 * Reads records from browser localStorage or seeds with demo data
 */
function getLocalRecords(): DamageRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse localStorage damages, resetting to seed data', e);
  }
  // Initialize with seed
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(SEED_DEMO_DAMAGES));
  return SEED_DEMO_DAMAGES;
}

/**
 * Saves records to browser localStorage
 */
function saveLocalRecords(records: DamageRecord[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save damages to localStorage', e);
  }
}

export const damageService = {
  /**
   * Fetch all damages with fallback to local/demo records if backend routes are pending
   */
  async getAllDamages(): Promise<DamageServiceResult<DamageRecord[]>> {
    // Check if backend is reachable
    const health = await checkBackendHealth();

    if (health.status === 'ok') {
      try {
        // Attempt live endpoint (Stage D Target)
        const response = await apiClient.get<DamageRecord[]>('/damages');
        if (response.status === 200 && Array.isArray(response.data)) {
          return {
            data: response.data,
            isLiveBackend: true,
            message: 'Connected to live Express backend database',
          };
        }
      } catch (err: unknown) {
        // Backend returned 404 or other error - expected in Stage C
        const local = getLocalRecords();
        return {
          data: local,
          isLiveBackend: false,
          message: 'Express backend active at /api/health; /api/damages pending Stage D. Displaying local demo records.',
        };
      }
    }

    // Backend offline
    const local = getLocalRecords();
    return {
      data: local,
      isLiveBackend: false,
      message: 'Backend currently offline. Displaying local demo records.',
    };
  },

  /**
   * Fetch a single damage record by ID
   */
  async getDamageById(id: string): Promise<DamageRecord | null> {
    try {
      const response = await apiClient.get<DamageRecord>(`/damages/${id}`);
      if (response.status === 200 && response.data) {
        return response.data;
      }
    } catch {
      // Fallback to local
    }

    const records = getLocalRecords();
    return records.find((item) => item.id === id) || null;
  },

  /**
   * Submit a new road damage report
   */
  async createDamage(input: CreateDamageInput): Promise<DamageServiceResult<DamageRecord>> {
    const newRecord: DamageRecord = {
      id: `DMG-${Date.now().toString(36).toUpperCase()}`,
      title: input.title.trim(),
      description: input.description.trim(),
      damageType: input.damageType,
      severity: input.severity,
      status: 'REPORTED',
      location: {
        type: 'Point',
        coordinates: [Number(input.longitude), Number(input.latitude)], // [lon, lat]
      },
      address: input.address?.trim() || 'Location specified by GPS coordinates',
      roadName: input.roadName?.trim() || 'Public Urban Corridor',
      photoUrl: input.photoUrl?.trim() || undefined,
      reporterName: 'Citizen Reporter (Logged In)',
      reportedAt: new Date().toISOString(),
      isDemo: false, // User submitted!
      repairEstimate: {
        estimatedCostInr: Math.round(15000 + Math.random() * 35000),
        materialType: 'Rapid Cold Patch Asphalt Mix',
        materialQuantityKg: Math.round(200 + Math.random() * 400),
        estimatedLaborCount: 4,
        estimatedHours: 6,
        isAiGenerated: true,
      },
    };

    // Attempt live backend creation
    try {
      const response = await apiClient.post<DamageRecord>('/damages', {
        title: newRecord.title,
        description: newRecord.description,
        damageType: newRecord.damageType,
        severity: newRecord.severity,
        location: newRecord.location,
        address: newRecord.address,
        photoUrl: newRecord.photoUrl,
      });

      if (response.status === 201 || response.status === 200) {
        return {
          data: response.data,
          isLiveBackend: true,
          message: 'Damage report successfully saved to MongoDB Atlas database!',
        };
      }
    } catch (e) {
      // Stage C limitation: backend endpoint /api/damages not yet present
    }

    // Persist to local storage
    const existing = getLocalRecords();
    const updated = [newRecord, ...existing];
    saveLocalRecords(updated);

    return {
      data: newRecord,
      isLiveBackend: false,
      message: 'Report saved to local session storage (Backend /api/damages CRUD route scheduled for Stage D).',
    };
  },

  /**
   * Filter in-memory damage records
   */
  filterDamages(records: DamageRecord[], filters: DamageFilter): DamageRecord[] {
    return records.filter((r) => {
      if (filters.severity && filters.severity !== 'ALL' && r.severity !== filters.severity) {
        return false;
      }
      if (filters.status && filters.status !== 'ALL' && r.status !== filters.status) {
        return false;
      }
      if (filters.damageType && filters.damageType !== 'ALL' && r.damageType !== filters.damageType) {
        return false;
      }
      if (filters.searchQuery && filters.searchQuery.trim() !== '') {
        const query = filters.searchQuery.toLowerCase();
        const matchesTitle = r.title.toLowerCase().includes(query);
        const matchesDesc = r.description.toLowerCase().includes(query);
        const matchesRoad = r.roadName?.toLowerCase().includes(query);
        const matchesAddr = r.address?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesRoad && !matchesAddr) {
          return false;
        }
      }
      return true;
    });
  },

  /**
   * Reset local storage to initial demo state
   */
  resetToDemo(): void {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(SEED_DEMO_DAMAGES));
  },
};
