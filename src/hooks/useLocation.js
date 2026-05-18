import { useState, useEffect } from 'react';
import { requestPermissions, getCurrentLocation } from '../services/location';

export function useLocation() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const granted = await requestPermissions();
      if (!granted) {
        setError('Location permission denied');
        setLoading(false);
        return;
      }
      try {
        const loc = await getCurrentLocation();
        setLocation(loc.coords);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { location, error, loading };
}
