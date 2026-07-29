import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function LocationViewer({ latitude, longitude, label, height = 220 }) {
  if (!latitude || !longitude) return <p style={{ color: '#9ca3af', fontSize: 13 }}>No location provided</p>;

  return (
    <div style={{ height, borderRadius: 10, overflow: 'hidden' }}>
      <MapContainer center={[latitude, longitude]} zoom={14} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[latitude, longitude]}>
          <Popup>{label || 'Location'}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}