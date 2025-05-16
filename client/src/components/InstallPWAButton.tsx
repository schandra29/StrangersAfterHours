import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { isRunningAsPWA } from '@/lib/registerSW';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface InstallPWAButtonProps {
  variant?: "primary" | "secondary" | "outline" | "menu";
  fullWidth?: boolean;
  showIcon?: boolean;
  text?: string;
}

export default function InstallPWAButton({ 
  variant = "primary", 
  fullWidth = false, 
  showIcon = true,
  text = "Install App"
}: InstallPWAButtonProps) {
  const [isPWA, setIsPWA] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  
  // Check if already running as PWA
  useEffect(() => {
    setIsPWA(isRunningAsPWA());
    
    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent Chrome 76+ from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);
  
  // If running as PWA, don't show the button
  if (isPWA) return null;
  
  // Install the app
  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    setIsInstalling(true);
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // User accepted, outcome will be 'accepted'
    if (outcome === 'accepted') {
      // Clear the saved prompt since it can't be used again
      setDeferredPrompt(null);
      localStorage.setItem('pwa-installed', 'true');
    }
    
    setIsInstalling(false);
    setIsOpen(false);
  };
  
  // Detect iOS Safari
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  
  // Get the button style based on variant
  const getButtonStyle = () => {
    switch(variant) {
      case "primary":
        return "bg-primary hover:bg-primary/90 text-white";
      case "secondary":
        return "bg-secondary hover:bg-secondary/90 text-white";
      case "outline":
        return "border border-primary text-primary hover:bg-primary/10";
      case "menu":
        return "w-full justify-start px-2 py-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md";
      default:
        return "bg-primary hover:bg-primary/90 text-white";
    }
  };
  
  return (
    <>
      <Button
        className={`${getButtonStyle()} ${fullWidth ? 'w-full' : ''}`}
        onClick={() => setIsOpen(true)}
        disabled={isInstalling}
      >
        {showIcon && <Download className="h-4 w-4 mr-2" />}
        {text}
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Install Strangers: After Hours</DialogTitle>
            <DialogDescription>
              Install this app to your home screen for the best experience
            </DialogDescription>
          </DialogHeader>
          
          {isIOS ? (
            // iOS installation instructions
            <div className="space-y-4 py-4">
              <p className="text-center font-medium">Follow these steps to install on your iPhone or iPad:</p>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                    <span className="text-xl">1</span>
                  </div>
                  <p className="text-sm">Tap the share button</p>
                  <div className="mt-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-2 flex justify-center">
                    <svg width="24" height="32" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22V8M12 8L6 14M12 8L18 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="2" y="26" width="20" height="2" rx="1" fill="currentColor"/>
                    </svg>
                  </div>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                    <span className="text-xl">2</span>
                  </div>
                  <p className="text-sm">Scroll and tap "Add to Home Screen"</p>
                  <div className="mt-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-2 flex justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="2" y="2" width="20" height="20" rx="4" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 6V12M12 12V18M12 12H18M12 12H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                    <span className="text-xl">3</span>
                  </div>
                  <p className="text-sm">Tap "Add" in the top-right</p>
                  <div className="mt-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-2 flex justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-primary/10 rounded-lg">
                <p className="text-sm text-center">
                  After installation, you'll find the app on your home screen with its own icon.
                </p>
              </div>
            </div>
          ) : (
            // Android/Chrome installation instructions
            <div className="space-y-4 py-4">
              {deferredPrompt ? (
                <div className="text-center">
                  <div className="h-20 w-20 mx-auto bg-primary/20 rounded-xl flex items-center justify-center mb-4">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p className="text-lg font-medium mb-2">One-click installation</p>
                  <p className="text-sm text-muted-foreground mb-6">
                    Get the full-screen experience with faster load times and offline access
                  </p>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <p className="font-medium">Install the app using your browser menu:</p>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="flex flex-col items-center">
                      <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                        <span className="text-xl">1</span>
                      </div>
                      <p className="text-sm">Tap the menu in your browser</p>
                      <div className="mt-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-2 flex justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                        <span className="text-xl">2</span>
                      </div>
                      <p className="text-sm">Tap "Install App" or "Add to Home Screen"</p>
                      <div className="mt-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-2 flex justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                          <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                        <span className="text-xl">3</span>
                      </div>
                      <p className="text-sm">Confirm installation</p>
                      <div className="mt-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-2 flex justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 12L10 17L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Maybe Later
            </Button>
            
            {!isIOS && deferredPrompt && (
              <Button
                onClick={handleInstall}
                disabled={isInstalling}
                className="bg-primary hover:bg-primary/90"
              >
                {isInstalling ? 'Installing...' : 'Install Now'}
              </Button>
            )}
            
            {isIOS && (
              <Button
                onClick={() => setIsOpen(false)}
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