import React from 'react';
import { PortalModuleView } from '../../components/layout/PortalModuleView';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { ExternalLink } from 'lucide-react';

export default function AssignedRoadsPage() {
  const assigned = [
    { id: 'ROAD-001', name: 'Outer Ring Road (NH 44)', code: 'NH44-BLR', stage: 'MONITORED', length: '18.4 km', defects: 2 },
    { id: 'ROAD-002', name: 'Hosur Road Expressway', code: 'NH48-EXP', stage: 'CONSTRUCTION', length: '12.8 km', defects: 1 },
  ];

  return (
    <PortalModuleView
      portal="Contractor"
      title="Contractor Assigned Road Corridors"
      description="Road segments assigned to BuildInfra EPC for routine maintenance, material verification, and pothole patch repair."
      stageNote="Corridors monitored under contractor warranty terms. Stage D will introduce digital lifecycle handover."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assigned.map((r) => (
          <Card key={r.id} className="p-4 bg-[#FFFEFA] border border-[#D8D7CE] space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[#252A24]">{r.name}</span>
              <Badge variant="status" status={r.stage} size="sm" />
            </div>
            <p className="text-xs text-[#6F726A]">
              Code: <span className="font-mono text-[#355844] font-medium">{r.code}</span> • Segment Length: {r.length}
            </p>
            <div className="flex items-center justify-between pt-2.5 border-t border-[#D8D7CE] text-xs">
              <span className="text-[#B9684D] font-semibold">{r.defects} Active Defects</span>
              <Link to={ROUTES.CONTRACTOR.REPAIR_TASKS}>
                <Button size="sm" variant="outline" rightIcon={<ExternalLink className="w-3 h-3" />}>
                  View Work Orders
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </PortalModuleView>
  );
}
