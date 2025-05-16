/**
 * This is a replacement file for the old PWA service worker registration
 * It's completely stripped of PWA functionality and now only contains
 * utility functions for app installation/download detection
 */

/**
 * Check if the app is already installed/downloaded
 */
export function isAppDownloaded(): boolean {
  return localStorage.getItem('app-downloaded') === 'true';
}

/**
 * Mark the app as downloaded
 */
export function markAppAsDownloaded(): void {
  localStorage.setItem('app-downloaded', 'true');
}

// This is a replacement for the old PWA-related function
// Now it just checks if the app is already downloaded
export function isRunningAsPWA(): boolean {
  return isAppDownloaded();
}