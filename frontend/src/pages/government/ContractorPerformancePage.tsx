import React from 'react';
import { PortalModuleView } from '../../components/layout/PortalModuleView';
import { Card } from '../../components/common/Card';

export default function GovContractorPerformancePage() {
  return (
    <PortalModuleView
      portal="Government"
      title="Regional Contractor Quality Benchmark"
      description="Comparative ranking of road contractors across the Bangalore urban road network based on the Evidence-Based CPI framework."
    >
      <div className="space-y-3.5">
        {[
          { rank: '#1', name: 'Apex Highway Builders', cpi: '91.2', status: 'Exemplary', badge: 'bg-[#E5EADF] text-[#355844] border-[#78846A]/20' },
          { rank: '#2', name: 'BuildInfra EPC Private Limited', cpi: '89.2', status: 'Grade A Compliant', badge: 'bg-[#E5EADF] text-[#355844] border-[#78846A]/20' },
          { rank: '#3', name: 'L&T Transportation Infrastructure', cpi: '84.0', status: 'Satisfactory', badge: 'bg-[#F5F3EC] text-[#6F726A] border-[#D8D7CE]' },
        ].map((item) => (
          <Card key={item.name} className="p-4 bg-[#FFFEFA] border border-[#D8D7CE] flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3.5">
              <span className="text-base font-bold font-mono text-[#78846A]">{item.rank}</span>
              <div>
                <h4 className="text-sm font-semibold text-[#252A24]">{item.name}</h4>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border mt-1 inline-block ${item.badge}`}>
                  {item.status}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-[#6F726A] block">CPI Index</span>
              <span className="text-xl font-bold font-mono text-[#252A24]">{item.cpi}</span>
            </div>
          </Card>
        ))}
      </div>
    </PortalModuleView>
  );
}
