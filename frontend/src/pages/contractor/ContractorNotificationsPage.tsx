import React from 'react';
import { PortalModuleView } from '../../components/layout/PortalModuleView';
import { Card } from '../../components/common/Card';
import { Bell } from 'lucide-react';

export default function ContractorNotificationsPage() {
  return (
    <PortalModuleView
      portal="Contractor"
      title="Contractor Operational Dispatches"
      description="Work order assignments, material inspection results, and government audit alerts."
    >
      <div className="space-y-3">
        {[
          { title: 'New Work Order Dispatched', desc: 'Cavity on Outer Ring Road Flyover assigned with 48h resolution SLA.', time: '1 hour ago' },
          { title: 'Aggregate Batch MATCH Verified', desc: 'Blue metal aggregate sample passed IRC specifications (Confidence: 97.2%).', time: 'Yesterday' },
        ].map((item) => (
          <Card key={item.title} className="p-4 bg-[#FFFEFA] border border-[#D8D7CE] flex items-start gap-3 shadow-sm">
            <Bell className="w-4 h-4 text-[#B9684D] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h4 className="text-sm font-semibold text-[#252A24]">{item.title}</h4>
              <p className="text-xs text-[#6F726A] leading-relaxed">{item.desc}</p>
              <span className="text-[11px] font-mono text-[#78846A]">{item.time}</span>
            </div>
          </Card>
        ))}
      </div>
    </PortalModuleView>
  );
}
