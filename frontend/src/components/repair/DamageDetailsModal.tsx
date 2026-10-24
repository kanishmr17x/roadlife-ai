import React from 'react';
import { DamageRecord } from '../../types/damage';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { MapPin, Calendar, User, Wrench, FileText, Compass } from 'lucide-react';

export interface DamageDetailsModalProps {
  damage: DamageRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DamageDetailsModal: React.FC<DamageDetailsModalProps> = ({
  damage,
  isOpen,
  onClose,
}) => {
  if (!damage) return null;

  const [lon, lat] = damage.location.coordinates;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pavement Inspection Dossier" maxWidth="xl">
      <div className="space-y-4 text-[#252A24]">
        {/* Header badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#D8D7CE]">
          <div className="flex items-center gap-2">
            <Badge variant="severity" severity={damage.severity} />
            <Badge variant="status" status={damage.status} />
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-[#6F726A]">
            {damage.isDemo ? <Badge variant="demo" size="sm" /> : <Badge variant="live" size="sm" />}
            <span>REF: {damage.id}</span>
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-1.5">
          <h3 className="text-base font-bold text-[#252A24] font-serif leading-snug">{damage.title}</h3>
          <p className="text-xs text-[#5A5D55] leading-relaxed bg-[#F5F3EC] p-3 rounded border border-[#D8D7CE]">
            {damage.description}
          </p>
        </div>

        {/* Photo evidence if present */}
        {damage.photoUrl && (
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#78846A]">
              Photographic Evidence Record
            </span>
            <div className="rounded overflow-hidden border border-[#D8D7CE] max-h-52 bg-[#F5F3EC]">
              <img
                src={damage.photoUrl}
                alt={damage.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          </div>
        )}

        {/* Spatial & Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 rounded bg-[#F5F3EC]/70 border border-[#D8D7CE] text-xs">
          <div className="space-y-0.5">
            <span className="text-[#6F726A] flex items-center gap-1 font-mono text-[11px]">
              <Compass className="w-3 h-3 text-[#355844]" />
              Spatial Coordinates (WGS 84)
            </span>
            <p className="font-mono text-[#252A24] text-[11px]">
              {lat.toFixed(5)}° N, {lon.toFixed(5)}° E
            </p>
          </div>

          <div className="space-y-0.5">
            <span className="text-[#6F726A] flex items-center gap-1 font-mono text-[11px]">
              <Calendar className="w-3 h-3 text-[#355844]" />
              Inspection Timestamp
            </span>
            <p className="text-[#252A24] font-mono text-[11px]">
              {new Date(damage.reportedAt).toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
          </div>

          {damage.roadName && (
            <div className="space-y-0.5">
              <span className="text-[#6F726A] text-[11px]">Corridor Reference:</span>
              <p className="text-[#252A24] font-medium">{damage.roadName}</p>
            </div>
          )}

          {damage.address && (
            <div className="space-y-0.5">
              <span className="text-[#6F726A] text-[11px]">Landmark / Station:</span>
              <p className="text-[#252A24]">{damage.address}</p>
            </div>
          )}

          {damage.reporterName && (
            <div className="space-y-0.5 sm:col-span-2">
              <span className="text-[#6F726A] text-[11px] flex items-center gap-1">
                <User className="w-3 h-3 text-[#355844]" />
                Logged Field Observer:
              </span>
              <p className="text-[#252A24]">{damage.reporterName}</p>
            </div>
          )}
        </div>

        {/* AI Repair Planning Estimate */}
        {damage.repairEstimate && (
          <div className="p-3.5 rounded bg-[#FFFEFA] border border-[#D8D7CE] border-l-3 border-l-[#355844] text-xs space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#355844] flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-mono">
                <Wrench className="w-3 h-3" />
                Engineering Volumetric Estimate
              </span>
              <span className="text-sm font-bold text-[#252A24] font-mono">
                ₹{damage.repairEstimate.estimatedCostInr.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[#5A5D55] pt-1">
              <div>
                <span className="text-[#6F726A] block text-[11px]">Specified Material:</span>
                <span className="font-medium text-[#252A24]">{damage.repairEstimate.materialType}</span>
              </div>
              <div>
                <span className="text-[#6F726A] block text-[11px]">Required Quantity:</span>
                <span className="font-medium text-[#252A24] font-mono">
                  {damage.repairEstimate.materialQuantityKg} kg
                </span>
              </div>
              <div>
                <span className="text-[#6F726A] block text-[11px]">Field Crew:</span>
                <span className="font-medium text-[#252A24] font-mono">
                  {damage.repairEstimate.estimatedLaborCount} workers
                </span>
              </div>
              <div>
                <span className="text-[#6F726A] block text-[11px]">Compaction Window:</span>
                <span className="font-medium text-[#252A24] font-mono">
                  {damage.repairEstimate.estimatedHours} hours
                </span>
              </div>
            </div>

            <p className="text-[10px] text-[#6F726A] border-t border-[#D8D7CE] pt-1.5 flex items-center gap-1">
              <FileText className="w-3 h-3 text-[#78846A] shrink-0" />
              Automated volumetric projection based on defect dimensions. Not a certified contractor tender quote.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};
