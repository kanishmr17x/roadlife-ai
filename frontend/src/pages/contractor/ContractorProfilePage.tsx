import React from 'react';
import { PortalModuleView } from '../../components/layout/PortalModuleView';
import { Card } from '../../components/common/Card';
import { HardHat } from 'lucide-react';

export default function ContractorProfilePage() {
  return (
    <PortalModuleView
      portal="Contractor"
      title="Contractor Entity Profile: BuildInfra EPC"
      description="Tender registration details, active maintenance contracts, and equipment fleet status."
    >
      <Card className="p-6 bg-[#FFFEFA] border border-[#D8D7CE] space-y-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-[#E5EADF] border border-[#78846A]/20 text-[#355844]">
            <HardHat className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-serif font-bold text-[#252A24]">BuildInfra EPC Private Limited</h3>
            <p className="text-xs text-[#6F726A]">Karnataka PWD Class-1 Registered Highway Maintenance Contractor</p>
            <span className="text-xs text-[#355844] font-semibold mt-1 inline-block font-mono bg-[#E5EADF] px-2 py-0.5 rounded border border-[#78846A]/20">
              CPI Score: 89.2 (Grade A Tier)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#D8D7CE] text-xs">
          <div className="p-3 rounded-lg bg-[#F5F3EC]/70 border border-[#D8D7CE]">
            <span className="text-[#6F726A] block">Monitored Kilometers</span>
            <span className="text-lg font-bold text-[#252A24] font-mono">31.2 km</span>
          </div>
          <div className="p-3 rounded-lg bg-[#F5F3EC]/70 border border-[#D8D7CE]">
            <span className="text-[#6F726A] block">Active Work Orders</span>
            <span className="text-lg font-bold text-[#B9684D] font-mono">4</span>
          </div>
          <div className="p-3 rounded-lg bg-[#F5F3EC]/70 border border-[#D8D7CE]">
            <span className="text-[#6F726A] block">Verified Repairs</span>
            <span className="text-lg font-bold text-[#355844] font-mono">42</span>
          </div>
        </div>
      </Card>
    </PortalModuleView>
  );
}
