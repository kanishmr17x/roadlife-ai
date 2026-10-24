import React from 'react';
import { useParams } from 'react-router-dom';
import { PortalModuleView } from '../../components/layout/PortalModuleView';
import { Card } from '../../components/common/Card';

export default function ContractorRoadDetailsPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <PortalModuleView
      portal="Contractor"
      title={`Corridor Dossier: ${id || 'Outer Ring Road'}`}
      description="Detailed technical specifications, geofenced boundaries, and ongoing maintenance lifecycle."
      stageNote="Digital immutable evidence chain linked to NHAI and Karnataka State PWD specifications."
    >
      <Card className="p-5 bg-[#FFFEFA] border border-[#D8D7CE] space-y-3 shadow-sm">
        <h3 className="font-serif text-base font-semibold text-[#252A24]">Engineering Specification</h3>
        <p className="text-xs text-[#6F726A] leading-relaxed">
          Design Speed: 80 km/h • Carriageway: Dual 3-lane divided • Pavement: Bituminous concrete wearing course (40mm) over Dense Bituminous Macadam (50mm).
        </p>
      </Card>
    </PortalModuleView>
  );
}
