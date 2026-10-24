import React, { useEffect, useState } from 'react';
import { PortalModuleView } from '../../components/layout/PortalModuleView';
import { DamageReportsList } from '../../components/damage/DamageReportsList';
import { DamageDetailsModal } from '../../components/repair/DamageDetailsModal';
import { DamageRecord } from '../../types/damage';
import { damageService } from '../../services/damage/damageService';

export default function ComplaintManagementPage() {
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
    <PortalModuleView
      portal="Government"
      title="Public Grievance & Distress Triage Management"
      description="Review citizen road defect submissions, approve work order dispatches, and audit resolution SLAs."
    >
      <DamageReportsList
        damages={damages}
        onSelectDamage={(d) => setSelectedDamage(d)}
      />
      <DamageDetailsModal
        isOpen={Boolean(selectedDamage)}
        damage={selectedDamage}
        onClose={() => setSelectedDamage(null)}
      />
    </PortalModuleView>
  );
}
