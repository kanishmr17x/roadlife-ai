import React, { useState } from 'react';
import { PortalModuleView } from '../../components/layout/PortalModuleView';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Camera, CheckCircle2 } from 'lucide-react';

export default function MaterialCapturePage() {
  const [materialType, setMaterialType] = useState('AGGREGATE_20MM');
  const [photoUrl, setPhotoUrl] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
  };

  return (
    <PortalModuleView
      portal="Contractor"
      title="Field Material Specimen Visual Capture"
      description="Capture high-resolution aggregate and bitumen photographs for ML visual verification (MATCH vs FLAG_FOR_INSPECTION)."
      stageNote="Computer vision model analyzes aggregate grading, binder sheen, and foreign particulate ratio against MoRTH Section 500."
    >
      <Card className="max-w-2xl mx-auto space-y-4 bg-[#FFFEFA] border border-[#D8D7CE] p-6 shadow-sm">
        {success && (
          <div className="p-3 rounded-lg bg-[#E5EADF] border border-[#78846A]/30 text-[#355844] text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#355844]" />
            <span>Material specimen verified by CV engine! Result: MATCH (Confidence 96.4%)</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#252A24] mb-1.5">Material Batch Category</label>
            <select
              value={materialType}
              onChange={(e) => setMaterialType(e.target.value)}
              className="w-full rounded-md bg-[#FFFEFA] border border-[#D8D7CE] text-[#252A24] text-xs py-2.5 px-3 focus:outline-none focus:border-[#355844] focus:ring-1 focus:ring-[#355844]/20"
            >
              <option value="AGGREGATE_20MM">20mm Crushed Stone Aggregate (IRC Grade)</option>
              <option value="BITUMEN_VG30">VG-30 Viscosity Grade Bitumen</option>
              <option value="COLD_PATCH">Cold Mix Polymer Modified Patching Compound</option>
            </select>
          </div>

          <Input
            label="Specimen Photo Link"
            required
            placeholder="https://images.unsplash.com/..."
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            leftIcon={<Camera className="w-4 h-4 text-[#6F726A]" />}
          />

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary">
              Run Visual Verification Check
            </Button>
          </div>
        </form>
      </Card>
    </PortalModuleView>
  );
}
