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
import { isRunningAsPWA } from '@/lib/registerSW';
import { X } from 'lucide-react';

interface AddToHomeScreenProps {
  timing?: 'immediate' | 'delayed' | 'manual';
  delay?: number; // delay in milliseconds before showing the prompt
}

export default function AddToHomeScreen({ 
  timing = 'delayed', 
  delay = 3000 
}: AddToHomeScreenProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  
  // Check if the app has been installed
  useEffect(() => {
    // Skip if already installed
    if (isRunningAsPWA()) return;
    
    // Skip if user has already dismissed or installed
    if (localStorage.getItem('pwa-installed') === 'true') return;
    if (localStorage.getItem('pwa-prompt-dismissed') === 'true') return;
    
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
  
  // Detect iOS Safari
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  
  const handleDismiss = () => {
    setIsOpen(false);
    setIsDismissed(true);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };
  
  // Don't render anything if already running as PWA
  if (isRunningAsPWA()) return null;
  
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
            Add Strangers: After Hours to Your Home Screen
          </SheetTitle>
          <SheetDescription className="text-center">
            Install this app for the best experience
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex items-center justify-center py-6">
          <div className="bg-card p-4 rounded-lg shadow-md border border-primary/20 max-w-sm mx-auto">
            {isIOS ? (
              <div className="space-y-4">
                <div className="flex items-center text-center">
                  <div className="flex flex-col items-center w-full">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 mb-2">
                      <span className="text-2xl">1</span>
                    </div>
                    <p>Tap the share button</p>
                    <div className="mt-2 bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
                      <svg width="20" height="30" viewBox="0 0 20 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="1" y="1" width="18" height="28" rx="4" stroke="currentColor" strokeWidth="2"/>
                        <path d="M10 22.5C10.8284 22.5 11.5 21.8284 11.5 21C11.5 20.1716 10.8284 19.5 10 19.5C9.17157 19.5 8.5 20.1716 8.5 21C8.5 21.8284 9.17157 22.5 10 22.5Z" fill="currentColor"/>
                        <path d="M5 6H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M10 13L10 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M7 10L10 13L13 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center text-center">
                  <div className="flex flex-col items-center w-full">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 mb-2">
                      <span className="text-2xl">2</span>
                    </div>
                    <p>Scroll down and tap "Add to Home Screen"</p>
                    <div className="mt-2 bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
                      <svg width="120" height="60" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="5" y="10" width="110" height="40" rx="4" fill="currentColor" fillOpacity="0.1"/>
                        <path d="M20 30H100" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M30 20H90" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M25 40H95" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <rect x="43" y="27" width="34" height="6" rx="1" fill="currentColor" fillOpacity="0.3"/>
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center text-center">
                  <div className="flex flex-col items-center w-full">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 mb-2">
                      <span className="text-2xl">3</span>
                    </div>
                    <p>Tap "Add" to install</p>
                    <div className="mt-2 bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
                      <svg width="120" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="5" y="5" width="110" height="30" rx="4" fill="currentColor" fillOpacity="0.1"/>
                        <path d="M90 20H100" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M20 20H30" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <rect x="43" y="17" width="34" height="6" rx="1" fill="currentColor" fillOpacity="0.3"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Android/Chrome instructions
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mx-auto">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 6V12M12 12V18M12 12H18M12 12H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p className="text-lg font-medium">When the installation prompt appears, tap "Add to Home Screen"</p>
                </div>
                
                <div className="flex flex-col items-center space-y-2">
                  <div className="h-14 w-14 rounded-xl bg-primary/30 flex items-center justify-center">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7.5 4.27C7.5 2 9.31 2 9.31 2H14.69S16.5 2 16.5 4.27C18.57 5.93 20 8.62 20 11.77C20 17.67 16.36 20 12 20C7.64 20 4 17.67 4 11.77C4 8.62 5.43 5.93 7.5 4.27Z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 2V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <span className="text-sm text-center">Strangers:<br/>After Hours</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <SheetFooter className="flex flex-col gap-2">
          <Button
            className="w-full bg-primary text-white"
            onClick={handleDismiss}
          >
            {isIOS ? "I'll do this later" : "Got it"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}