import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, CircleMarker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const eventIcon = L.divIcon({
  className: '',
  html: '<div style="width:12px;height:12px;border-radius:50%;background:#FF3B30;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3)"></div>',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
  popupAnchor: [0, -10],
});

const birthIcon = L.divIcon({
  className: '',
  html: '<div style="width:16px;height:16px;border-radius:50%;background:#FF3B30;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.4)"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  popupAnchor: [0, -12],
});

function FlyTo({ location }) {
  const map = useMap();
  const prev = useRef(null);
  useEffect(() => {
    if (!location) return;
    const key = `${location.lat},${location.lng}`;
    if (key === prev.current) return;
    prev.current = key;
    map.flyTo([location.lat, location.lng], map.getZoom() < 4 ? 6 : map.getZoom(), { duration: 0.6 });
  }, [location]);
  return null;
}

export default function LeafletMap({ polylinePoints = [], eventMarkers = [], flyTo = null }) {
  const lineCoords = polylinePoints.map((p) => [p.lat, p.lng]);

  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />

      {lineCoords.length >= 2 && (
        <Polyline
          positions={lineCoords}
          pathOptions={{ color: '#FF3B30', weight: 2.5, opacity: 0.8 }}
        />
      )}

      {eventMarkers.map((marker, i) => (
        <Marker
          key={marker.id ?? i}
          position={[marker.lat, marker.lng]}
          icon={i === 0 ? birthIcon : eventIcon}
        >
          <Popup>
            <strong>{marker.title}</strong>
            {marker.event_date && (
              <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                {new Date(marker.event_date).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric',
                })}
              </div>
            )}
            <div style={{ fontSize: 12, color: '#666' }}>{marker.place_name}</div>
          </Popup>
        </Marker>
      ))}

      {flyTo && <FlyTo location={flyTo} />}
    </MapContainer>
  );
}
