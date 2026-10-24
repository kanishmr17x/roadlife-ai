import React from 'react';
import { useParams } from 'react-router-dom';
import { PortalModuleView } from '../../components/layout/PortalModuleView';
import { Card } from '../../components/common/Card';

export default function ContractorDetailsPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <PortalModuleView
      portal="Government"
      title={`Contractor Performance Audit: ${id || 'BuildInfra EPC'}`}
      description="Historical defect resolution records, laboratory specimen tests, and penalty assessment logs."
    >
      <Card className="p-6 space-y-3 bg-[#FFFEFA] border border-[#D8D7CE] shadow-sm">
        <h3 className="font-serif text-base font-semibold text-[#252A24]">Audit Summary</h3>
        <p className="text-xs text-[#6F726A] leading-relaxed">
          Contractor ID <span className="font-mono text-[#252A24] font-semibold">{id}</span> has resolved 42 road distress incidents in the current financial quarter with a 94.6% material match rate and 0 SLA breach escalations.
        </p>
      </Card>
    </PortalModuleView>
  );
}
