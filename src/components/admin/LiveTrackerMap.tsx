import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../../lib/supabase';

// Fix Leaflet's default icon issue with React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// A simple component to re-center the map when position changes
function MapUpdater({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, map.getZoom(), { animate: true });
  }, [position, map]);
  return null;
}

interface LiveTrackerMapProps {
  driverId: string;
  driverName: string;
}

export const LiveTrackerMap: React.FC<LiveTrackerMapProps> = ({ driverId, driverName }) => {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    // 1. Fetch initial location
    const fetchInitial = async () => {
      // Use select('*') instead of select('latitude, longitude') so it won't crash 
      // with "column does not exist" if the backend schema hasn't been updated yet.
      const { data, error: err } = await supabase
        .from('drivers')
        .select('*')
        .eq('id', driverId)
        .single();
      
      if (!cancelled) {
        if (err) {
          setError('Could not fetch location data.');
        } else if (data && data.latitude != null && data.longitude != null) {
          setPosition([data.latitude, data.longitude]);
        }
      }
    };
    void fetchInitial();

    // 2. Subscribe to Realtime updates
    const subscription = supabase
      .channel(`driver-tracking-${driverId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'drivers',
          filter: `id=eq.${driverId}`,
        },
        (payload) => {
          // If the payload contains location updates
          const { latitude, longitude } = payload.new as any;
          if (latitude != null && longitude != null) {
            setPosition([latitude, longitude]);
          }
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(subscription);
    };
  }, [driverId]);

  if (error) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center rounded-xl border border-line bg-ink-900 px-6 text-center text-sm text-amber-500">
        {error}
      </div>
    );
  }

  if (!position) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center rounded-xl border border-line bg-ink-900 px-6 text-center">
        <p className="text-sm text-slate-400">
          Waiting for GPS signal... <br />
          <span className="text-xs opacity-70">
            (The map will appear once the driver's device uploads coordinates to the database)
          </span>
        </p>
      </div>
    );
  }

  return (
    <div className="h-[400px] w-full rounded-xl overflow-hidden border border-line z-0 relative isolate">
      <MapContainer 
        center={position} 
        zoom={16} 
        scrollWheelZoom={false}
        className="h-full w-full !bg-ink-900"
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <Marker position={position}>
          <Popup>
            <div className="text-sm font-semibold text-slate-800">
              {driverName}
            </div>
            <div className="text-xs text-slate-500">Live Location</div>
          </Popup>
        </Marker>
        <MapUpdater position={position} />
      </MapContainer>
    </div>
  );
};

