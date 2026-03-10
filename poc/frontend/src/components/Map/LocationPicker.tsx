import { useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with bundlers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface LocationPickerProps {
  latitude?: number;
  longitude?: number;
  onLocationSelect: (lat: number, lng: number) => void;
  height?: string;
}

function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function LocationPicker({
  latitude = 14.5582,
  longitude = 121.0582,
  onLocationSelect,
  height = '400px',
}: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(
    latitude && longitude ? [latitude, longitude] : null
  );
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);

  const handleMapClick = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    onLocationSelect(lat, lng);
  };

  const handleUseMyLocation = () => {
    setUseCurrentLocation(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
          onLocationSelect(latitude, longitude);
          if (mapRef.current) {
            mapRef.current.flyTo([latitude, longitude], 16);
          }
          setUseCurrentLocation(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Unable to get your location. Please check your browser permissions.');
          setUseCurrentLocation(false);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
      setUseCurrentLocation(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-slate-700">
          Location <span className="text-red-500">*</span>
        </label>
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={useCurrentLocation}
          className="text-sm text-brand-600 hover:text-brand-700 font-medium disabled:opacity-50"
        >
          {useCurrentLocation ? 'Getting location...' : '📍 Use My Location'}
        </button>
      </div>
      <p className="text-xs text-slate-500 mb-2">Click on the map to drop a pin at the incident location</p>
      <div style={{ height, borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        <MapContainer
          center={position || [14.5995, 120.9842]}
          zoom={position ? 16 : 13}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onLocationSelect={handleMapClick} />
          {position && <Marker position={position} />}
        </MapContainer>
      </div>
      {position && (
        <p className="text-xs text-slate-600">
          Selected: {position[0].toFixed(6)}, { position[1].toFixed(6)}
        </p>
      )}
    </div>
  );
}
