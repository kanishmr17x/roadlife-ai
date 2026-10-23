export enum RoadLifecycleStage {
  REGISTERED = 'REGISTERED',
  SPECIFIED = 'SPECIFIED',
  ASSIGNED = 'ASSIGNED',
  CONSTRUCTION = 'CONSTRUCTION',
  COMPLETED = 'COMPLETED',
  MONITORED = 'MONITORED'
}

export enum DamageSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum MaterialAssessmentStatus {
  MATCH = 'MATCH',
  FLAG_FOR_INSPECTION = 'FLAG_FOR_INSPECTION'
}
