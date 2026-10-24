import React from 'react';
import { PortalModuleView } from '../../components/layout/PortalModuleView';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { Map, PlusCircle, ExternalLink } from 'lucide-react';

export default function RoadManagementPage() {
  const sampleRoads = [
    { id: 'ROAD-001', name: 'Outer Ring Road (NH 44)', code: 'NH44-BLR', length: '18.4 km', stage: 'MONITORED', contractor: 'BuildInfra EPC' },
    { id: 'ROAD-002', name: 'Hosur Road Expressway', code: 'NH48-EXP', length: '12.8 km', stage: 'CONSTRUCTION', contractor: 'Apex Highway Builders' },
    { id: 'ROAD-003', name: 'Whitefield Main Corridor', code: 'WFD-ART-01', length: '9.2 km', stage: 'ASSIGNED', contractor: 'L&T Transportation' },
  ];

  return (
    <PortalModuleView
      portal="Government"
      title="Road Infrastructure Registry"
      description="Pre-construction GPS registration, corridor specifications, and contractor assignments."
      stageNote="Corridor spatial registry connected to RoadSense lifecycle architecture. Stage D will introduce live multi-segment GeoJSON LineString geometry."
    >
      <Card className="bg-[#FFFEFA] border border-[#D8D7CE] space-y-4 p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[#D8D7CE]">
          <h3 className="font-serif text-base font-semibold text-[#252A24] flex items-center gap-2">
            <Map className="w-4 h-4 text-[#355844]" />
            Registered Municipal Corridors
          </h3>
          <Link to={ROUTES.GOVERNMENT.CREATE_ROAD}>
            <Button size="sm" variant="primary" leftIcon={<PlusCircle className="w-3.5 h-3.5" />}>
              Register New Corridor
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#252A24]">
            <thead className="bg-[#F5F3EC] text-[#6F726A] uppercase text-[10px] font-mono tracking-wider border-b border-[#D8D7CE]">
              <tr>
                <th className="py-2.5 px-3">Road Name</th>
                <th className="py-2.5 px-3">Code</th>
                <th className="py-2.5 px-3">Length</th>
                <th className="py-2.5 px-3">Lifecycle Stage</th>
                <th className="py-2.5 px-3">Assigned Contractor</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8D7CE] font-medium">
              {sampleRoads.map((r) => (
                <tr key={r.id} className="hover:bg-[#F5F3EC]/70 transition-colors">
                  <td className="py-3 px-3 font-semibold text-[#252A24]">{r.name}</td>
                  <td className="py-3 px-3 font-mono text-[#355844]">{r.code}</td>
                  <td className="py-3 px-3 text-[#6F726A]">{r.length}</td>
                  <td className="py-3 px-3">
                    <Badge variant="status" status={r.stage} size="sm" />
                  </td>
                  <td className="py-3 px-3 text-[#6F726A]">{r.contractor}</td>
                  <td className="py-3 px-3 text-right">
                    <Link to={ROUTES.GOVERNMENT.ROAD_MAP}>
                      <Button size="sm" variant="ghost" rightIcon={<ExternalLink className="w-3 h-3" />}>
                        View Map
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PortalModuleView>
  );
}
