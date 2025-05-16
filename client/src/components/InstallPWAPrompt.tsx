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
import { isAppDownloaded } from '@/lib/registerSW';
import { useLocation } from 'wouter';

interface InstallPWAPromptProps {
  autoPrompt?: boolean; // Whether to automatically show the prompt once
}

/**
 * This component has been completely redesigned to use direct downloads
 * instead of PWA installation. It now redirects users to the download page.
 */
export default function InstallPWAPrompt({ autoPrompt = true }: InstallPWAPromptProps) {
  const [, setLocation] = useLocation();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isAlreadyDownloaded, setIsAlreadyDownloaded] = useState(false);
  
  // Check if the app is already downloaded
  useEffect(() => {
    setIsAlreadyDownloaded(isAppDownloaded());
  }, []);
  
  // Don't show if already downloaded
  if (isAlreadyDownloaded) {
    return null;
  }
  
  // Show prompt based on autoPrompt setting
  useEffect(() => {
    if (autoPrompt && !localStorage.getItem('app-download-prompted')) {
      // Only show auto prompt once
      setShowPrompt(true);
      localStorage.setItem('app-download-prompted', 'true');
    }
  }, [autoPrompt]);
  
  // Detect iOS Safari
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  
  // Go to download page
  const handleDownload = () => {
    setShowPrompt(false);
    setLocation('/install');
  };
  
  return (
    <>
      <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Download Strangers: After Hours</DialogTitle>
            <DialogDescription>
              {isIOS ? (
                // iOS specific description
                <>
                  Download the app on your iPhone for beta testing:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Get the TestFlight version for iOS</li>
                    <li>Access all features offline</li>
                    <li>Be part of our exclusive beta testing group</li>
                  </ul>
                </>
              ) : (
                // Android and other devices
                <>
                  Download this app on your device to enjoy a better experience with:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Fullscreen gameplay experience</li>
                    <li>Faster loading times</li>
                    <li>Works offline</li>
                    <li>Easy access from your app drawer</li>
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
            
            <Button
              onClick={handleDownload}
              className="bg-primary hover:bg-primary/90"
            >
              Download App
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}