import React from 'react';
import { PortalModuleView } from '../../components/layout/PortalModuleView';
import { Card } from '../../components/common/Card';
import { Database, Cpu } from 'lucide-react';

export default function GovernmentSettingsPage() {
  return (
    <PortalModuleView
      portal="Government"
      title="Platform Configuration & Regulatory Thresholds"
      description="Configure distress triage thresholds, weather risk tolerance limits, and backend API parameters."
    >
      <div className="space-y-4 max-w-2xl">
        <Card className="bg-[#FFFEFA] border border-[#D8D7CE] space-y-3 p-5 shadow-sm">
          <h4 className="text-sm font-semibold text-[#252A24] flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#355844]" />
            Computer Vision Inference Thresholds
          </h4>
          <p className="text-xs text-[#6F726A] leading-relaxed">
            Pothole confidence threshold set to 0.75. Material aggregate grading match threshold set to 0.85 in accordance with MoRTH specifications.
          </p>
        </Card>

        <Card className="bg-[#FFFEFA] border border-[#D8D7CE] space-y-3 p-5 shadow-sm">
          <h4 className="text-sm font-semibold text-[#252A24] flex items-center gap-2">
            <Database className="w-4 h-4 text-[#355844]" />
            MongoDB Atlas GeoJSON Spatial Indexing
          </h4>
          <p className="text-xs text-[#6F726A] leading-relaxed">
            2dsphere compound indexing active on location coordinate fields. Municipal proximity search radius configured at 5.0 km.
          </p>
        </Card>
      </div>
    </PortalModuleView>
  );
}
