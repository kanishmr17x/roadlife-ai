import { DamageRecord } from '../types/damage';
import { DamageSeverity } from '../constants/status';

/**
 * EXPLICIT DEVELOPMENT DEMO DATA
 * 
 * Note: These records are seed demonstrations for offline evaluation and UI verification.
 * They are explicitly flagged with `isDemo: true`.
 * In production or once Stage D backend damage CRUD endpoints are operational,
 * live records from MongoDB Atlas will be loaded via the damageService.
 */
export const SEED_DEMO_DAMAGES: DamageRecord[] = [
  {
    id: 'DEMO-DMG-001',
    title: 'Severe Cavity on Outer Ring Road Flyover Approach',
    description: 'Deep structural pothole approximately 120cm diameter and 14cm depth creating vehicle deceleration hazards on the high-speed transit lane.',
    damageType: 'POTHOLE',
    severity: DamageSeverity.CRITICAL,
    status: 'REPORTED',
    location: {
      type: 'Point',
      coordinates: [77.6385, 12.9279], // [lon, lat] - Outer Ring Road, Bellandur, Bangalore
    },
    address: 'Near Ecospace Junction, Outer Ring Road, Bellandur',
    roadName: 'Outer Ring Road (NH 44 Connector)',
    photoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    reporterName: 'Aditya Rao (Citizen Inspector)',
    reportedAt: '2026-10-23T08:30:00Z',
    isDemo: true,
    repairEstimate: {
      estimatedCostInr: 28500,
      materialType: 'Bituminous Concrete Grade 2 + Cold Mix Patch',
      materialQuantityKg: 420,
      estimatedLaborCount: 4,
      estimatedHours: 6,
      isAiGenerated: true,
    },
  },
  {
    id: 'DEMO-DMG-002',
    title: 'Alligator Fatigue Cracking Along Bus Bay',
    description: 'Extensive sub-base fatigue cracking spreading over 18 meters along the heavy commercial bus transit strip.',
    damageType: 'ALLIGATOR_CRACK',
    severity: DamageSeverity.HIGH,
    status: 'VERIFIED',
    location: {
      type: 'Point',
      coordinates: [77.5946, 12.9716], // [lon, lat] - Central Bangalore, MG Road
    },
    address: 'Near Trinity Metro Station, MG Road',
    roadName: 'Mahatma Gandhi Road Arterial',
    photoUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    reporterName: 'Kavita Menon (Urban Transit Watch)',
    reportedAt: '2026-10-22T14:15:00Z',
    isDemo: true,
    repairEstimate: {
      estimatedCostInr: 54000,
      materialType: 'Micro-surfacing Bituminous Emulsion + Geogrid Reinforcement',
      materialQuantityKg: 850,
      estimatedLaborCount: 6,
      estimatedHours: 12,
      isAiGenerated: true,
    },
  },
  {
    id: 'DEMO-DMG-003',
    title: 'Road Shoulder Erosion and Edge Breaking',
    description: 'Post-monsoon stormwater runoff caused subgrade wash-away and 45cm asphalt shoulder collapse threatening two-wheeler safety.',
    damageType: 'EDGE_FAILURE',
    severity: DamageSeverity.HIGH,
    status: 'IN_PROGRESS',
    location: {
      type: 'Point',
      coordinates: [77.6848, 12.9856], // [lon, lat] - Whitefield Main Road
    },
    address: 'Opposite ITPL Main Gate, Whitefield',
    roadName: 'Whitefield Main Corridor',
    photoUrl: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&w=800&q=80',
    reporterName: 'Rajesh Nair (BBMP Road Safety Marshall)',
    reportedAt: '2026-10-20T11:45:00Z',
    isDemo: true,
    repairEstimate: {
      estimatedCostInr: 39000,
      materialType: 'Wet Mix Macadam (WMM) + Stone Kerb Reinforcement',
      materialQuantityKg: 680,
      estimatedLaborCount: 5,
      estimatedHours: 8,
      isAiGenerated: true,
    },
  },
  {
    id: 'DEMO-DMG-004',
    title: 'Longitudinal Wheel Rutting on Heavy Freight Corridor',
    description: 'Surface rutting depth measured at 38mm along the loaded truck lane near freight depot.',
    damageType: 'RUTTING',
    severity: DamageSeverity.MEDIUM,
    status: 'ASSIGNED',
    location: {
      type: 'Point',
      coordinates: [77.6763, 12.8452], // [lon, lat] - Electronic City Expressway Approach
    },
    address: 'Phase 1 Toll Plaza Approach, Hosur Road',
    roadName: 'Hosur Road Expressway (NH 48)',
    photoUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80',
    reporterName: 'Sanjay Deshmukh (Contractor Engineer)',
    reportedAt: '2026-10-21T09:10:00Z',
    isDemo: true,
    repairEstimate: {
      estimatedCostInr: 46000,
      materialType: 'Dense Bituminous Macadam (DBM) Re-levelling',
      materialQuantityKg: 620,
      estimatedLaborCount: 5,
      estimatedHours: 10,
      isAiGenerated: true,
    },
  },
  {
    id: 'DEMO-DMG-005',
    title: 'Stormwater Drainage Grate Collapse & Road Subsidence',
    description: 'Collapsed precast concrete drain cover with 25cm adjacent road subsidence causing severe puddle formation.',
    damageType: 'DRAINAGE_DEFECT',
    severity: DamageSeverity.CRITICAL,
    status: 'REPORTED',
    location: {
      type: 'Point',
      coordinates: [77.6412, 12.9784], // [lon, lat] - 100ft Road, Indiranagar
    },
    address: 'Near 12th Main Cross, 100 Feet Road, Indiranagar',
    roadName: 'Indiranagar 100 Feet Boulevard',
    photoUrl: 'https://images.unsplash.com/photo-1508873696983-2df5703bc225?auto=format&fit=crop&w=800&q=80',
    reporterName: 'Deepa Varma (Resident Welfare)',
    reportedAt: '2026-10-24T06:20:00Z',
    isDemo: true,
    repairEstimate: {
      estimatedCostInr: 32000,
      materialType: 'Ductile Iron Drain Grating + M30 Grade Rapid Concrete',
      materialQuantityKg: 350,
      estimatedLaborCount: 4,
      estimatedHours: 5,
      isAiGenerated: true,
    },
  },
  {
    id: 'DEMO-DMG-006',
    title: 'Minor Surface Abrasion and Stone Ravelling',
    description: 'Early-stage binder loss with loose aggregate chipping on residential collector lane.',
    damageType: 'EROSION',
    severity: DamageSeverity.LOW,
    status: 'COMPLETED',
    location: {
      type: 'Point',
      coordinates: [77.6066, 12.9352], // [lon, lat] - Koramangala 4th Block
    },
    address: '80 Feet Road Junction, Koramangala',
    roadName: 'Koramangala 80 Feet Road',
    photoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
    reporterName: 'Manoj Kumar (Municipal Inspector)',
    reportedAt: '2026-10-18T16:00:00Z',
    isDemo: true,
    repairEstimate: {
      estimatedCostInr: 14500,
      materialType: 'Bitumen Fog Seal Spray Application',
      materialQuantityKg: 150,
      estimatedLaborCount: 3,
      estimatedHours: 4,
      isAiGenerated: true,
    },
  },
];
