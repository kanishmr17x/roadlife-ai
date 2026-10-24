import React, { useEffect, useState } from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { DamageMarkerMap } from '../../components/map/DamageMarkerMap';
import { DamageDetailsModal } from '../../components/repair/DamageDetailsModal';
import { DamageRecord } from '../../types/damage';
import { damageService } from '../../services/damage/damageService';
import { Badge } from '../../components/common/Badge';
import { Map } from 'lucide-react';

export default function RoadMapPage() {
  const [damages, setDamages] = useState<DamageRecord[]>([]);
  const [selectedDamage, setSelectedDamage] = useState<DamageRecord | null>(null);

  useEffect(() => {
    async function load() {
      const res = await damageService.getAllDamages();
      setDamages(res.data);
    }
    load();
  }, []);

  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#D8D7CE]">
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-[#78846A]">
              <span>GIS SPATIAL REPOSITORY</span>
              <span>•</span>
              <span>WGS 84</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#252A24] font-serif mt-0.5">
              Regional GIS Road Distress & Infrastructure Map
            </h1>
            <p className="text-xs text-[#6F726A] mt-0.5">
              Interactive spatial view of registered potholes, asphalt rutting, and road shoulder erosion across monitored corridors.
            </p>
          </div>
          <Badge variant="demo">GeoJSON Spatial Layer</Badge>
        </div>

        <DamageMarkerMap
          damages={damages}
          height="620px"
          onSelectDamage={(record) => setSelectedDamage(record)}
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
