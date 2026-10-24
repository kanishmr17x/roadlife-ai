import React, { useState } from 'react';
import { PortalModuleView } from '../../components/layout/PortalModuleView';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { CheckCircle2 } from 'lucide-react';

export default function CreateRoadPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [lengthKm, setLengthKm] = useState('');
  const [contractor, setContractor] = useState('BuildInfra EPC');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      navigate(ROUTES.GOVERNMENT.ROADS);
    }, 1200);
  };

  return (
    <PortalModuleView
      portal="Government"
      title="Register New Road Corridor"
      description="Define corridor metadata, target GPS coordinates, structural pavement layers, and initial contractor assignment."
      stageNote="Draft corridor registration module. Full GeoJSON LineString coordinates import will be connected with Stage D road endpoints."
    >
      <Card className="max-w-2xl mx-auto space-y-4 bg-[#FFFEFA] border border-[#D8D7CE] p-6 shadow-sm">
        {submitted && (
          <div className="p-3 rounded-lg bg-[#E5EADF] border border-[#78846A]/30 text-[#355844] text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#355844]" />
            <span>Corridor draft successfully registered! Redirecting to inventory...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Corridor Name"
            required
            placeholder="e.g. Bellandur-Marathahalli Expressway Connector"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Corridor Code / Tender Ref"
              required
              placeholder="e.g. NH44-BLR-09"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <Input
              label="Segment Length (km)"
              type="number"
              required
              placeholder="e.g. 14.5"
              value={lengthKm}
              onChange={(e) => setLengthKm(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#252A24] mb-1.5">Assigned EPC Contractor</label>
            <select
              value={contractor}
              onChange={(e) => setContractor(e.target.value)}
              className="w-full rounded-md bg-[#FFFEFA] border border-[#D8D7CE] text-[#252A24] text-xs py-2.5 px-3 focus:outline-none focus:border-[#355844] focus:ring-1 focus:ring-[#355844]/20"
            >
              <option value="BuildInfra EPC">BuildInfra EPC Ltd. (CPI: 89.2)</option>
              <option value="Apex Highway Builders">Apex Highway Builders (CPI: 91.2)</option>
              <option value="L&T Transportation">L&T Transportation Infra (CPI: 84.0)</option>
            </select>
          </div>

          <div className="pt-3 border-t border-[#D8D7CE] flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Register Corridor
            </Button>
          </div>
        </form>
      </Card>
    </PortalModuleView>
  );
}
