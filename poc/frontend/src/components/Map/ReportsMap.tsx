import { MapContainer, TileLayer, Marker, Popup} from 'react-leaflet';
import L from 'leaflet';
import type { Report, ReportSeverity } from '@/api/types';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icons based on severity
const severityColors = {
  LOW: '#22c55e',      // green
  MEDIUM: '#eab308',   // yellow
  HIGH: '#f97316',     // orange
  EMERGENCY: '#ef4444', // red
};

function createCustomIcon(severity: ReportSeverity) {
  const color = severityColors[severity];
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">
        <div style="
          width: 8px;
          height: 8px;
          background-color: white;
          border-radius: 50%;
          position: absolute;
          top: 6px;
          left: 6px;
        "></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });
}

interface ReportsMapProps {
  reports: Report[];
  onReportClick?: (report: Report) => void;
  height?: string;
  center?: [number, number];
  zoom?: number;
}

export function ReportsMap({
  reports,
  onReportClick,
  height = '600px',
  center = [14.5582, 121.0582],
  zoom = 15,
}: ReportsMapProps) {
  return (
    <div style={{ height, borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {reports.map((report) => (
          <Marker
            key={report.id}
            position={[report.latitude, report.longitude]}
            icon={createCustomIcon(report.severity)}
            eventHandlers={{
              click: () => {
                if (onReportClick) {
                  onReportClick(report);
                }
              },
            }}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-semibold text-sm mb-1">{report.title}</h3>
                <div className="text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      report.severity === 'EMERGENCY' ? 'bg-red-100 text-red-700' :
                      report.severity === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                      report.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {report.severity}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      report.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-700' :
                      report.status === 'ACKNOWLEDGED' ? 'bg-purple-100 text-purple-700' :
                      report.status === 'INVESTIGATING' ? 'bg-orange-100 text-orange-700' :
                      report.status === 'RESOLVED' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                  <p className="text-slate-600">{report.type.replace(/_/g, ' ')}</p>
                  <p className="text-slate-500">{report.referenceNumber}</p>
                  {onReportClick && (
                    <button
                      onClick={() => onReportClick(report)}
                      className="mt-2 text-brand-600 hover:text-brand-700 font-medium text-xs"
                    >
                      View Details →
                    </button>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
