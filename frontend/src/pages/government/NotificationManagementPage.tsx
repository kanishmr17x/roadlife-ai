import React from 'react';
import { PortalModuleView } from '../../components/layout/PortalModuleView';
import { Card } from '../../components/common/Card';
import { Bell } from 'lucide-react';

export default function NotificationManagementPage() {
  return (
    <PortalModuleView
      portal="Government"
      title="Public Advisory & Notification Broadcasts"
      description="Issue road closure bulletins, monsoon pothole repair drives, and emergency transit advisories."
    >
      <Card className="p-5 space-y-3 max-w-xl bg-[#FFFEFA] border border-[#D8D7CE] shadow-sm">
        <h3 className="font-serif text-base font-semibold text-[#252A24] flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#355844]" />
          Broadcast Municipal Advisory
        </h3>
        <p className="text-xs text-[#6F726A] leading-relaxed">
          Push real-time notifications to registered citizens and mobile field crews situated within designated spatial GIS coordinates.
        </p>
      </Card>
    </PortalModuleView>
  );
}
