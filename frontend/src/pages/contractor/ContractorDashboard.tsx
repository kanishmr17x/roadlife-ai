import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { MainLayout } from '../../layouts/MainLayout';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { DamageRecord } from '../../types/damage';
import { damageService } from '../../services/damage/damageService';
import { 
  HardHat, 
  Wrench, 
  CloudSun, 
  Award, 
  MapPin, 
  Camera, 
  CheckCircle,
  ExternalLink 
} from 'lucide-react';

export default function ContractorDashboard() {
  const [damages, setDamages] = useState<DamageRecord[]>([]);

  useEffect(() => {
    async function load() {
      const res = await damageService.getAllDamages();
      setDamages(res.data);
    }
    load();
  }, []);

  const activeWorkOrders = damages.filter((d) => d.status === 'ASSIGNED' || d.status === 'IN_PROGRESS');

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[#D8D7CE]">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl font-semibold text-[#252A24] flex items-center gap-2">
                <HardHat className="w-5 h-5 text-[#B9684D]" />
                Contractor Execution & Repair Operations
              </h1>
              <Badge variant="demo">BuildInfra EPC • Class-1</Badge>
            </div>
            <p className="text-xs text-[#6F726A] mt-1">
              Field repair work orders, weather-aware schedule coordination, and verifiable photo completion audits.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link to={ROUTES.CONTRACTOR.WEATHER_SCHEDULE}>
              <Button size="sm" variant="outline" leftIcon={<CloudSun className="w-3.5 h-3.5" />}>
                Weather Advisory
              </Button>
            </Link>
            <Link to={ROUTES.CONTRACTOR.PERFORMANCE}>
              <Button size="sm" variant="secondary" leftIcon={<Award className="w-3.5 h-3.5" />}>
                Quality Rating (CPI)
              </Button>
            </Link>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Assigned Work Orders"
            value={activeWorkOrders.length}
            subtext="Active repair dispatches"
            icon={<Wrench className="w-5 h-5 text-[#B9684D]" />}
            variant="amber"
          />
          <StatCard
            title="Weather Viability"
            value="Optimal (92%)"
            subtext="Dry asphalt paving window"
            icon={<CloudSun className="w-5 h-5 text-[#355844]" />}
            variant="forest"
          />
          <StatCard
            title="Material Verification"
            value="100% MATCH"
            subtext="Visual grading check"
            icon={<CheckCircle className="w-5 h-5 text-[#355844]" />}
            variant="sage"
          />
          <StatCard
            title="Performance Index"
            value="89.2"
            subtext="Quality tier: Grade A"
            icon={<Award className="w-5 h-5 text-[#355844]" />}
            variant="forest"
          />
        </div>

        {/* Weather Schedule Advisory Widget */}
        <Card className="border border-[#78846A]/30 bg-[#E5EADF]/30 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-[#355844] uppercase tracking-wider flex items-center gap-1.5">
              <CloudSun className="w-4 h-4 text-[#355844]" />
              Microclimate Paving Advisory — Bangalore Urban Corridors
            </span>
            <Badge variant="status" status="COMPLETED" size="sm">
              Clear Window: 48h
            </Badge>
          </div>
          <p className="text-xs text-[#252A24]/90 leading-relaxed">
            Current humidity 52%, temperature 29°C, 0% precipitation risk across Hosur Road & Bellandur flyover. Suitable for Hot Mix Asphalt (HMA) compaction and bitumen emulsion tack coats in compliance with MoRTH Section 500.
          </p>
        </Card>

        {/* Assigned Tasks Table */}
        <Card className="bg-[#FFFEFA] border border-[#D8D7CE] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#D8D7CE]">
            <h3 className="font-serif text-base font-semibold text-[#252A24] flex items-center gap-2">
              <Wrench className="w-4 h-4 text-[#B9684D]" />
              Active Repair Work Orders
            </h3>
            <span className="text-xs font-mono text-[#6F726A]">{activeWorkOrders.length} active tasks</span>
          </div>

          <div className="space-y-3">
            {activeWorkOrders.map((task) => (
              <div
                key={task.id}
                className="p-3.5 rounded-lg bg-[#F5F3EC]/50 border border-[#D8D7CE] hover:border-[#78846A]/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#252A24]">{task.title}</span>
                    <Badge variant="severity" severity={task.severity} size="sm" />
                    <Badge variant="status" status={task.status} size="sm" />
                  </div>
                  <p className="text-xs text-[#6F726A] flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#78846A] shrink-0" />
                    <span>{task.roadName || task.address}</span>
                    <span>•</span>
                    <span>Sanctioned:</span>
                    <span className="text-[#355844] font-mono font-semibold">
                      ₹{task.repairEstimate?.estimatedCostInr.toLocaleString('en-IN')}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link to={ROUTES.CONTRACTOR.COMPLETION_EVIDENCE}>
                    <Button
                      size="sm"
                      variant="primary"
                      leftIcon={<Camera className="w-3.5 h-3.5" />}
                      className="text-xs"
                    >
                      Upload Evidence
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
