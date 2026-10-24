import React, { useEffect, useState } from 'react';
import { PortalModuleView } from '../../components/layout/PortalModuleView';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { DamageRecord } from '../../types/damage';
import { damageService } from '../../services/damage/damageService';

export default function RepairMonitoringPage() {
  const [damages, setDamages] = useState<DamageRecord[]>([]);

  useEffect(() => {
    async function load() {
      const res = await damageService.getAllDamages();
      setDamages(res.data);
    }
    load();
  }, []);

  return (
    <PortalModuleView
      portal="Government"
      title="Road Repair Quality & SLA Monitoring"
      description="Track field repair milestones, post-repair compaction evidence, and warranty compliance."
    >
      <div className="space-y-3">
        {damages.map((d) => (
          <Card key={d.id} className="p-4 bg-[#FFFEFA] border border-[#D8D7CE] flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <span className="text-sm font-semibold text-[#252A24]">{d.title}</span>
              <p className="text-xs text-[#6F726A]">
                Road: {d.roadName || d.address} • Estimated Budget: <span className="text-[#355844] font-mono font-semibold">₹{d.repairEstimate?.estimatedCostInr.toLocaleString('en-IN')}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="severity" severity={d.severity} size="sm" />
              <Badge variant="status" status={d.status} size="sm" />
            </div>
          </Card>
        ))}
      </div>
    </PortalModuleView>
  );
}
