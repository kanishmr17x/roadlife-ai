import { DamageSeverity } from '../constants/status';

export type DamageType = 
  | 'POTHOLE' 
  | 'ALLIGATOR_CRACK' 
  | 'TRANSVERSE_CRACK' 
  | 'RUTTING' 
  | 'EDGE_FAILURE' 
  | 'DRAINAGE_DEFECT' 
  | 'EROSION'
  | 'SURFACE_DEPRESSION';

export type DamageStatus = 
  | 'REPORTED' 
  | 'VERIFIED' 
  | 'ASSIGNED' 
  | 'IN_PROGRESS' 
  | 'COMPLETED';

export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface DamageRepairEstimate {
  estimatedCostInr: number;
  materialType: string;
  materialQuantityKg: number;
  estimatedLaborCount: number;
  estimatedHours: number;
  isAiGenerated: boolean;
}

export interface DamageRecord {
  id: string;
  title: string;
  description: string;
  damageType: DamageType | string;
  severity: DamageSeverity;
  status: DamageStatus;
  location: GeoPoint;
  address?: string;
  roadName?: string;
  photoUrl?: string;
  reporterName?: string;
  reportedAt: string;
  updatedAt?: string;
  isDemo?: boolean;
  repairEstimate?: DamageRepairEstimate;
}

export interface DamageFilter {
  severity?: DamageSeverity | 'ALL';
  status?: DamageStatus | 'ALL';
  damageType?: string | 'ALL';
  searchQuery?: string;
}

export interface CreateDamageInput {
  title: string;
  description: string;
  damageType: string;
  severity: DamageSeverity;
  latitude: number;
  longitude: number;
  address?: string;
  roadName?: string;
  photoUrl?: string;
}
