/**
 * This is a replacement file for the old PWA service worker registration
 * It's completely stripped of PWA functionality and now only contains
 * utility functions for app installation/download detection
 */

/**
 * This is a helper function to track download counts for analytics 
 * It does NOT prevent repeated downloads
 */
export function trackDownload(platform: string): void {
  const downloadCount = localStorage.getItem('download-count') || '0';
  const count = parseInt(downloadCount) + 1;
  localStorage.setItem('download-count', count.toString());
  
  // Track platform-specific downloads
  const platformKey = `download-count-${platform.toLowerCase()}`;
  const platformCount = localStorage.getItem(platformKey) || '0';
  const pCount = parseInt(platformCount) + 1;
  localStorage.setItem(platformKey, pCount.toString());
}

/**
 * Get download count for analytics
 */
export function getDownloadCount(): number {
  const downloadCount = localStorage.getItem('download-count') || '0';
  return parseInt(downloadCount);
}

/**
 * For compatibility with existing code - always returns false
 * to ensure users can always download again
 */
export function isAppDownloaded(): boolean {
  return false;
}

/**
 * Legacy function, no longer prevents re-downloading
 */
export function markAppAsDownloaded(): void {
  trackDownload('general');
}

/**
 * Legacy function, always returns false to remove PWA behavior
 */
export function isRunningAsPWA(): boolean {
  return false;
}