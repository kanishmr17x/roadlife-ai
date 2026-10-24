import React from 'react';
import { PortalModuleView } from '../../components/layout/PortalModuleView';
import { Card } from '../../components/common/Card';
import { Award, ShieldCheck, CheckCircle2, Clock, ThumbsUp } from 'lucide-react';

export default function ContractorPerformancePage() {
  const metrics = [
    { title: 'Material Verification Match', score: '94.6%', icon: <ShieldCheck className="w-5 h-5 text-[#355844]" />, sub: 'Verified by computer vision grading' },
    { title: 'Timely Task Execution', score: '91.0%', icon: <Clock className="w-5 h-5 text-[#B9684D]" />, sub: 'Completed within tender SLA window' },
    { title: 'Pavement Durability Index', score: '88.5%', icon: <CheckCircle2 className="w-5 h-5 text-[#355844]" />, sub: '6-month post-repair defect check' },
    { title: 'Citizen Resolution Rating', score: '4.6 / 5', icon: <ThumbsUp className="w-5 h-5 text-[#C48B32]" />, sub: 'Public satisfaction sentiment' },
  ];

  return (
    <PortalModuleView
      portal="Contractor"
      title="Evidence-Based Contractor Performance Index (CPI)"
      description="Objective rating metrics tied to immutable geofenced photo evidence and post-repair road longevity."
      stageNote="Contractor Performance Index (CPI) is calculated programmatically from verified material captures, weather compliance, and verified repair photos."
    >
      <div className="space-y-6">
        <Card className="p-6 bg-[#FFFEFA] border border-[#D8D7CE] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <span className="text-xs uppercase font-mono font-bold text-[#78846A] tracking-wider">
              Overall Performance Accreditation
            </span>
            <div className="flex items-baseline gap-3 justify-center sm:justify-start">
              <span className="text-4xl font-extrabold text-[#252A24] font-mono">89.2</span>
              <span className="text-xs font-semibold text-[#355844] bg-[#E5EADF] px-2.5 py-0.5 rounded border border-[#78846A]/20">
                Grade A Tier (Exemplary)
              </span>
            </div>
            <p className="text-xs text-[#6F726A] max-w-md leading-relaxed">
              Qualifies for priority bidding on Tier-1 National Highway and smart urban arterial maintenance contracts across Karnataka PWD.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#E5EADF] border border-[#78846A]/20 text-[#355844] shrink-0">
            <Award className="w-14 h-14" />
          </div>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m) => (
            <Card key={m.title} className="bg-[#FFFEFA] border border-[#D8D7CE] p-4 space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#6F726A] font-medium">{m.title}</span>
                {m.icon}
              </div>
              <span className="text-2xl font-bold text-[#252A24] font-mono block">{m.score}</span>
              <p className="text-[11px] text-[#6F726A] border-t border-[#D8D7CE] pt-1.5">{m.sub}</p>
            </Card>
          ))}
        </div>
      </div>
    </PortalModuleView>
  );
}
