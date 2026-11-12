import { MaterialAssessmentStatus } from '../constants/status';

export interface MaterialEvidence {
  id: string;
  photoUrl: string;
  aiAssessment: MaterialAssessmentStatus;
}

export interface MaterialMetric {
  metric_name: string;
  score: number;
  status: string;
  details: string;
}

export interface MaterialVerificationResult {
  status: string;
  material_type: string;
  confidence: number;
  overall_quality_score: number;
  compliance: string;
  metrics: MaterialMetric[];
  defects_identified: string[];
  engineering_recommendation: string;
  standard_reference: string;
}
