import React from 'react';
import { PortalModuleView } from '../../components/layout/PortalModuleView';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export default function ConstructionEvidencePage() {
  return (
    <PortalModuleView
      portal="Contractor"
      title="Stage-by-Stage Construction Evidence"
      description="Subgrade, granular sub-base, wet mix macadam, and bituminous compaction verification."
      stageNote="Immutable stage photo chain. Each stage requires geofenced photo audit before next layer clearance."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {['Subgrade Compaction', 'Granular Sub-Base (GSB)', 'Dense Bituminous Macadam', 'Bituminous Concrete'].map((stage, idx) => (
          <Card key={stage} className="p-4 bg-[#FFFEFA] border border-[#D8D7CE] space-y-2.5 shadow-sm">
            <span className="text-[10px] font-mono font-semibold text-[#78846A]">STAGE 0{idx + 1}</span>
            <h4 className="text-xs font-bold text-[#252A24]">{stage}</h4>
            <div>
              <Badge variant="status" status="COMPLETED" size="sm" />
            </div>
            <p className="text-[11px] text-[#6F726A] pt-1.5 border-t border-[#D8D7CE]">
              Geofence: Verified • Timestamp: Immutable
            </p>
          </Card>
        ))}
      </div>
    </PortalModuleView>
  );
}
