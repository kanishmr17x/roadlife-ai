import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { MainLayout } from '../../layouts/MainLayout';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { DamageMarkerMap } from '../../components/map/DamageMarkerMap';
import { DamageRecord } from '../../types/damage';
import { damageService } from '../../services/damage/damageService';
import { 
  Landmark, 
  Map, 
  BarChart2, 
  HardHat, 
  AlertTriangle, 
  IndianRupee, 
  ExternalLink
} from 'lucide-react';

export default function GovernmentDashboard() {
  const [damages, setDamages] = useState<DamageRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await damageService.getAllDamages();
      setDamages(res.data);
      setIsLoading(false);
    }
    load();
  }, []);

  const totalCost = damages.reduce((acc, d) => acc + (d.repairEstimate?.estimatedCostInr || 0), 0);

  return (
    <MainLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-3 border-b border-[#D8D7CE]">
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-[#78846A]">
              <span>MUNICIPAL INFRASTRUCTURE DIVISION</span>
              <span>•</span>
              <span>PWD CIRCLE 04</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#252A24] font-serif mt-0.5">
              Public Works & Road Lifecycle Oversight
            </h1>
            <p className="text-xs text-[#6F726A] mt-0.5">
              Regional corridor inventory, contractor quality indices (CPI), and statutory road maintenance audits.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link to={ROUTES.GOVERNMENT.ROAD_MAP}>
              <Button size="sm" variant="secondary" leftIcon={<Map className="w-3.5 h-3.5" />}>
                GIS Map
              </Button>
            </Link>
            <Link to={ROUTES.GOVERNMENT.ANALYTICS}>
              <Button size="sm" variant="secondary" leftIcon={<BarChart2 className="w-3.5 h-3.5" />}>
                Analytics
              </Button>
            </Link>
          </div>
        </div>

        {/* Oversight Stat KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            title="Registered Corridors"
            technicalCode="COR-REG"
            value="142"
            subtext="GPS-mapped lifecycle corridors"
            variant="forest"
          />
          <StatCard
            title="Logged Distresses"
            technicalCode="ANOM-TOT"
            value={damages.length}
            subtext="Under municipal review"
            variant="crimson"
          />
          <StatCard
            title="Contractor Rating (CPI)"
            technicalCode="CPI-AVG"
            value="84.6"
            subtext="Evidence-based performance avg"
            variant="sage"
          />
          <StatCard
            title="Sanctioned Budget"
            technicalCode="SOR-TALLY"
            value={`₹${(totalCost / 100000).toFixed(2)} L`}
            subtext="AI smart estimate tally"
            variant="amber"
          />
        </div>

        {/* GIS Geospatial Overview */}
        <div className="bg-[#FFFEFA] border border-[#D8D7CE] rounded-md p-4 space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-[#D8D7CE]">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#252A24] flex items-center gap-1.5">
              <Map className="w-3.5 h-3.5 text-[#355844]" />
              Regional Damage Spatial Density (WGS 84)
            </h3>
            <span className="text-[11px] font-mono text-[#6F726A]">
              {damages.length} active distress markers across monitored corridors
            </span>
          </div>

          <DamageMarkerMap damages={damages} height="360px" />
        </div>

        {/* Monitored Corridors Table */}
        <div className="bg-[#FFFEFA] border border-[#D8D7CE] rounded-md p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-[#D8D7CE]">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#252A24]">
              Active Road Infrastructure Projects & Lifecycle Status
            </h3>
            <span className="text-[10px] font-mono text-[#6F726A]">SAMPLE REGISTER</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#252A24]">
              <thead className="bg-[#F5F3EC] text-[#6F726A] uppercase text-[10px] tracking-wider border-b border-[#D8D7CE] font-mono">
                <tr>
                  <th className="py-2.5 px-3">Corridor Designation</th>
                  <th className="py-2.5 px-3">Ref Code</th>
                  <th className="py-2.5 px-3">Stage</th>
                  <th className="py-2.5 px-3">EPC Contractor</th>
                  <th className="py-2.5 px-3">Quality Score</th>
                  <th className="py-2.5 px-3 text-right">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8D7CE]/60">
                {[
                  {
                    name: 'Outer Ring Road (NH 44 Connector)',
                    code: 'COR-BLR-01',
                    stage: 'MONITORED',
                    contractor: 'BuildInfra EPC Ltd.',
                    score: '88.5%',
                  },
                  {
                    name: 'Hosur Road Expressway (NH 48)',
                    code: 'COR-BLR-02',
                    stage: 'CONSTRUCTION',
                    contractor: 'Apex Highway Builders',
                    score: '91.2%',
                  },
                  {
                    name: 'Whitefield Main Arterial',
                    code: 'COR-BLR-03',
                    stage: 'ASSIGNED',
                    contractor: 'L&T Transportation Infra',
                    score: '84.0%',
                  },
                  {
                    name: 'Indiranagar 100 Feet Boulevard',
                    code: 'COR-BLR-04',
                    stage: 'MONITORED',
                    contractor: 'Shree Sai Roadways',
                    score: '79.4%',
                  },
                ].map((row) => (
                  <tr key={row.code} className="hover:bg-[#F0F4EC] transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-[#252A24]">{row.name}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#6F726A]">{row.code}</td>
                    <td className="py-2.5 px-3">
                      <Badge variant="status" status={row.stage} size="sm" />
                    </td>
                    <td className="py-2.5 px-3 text-[#5A5D55]">{row.contractor}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#355844]">{row.score}</td>
                    <td className="py-2.5 px-3 text-right">
                      <Link to={ROUTES.GOVERNMENT.ANALYTICS}>
                        <Button size="sm" variant="ghost" rightIcon={<ExternalLink className="w-3 h-3" />}>
                          Inspect
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
