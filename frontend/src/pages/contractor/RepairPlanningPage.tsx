import React from 'react';
import { PortalModuleView } from '../../components/layout/PortalModuleView';
import { Card } from '../../components/common/Card';

export default function RepairPlanningPage() {
  return (
    <PortalModuleView
      portal="Contractor"
      title="Smart Repair Planning Engine"
      description="Automated material, labor crew, duration, and equipment estimation based on road defect dimensions."
      stageNote="AI algorithms calculate volumetric bitumen quantities and assign crews to minimize commuter traffic disruptions."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-[#FFFEFA] border border-[#D8D7CE] space-y-2 shadow-sm">
          <span className="text-xs text-[#78846A] font-mono font-semibold uppercase tracking-wider">
            Pothole Volume Model
          </span>
          <p className="text-xs text-[#252A24] leading-relaxed">
            Calculates binder, aggregate, and compaction tonnage directly from defect depth, perimeter, and surface area.
          </p>
        </Card>
        <Card className="p-4 bg-[#FFFEFA] border border-[#D8D7CE] space-y-2 shadow-sm">
          <span className="text-xs text-[#78846A] font-mono font-semibold uppercase tracking-wider">
            Crew Allocation Optimizer
          </span>
          <p className="text-xs text-[#252A24] leading-relaxed">
            Optimizes routing schedules for municipal mobile repair vans, infrared heaters, and pneumatic compactor rollers.
          </p>
        </Card>
        <Card className="p-4 bg-[#FFFEFA] border border-[#D8D7CE] space-y-2 shadow-sm">
          <span className="text-xs text-[#78846A] font-mono font-semibold uppercase tracking-wider">
            Cost Escalation Prevention
          </span>
          <p className="text-xs text-[#252A24] leading-relaxed">
            Continuously benchmarked against Karnataka PWD Schedule of Rates (SOR) to prevent tender cost overruns.
          </p>
        </Card>
      </div>
    </PortalModuleView>
  );
}
