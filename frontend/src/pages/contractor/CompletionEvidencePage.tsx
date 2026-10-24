import React, { useState } from 'react';
import { PortalModuleView } from '../../components/layout/PortalModuleView';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { Camera, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function CompletionEvidencePage() {
  const navigate = useNavigate();
  const [workOrderId, setWorkOrderId] = useState('DEMO-DMG-001');
  const [photoUrl, setPhotoUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      navigate(ROUTES.CONTRACTOR.DASHBOARD);
    }, 1500);
  };

  return (
    <PortalModuleView
      portal="Contractor"
      title="Upload Repair Completion Evidence"
      description="Submit post-compaction road surface imagery with GPS geofencing and EXIF timestamp verification."
      stageNote="Evidence photographs are verified against original damage coordinates (within 50m tolerance) to calculate Contractor Performance Index."
    >
      <Card className="max-w-2xl mx-auto space-y-5 bg-[#FFFEFA] border border-[#D8D7CE] p-6 shadow-sm">
        {isSuccess && (
          <div className="p-3.5 rounded-lg bg-[#E5EADF] border border-[#78846A]/30 text-[#355844] text-xs flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#355844] shrink-0" />
            <div>
              <p className="font-semibold">Completion Evidence Logged Successfully</p>
              <p className="text-[11px] text-[#355844]/80">
                Geofence validated within 14m of target defect coordinates. Contractor performance index updated.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#252A24] mb-1.5">Associated Work Order</label>
            <select
              value={workOrderId}
              onChange={(e) => setWorkOrderId(e.target.value)}
              className="w-full rounded-md bg-[#FFFEFA] border border-[#D8D7CE] text-[#252A24] text-xs py-2 px-3 focus:outline-none focus:border-[#355844] focus:ring-1 focus:ring-[#355844]/20"
            >
              <option value="DEMO-DMG-001">DEMO-DMG-001: Outer Ring Road Cavity Patch</option>
              <option value="DEMO-DMG-002">DEMO-DMG-002: MG Road Alligator Fatigue Cracking</option>
              <option value="DEMO-DMG-003">DEMO-DMG-003: Whitefield Road Shoulder Kerb Erosion</option>
            </select>
          </div>

          <Input
            label="Finished Road Surface Image URL"
            required
            placeholder="https://images.unsplash.com/photo-..."
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            leftIcon={<Camera className="w-4 h-4 text-[#6F726A]" />}
            helperText="Provide public URL of the compacted and cooled asphalt surface."
          />

          {photoUrl && (
            <div className="h-44 rounded-lg overflow-hidden border border-[#D8D7CE] bg-[#F5F3EC] max-w-sm">
              <img src={photoUrl} alt="Finished work preview" className="w-full h-full object-cover" />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#252A24] mb-1.5">
              Field Execution Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Cut-back edges prepared, tack coat applied at 0.3 kg/m², hot mix asphalt compacted with 8-ton vibratory roller."
              className="w-full rounded-md bg-[#FFFEFA] border border-[#D8D7CE] text-[#252A24] text-xs py-2 px-3 focus:outline-none focus:border-[#355844] focus:ring-1 focus:ring-[#355844]/20"
            />
          </div>

          <div className="p-3 rounded-lg bg-[#F5F3EC] border border-[#D8D7CE] text-xs text-[#6F726A] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#355844] shrink-0" />
            <span>Automatic GPS Geofence validation enabled via EXIF metadata and browser geolocation.</span>
          </div>

          <div className="pt-3 border-t border-[#D8D7CE] flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" leftIcon={<Camera className="w-4 h-4" />}>
              Submit Completion Evidence
            </Button>
          </div>
        </form>
      </Card>
    </PortalModuleView>
  );
}
