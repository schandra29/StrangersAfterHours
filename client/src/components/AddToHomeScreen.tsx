import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { isAppDownloaded } from '@/lib/registerSW';
import { X, Download, Smartphone, TabletSmartphone, Laptop } from 'lucide-react';
import { useLocation } from 'wouter';

interface AddToHomeScreenProps {
  timing?: 'immediate' | 'delayed' | 'manual';
  delay?: number; // delay in milliseconds before showing the prompt
}

/**
 * This component is completely hidden per client request.
 * Code is preserved for future use.
 */
export default function AddToHomeScreen({ 
  timing = 'delayed', 
  delay = 3000 
}: AddToHomeScreenProps) {
  // Hidden implementation - returning null
  return null;
  
  /* Original implementation preserved as comment for future use
  const [, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  
  // Check if the app has been downloaded
  useEffect(() => {
    // Skip if already downloaded
    if (isAppDownloaded()) return;
    
    // Skip if user has already dismissed
    if (localStorage.getItem('app-banner-dismissed') === 'true') return;
    
    // Determine when to show based on timing option
    if (timing === 'immediate') {
      setIsVisible(true);
    } else if (timing === 'delayed') {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, delay);
      
      return () => clearTimeout(timer);
    }
    // If 'manual', visibility must be controlled by parent component
  }, [timing, delay]);
  
  // Update open state when visibility changes
  useEffect(() => {
    if (isVisible && !isDismissed) {
      setIsOpen(true);
    }
  }, [isVisible, isDismissed]);
  
  // Detect device type
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  const isAndroid = /Android/.test(navigator.userAgent);
  
  const handleDismiss = () => {
    setIsOpen(false);
    setIsDismissed(true);
    localStorage.setItem('app-banner-dismissed', 'true');
  };
  
  // Go to download page
  const handleDownload = () => {
    setIsOpen(false);
    setLocation('/install');
  };
  
  // Don't render anything if already downloaded
  if (isAppDownloaded()) return null;
  
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="bottom" className="rounded-t-xl max-w-none">
        <div className="absolute right-4 top-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleDismiss}
            className="h-6 w-6 rounded-md"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <SheetHeader className="px-1">
          <SheetTitle className="text-xl text-center">
            Download Strangers: After Hours
          </SheetTitle>
          <SheetDescription className="text-center">
            Get the official beta app for your device
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex items-center justify-center py-6">
          <div className="bg-card p-6 rounded-lg shadow-md border border-primary/20 max-w-sm mx-auto">
            <div className="flex flex-col items-center mb-4">
              <div className="h-16 w-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <Download className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2 text-center">Now available for beta testing</h3>
              <p className="text-center text-sm text-muted-foreground mb-4">
                Download the official app for your device to enjoy the best experience
              </p>
              
              <div className="grid grid-cols-3 gap-4 w-full mb-6">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <Smartphone className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xs text-center">Android</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <TabletSmartphone className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xs text-center">iOS</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <Laptop className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xs text-center">Desktop</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <SheetFooter className="flex flex-col gap-2">
          <Button
            className="w-full bg-primary text-white py-6 text-lg"
            onClick={handleDownload}
          >
            <Download className="h-5 w-5 mr-2" />
            Download Now
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleDismiss}
          >
            Maybe Later
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
  */
}