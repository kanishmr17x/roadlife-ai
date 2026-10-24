import React from 'react';
import { PortalModuleView } from '../../components/layout/PortalModuleView';
import { Card } from '../../components/common/Card';

export default function MaterialReviewPage() {
  return (
    <PortalModuleView
      portal="Government"
      title="Statutory Material Visual Verification Review"
      description="Quality assurance review of contractor-submitted road construction materials analyzed by AI."
      stageNote="Batches marked FLAG_FOR_INSPECTION automatically trigger third-party core testing."
    >
      <div className="space-y-3">
        {[
          { id: 'BATCH-2026-90', contractor: 'BuildInfra EPC', material: 'Dense Bituminous Macadam (DBM)', status: 'MATCH', confidence: '96.8%' },
          { id: 'BATCH-2026-91', contractor: 'Apex Highway', material: 'Granular Sub-Base Crushed Aggregates', status: 'MATCH', confidence: '98.1%' },
          { id: 'BATCH-2026-92', contractor: 'City Pavements', material: 'Cold Mix Polymer Asphalt', status: 'FLAG_FOR_INSPECTION', confidence: '68.4%' },
        ].map((b) => (
          <Card key={b.id} className="p-4 bg-[#FFFEFA] border border-[#D8D7CE] flex items-center justify-between shadow-sm">
            <div>
              <span className="text-sm font-semibold text-[#252A24]">{b.material}</span>
              <p className="text-xs text-[#6F726A]">Contractor: {b.contractor} • Ref: <span className="font-mono">{b.id}</span></p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-[#6F726A]">Confidence: {b.confidence}</span>
              <span
                className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded border ${
                  b.status === 'MATCH'
                    ? 'bg-[#E5EADF] text-[#355844] border-[#78846A]/20'
                    : 'bg-[#A9423B]/10 text-[#A9423B] border-[#A9423B]/20'
                }`}
              >
                {b.status}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </PortalModuleView>
  );
}
