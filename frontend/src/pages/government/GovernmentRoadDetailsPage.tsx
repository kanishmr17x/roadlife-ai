import React from 'react';
import { useParams } from 'react-router-dom';
import { PortalModuleView } from '../../components/layout/PortalModuleView';
import { Card } from '../../components/common/Card';

export default function GovernmentRoadDetailsPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <PortalModuleView
      portal="Government"
      title={`Road Infrastructure Asset Audit: ${id || 'Outer Ring Road'}`}
      description="Asset specifications, contractor SLA records, and digital warranty tracking."
    >
      <Card className="p-6 space-y-3 bg-[#FFFEFA] border border-[#D8D7CE] shadow-sm">
        <h3 className="font-serif text-base font-semibold text-[#252A24]">Statutory Lifecycle Status</h3>
        <p className="text-xs text-[#6F726A] leading-relaxed">
          Asset Code: <span className="font-mono text-[#252A24] font-semibold">{id}</span> • Stage: MONITORED • Defect Liability Period: Active (Ends Nov 2027) • PWD Division: Bangalore Urban Infrastructure Circle.
        </p>
      </Card>
    </PortalModuleView>
  );
}
