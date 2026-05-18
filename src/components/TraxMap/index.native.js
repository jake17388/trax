import { useRef, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { colors } from '../../constants/theme';

export default function TraxMap({ tracks, userLocation }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  }, [userLocation]);

  return (
    <MapView
      ref={mapRef}
      style={StyleSheet.absoluteFill}
      showsUserLocation
      initialRegion={{ latitude: 20, longitude: 0, latitudeDelta: 100, longitudeDelta: 100 }}
    >
      {tracks.map((track) => (
        <Marker
          key={track.id}
          coordinate={track.coordinate}
          title={track.title}
          pinColor={colors.trackPin}
        />
      ))}
    </MapView>
  );
}
