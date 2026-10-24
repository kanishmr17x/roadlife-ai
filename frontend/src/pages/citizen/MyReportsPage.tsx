import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { DamageRecord } from '../../types/damage';
import { damageService } from '../../services/damage/damageService';
import { MainLayout } from '../../layouts/MainLayout';
import { DamageReportsList } from '../../components/damage/DamageReportsList';
import { DamageDetailsModal } from '../../components/repair/DamageDetailsModal';
import { Button } from '../../components/common/Button';
import { Plus, RotateCcw, FileText } from 'lucide-react';

export default function MyReportsPage() {
  const [damages, setDamages] = useState<DamageRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDamage, setSelectedDamage] = useState<DamageRecord | null>(null);

  const load = async () => {
    setIsLoading(true);
    const res = await damageService.getAllDamages();
    setDamages(res.data);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#D8D7CE]">
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-[#78846A]">
              <span>MUNICIPAL AUDIT LOG</span>
              <span>•</span>
              <span>DISTRESS INCIDENTS</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#252A24] font-serif mt-0.5">
              Pavement Distress Incident Registry
            </h1>
            <p className="text-xs text-[#6F726A] mt-0.5">
              Verified record of citizen-reported road anomalies, contractor work orders, and resolution milestones.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={load}
              isLoading={isLoading}
              leftIcon={<RotateCcw className="w-3 h-3" />}
            >
              Refresh
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

        <DamageReportsList
          damages={damages}
          isLoading={isLoading}
          onSelectDamage={(d) => setSelectedDamage(d)}
          onRefresh={load}
        />

        <DamageDetailsModal
          isOpen={Boolean(selectedDamage)}
          damage={selectedDamage}
          onClose={() => setSelectedDamage(null)}
        />
      </div>
    </MainLayout>
  );
}
