import React, { useEffect, useState } from 'react';
import { PortalModuleView } from '../../components/layout/PortalModuleView';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { DamageRecord } from '../../types/damage';
import { damageService } from '../../services/damage/damageService';
import { MapPin, Camera } from 'lucide-react';

export default function RepairTasksPage() {
  const [tasks, setTasks] = useState<DamageRecord[]>([]);

  useEffect(() => {
    async function load() {
      const res = await damageService.getAllDamages();
      setTasks(res.data);
    }
    load();
  }, []);

  return (
    <PortalModuleView
      portal="Contractor"
      title="Repair Work Orders & Task Dispatch"
      description="Field triage queue for executing asphalt pothole fills, crack sealing, and kerb repairs."
      stageNote="Work orders scheduled based on AI severity classification, structural dimensions, and microclimate weather windows."
    >
      <div className="space-y-3.5">
        {tasks.map((task) => (
          <Card key={task.id} className="p-4 bg-[#FFFEFA] border border-[#D8D7CE] hover:border-[#78846A]/50 transition-colors shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#252A24]">{task.title}</span>
                  <Badge variant="severity" severity={task.severity} size="sm" />
                  <Badge variant="status" status={task.status} size="sm" />
                </div>
                <p className="text-xs text-[#6F726A] flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#78846A] shrink-0" />
                  <span>{task.roadName || task.address}</span>
                  <span>•</span>
                  <span>Estimated Budget:</span>
                  <span className="text-[#355844] font-mono font-semibold">
                    ₹{task.repairEstimate?.estimatedCostInr.toLocaleString('en-IN')}
                  </span>
                </p>
                {task.repairEstimate && (
                  <p className="text-[11px] text-[#6F726A] pt-0.5">
                    Material: {task.repairEstimate.materialType} ({task.repairEstimate.materialQuantityKg} kg) • Crew: {task.repairEstimate.estimatedLaborCount} workers • Hours: {task.repairEstimate.estimatedHours}h
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link to={ROUTES.CONTRACTOR.COMPLETION_EVIDENCE}>
                  <Button size="sm" variant="primary" leftIcon={<Camera className="w-3.5 h-3.5" />}>
                    Upload Evidence
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </PortalModuleView>
  );
}
