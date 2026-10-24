import React from 'react';
import { PortalModuleView } from '../../components/layout/PortalModuleView';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export default function ConstructionMonitoringPage() {
  return (
    <PortalModuleView
      portal="Government"
      title="Corridor Construction Stage Monitoring"
      description="Real-time multi-stage verification ensuring no contractor lays bituminous layers over uncompacted sub-base."
      stageNote="Milestone clearance requires automated geofenced inspection certificates."
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { road: 'Hosur Road Expressway (NH 48)', stage: 'CONSTRUCTION', progress: '64%', contractor: 'Apex Highway' },
          { road: 'Bellandur-Outer Ring Road', stage: 'MONITORED', progress: '100%', contractor: 'BuildInfra EPC' },
          { road: 'Whitefield Corridor', stage: 'ASSIGNED', progress: '12%', contractor: 'L&T Transportation' },
        ].map((item) => (
          <Card key={item.road} className="p-4 bg-[#FFFEFA] border border-[#D8D7CE] space-y-3 shadow-sm">
            <h4 className="text-sm font-semibold text-[#252A24]">{item.road}</h4>
            <div className="flex items-center justify-between">
              <Badge variant="status" status={item.stage} size="sm" />
              <span className="text-xs font-mono font-bold text-[#355844]">{item.progress}</span>
            </div>
            <p className="text-[11px] text-[#6F726A] border-t border-[#D8D7CE] pt-2">
              Assigned: {item.contractor}
            </p>
          </Card>
        ))}
      </div>
    </PortalModuleView>
  );
}
