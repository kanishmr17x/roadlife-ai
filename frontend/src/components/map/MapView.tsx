import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ENV } from '../../config/env';

// Fix standard Leaflet default icon paths in bundler environments
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

export interface MapViewProps {
  center?: [number, number]; // [lat, lon]
  zoom?: number;
  height?: string;
  children?: React.ReactNode;
  onMapClick?: (lat: number, lon: number) => void;
  className?: string;
}

// Sub-component to listen to map clicks and handle resize
const MapInteractionHandler: React.FC<{ onMapClick?: (lat: number, lon: number) => void }> = ({
  onMapClick,
}) => {
  const map = useMap();

  useEffect(() => {
    // Invalidate map size after mount / container resize
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    return () => clearTimeout(timer);
  }, [map]);

  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });

  return null;
};

export const MapView: React.FC<MapViewProps> = ({
  center = [12.9716, 77.5946], // Default center: Bangalore
  zoom = 12,
  height = '420px',
  children,
  onMapClick,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      style={{ height, minHeight: '280px' }}
      className={`relative w-full rounded-md overflow-hidden border border-[#D8D7CE] bg-[#EAE8DF] shadow-sm ${className}`}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        className="w-full h-full z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
          url={ENV.MAP_TILE_LAYER}
          maxZoom={19}
        />
        <MapInteractionHandler onMapClick={onMapClick} />
        {children}
      </MapContainer>
    </div>
  );
};
