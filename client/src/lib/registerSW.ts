// Function to register service worker for PWA functionality
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        })
        .catch(error => {
          console.error('ServiceWorker registration failed: ', error);
        });
    });
  }
}

// Function to check if app can be installed (not already installed)
export function checkInstallability() {
  if ('getInstalledRelatedApps' in navigator) {
    // @ts-ignore - TypeScript doesn't know about this API yet
    navigator.getInstalledRelatedApps().then(relatedApps => {
      const isInstalled = relatedApps.length > 0;
      return !isInstalled;
    });
  }
  
  return true; // Assume installable if API not available
}

// Listen to beforeinstallprompt to enable custom installation flow
export function setupInstallPrompt(
  callback: (event: any) => void
) {
  // Store the install prompt event for later use
  let deferredPrompt: any = null;
  
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    // Call the callback function to notify the app
    callback(deferredPrompt);
  });
  
  // Return function to trigger installation prompt
  return async () => {
    if (!deferredPrompt) {
      console.log('No installation prompt available');
      return false;
    }
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // Clear the prompt reference
    deferredPrompt = null;
    
    // Return true if installed
    return outcome === 'accepted';
  };
}

// Function to check if the app is running in standalone mode (installed PWA)
export function isRunningAsPWA() {
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.matchMedia('(display-mode: fullscreen)').matches ||
         (window.navigator as any).standalone === true; // iOS Safari
}