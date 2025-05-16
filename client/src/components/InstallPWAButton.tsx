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
  
  // Generate a PWA installation QR code that leads to this app
  const generateQRCode = () => {
    const appUrl = window.location.href.split("#")[0];
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(appUrl)}`;
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
              
              {/* QR Code for cross-device installation */}
              <Button
                variant="outline"
                className="w-full justify-between py-6 text-left"
                onClick={() => {
                  setIsOpen(false);
                  window.open(generateQRCode(), "_blank");
                  toast({
                    title: "QR Code opened",
                    description: "Scan this code with another device to install the app",
                    duration: 3000,
                  });
                }}
              >
                <div className="flex items-center">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                      <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                      <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                      <path d="M14 14H21V17H14V14Z" stroke="currentColor" strokeWidth="2" />
                      <path d="M14 19H17V21H14V19Z" stroke="currentColor" strokeWidth="2" />
                      <path d="M19 19H21V21H19V19Z" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Scan QR Code</p>
                    <p className="text-sm text-muted-foreground">Open on another device to install</p>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 flex-shrink-0" />
              </Button>

            {/* Copy link option */}
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
                    <svg 
                      width="100%" 
                      height="100%" 
                      viewBox="0 0 512 512" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ borderRadius: '12px' }}
                    >
                      <rect width="512" height="512" rx="128" fill="#FF6B6B" />
                      <circle cx="256" cy="256" r="200" fill="#D1495B" />
                      <circle cx="256" cy="256" r="150" fill="#EDAE49" />
                      <path d="M160 220C177.673 220 192 205.673 192 188C192 170.327 177.673 156 160 156C142.327 156 128 170.327 128 188C128 205.673 142.327 220 160 220Z" fill="white" />
                      <path d="M224 260C241.673 260 256 245.673 256 228C256 210.327 241.673 196 224 196C206.327 196 192 210.327 192 228C192 245.673 206.327 260 224 260Z" fill="white" />
                      <path d="M320 252C337.673 252 352 237.673 352 220C352 202.327 337.673 188 320 188C302.327 188 288 202.327 288 220C288 237.673 302.327 252 320 252Z" fill="white" />
                      <path d="M288 332C305.673 332 320 317.673 320 300C320 282.327 305.673 268 288 268C270.327 268 256 282.327 256 300C256 317.673 270.327 332 288 332Z" fill="white" />
                      <path d="M192 332C209.673 332 224 317.673 224 300C224 282.327 209.673 268 192 268C174.327 268 160 282.327 160 300C160 317.673 174.327 332 192 332Z" fill="white" />
                      <path d="M160 220L224 260" stroke="#30638E" strokeWidth="8" />
                      <path d="M224 260L320 252" stroke="#30638E" strokeWidth="8" />
                      <path d="M320 252L288 332" stroke="#30638E" strokeWidth="8" />
                      <path d="M288 332L192 332" stroke="#30638E" strokeWidth="8" />
                      <path d="M192 332L160 220" stroke="#30638E" strokeWidth="8" />
                    </svg>
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