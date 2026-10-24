import React from 'react';
import { PortalModuleView } from '../../components/layout/PortalModuleView';
import { Card } from '../../components/common/Card';
import { CloudSun, CloudRain, Sun } from 'lucide-react';

export default function WeatherSchedulePage() {
  const days = [
    {
      date: 'Today (Saturday)',
      temp: '29°C',
      humidity: '48%',
      rainRisk: '5%',
      wind: '12 km/h',
      status: 'OPTIMAL',
      notes: 'Safe for Hot Mix Asphalt (HMA) laying and compaction in compliance with MoRTH Section 500.',
    },
    {
      date: 'Tomorrow (Sunday)',
      temp: '28°C',
      humidity: '55%',
      rainRisk: '15%',
      wind: '14 km/h',
      status: 'OPTIMAL',
      notes: 'Safe for micro-surfacing, slurry seals, and rapid-setting bituminous tack coats.',
    },
    {
      date: 'Monday',
      temp: '26°C',
      humidity: '78%',
      rainRisk: '65%',
      wind: '22 km/h',
      status: 'HIGH_RISK',
      notes: 'Heavy precipitation forecast. Pause bituminous surface paving to avoid binder stripping.',
    },
    {
      date: 'Tuesday',
      temp: '27°C',
      humidity: '70%',
      rainRisk: '40%',
      wind: '18 km/h',
      status: 'MODERATE_RISK',
      notes: 'Marginal drying window. Concrete kerb and drainage work permitted; surface paving deferred.',
    },
  ];

  return (
    <PortalModuleView
      portal="Contractor"
      title="Microclimate Weather & Paving Schedule"
      description="Field precipitation analytics and drying window forecasting to prevent premature asphalt failure."
      stageNote="Connected to RoadLife AI Weather Risk Engine. Analyzes real-time Open-Meteo precipitation thresholds to automatically flag risky paving windows."
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {days.map((d) => (
            <Card
              key={d.date}
              className={`space-y-3 bg-[#FFFEFA] border p-4 ${
                d.status === 'OPTIMAL'
                  ? 'border-[#78846A]/40'
                  : d.status === 'HIGH_RISK'
                  ? 'border-[#A9423B]/40'
                  : 'border-[#C48B32]/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#252A24]">{d.date}</span>
                {d.status === 'OPTIMAL' ? (
                  <span className="text-[10px] font-mono font-bold text-[#355844] px-2 py-0.5 rounded bg-[#E5EADF] border border-[#78846A]/20">
                    Safe to Pave
                  </span>
                ) : d.status === 'HIGH_RISK' ? (
                  <span className="text-[10px] font-mono font-bold text-[#A9423B] px-2 py-0.5 rounded bg-[#A9423B]/10 border border-[#A9423B]/20">
                    Hold Paving
                  </span>
                ) : (
                  <span className="text-[10px] font-mono font-bold text-[#C48B32] px-2 py-0.5 rounded bg-[#C48B32]/10 border border-[#C48B32]/20">
                    Caution
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-[#252A24] pt-1">
                {d.status === 'OPTIMAL' ? (
                  <Sun className="w-8 h-8 text-[#C48B32]" />
                ) : (
                  <CloudRain className="w-8 h-8 text-[#78846A]" />
                )}
                <div>
                  <span className="text-2xl font-bold font-mono text-[#252A24]">{d.temp}</span>
                  <span className="text-xs text-[#6F726A] block">Precipitation Risk: {d.rainRisk}</span>
                </div>
              </div>

              <div className="text-[11px] text-[#6F726A] space-y-1.5 border-t border-[#D8D7CE] pt-2.5">
                <p className="font-mono">Humidity: {d.humidity} • Wind: {d.wind}</p>
                <p className="text-[#252A24]/90 italic leading-snug">{d.notes}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </PortalModuleView>
  );
}
