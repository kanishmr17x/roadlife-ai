import React from 'react';
import { PortalModuleView } from '../../components/layout/PortalModuleView';
import { Card } from '../../components/common/Card';

export default function MaterialVerificationPage() {
  const verifications = [
    { id: 'MAT-001', material: '20mm Crushed Blue Metal Aggregate', result: 'MATCH', confidence: '97.2%', road: 'Outer Ring Road Flyover' },
    { id: 'MAT-002', material: 'VG-30 Bitumen Emulsion', result: 'MATCH', confidence: '94.8%', road: 'Hosur Road Expressway' },
    { id: 'MAT-003', material: 'Wet Mix Macadam Subgrade Base', result: 'FLAG_FOR_INSPECTION', confidence: '71.0%', road: 'Whitefield Corridor' },
  ];

  return (
    <PortalModuleView
      portal="Contractor"
      title="Material Visual Verification Log"
      description="Computer vision assessment results comparing captured construction materials against registered tender specifications."
      stageNote="Materials flagged as 'FLAG_FOR_INSPECTION' require physical lab core testing before government payment clearance."
    >
      <div className="space-y-3">
        {verifications.map((v) => (
          <Card key={v.id} className="p-4 bg-[#FFFEFA] border border-[#D8D7CE] flex items-center justify-between shadow-sm">
            <div>
              <span className="text-sm font-semibold text-[#252A24]">{v.material}</span>
              <p className="text-xs text-[#6F726A]">Road: {v.road} • ID: <span className="font-mono">{v.id}</span></p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-[#6F726A]">Confidence: {v.confidence}</span>
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                  v.result === 'MATCH'
                    ? 'bg-[#E5EADF] text-[#355844] border-[#78846A]/20'
                    : 'bg-[#A9423B]/10 text-[#A9423B] border-[#A9423B]/20'
                }`}
              >
                {v.result}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </PortalModuleView>
  );
}
