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

export default function InstallApp() {
  const [downloadStarted, setDownloadStarted] = useState(false);
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
  
  // Generate QR code URL for downloading the app on another device
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
  
  // Handle app download for beta testers
  const handleDownload = (platformType: string) => {
    setDownloadStarted(true);
    
    // Define platform-specific file names and paths
    const downloadFiles = {
      'Android': {
        filename: 'strangers-after-hours.apk',
        mime: 'application/vnd.android.package-archive'
      },
      'iOS': {
        filename: 'strangers-beta-invitation.html',
        mime: 'text/html'
      },
      'Desktop': {
        filename: platformType === 'macOS' ? 'strangers-after-hours.dmg' : 'strangers-after-hours-setup.exe',
        mime: 'application/octet-stream'
      }
    };
    
    const fileInfo = downloadFiles[platformType as keyof typeof downloadFiles];
    
    // Show download starting toast
    toast({
      title: "Download starting",
      description: `Downloading Strangers: After Hours for ${platformType}...`,
      duration: 2000,
    });
    
    // For Android, simulate downloading the APK file
    if (platformType === 'Android') {
      setTimeout(() => {
        // Create a temporary anchor element to trigger download
        const downloadLink = document.createElement('a');
        // This would be an actual file in production
        downloadLink.href = `/download/${fileInfo.filename}`;
        downloadLink.download = fileInfo.filename;
        downloadLink.click();
        
        // Show instructions on how to locate and install the APK
        setTimeout(() => {
          toast({
            title: "APK Downloaded",
            description: "Check your Downloads folder. Tap on the file to install and follow the security prompts to enable installation from unknown sources.",
            duration: 8000,
          });
          setDownloadStarted(false);
        }, 1500);
      }, 1500);
    } 
    // For iOS, open TestFlight invitation page
    else if (platformType === 'iOS') {
      setTimeout(() => {
        window.open('https://testflight.apple.com/join/beta-code-here', '_blank');
        
        toast({
          title: "TestFlight Invitation Sent",
          description: "We've opened the TestFlight registration page. Follow the instructions to install the beta app.",
          duration: 6000,
        });
        
        setDownloadStarted(false);
      }, 1500);
    }
    // For Desktop, trigger file download
    else {
      setTimeout(() => {
        // Create a temporary anchor element to trigger download
        const downloadLink = document.createElement('a');
        // This would be an actual file in production
        downloadLink.href = `/download/${fileInfo.filename}`;
        downloadLink.download = fileInfo.filename;
        downloadLink.click();
        
        toast({
          title: "Download Complete",
          description: "Installer downloaded. Open the file to install the application.",
          duration: 5000,
        });
        
        setDownloadStarted(false);
      }, 2000);
    }
  };
  
  // Create download directories/files for the app
  useEffect(() => {
    // This would create download files in a real app
    // For now, we're just simulating downloads
  }, []);
  
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
          <h1 className="text-3xl font-bold mb-2">Download Strangers: After Hours</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Download the official app for your platform to enjoy the best experience.
          </p>
          
          <div className="mt-8 grid gap-4 max-w-md mx-auto">
            <Button
              size="lg"
              className="bg-primary text-white hover:bg-primary/90 py-8 px-8 text-lg"
              onClick={() => handleDownload(platform === 'desktop' ? 'Desktop' : platform === 'ios' ? 'iOS' : 'Android')}
            >
              <div className="flex items-center">
                <Download className="h-5 w-5 mr-3" />
                Download for {platform === 'desktop' ? 'Desktop' : platform === 'ios' ? 'iOS' : 'Android'}
              </div>
            </Button>
            <p className="text-xs text-muted-foreground mt-1">
              Beta test version for authorized testers only
            </p>
          </div>
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
                    <h3 className="text-lg font-medium">Download the APK file</h3>
                    <p className="text-muted-foreground">Click the download button above to get the app package</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <span className="text-xl font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Allow installation from unknown sources</h3>
                    <p className="text-muted-foreground">When prompted, give permission to install the app</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <span className="text-xl font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Open the app after installation</h3>
                    <p className="text-muted-foreground">Enjoy the full app experience</p>
                  </div>
                </div>
                
                <div className="bg-muted/30 p-4 rounded-lg mt-6">
                  <p className="text-sm">
                    <span className="font-medium">Note:</span> This beta test version is not available on Google Play Store. It's distributed only to authorized beta testers.
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
                    <h3 className="text-lg font-medium">Download TestFlight</h3>
                    <p className="text-muted-foreground">Install TestFlight from the App Store if you haven't already</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <span className="text-xl font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Click the download button above</h3>
                    <p className="text-muted-foreground">This will send you an email with your TestFlight invitation</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <span className="text-xl font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Open the invitation in TestFlight</h3>
                    <p className="text-muted-foreground">Follow the instructions to install the beta app</p>
                  </div>
                </div>
                
                <div className="bg-muted/30 p-4 rounded-lg mt-6">
                  <p className="text-sm">
                    <span className="font-medium">Note:</span> This beta version is distributed through TestFlight and limited to authorized beta testers only.
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
                    <h3 className="text-lg font-medium">Download the installer package</h3>
                    <p className="text-muted-foreground">Click the download button above to get the desktop installer</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <span className="text-xl font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Run the installer</h3>
                    <p className="text-muted-foreground">Follow the installation wizard to install the app</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <span className="text-xl font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Launch the application</h3>
                    <p className="text-muted-foreground">The app will be available in your Start menu or Applications folder</p>
                  </div>
                </div>
                
                <div className="bg-muted/30 p-4 rounded-lg mt-6">
                  <p className="text-sm">
                    <span className="font-medium">Available for:</span> Windows, macOS, and Linux. This beta version is distributed directly to authorized testers only.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-card p-6 rounded-xl shadow-sm flex flex-col items-center text-center">
            <QrCode className="h-8 w-8 mb-4 text-primary" />
            <h3 className="text-xl font-medium mb-2">Download on Another Device</h3>
            <p className="text-muted-foreground mb-4">Scan this QR code with your phone's camera to download the app on another device.</p>
            
            <div className="bg-white p-3 rounded-lg mb-4 shadow-sm">
              <img 
                src={generateQRCodeUrl()} 
                alt="Download QR Code" 
                className="w-full max-w-[200px] h-auto"
              />
            </div>
            
            <p className="text-xs text-muted-foreground">
              Opens the download page on any mobile device
            </p>
          </div>
          
          <div className="bg-card p-6 rounded-xl shadow-sm flex flex-col">
            <Share className="h-8 w-8 mb-4 text-primary self-center" />
            <h3 className="text-xl font-medium mb-2 text-center">Share with Friends</h3>
            <p className="text-muted-foreground mb-4 text-center">Share the app download link with your friends so they can join your beta test.</p>
            
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
                Share Download Link
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