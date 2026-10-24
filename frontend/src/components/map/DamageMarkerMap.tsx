import React, { useState } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { DamageRecord } from '../../types/damage';
import { DamageSeverity } from '../../constants/status';
import { THEME_CONFIG } from '../../config/theme';
import { MapView } from './MapView';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { ExternalLink, Filter, MapPin } from 'lucide-react';

export interface DamageMarkerMapProps {
  damages: DamageRecord[];
  onSelectDamage?: (damage: DamageRecord) => void;
  height?: string;
  selectedId?: string;
  allowCoordinatePicking?: boolean;
  onPickCoordinate?: (lat: number, lon: number) => void;
  pickedCoordinate?: [number, number] | null; // [lat, lon]
}

// Generate dynamic SVG pins styled in Civic Field Notes palette
function createSeverityPin(severity: DamageSeverity, isSelected: boolean) {
  const color = THEME_CONFIG.severityColors[severity]?.hex || '#355844';
  const size = isSelected ? 32 : 26;
  const strokeWidth = isSelected ? 2.5 : 1.5;

  const svgHtml = `
    <div class="civic-map-pin" style="transform: translate(-50%, -100%);">
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C7.58 0 4 3.58 4 8C4 13.5 12 24 12 24C12 24 20 13.5 20 8C20 3.58 16.42 0 12 0Z" 
              fill="${color}" stroke="#FFFFFF" stroke-width="${strokeWidth}"/>
        <circle cx="12" cy="8" r="3.5" fill="#FFFFFF" />
      </svg>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'roadsense-civic-pin',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

const pickedPinIcon = L.divIcon({
  html: `
    <div style="transform: translate(-50%, -100%);">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C7.58 0 4 3.58 4 8C4 13.5 12 24 12 24C12 24 20 13.5 20 8C20 3.58 16.42 0 12 0Z" 
              fill="#355844" stroke="#FFFFFF" stroke-width="2"/>
        <circle cx="12" cy="8" r="3.5" fill="#FFFFFF" />
      </svg>
    </div>
  `,
  className: 'roadsense-picked-pin',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

export const DamageMarkerMap: React.FC<DamageMarkerMapProps> = ({
  damages,
  onSelectDamage,
  height = '480px',
  selectedId,
  allowCoordinatePicking = false,
  onPickCoordinate,
  pickedCoordinate,
}) => {
  const [severityFilter, setSeverityFilter] = useState<DamageSeverity | 'ALL'>('ALL');

  // Filter damage points
  const filteredDamages = damages.filter((d) => {
    // Validate coordinates exist
    if (!d.location || !Array.isArray(d.location.coordinates) || d.location.coordinates.length < 2) {
      return false;
    }
    const [lon, lat] = d.location.coordinates;
    if (typeof lat !== 'number' || typeof lon !== 'number' || isNaN(lat) || isNaN(lon)) {
      return false;
    }
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return false;
    }
    if (severityFilter !== 'ALL' && d.severity !== severityFilter) {
      return false;
    }
    return true;
  });

  // Calculate center from filtered points or use Bangalore default
  const defaultCenter: [number, number] = [12.9716, 77.5946];
  const center: [number, number] =
    filteredDamages.length > 0
      ? [filteredDamages[0].location.coordinates[1], filteredDamages[0].location.coordinates[0]]
      : defaultCenter;

  return (
    <div className="space-y-2.5">
      {/* Map Filter & Info Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FFFEFA] p-2.5 sm:p-3 rounded-md border border-[#D8D7CE] shadow-sm">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#355844]" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#6F726A]">Filter Severity:</span>
          <div className="flex flex-wrap gap-1">
            {([
              'ALL',
              DamageSeverity.CRITICAL,
              DamageSeverity.HIGH,
              DamageSeverity.MEDIUM,
              DamageSeverity.LOW,
            ] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2.5 py-0.5 text-xs font-medium rounded transition-colors ${
                  severityFilter === sev
                    ? 'bg-[#355844] text-[#FFFEFA] font-semibold'
                    : 'bg-[#F5F3EC] text-[#252A24] hover:bg-[#E5EADF]'
                }`}
              >
                {sev === 'ALL' ? 'All Severities' : THEME_CONFIG.severityColors[sev]?.label || sev}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#6F726A]">
          <MapPin className="w-3.5 h-3.5 text-[#355844]" />
          <span>
            <strong className="text-[#252A24] font-semibold">{filteredDamages.length}</strong> incidents mapped
          </span>
          {allowCoordinatePicking && (
            <span className="text-[#355844] ml-2 font-mono text-[11px] bg-[#EDF3EE] px-2 py-0.5 rounded border border-[#C6D8CC]">
              Click map to set coordinates
            </span>
          )}
        </div>
      </div>

      {/* Map View */}
      <MapView
        center={center}
        zoom={12}
        height={height}
        onMapClick={allowCoordinatePicking ? onPickCoordinate : undefined}
      >
        {/* Render Damage Markers */}
        {filteredDamages.map((damage) => {
          const [lon, lat] = damage.location.coordinates;
          const isSelected = damage.id === selectedId;

          return (
            <Marker
              key={damage.id}
              position={[lat, lon]}
              icon={createSeverityPin(damage.severity, isSelected)}
              eventHandlers={{
                click: () => {
                  if (onSelectDamage) {
                    onSelectDamage(damage);
                  }
                },
              }}
            >
              <Popup>
                <div className="space-y-2 min-w-[220px] text-[#252A24]">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="severity" severity={damage.severity} size="sm" />
                    {damage.isDemo && <Badge variant="demo" size="sm" />}
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-[#252A24] leading-snug">
                    {damage.title}
                  </h4>

                  <p className="text-xs text-[#6F726A] line-clamp-2">{damage.description}</p>

                  <div className="text-[11px] text-[#6F726A] space-y-0.5 border-t border-[#D8D7CE] pt-1.5 font-mono">
                    <div>
                      <span className="text-[#252A24] font-medium">Type:</span> {damage.damageType.replace('_', ' ')}
                    </div>
                    {damage.roadName && (
                      <div className="truncate">
                        <span className="text-[#252A24] font-medium">Road:</span> {damage.roadName}
                      </div>
                    )}
                    <div>
                      <span className="text-[#252A24] font-medium">GPS:</span> {lat.toFixed(4)}°N, {lon.toFixed(4)}°E
                    </div>
                  </div>

                  {onSelectDamage && (
                    <div className="pt-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="w-full text-xs py-1"
                        onClick={() => onSelectDamage(damage)}
                        rightIcon={<ExternalLink className="w-3 h-3" />}
                      >
                        Inspect Record
                      </Button>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Render User-Picked Location Pin if in selection mode */}
        {pickedCoordinate && (
          <Marker position={pickedCoordinate} icon={pickedPinIcon}>
            <Popup>
              <div className="p-1 text-xs text-[#252A24] font-mono">
                <p className="font-bold text-[#355844]">Pinned GPS Coordinates</p>
                <p className="text-[#6F726A] mt-0.5">
                  Lat: {pickedCoordinate[0].toFixed(5)}, Lon: {pickedCoordinate[1].toFixed(5)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapView>
    </div>
  );
};
