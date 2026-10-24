import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { DamageRecord } from '../../types/damage';
import { DamageSeverity } from '../../constants/status';
import { damageService } from '../../services/damage/damageService';
import { MainLayout } from '../../layouts/MainLayout';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { DamageMarkerMap } from '../../components/map/DamageMarkerMap';
import { DamageAnalyticsChart } from '../../components/charts/DamageAnalyticsChart';
import { DamageReportsList } from '../../components/damage/DamageReportsList';
import { DamageDetailsModal } from '../../components/repair/DamageDetailsModal';
import { ErrorState } from '../../components/common/ErrorState';
import { 
  AlertTriangle, 
  Plus, 
  Activity, 
  MapPin, 
  ShieldAlert, 
  RotateCcw,
  Wrench,
  ArrowRight
} from 'lucide-react';

export default function CitizenDashboard() {
  const [damages, setDamages] = useState<DamageRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serviceMessage, setServiceMessage] = useState<string>('');
  const [isLiveBackend, setIsLiveBackend] = useState<boolean>(false);
  const [selectedDamage, setSelectedDamage] = useState<DamageRecord | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await damageService.getAllDamages();
      setDamages(res.data);
      setIsLiveBackend(res.isLiveBackend);
      setServiceMessage(res.message || '');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch road damage records';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute KPI statistics
  const totalDamages = damages.length;
  const criticalCount = damages.filter(
    (d) => d.severity === DamageSeverity.CRITICAL || d.severity === DamageSeverity.HIGH
  ).length;
  const inProgressRepairs = damages.filter(
    (d) => d.status === 'IN_PROGRESS' || d.status === 'ASSIGNED'
  ).length;
  const estimatedTotalBudget = damages.reduce(
    (acc, cur) => acc + (cur.repairEstimate?.estimatedCostInr || 0),
    0
  );

  return (
    <MainLayout>
      <div className="space-y-5">
        {/* Editorial Heading & Context Row */}
        <div className="bg-[#FFFEFA] border border-[#D8D7CE] rounded-md p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-[#6F726A]">
                <span>Corridor Audit Cycle: Q4-2026</span>
                <span>•</span>
                <span>Division: Bangalore Urban Central</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252A24] font-serif">
                Road Network Overview
              </h1>
              <p className="text-xs text-[#6F726A] max-w-2xl leading-relaxed">
                Municipal pavement monitoring and digital lifecycle log. Field officers and citizen observers record road surface distress, verify aggregate layers, and dispatch contractor work orders.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Badge variant={isLiveBackend ? 'live' : 'demo'} />
              <Button
                variant="secondary"
                size="sm"
                onClick={loadData}
                isLoading={isLoading}
                leftIcon={<RotateCcw className="w-3 h-3" />}
              >
                Sync Data
              </Button>
              <Link to={ROUTES.CITIZEN.REPORT}>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Report Defect
                </Button>
              </Link>
            </div>
          </div>

          {/* Integration Status Notice */}
          {serviceMessage && (
            <div className="mt-3 pt-2.5 border-t border-[#D8D7CE]/60 flex items-center justify-between text-xs text-[#6F726A] font-mono">
              <span className="flex items-center gap-1.5 text-[#355844] text-[11px]">
                <Activity className="w-3 h-3" />
                {serviceMessage}
              </span>
              <span className="text-[10px] text-[#9E9F97] hidden sm:inline">
                API Port: 5000 / Proxy: Vite
              </span>
            </div>
          )}
        </div>

        {error && (
          <ErrorState
            title="Failed to Load Road Records"
            message={error}
            onRetry={loadData}
          />
        )}

        {/* Editorial Metric Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            title="Tracked Incidents"
            technicalCode="GEO-REC"
            value={totalDamages}
            subtext="Registered within municipal boundary"
            variant="forest"
          />

          <StatCard
            title="Critical / Urgent"
            technicalCode="SEV-CRIT"
            value={criticalCount}
            subtext="Immediate traffic hazard priority"
            variant="crimson"
          />

          <StatCard
            title="Active Work Orders"
            technicalCode="DISP-QUEUE"
            value={inProgressRepairs}
            subtext="Assigned to maintenance EPCs"
            variant="amber"
          />

          <StatCard
            title="Est. Repair Budget"
            technicalCode="SOR-EST"
            value={`₹${(estimatedTotalBudget / 100000).toFixed(2)} L`}
            subtext="Preliminary material & crew estimate"
            variant="sage"
          />
        </div>

        {/* Primary Visual Anchor: Interactive GIS Map */}
        <section className="space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#252A24] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#355844]" />
              Geographic Distress Survey (OpenStreetMap GIS)
            </h2>
            <span className="text-[11px] font-mono text-[#6F726A]">
              Projection: WGS 84 / Coordinates: [Lon, Lat]
            </span>
          </div>

          <DamageMarkerMap
            damages={damages}
            height="440px"
            onSelectDamage={(record) => setSelectedDamage(record)}
          />
        </section>

        {/* Two-Column Section: Visual Breakdown & Recent Audits */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Visual Analytics Summary (1 Column) */}
          <div className="lg:col-span-1 space-y-2">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#252A24] flex items-center gap-1.5 px-0.5">
              <Activity className="w-3.5 h-3.5 text-[#355844]" />
              Pavement Classification
            </h2>
            <DamageAnalyticsChart damages={damages} isDemo={!isLiveBackend} />
          </div>

          {/* Damage Reports & Inspections Table (2 Columns) */}
          <div className="lg:col-span-2 space-y-2">
            <div className="flex items-center justify-between px-0.5">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#252A24] flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-[#B9684D]" />
                Recent Field Inspections & Audit Log
              </h2>
              <Link
                to={ROUTES.CITIZEN.MY_REPORTS}
                className="text-xs font-medium text-[#355844] hover:underline flex items-center gap-1"
              >
                <span>Full Registry</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <DamageReportsList
              damages={damages}
              isLoading={isLoading}
              onSelectDamage={(record) => setSelectedDamage(record)}
              onRefresh={loadData}
            />
          </div>
        </div>
      </div>

      {/* Details Dossier Modal */}
      <DamageDetailsModal
        isOpen={Boolean(selectedDamage)}
        damage={selectedDamage}
        onClose={() => setSelectedDamage(null)}
      />
    </MainLayout>
  );
}
