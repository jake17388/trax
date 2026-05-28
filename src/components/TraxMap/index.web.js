import { useEffect, useState } from 'react';

export default function TraxMap(props) {
  const [LeafletMap, setLeafletMap] = useState(null);

  useEffect(() => {
    import('./LeafletMap').then((mod) => setLeafletMap(() => mod.default));
  }, []);

  if (!LeafletMap) return null;
  return <LeafletMap {...props} />;
}
