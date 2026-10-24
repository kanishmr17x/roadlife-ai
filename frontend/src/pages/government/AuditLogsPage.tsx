import React from 'react';
import { PortalModuleView } from '../../components/layout/PortalModuleView';
import { Card } from '../../components/common/Card';
import { History } from 'lucide-react';

export default function AuditLogsPage() {
  const logs = [
    { id: 'LOG-881', event: 'Damage Status Transitioned to COMPLETED', actor: 'BuildInfra Field Engineer', target: 'DEMO-DMG-006', time: '10:45 AM Today' },
    { id: 'LOG-880', event: 'Material Verification Match Approved', actor: 'Automated ML Vision Microservice', target: 'BATCH-2026-90', time: '09:20 AM Today' },
    { id: 'LOG-879', event: 'Public Grievance Escalated to Critical', actor: 'Citizen Watch Algorithm', target: 'DEMO-DMG-001', time: 'Yesterday' },
  ];

  return (
    <PortalModuleView
      portal="Government"
      title="Immutable System Audit Trail"
      description="Cryptographic and timestamped change log of all road damage classifications, contractor dispatches, and material approvals."
      stageNote="Preserves tamper-evident evidence chain for statutory oversight, anti-corruption compliance, and public right-to-information audits."
    >
      <div className="space-y-3">
        {logs.map((l) => (
          <Card key={l.id} className="p-4 bg-[#FFFEFA] border border-[#D8D7CE] flex items-center justify-between text-xs shadow-sm">
            <div className="space-y-1">
              <span className="font-semibold text-[#252A24] flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-[#355844]" />
                {l.event}
              </span>
              <p className="text-[#6F726A]">Actor: {l.actor} • Ref: <span className="font-mono text-[#252A24]">{l.target}</span></p>
            </div>
            <div className="text-right">
              <span className="font-mono text-[#355844] font-semibold">{l.id}</span>
              <span className="text-[#6F726A] block text-[11px] font-mono">{l.time}</span>
            </div>
          </Card>
        ))}
      </div>
    </PortalModuleView>
  );
}
