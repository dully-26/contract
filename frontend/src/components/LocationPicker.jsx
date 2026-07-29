import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function ClickHandler({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) map.setView([lat, lng], map.getZoom());
  }, [lat, lng]);
  return null;
}

export default function LocationPicker({ latitude, longitude, onChange, height = 280 }) {
  const [position, setPosition] = useState({
    lat: latitude || -6.7924, // default: Dar es Salaam
    lng: longitude || 39.2083,
  });

  const handleSelect = (lat, lng) => {
    setPosition({ lat, lng });
    onChange(lat, lng);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => handleSelect(pos.coords.latitude, pos.coords.longitude),
      () => alert('Unable to retrieve your location')
    );
  };

  return (
    <div className="location-picker">
      <div className="location-picker-header">
        <span>📍 Click on the map to set location</span>
        <button type="button" className="btn-small" onClick={useMyLocation}>Use My Location</button>
      </div>
      <div style={{ height, borderRadius: 10, overflow: 'hidden' }}>
        <MapContainer center={[position.lat, position.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[position.lat, position.lng]} />
          <ClickHandler onSelect={handleSelect} />
          <RecenterMap lat={position.lat} lng={position.lng} />
        </MapContainer>
      </div>
      <p className="location-coords">Lat: {position.lat.toFixed(5)}, Lng: {position.lng.toFixed(5)}</p>
    </div>
  );
}