import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PortalModuleView } from '../../components/layout/PortalModuleView';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { DamageRecord } from '../../types/damage';
import { damageService } from '../../services/damage/damageService';

export default function ComplaintDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [damage, setDamage] = useState<DamageRecord | null>(null);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const rec = await damageService.getDamageById(id);
      setDamage(rec);
    }
    load();
  }, [id]);

  return (
    <PortalModuleView
      portal="Contractor"
      title={`Complaint Investigation: ${damage?.title || id}`}
      description="Field investigation parameters, citizen comments, and SLA resolution timeline."
    >
      <Card className="space-y-4 bg-[#FFFEFA] border border-[#D8D7CE] p-5 shadow-sm">
        {damage && (
          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-2">
              <Badge variant="severity" severity={damage.severity} />
              <Badge variant="status" status={damage.status} />
            </div>
            <p className="text-[#252A24] leading-relaxed">{damage.description}</p>
            <p className="text-[#6F726A]">Road Corridor: <span className="font-semibold text-[#252A24]">{damage.roadName || damage.address}</span></p>
          </div>
        )}
      </Card>
    </PortalModuleView>
  );
}
