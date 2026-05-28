import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const trackIcon = L.divIcon({
  className: '',
  html: '<div style="width:14px;height:14px;border-radius:50%;background:#FF6B35;border:2.5px solid white;box-shadow:0 2px 6px rgba(0,0,0,.35)"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  popupAnchor: [0, -12],
});

function FlyToUser({ location }) {
  const map = useMap();
  useEffect(() => {
    if (location) {
      map.flyTo([location.latitude, location.longitude], 13, { duration: 1.5 });
    }
  }, [location]);
  return null;
}

export default function LeafletMap({ tracks, userLocation }) {
  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />

      {userLocation && (
        <>
          <FlyToUser location={userLocation} />
          <CircleMarker
            center={[userLocation.latitude, userLocation.longitude]}
            radius={8}
            pathOptions={{ fillColor: '#1A73E8', fillOpacity: 1, color: 'white', weight: 2.5 }}
          />
        </>
      )}

      {tracks.map((track) => (
        <Marker
          key={track.id}
          position={[track.coordinate.latitude, track.coordinate.longitude]}
          icon={trackIcon}
        >
          <Popup>{track.title}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
