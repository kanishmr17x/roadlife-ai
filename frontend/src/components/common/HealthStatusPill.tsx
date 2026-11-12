import React, { useEffect, useState } from 'react';
import { checkBackendHealth, HealthResponse } from '../../services/api/client';
import { Activity, Database, Server } from 'lucide-react';

export const HealthStatusPill: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse>({
    status: 'offline',
    service: 'roadsense-backend',
  });
  const [loading, setLoading] = useState<boolean>(true);

  const check = async () => {
    setLoading(true);
    const res = await checkBackendHealth();
    setHealth(res);
    setLoading(false);
  };

  useEffect(() => {
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  const isOk = health.status === 'ok';
  const dbConnected = health.database === 'connected';

  return (
    <div className="flex items-center gap-1.5">
      {/* Backend API Pill */}
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono border transition-colors ${
          isOk
            ? 'bg-[#EDF3EE] text-[#355844] border-[#C6D8CC]'
            : 'bg-[#F5F3EC] text-[#6F726A] border-[#D8D7CE]'
        }`}
        title={
          isOk
            ? `Express Backend (${health.service}) connected at /api/health`
            : 'Local inspection mode (Express service offline)'
        }
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            loading
              ? 'bg-[#9E9F97] animate-pulse'
              : isOk
              ? 'bg-[#355844]'
              : 'bg-[#C48B32]'
          }`}
        />
        <Server className="w-3 h-3 opacity-80" />
        <span>{isOk ? 'API Live' : 'Demo API'}</span>
      </div>

      {/* Database Pill */}
      {isOk && (
        <div
          className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono border transition-colors ${
            dbConnected
              ? 'bg-[#EDF3EE] text-[#355844] border-[#C6D8CC]'
              : 'bg-[#FAF0EF] text-[#9A6A1E] border-[#F1DAB0]'
          }`}
          title={
            dbConnected
              ? 'MongoDB Atlas connection active'
              : 'MongoDB not configured; running in resilient in-memory fallback mode'
          }
        >
          <Database className="w-3 h-3 opacity-80" />
          <span>{dbConnected ? 'MongoDB' : 'Memory DB'}</span>
        </div>
      )}
    </div>
  );
};
