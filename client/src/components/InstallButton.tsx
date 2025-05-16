import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Download, DownloadCloud } from "lucide-react";
import { isRunningAsPWA } from '@/lib/registerSW';
import { Link } from 'wouter';

interface InstallButtonProps {
  variant?: "default" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showText?: boolean;
  showIcon?: boolean;
  text?: string;
}

export default function InstallButton({
  variant = "default",
  size = "default",
  className = "",
  showText = true,
  showIcon = true,
  text = "Install App"
}: InstallButtonProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  
  // Check if already running as PWA
  useEffect(() => {
    // Don't capture the prompt if already running as PWA
    if (isRunningAsPWA()) return;
    
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
  if (isRunningAsPWA()) return null;
  
  // Install the app directly
  const handleInstall = async () => {
    if (deferredPrompt) {
      setIsInstalling(true);
      
      try {
        // Show the native install prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          setDeferredPrompt(null);
          localStorage.setItem('pwa-installed', 'true');
        }
      } catch (error) {
        console.error('Installation failed', error);
      } finally {
        setIsInstalling(false);
      }
    } else {
      // If no deferred prompt is available, go to the installation page
      window.location.href = '/install';
    }
  };

  return (
    <>
      {deferredPrompt ? (
        <Button
          variant={variant}
          size={size}
          className={className}
          onClick={handleInstall}
          disabled={isInstalling}
        >
          {showIcon && <Download className={`h-4 w-4 ${showText ? 'mr-2' : ''}`} />}
          {showText && (isInstalling ? 'Installing...' : text)}
        </Button>
      ) : (
        <Button
          variant={variant}
          size={size}
          className={className}
          asChild
        >
          <Link href="/install">
            {showIcon && <DownloadCloud className={`h-4 w-4 ${showText ? 'mr-2' : ''}`} />}
            {showText && text}
          </Link>
        </Button>
      )}
    </>
  );
}