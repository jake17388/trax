import * as Location from 'expo-location';

export async function requestPermissions() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

export async function getCurrentLocation() {
  return Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
}

export function watchLocation(callback) {
  return Location.watchPositionAsync(
    { accuracy: Location.Accuracy.High, distanceInterval: 10 },
    callback
  );
}
