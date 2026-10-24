import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DamageRecord } from '../../types/damage';
import { damageService } from '../../services/damage/damageService';
import { MainLayout } from '../../layouts/MainLayout';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { MapView } from '../../components/map/MapView';
import { Marker, Popup } from 'react-leaflet';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Wrench, 
  User, 
  AlertCircle,
  FileText,
  Compass
} from 'lucide-react';

export default function ReportDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [damage, setDamage] = useState<DamageRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRecord() {
      if (!id) return;
      setIsLoading(true);
      const record = await damageService.getDamageById(id);
      setDamage(record);
      setIsLoading(false);
    }
    fetchRecord();
  }, [id]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="py-24">
          <Spinner size="md" label="Loading inspection dossier..." />
        </div>
      </MainLayout>
    );
  }

  if (!damage) {
    return (
      <MainLayout>
        <div className="max-w-md mx-auto text-center py-16 space-y-3 bg-[#FFFEFA] border border-[#D8D7CE] rounded-md p-6">
          <AlertCircle className="w-10 h-10 text-[#C48B32] mx-auto" />
          <h2 className="text-base font-bold text-[#252A24] font-serif">Incident Record Not Found</h2>
          <p className="text-xs text-[#6F726A]">
            No inspection report matches identifier: <span className="font-mono text-[#252A24]">{id}</span>.
          </p>
          <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
            Return to Registry
          </Button>
        </div>
      </MainLayout>
    );
  }

  const [lon, lat] = damage.location.coordinates;

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Back and Title Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#D8D7CE]">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            >
              Return
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#78846A]">
                  INSPECTION DOSSIER
                </span>
                <span>•</span>
                <span className="text-[10px] font-mono text-[#6F726A]">{damage.id}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#252A24] font-serif mt-0.5">
                {damage.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="severity" severity={damage.severity} />
            <Badge variant="status" status={damage.status} />
            {damage.isDemo && <Badge variant="demo" size="sm" />}
          </div>
        </div>

        {/* Overview & Visual Evidence Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Notes Card */}
          <div className="bg-[#FFFEFA] border border-[#D8D7CE] rounded-md p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-[#D8D7CE]">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#252A24]">
                Field Observation Notes
              </span>
              <span className="text-[10px] font-mono text-[#6F726A]">REF: SCHEDULE-84</span>
            </div>

            <p className="text-xs text-[#5A5D55] leading-relaxed bg-[#F5F3EC] p-3 rounded border border-[#D8D7CE]">
              {damage.description}
            </p>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b border-[#D8D7CE]/60">
                <span className="text-[#6F726A]">Distress Category:</span>
                <span className="text-[#252A24] font-medium capitalize">
                  {damage.damageType.replace('_', ' ').toLowerCase()}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#D8D7CE]/60">
                <span className="text-[#6F726A]">Corridor:</span>
                <span className="text-[#252A24] font-medium">{damage.roadName || 'Not specified'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#D8D7CE]/60">
                <span className="text-[#6F726A]">Station / Landmark:</span>
                <span className="text-[#252A24]">{damage.address || 'Point Coordinates only'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#6F726A]">Field Observer:</span>
                <span className="text-[#252A24] font-medium">{damage.reporterName || 'Citizen Inspector'}</span>
              </div>
            </div>
          </div>

          {/* Photo Evidence */}
          <div className="bg-[#FFFEFA] border border-[#D8D7CE] rounded-md p-4 space-y-2 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-[#D8D7CE]">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#252A24]">
                Pavement Photographic Evidence
              </span>
              <span className="text-[10px] font-mono text-[#6F726A]">IMAGE ATTACHMENT</span>
            </div>

            {damage.photoUrl ? (
              <div className="h-56 rounded overflow-hidden border border-[#D8D7CE] bg-[#F5F3EC]">
                <img
                  src={damage.photoUrl}
                  alt={damage.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="h-56 rounded border border-dashed border-[#D8D7CE] flex items-center justify-center text-xs text-[#9E9F97] bg-[#F5F3EC]/50 font-mono">
                No photograph attached with this inspection record
              </div>
            )}
          </div>
        </div>

        {/* Spatial Location Map */}
        <div className="bg-[#FFFEFA] border border-[#D8D7CE] rounded-md p-4 space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-[#D8D7CE]">
            <div className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-[#355844]" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#252A24]">
                Spatial Coordinate Verification (WGS 84)
              </h3>
            </div>
            <span className="text-xs font-mono text-[#355844]">
              {lat.toFixed(5)}° N, {lon.toFixed(5)}° E
            </span>
          </div>

          <MapView center={[lat, lon]} zoom={14} height="260px">
            <Marker position={[lat, lon]}>
              <Popup>
                <div className="text-xs text-[#252A24] space-y-0.5">
                  <p className="font-bold">{damage.title}</p>
                  <p className="text-[#6F726A] text-[11px]">{damage.roadName}</p>
                </div>
              </Popup>
            </Marker>
          </MapView>
        </div>

        {/* AI Volumetric Repair Plan */}
        {damage.repairEstimate && (
          <div className="bg-[#FFFEFA] border border-[#D8D7CE] border-l-4 border-l-[#355844] rounded-md p-4 space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-[#D8D7CE]">
              <div className="flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-[#355844]" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#355844]">
                  AI Volumetric Material & Labor Estimation
                </h3>
              </div>
              <span className="text-base font-bold text-[#252A24] font-mono tabular-nums">
                ₹{damage.repairEstimate.estimatedCostInr.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded bg-[#F5F3EC] border border-[#D8D7CE]/70">
                <span className="text-[#6F726A] block text-[10px] font-mono uppercase">Specified Mix</span>
                <span className="text-[#252A24] font-medium">{damage.repairEstimate.materialType}</span>
              </div>
              <div className="p-2.5 rounded bg-[#F5F3EC] border border-[#D8D7CE]/70">
                <span className="text-[#6F726A] block text-[10px] font-mono uppercase">Volume / Weight</span>
                <span className="text-[#252A24] font-mono font-semibold">{damage.repairEstimate.materialQuantityKg} kg</span>
              </div>
              <div className="p-2.5 rounded bg-[#F5F3EC] border border-[#D8D7CE]/70">
                <span className="text-[#6F726A] block text-[10px] font-mono uppercase">Crew Size</span>
                <span className="text-[#252A24] font-mono font-semibold">{damage.repairEstimate.estimatedLaborCount} workers</span>
              </div>
              <div className="p-2.5 rounded bg-[#F5F3EC] border border-[#D8D7CE]/70">
                <span className="text-[#6F726A] block text-[10px] font-mono uppercase">Compaction Window</span>
                <span className="text-[#252A24] font-mono font-semibold">{damage.repairEstimate.estimatedHours} hours</span>
              </div>
            </div>

            <p className="text-[10px] text-[#6F726A] pt-1 border-t border-[#D8D7CE]/60 flex items-center gap-1">
              <FileText className="w-3 h-3 text-[#78846A] shrink-0" />
              Statutory Disclaimer: Automated engineering estimate for triage budget allocation. Not a contractor tender award.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
