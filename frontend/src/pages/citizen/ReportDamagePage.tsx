import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { MainLayout } from '../../layouts/MainLayout';
import { DamageReportForm } from '../../components/forms/DamageReportForm';
import { Button } from '../../components/common/Button';
import { ArrowLeft } from 'lucide-react';

export default function ReportDamagePage() {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="space-y-4 max-w-3xl mx-auto">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
          >
            Return
          </Button>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#78846A]">
              CIVIC OBSERVATION LOG
            </span>
            <h1 className="text-xl font-bold text-[#252A24] font-serif">
              Report Road Defect & Pavement Distress
            </h1>
          </div>
        </div>

        <DamageReportForm
          onCancel={() => navigate(ROUTES.CITIZEN.DASHBOARD)}
        />
      </div>
    </MainLayout>
  );
}
