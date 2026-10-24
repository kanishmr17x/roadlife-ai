import React from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Bell, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

export default function CitizenNotificationsPage() {
  const notifications = [
    {
      id: 'NOTIF-01',
      title: 'Resurfacing Completed: Koramangala 80 Feet Road',
      message: 'The surface binder ravelling defect you logged has been sealed with bitumen fog seal spray.',
      time: '2 hours ago',
      type: 'completed',
    },
    {
      id: 'NOTIF-02',
      title: 'Contractor Work Order Dispatched: Outer Ring Road Cavity',
      message: 'BuildInfra EPC has been dispatched for asphalt cavity stabilization near Ecospace approach.',
      time: 'Yesterday',
      type: 'assigned',
    },
    {
      id: 'NOTIF-03',
      title: 'Precipitation Weather Advisory: Whitefield Arterial',
      message: 'Weather risk model detected 65% rain risk. Bituminous compaction suspended for 24 hours.',
      time: '2 days ago',
      type: 'weather',
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-4 max-w-4xl mx-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#D8D7CE]">
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-[#78846A]">
              <span>MUNICIPAL BULLETINS</span>
              <span>•</span>
              <span>ACTIVITY FEED</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#252A24] font-serif mt-0.5">
              Public Alerts & Activity Feed
            </h1>
            <p className="text-xs text-[#6F726A] mt-0.5">
              Official status notices regarding logged pavement defects, contractor work order progress, and weather advisories.
            </p>
          </div>
          <Badge variant="demo">Demo Feed</Badge>
        </div>

        <div className="space-y-2.5">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="bg-[#FFFEFA] border border-[#D8D7CE] rounded-md p-3.5 sm:p-4 flex items-start gap-3.5 shadow-sm"
            >
              <div className="p-2 rounded bg-[#F5F3EC] border border-[#D8D7CE] text-[#355844] shrink-0 mt-0.5">
                {n.type === 'completed' ? (
                  <CheckCircle2 className="w-4 h-4 text-[#355844]" />
                ) : n.type === 'weather' ? (
                  <AlertTriangle className="w-4 h-4 text-[#C48B32]" />
                ) : (
                  <Clock className="w-4 h-4 text-[#78846A]" />
                )}
              </div>
              <div className="space-y-0.5 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-bold text-[#252A24]">{n.title}</h4>
                  <span className="text-[10px] font-mono text-[#6F726A]">{n.time}</span>
                </div>
                <p className="text-xs text-[#5A5D55] leading-relaxed">{n.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
