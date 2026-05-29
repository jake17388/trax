import { useRef, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

export default function TraxMap({ polylinePoints = [], eventMarkers = [], flyTo = null }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!flyTo || !mapRef.current) return;
    mapRef.current.animateToRegion({
      latitude: flyTo.lat,
      longitude: flyTo.lng,
      latitudeDelta: 2,
      longitudeDelta: 2,
    }, 600);
  }, [flyTo]);

  return (
    <MapView
      ref={mapRef}
      style={StyleSheet.absoluteFill}
      initialRegion={{ latitude: 20, longitude: 0, latitudeDelta: 100, longitudeDelta: 100 }}
    >
      {polylinePoints.length >= 2 && (
        <Polyline
          coordinates={polylinePoints.map((p) => ({ latitude: p.lat, longitude: p.lng }))}
          strokeColor="#FF3B30"
          strokeWidth={2.5}
        />
      )}

      {eventMarkers.map((marker, i) => (
        <Marker
          key={marker.id ?? i}
          coordinate={{ latitude: marker.lat, longitude: marker.lng }}
          title={marker.title}
          description={marker.place_name}
          pinColor="#FF3B30"
        />
      ))}
    </MapView>
  );
}
