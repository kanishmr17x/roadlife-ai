import React from 'react';
import { DamageRecord } from '../../types/damage';
import { THEME_CONFIG } from '../../config/theme';
import { DamageSeverity } from '../../constants/status';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { BarChart2, PieChart, Info } from 'lucide-react';

export interface DamageAnalyticsChartProps {
  damages: DamageRecord[];
  isDemo?: boolean;
}

export const DamageAnalyticsChart: React.FC<DamageAnalyticsChartProps> = ({
  damages,
  isDemo = true,
}) => {
  // Aggregate severity distribution
  const severityCounts: Record<DamageSeverity, number> = {
    [DamageSeverity.CRITICAL]: 0,
    [DamageSeverity.HIGH]: 0,
    [DamageSeverity.MEDIUM]: 0,
    [DamageSeverity.LOW]: 0,
  };

  // Aggregate damage type distribution
  const typeCounts: Record<string, number> = {};

  // Aggregate estimated cost
  let totalEstimatedCost = 0;

  damages.forEach((d) => {
    if (severityCounts[d.severity] !== undefined) {
      severityCounts[d.severity]++;
    }
    const typeKey = d.damageType.replace('_', ' ');
    typeCounts[typeKey] = (typeCounts[typeKey] || 0) + 1;

    if (d.repairEstimate?.estimatedCostInr) {
      totalEstimatedCost += d.repairEstimate.estimatedCostInr;
    }
  });

  const totalReports = damages.length || 1;

  return (
    <div className="space-y-4">
      {/* Severity Breakdown Card */}
      <Card className="border-[#D8D7CE] space-y-3.5">
        <div className="flex items-center justify-between pb-2.5 border-b border-[#D8D7CE]">
          <div className="flex items-center gap-1.5">
            <PieChart className="w-4 h-4 text-[#355844]" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#252A24]">
              Severity Distribution
            </h3>
          </div>
          {isDemo && <Badge variant="demo" size="sm" />}
        </div>

        <div className="space-y-2.5">
          {(Object.keys(severityCounts) as DamageSeverity[]).map((sev) => {
            const count = severityCounts[sev];
            const pct = Math.round((count / totalReports) * 100);
            const config = THEME_CONFIG.severityColors[sev];

            return (
              <div key={sev} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#252A24] flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${config.dot}`} />
                    {config.label || sev}
                  </span>
                  <span className="text-[#6F726A] font-mono text-[11px] tabular-nums">
                    {count} records ({pct}%)
                  </span>
                </div>
                <div className="w-full bg-[#F5F3EC] h-1.5 rounded-full overflow-hidden border border-[#D8D7CE]">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: config.hex,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Distress Category & Cost Breakdown */}
      <Card className="border-[#D8D7CE] space-y-3.5">
        <div className="flex items-center justify-between pb-2.5 border-b border-[#D8D7CE]">
          <div className="flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-[#355844]" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#252A24]">
              Defect Classification
            </h3>
          </div>
          <span className="text-[11px] font-mono text-[#6F726A]">Tally</span>
        </div>

        <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
          {Object.entries(typeCounts).map(([type, count]) => {
            const pct = Math.round((count / totalReports) * 100);
            return (
              <div
                key={type}
                className="flex items-center justify-between text-xs p-1.5 rounded bg-[#F5F3EC] border border-[#D8D7CE]/70"
              >
                <span className="text-[#252A24] font-medium capitalize">{type.toLowerCase()}</span>
                <span className="text-[#355844] font-mono font-semibold text-[11px] tabular-nums">
                  {count} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>

        <div className="p-3 rounded bg-[#EDF3EE] border border-[#C6D8CC] space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#355844] font-medium">Volumetric Repair Budget:</span>
            <span className="text-sm font-bold text-[#264031] font-mono tabular-nums">
              ₹{totalEstimatedCost.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-[10px] text-[#5A5D55] flex items-center gap-1 pt-1 border-t border-[#C6D8CC]/60">
            <Info className="w-3 h-3 text-[#355844] shrink-0" />
            Preliminary projection based on cavity cubic volume calculations.
          </p>
        </div>
      </Card>
    </div>
  );
};
