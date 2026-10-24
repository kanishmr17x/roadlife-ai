import React from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { useAuthContext } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { User, Mail, Award, CheckCircle, Shield } from 'lucide-react';

export default function CitizenProfilePage() {
  const { user } = useAuthContext();

  return (
    <MainLayout>
      <div className="space-y-4 max-w-3xl mx-auto">
        <div className="pb-3 border-b border-[#D8D7CE]">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-[#78846A]">
            <span>OBSERVER PROFILE</span>
            <span>•</span>
            <span>CREDENTIAL RECORD</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#252A24] font-serif mt-0.5">
            Civic Field Observer Credentials
          </h1>
          <p className="text-xs text-[#6F726A] mt-0.5">
            Accreditation status, verified GPS logging accuracy, and public observation history.
          </p>
        </div>

        <div className="bg-[#FFFEFA] border border-[#D8D7CE] rounded-md p-5 sm:p-6 space-y-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded bg-[#EDF3EE] border border-[#C6D8CC] flex items-center justify-center text-[#355844] font-serif font-bold text-xl">
              {user?.fullName.charAt(0) || 'P'}
            </div>
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-[#252A24]">{user?.fullName || 'Priya Sharma'}</h3>
              <p className="text-xs text-[#6F726A] flex items-center gap-1.5 font-mono">
                <Mail className="w-3.5 h-3.5 text-[#78846A]" />
                {user?.email || 'citizen@roadsense.local'}
              </p>
              <div className="pt-1">
                <Badge variant="status" status="VERIFIED">
                  Verified Civic Observer
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#D8D7CE]">
            <div className="p-3 rounded bg-[#F5F3EC] border border-[#D8D7CE] text-center">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#6F726A] block">Reports Logged</span>
              <span className="text-xl font-bold text-[#252A24] font-mono tabular-nums">14</span>
            </div>
            <div className="p-3 rounded bg-[#F5F3EC] border border-[#D8D7CE] text-center">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#6F726A] block">Repairs Verified</span>
              <span className="text-xl font-bold text-[#355844] font-mono tabular-nums">11</span>
            </div>
            <div className="p-3 rounded bg-[#F5F3EC] border border-[#D8D7CE] text-center">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#6F726A] block">GPS Accuracy</span>
              <span className="text-xl font-bold text-[#252A24] font-mono tabular-nums">98.4%</span>
            </div>
          </div>

          <div className="p-3.5 rounded bg-[#F5F3EC] border border-[#D8D7CE] space-y-2">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#78846A] flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[#B9684D]" />
              Field Observer Qualifications & Badges
            </span>
            <div className="flex flex-wrap gap-2 pt-0.5">
              <span className="px-2 py-0.5 rounded bg-[#FFFEFA] border border-[#D8D7CE] text-xs text-[#252A24] flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-[#355844]" />
                Geo-verification Specialist
              </span>
              <span className="px-2 py-0.5 rounded bg-[#FFFEFA] border border-[#D8D7CE] text-xs text-[#252A24] flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-[#355844]" />
                Pothole Safety Marshall
              </span>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
