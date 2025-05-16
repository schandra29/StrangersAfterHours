import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Download, 
  ArrowLeft, 
  Smartphone, 
  TabletSmartphone, 
  Laptop, 
  Share, 
  Copy, 
  QrCode,
  CheckCircle2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Link } from "wouter";
import { isRunningAsPWA } from '@/lib/registerSW';

export default function InstallApp() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [platform, setPlatform] = useState<'android' | 'ios' | 'desktop'>('android');
  const { toast } = useToast();

  // Detect platform
  useEffect(() => {
    // Detect iOS
    if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream) {
      setPlatform('ios');
    } 
    // Detect Android
    else if (/Android/.test(navigator.userAgent)) {
      setPlatform('android');
    } 
    // Assume desktop
    else {
      setPlatform('desktop');
    }
    
    // Listen for installation prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
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
  
  // Generate QR code URL for installation
  const generateQRCodeUrl = () => {
    const appUrl = window.location.origin;
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(appUrl)}`;
  };
  
  // Copy app link to clipboard
  const copyAppLink = () => {
    navigator.clipboard.writeText(window.location.origin)
      .then(() => {
        setCopySuccess(true);
        toast({
          title: "Link copied!",
          description: "App link copied to clipboard",
          duration: 3000,
        });
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
      });
  };
  
  // Handle installation
  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    setIsInstalling(true);
    
    try {
      // Show the install prompt
      deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        localStorage.setItem('pwa-installed', 'true');
        
        toast({
          title: "App installed!",
          description: "Strangers: After Hours has been added to your home screen.",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Installation failed', error);
    } finally {
      setIsInstalling(false);
    }
  };
  
  // Create a deep link for App Clips (iOS) or Instant Apps (Android)
  const getAppDeepLink = () => {
    return `https://app.strangers-afterhours.com/?install=true`;
  };
  
  // If already running as PWA, show success message
  if (isRunningAsPWA()) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/90">
        <header className="bg-gradient-to-r from-primary/20 to-secondary/20 py-4 px-4">
          <div className="container mx-auto">
            <Link href="/" className="flex items-center text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span>Back to App</span>
            </Link>
          </div>
        </header>
        
        <main className="flex-1 container mx-auto px-4 py-10 max-w-3xl">
          <div className="flex flex-col items-center justify-center text-center py-16 px-6 bg-card rounded-xl shadow-sm">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">App Successfully Installed!</h1>
            <p className="text-lg text-muted-foreground mb-8">
              You're currently running the fully installed version of Strangers: After Hours.
            </p>
            <Button asChild>
              <Link href="/">Continue to App</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/90">
      <header className="bg-gradient-to-r from-primary/20 to-secondary/20 py-4 px-4">
        <div className="container mx-auto">
          <Link href="/" className="flex items-center text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>Back to App</span>
          </Link>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-10 max-w-3xl">
        <div className="text-center mb-8">
          <div className="inline-flex rounded-full bg-primary/10 p-2 mb-4">
            <svg 
              width="60" 
              height="60" 
              viewBox="0 0 512 512" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="p-2"
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
          <h1 className="text-3xl font-bold mb-2">Install Strangers: After Hours</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Get the full app experience with offline access, faster loading times, and a dedicated icon on your home screen.
          </p>
          
          {deferredPrompt && (
            <div className="mt-6 mb-8">
              <Button
                size="lg"
                className="bg-primary text-white hover:bg-primary/90 py-6 px-8 text-lg"
                onClick={handleInstall}
                disabled={isInstalling}
              >
                {isInstalling ? (
                  <div className="flex items-center">
                    <span className="animate-spin h-5 w-5 mr-3 border-2 border-white border-r-transparent rounded-full"></span>
                    Installing...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Download className="h-5 w-5 mr-2" />
                    Install with One Click
                  </div>
                )}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Install directly to your device
              </p>
            </div>
          )}
        </div>
        
        <div className="bg-card rounded-xl shadow-sm overflow-hidden mb-8">
          <Tabs defaultValue={platform} className="w-full">
            <div className="px-4 pt-4 pb-0">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="android" className="flex items-center gap-1">
                  <Smartphone className="h-4 w-4" />
                  <span>Android</span>
                </TabsTrigger>
                <TabsTrigger value="ios" className="flex items-center gap-1">
                  <TabletSmartphone className="h-4 w-4" />
                  <span>iOS</span>
                </TabsTrigger>
                <TabsTrigger value="desktop" className="flex items-center gap-1">
                  <Laptop className="h-4 w-4" />
                  <span>Desktop</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="android" className="p-6">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <span className="text-xl font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Open Chrome menu</h3>
                    <p className="text-muted-foreground">Tap the three dots (⋮) in the top-right corner</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <span className="text-xl font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Select "Install app" or "Add to Home screen"</h3>
                    <p className="text-muted-foreground">The option may vary depending on your browser</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <span className="text-xl font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Tap "Install" to confirm</h3>
                    <p className="text-muted-foreground">The app will be added to your home screen</p>
                  </div>
                </div>
                
                <div className="bg-muted/30 p-4 rounded-lg mt-6">
                  <p className="text-sm">
                    <span className="font-medium">Tip:</span> On some Android devices, you may also see an "Add to Home screen" banner at the bottom of your browser.
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="ios" className="p-6">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <span className="text-xl font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Tap the Share button</h3>
                    <p className="text-muted-foreground">Look for the square with an arrow pointing up (↑)</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <span className="text-xl font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Scroll down and tap "Add to Home Screen"</h3>
                    <p className="text-muted-foreground">You may need to swipe left to find this option</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <span className="text-xl font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Tap "Add" in the top-right corner</h3>
                    <p className="text-muted-foreground">The app will be added to your home screen</p>
                  </div>
                </div>
                
                <div className="bg-muted/30 p-4 rounded-lg mt-6">
                  <p className="text-sm">
                    <span className="font-medium">Note:</span> On iOS, the app will function like a native app but must be installed through Safari. If you're using another browser, please open this page in Safari first.
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="desktop" className="p-6">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <span className="text-xl font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Look for the install icon in your address bar</h3>
                    <p className="text-muted-foreground">In Chrome, Edge, or other browsers, look for a "+" or download icon</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <span className="text-xl font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Click "Install" or "Install app"</h3>
                    <p className="text-muted-foreground">Follow the prompt to install the application</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <span className="text-xl font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Confirm installation</h3>
                    <p className="text-muted-foreground">The app will be installed and added to your desktop or start menu</p>
                  </div>
                </div>
                
                <div className="bg-muted/30 p-4 rounded-lg mt-6">
                  <p className="text-sm">
                    <span className="font-medium">Alternative:</span> In Chrome, you can also click the three dots (⋮) in the top-right corner, then select "Install Strangers: After Hours" from the menu.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-card p-6 rounded-xl shadow-sm flex flex-col items-center text-center">
            <QrCode className="h-8 w-8 mb-4 text-primary" />
            <h3 className="text-xl font-medium mb-2">Install on Another Device</h3>
            <p className="text-muted-foreground mb-4">Scan this QR code with your phone's camera to open the app on another device.</p>
            
            <div className="bg-white p-3 rounded-lg mb-4 shadow-sm">
              <img 
                src={generateQRCodeUrl()} 
                alt="Installation QR Code" 
                className="w-full max-w-[200px] h-auto"
              />
            </div>
            
            <p className="text-xs text-muted-foreground">
              Opens Strangers: After Hours on any mobile device
            </p>
          </div>
          
          <div className="bg-card p-6 rounded-xl shadow-sm flex flex-col">
            <Share className="h-8 w-8 mb-4 text-primary self-center" />
            <h3 className="text-xl font-medium mb-2 text-center">Share with Friends</h3>
            <p className="text-muted-foreground mb-4 text-center">Share the app link with your friends so they can join your session.</p>
            
            <div className="flex items-center mb-6 bg-muted/30 p-3 rounded-lg">
              <input 
                type="text" 
                value={window.location.origin} 
                readOnly 
                className="flex-1 bg-transparent border-none focus:outline-none text-sm"
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={copyAppLink} 
                className="ml-2 gap-1"
              >
                {copySuccess ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy</span>
                  </>
                )}
              </Button>
            </div>
            
            <div className="mt-auto">
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'Strangers: After Hours - A Party Game for Building Connections',
                      text: 'Join me in playing Strangers: After Hours, the party game that builds real connections!',
                      url: window.location.origin,
                    });
                  } else {
                    copyAppLink();
                  }
                }}
              >
                <Share className="h-4 w-4 mr-2" />
                Share App Link
              </Button>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <Button asChild variant="outline">
            <Link href="/">Return to App</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}