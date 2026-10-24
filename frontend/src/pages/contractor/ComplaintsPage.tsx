import React, { useEffect, useState } from 'react';
import { PortalModuleView } from '../../components/layout/PortalModuleView';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Link } from 'react-router-dom';
import { DamageRecord } from '../../types/damage';
import { damageService } from '../../services/damage/damageService';
import { ExternalLink } from 'lucide-react';

export default function ComplaintsPage() {
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
      portal="Contractor"
      title="Citizen Damage Complaints"
      description="Public grievances routed to BuildInfra EPC for inspection and field resolution."
      stageNote="Complaints tracked with SLA resolution timer to avoid contractor performance score penalties."
    >
      <div className="space-y-3">
        {damages.map((d) => (
          <Card key={d.id} className="p-4 bg-[#FFFEFA] border border-[#D8D7CE] flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <span className="text-sm font-semibold text-[#252A24]">{d.title}</span>
              <p className="text-xs text-[#6F726A]">Road: {d.roadName || d.address} • ID: <span className="font-mono">{d.id}</span></p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="severity" severity={d.severity} size="sm" />
              <Link to={`/contractor/complaints/${d.id}`}>
                <Button size="sm" variant="ghost" rightIcon={<ExternalLink className="w-3 h-3" />}>
                  Inspect
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </PortalModuleView>
  );
}
