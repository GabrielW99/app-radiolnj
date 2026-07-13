export function redirectSystemPath({ path }: { path: string; initial: boolean }) {
  // react-native-track-player launches the app with
  // "trackplayer://notification.click" when the notification is tapped.
  // Redirect it to home instead of letting it hit +not-found.
  if (path.includes('notification.click')) {
    return '/';
  }
  return path;
}
