import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Download, 
  SmartphoneNfc, 
  X, 
  ExternalLink, 
  Info
} from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { isAppDownloaded, markAppAsDownloaded } from '@/lib/registerSW';
import { useToast } from "@/hooks/use-toast";
import { useLocation } from 'wouter';

/**
 * A visually appealing banner for app promotion - currently hidden per client request
 * Code is preserved for future use
 */
export default function AppDownloadBanner() {
  // Hidden implementation - return null
  return null;
  
  /* Original implementation preserved as comment for future use
  const [showBanner, setShowBanner] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Check if already downloaded or previously dismissed
  useEffect(() => {
    // Don't show if already downloaded
    if (isAppDownloaded()) return;
    
    // Don't show if user has dismissed
    if (localStorage.getItem('app-banner-dismissed') === 'true') return;
    
    // Show banner
    setShowBanner(true);
  }, []);
  
  // Handle dismiss
  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('app-banner-dismissed', 'true');
  };
  
  // Go to download page
  const handleDownload = () => {
    setLocation('/install');
  };
  
  // Generate QR code for download on another device
  const generateQRCodeUrl = () => {
    const appUrl = `${window.location.origin}/install`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(appUrl)}`;
  };
  
  // Show QR code in a new tab
  const showQRCode = () => {
    window.open(generateQRCodeUrl(), '_blank');
    
    toast({
      title: "QR Code opened",
      description: "Scan with another device to download the app",
      duration: 3000,
    });
  };
  
  // If already downloaded or banner dismissed, don't show anything
  if (!showBanner) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up-fade">
      <div className="bg-gradient-to-br from-primary/90 to-secondary/90 backdrop-blur-sm text-white p-4 shadow-lg rounded-t-xl mx-auto max-w-md">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center mr-3">
              <svg 
                width="36" 
                height="36" 
                viewBox="0 0 512 512" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="p-1"
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
            <div>
              <h3 className="font-semibold text-sm">Strangers: After Hours</h3>
              <p className="text-xs text-white/80">Get the full app experience</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleDismiss} className="h-6 w-6 rounded-full bg-white/10 hover:bg-white/20 -mt-1 -mr-1">
            <X className="h-3 w-3" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2 mt-3">
          <Button 
            className="bg-white text-primary hover:bg-white/90 flex-1 h-9 rounded-full text-sm shadow-md"
            onClick={handleDownload}
          >
            <span className="flex items-center">
              <Download className="h-4 w-4 mr-1" />
              Download App
            </span>
          </Button>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={showQRCode} className="bg-white/20 hover:bg-white/30 h-9 w-9 rounded-full">
                  <SmartphoneNfc className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download on another device</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => window.open('/install', '_blank')} className="bg-white/20 hover:bg-white/30 h-9 w-9 rounded-full">
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download help</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
  */
}