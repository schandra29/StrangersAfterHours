import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, Copy, CheckCircle2 } from "lucide-react";
import { isRunningAsPWA } from '@/lib/registerSW';
import { useToast } from "@/hooks/use-toast";
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
  const [copySuccess, setCopySuccess] = useState(false);
  const { toast } = useToast();
  
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
  
  // Reset copy success state after 2 seconds
  useEffect(() => {
    if (copySuccess) {
      const timer = setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [copySuccess]);
  
  // If running as PWA, don't show the button
  if (isPWA) return null;
  
  // Install the app directly using the native prompt
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
      
      // Show success toast
      toast({
        title: "App installed!",
        description: "The app has been added to your home screen.",
      });
    }
    
    setIsInstalling(false);
    setIsOpen(false);
  };
  
  // Open browser menu automatically on Android (Chrome only)
  const openChromeMenu = () => {
    // This is not a real API, but we're showing instructions
    toast({
      title: "Tap the menu button →",
      description: "Look for the ⋮ icon in the top-right corner of your browser",
      duration: 5000,
    });
  };
  
  // Open direct install instructions for iOS
  const openIOSInstructions = () => {
    window.open("https://www.macrumors.com/how-to/add-a-web-site-to-iphone-home-screen/", "_blank");
  };
  
  // Detect device type
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  const isAndroid = /Android/.test(navigator.userAgent);
  
  // Copy installation link to clipboard
  const copyInstallLink = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        setCopySuccess(true);
        toast({
          title: "Link copied!",
          description: "Share this link with others to install the app",
          duration: 3000,
        });
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
      });
  };
  
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
        return "w-full justify-start px-2 py-1.5 text-white hover:text-primary hover:bg-primary/10 rounded-md";
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
            <DialogTitle className="flex items-center justify-center text-xl">
              <Download className="h-5 w-5 mr-2" />
              Install Strangers: After Hours
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            {/* Direct Installation Button (Chrome/Edge/Android) */}
            {deferredPrompt && (
              <div className="mb-6">
                <Button 
                  onClick={handleInstall} 
                  className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-lg"
                  disabled={isInstalling}
                >
                  {isInstalling ? 'Installing...' : 'Install App with One Click'}
                </Button>
                <p className="text-center text-sm mt-2 text-muted-foreground">
                  This will add the app to your home screen
                </p>
              </div>
            )}
            
            {/* Platform-specific options */}
            <div className="space-y-3 mt-4">
              <h3 className="font-medium text-center">
                {deferredPrompt 
                 ? "Alternative installation methods:" 
                 : "Choose how to install:"}
              </h3>
              
              {/* iOS Option */}
              {isIOS && (
                <Button
                  variant="outline"
                  className="w-full justify-between py-6 text-left"
                  onClick={() => {
                    toast({
                      title: "Tap the share button ↑",
                      description: "Look for the Share icon at the bottom of your screen",
                      duration: 5000,
                    });
                  }}
                >
                  <div className="flex items-center">
                    <div className="bg-primary/10 p-2 rounded-full mr-3">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 5V19M12 5L18 11M12 5L6 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Tap the Share button</p>
                      <p className="text-sm text-muted-foreground">Then select "Add to Home Screen"</p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 flex-shrink-0" />
                </Button>
              )}
              
              {/* Android Option */}
              {isAndroid && !deferredPrompt && (
                <Button
                  variant="outline"
                  className="w-full justify-between py-6 text-left"
                  onClick={openChromeMenu}
                >
                  <div className="flex items-center">
                    <div className="bg-primary/10 p-2 rounded-full mr-3">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Tap the menu button</p>
                      <p className="text-sm text-muted-foreground">Then select "Add to Home Screen"</p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 flex-shrink-0" />
                </Button>
              )}
              
              {/* General Option */}
              <Button
                variant="outline"
                className="w-full justify-between py-6 text-left"
                onClick={copyInstallLink}
              >
                <div className="flex items-center">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    {copySuccess ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">Copy installation link</p>
                    <p className="text-sm text-muted-foreground">Share with friends or open on your phone</p>
                  </div>
                </div>
                {copySuccess ? (
                  <span className="text-xs text-green-500">Copied!</span>
                ) : (
                  <Copy className="h-4 w-4 flex-shrink-0" />
                )}
              </Button>
            </div>
            
            {/* Visual of the app on home screen */}
            <div className="flex justify-center mt-6">
              <div className="bg-gray-800 p-2 rounded-2xl shadow-lg w-32">
                <div className="bg-gray-900 rounded-xl p-2 flex flex-col items-center">
                  <div className="w-16 h-16 bg-primary rounded-xl mb-1 flex items-center justify-center overflow-hidden">
                    <img 
                      src="/icons/icon-192x192.png" 
                      alt="App icon" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs text-white">Strangers</span>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="w-full"
            >
              Later
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}