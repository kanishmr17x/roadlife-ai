import React from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Info } from 'lucide-react';

export interface PortalModuleViewProps {
  portal: 'Citizen' | 'Contractor' | 'Government';
  title: string;
  description: string;
  stageNote?: string;
  children?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const PortalModuleView: React.FC<PortalModuleViewProps> = ({
  portal,
  title,
  description,
  stageNote = 'Operational Module • RoadSense Target Architecture',
  children,
  action,
}) => {
  const navigate = useNavigate();

  const portalBadge = {
    Citizen: 'bg-[#EDF3EE] text-[#355844] border-[#C6D8CC]',
    Contractor: 'bg-[#FDF7EC] text-[#9A6A1E] border-[#F1DAB0]',
    Government: 'bg-[#E5EADF] text-[#264031] border-[#B8C6AE]',
  }[portal];

  return (
    <MainLayout>
      <div className="space-y-5 max-w-5xl mx-auto">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3.5 border-b border-[#D8D7CE]">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            >
              Back
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-[#252A24] font-serif">{title}</h1>
                <span className={`text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded border ${portalBadge}`}>
                  {portal} Section
                </span>
              </div>
              <p className="text-xs text-[#6F726A] mt-0.5">{description}</p>
            </div>
          </div>

          {action && (
            <Button size="sm" variant="primary" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </div>

        {/* Informational Stage Banner */}
        <div className="rounded-md border border-[#D8D7CE] bg-[#FFFEFA] p-3.5 shadow-sm">
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#355844] shrink-0 mt-0.5" />
            <div className="text-xs text-[#252A24] space-y-0.5">
              <span className="font-semibold block text-[11px] font-mono uppercase tracking-wide text-[#78846A]">
                Engineering Specifications & Workflow Context
              </span>
              <p className="text-[#6F726A] leading-relaxed text-[11px]">{stageNote}</p>
            </div>
          </div>
        </div>

        {/* Content body */}
        {children}
      </div>
    </MainLayout>
  );
};
