import React from 'react';
import { Compass, Database, FileText } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#D8D7CE] bg-[#FFFEFA] py-5 px-4 sm:px-6 text-xs text-[#6F726A] mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-[#355844]" />
          <span className="font-semibold text-[#252A24]">RoadSense</span>
          <span>&copy; {new Date().getFullYear()} Municipal Infrastructure Field System</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#6F726A]">
          <span className="flex items-center gap-1.5 font-mono">
            <Database className="w-3 h-3 text-[#355844]" />
            GeoJSON Spatial Model (EPSG:4326)
          </span>
          <span className="flex items-center gap-1.5">
            <FileText className="w-3 h-3 text-[#78846A]" />
            IRC-SP:84 / MoRTH Field Compliance
          </span>
        </div>
      </div>
    </footer>
  );
};
