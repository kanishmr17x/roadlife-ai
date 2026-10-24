import React from 'react';
import { PortalModuleView } from '../../components/layout/PortalModuleView';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Link } from 'react-router-dom';
import { HardHat, ExternalLink } from 'lucide-react';

export default function ContractorManagementPage() {
  const contractors = [
    { id: 'CON-001', name: 'BuildInfra EPC Private Limited', class: 'Class-1 National', cpi: '89.2', activeKm: '31.2 km', rating: 'Grade A' },
    { id: 'CON-002', name: 'Apex Highway Builders Ltd.', class: 'Class-1 National', cpi: '91.2', activeKm: '42.8 km', rating: 'Grade A+' },
    { id: 'CON-003', name: 'L&T Transportation Infrastructure', class: 'Tier-1 EPC', cpi: '84.0', activeKm: '18.4 km', rating: 'Grade B' },
  ];

  return (
    <PortalModuleView
      portal="Government"
      title="Contractor Directory & Accreditation Management"
      description="Performance auditing and accreditation directory based on Evidence-Based Contractor Performance Index (CPI)."
    >
      <div className="space-y-3.5">
        {contractors.map((c) => (
          <Card key={c.id} className="p-4 bg-[#FFFEFA] border border-[#D8D7CE] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <HardHat className="w-4 h-4 text-[#B9684D]" />
                <span className="text-sm font-semibold text-[#252A24]">{c.name}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-[#F5F3EC] border border-[#D8D7CE] text-[#6F726A] font-mono">{c.id}</span>
              </div>
              <p className="text-xs text-[#6F726A]">
                Classification: {c.class} • Active Maintenance: {c.activeKm}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-xs text-[#6F726A] block">Performance Index</span>
                <span className="text-base font-bold text-[#355844] font-mono">{c.cpi} ({c.rating})</span>
              </div>
              <Link to={`/government/contractors/${c.id}`}>
                <Button size="sm" variant="ghost" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                  Dossier
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </PortalModuleView>
  );
}
