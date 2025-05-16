import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { setupInstallPrompt, isRunningAsPWA } from '@/lib/registerSW';

interface InstallPWAPromptProps {
  autoPrompt?: boolean; // Whether to automatically show the prompt once
}

export default function InstallPWAPrompt({ autoPrompt = true }: InstallPWAPromptProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [installHandler, setInstallHandler] = useState<(() => Promise<boolean>) | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  
  // Detect if already running as PWA
  useEffect(() => {
    setIsPWA(isRunningAsPWA());
  }, []);
  
  // Don't show if already running as PWA
  if (isPWA) {
    return null;
  }
  
  // Set up install event listener
  useEffect(() => {
    const promptHandler = setupInstallPrompt((event) => {
      if (autoPrompt && !localStorage.getItem('pwa-install-prompted')) {
        // Only show auto prompt once
        setShowPrompt(true);
        localStorage.setItem('pwa-install-prompted', 'true');
      }
      
      // Store the handler to trigger install later
      setInstallHandler(() => async () => {
        setIsInstalling(true);
        try {
          return await promptHandler();
        } finally {
          setIsInstalling(false);
          setShowPrompt(false);
        }
      });
    });
  }, [autoPrompt]);

  // Detect iOS Safari
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  
  const handleInstall = async () => {
    if (installHandler) {
      await installHandler();
    }
  };
  
  return (
    <>
      <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Install Strangers: After Hours</DialogTitle>
            <DialogDescription>
              {isIOS ? (
                // iOS specific instructions
                <>
                  To install this app on your iPhone:
                  <ol className="list-decimal list-inside mt-2 space-y-2">
                    <li>Tap the Share button <span className="inline-block w-5 h-5 bg-gray-200 rounded-full text-center leading-5">↑</span> at the bottom of your screen</li>
                    <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
                    <li>Tap "Add" in the top right corner</li>
                  </ol>
                </>
              ) : (
                // Android and other devices
                <>
                  Install this app on your device to enjoy a better experience with:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Fullscreen gameplay experience</li>
                    <li>Faster loading times</li>
                    <li>Works even with poor internet connections</li>
                    <li>Easy access from your home screen</li>
                  </ul>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setShowPrompt(false)}
            >
              Maybe Later
            </Button>
            
            {!isIOS && installHandler && (
              <Button
                onClick={handleInstall}
                disabled={isInstalling}
                className="bg-primary hover:bg-primary/90"
              >
                {isInstalling ? 'Installing...' : 'Install App'}
              </Button>
            )}
            
            {isIOS && (
              <Button
                onClick={() => setShowPrompt(false)}
                className="bg-primary hover:bg-primary/90"
              >
                Got it
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}