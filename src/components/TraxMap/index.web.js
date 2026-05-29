import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';

export default function TraxMap(props) {
  const [LeafletMap, setLeafletMap] = useState(null);

  useEffect(() => {
    import('./LeafletMap').then((mod) => setLeafletMap(() => mod.default));
  }, []);

  if (!LeafletMap) return null;

  // absoluteFill so the Leaflet container always fills whatever parent is given,
  // regardless of how the parent sizes itself on web.
  return (
    <View style={StyleSheet.absoluteFill}>
      <LeafletMap {...props} />
    </View>
  );
}
