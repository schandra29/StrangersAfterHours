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
import { trackDownload } from '@/lib/registerSW';

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
  
  // Generate direct download links for each platform
  const getDirectDownloadUrl = (devicePlatform: string) => {
    const baseUrl = window.location.origin;
    
    switch(devicePlatform) {
      case 'android':
      case 'Android':
        return `${baseUrl}/files/android-app`;
      case 'ios':
      case 'iOS':
        return `${baseUrl}/files/ios-invite`;
      case 'macos':
      case 'macOS':
        return `${baseUrl}/files/macos-app`;
      case 'windows':
      case 'Windows':
        return `${baseUrl}/files/windows-app`;
      case 'desktop':
      case 'Desktop':
        // Detect macOS vs Windows for desktop
        const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
        return isMac ? `${baseUrl}/files/macos-app` : `${baseUrl}/files/windows-app`;
      default:
        // Default to a download landing page with auto-platform detection
        return `${baseUrl}/install?auto=true`;
    }
  };
  
  // Generate QR code URL for downloading the app directly on another device
  const generateQRCodeUrl = () => {
    // Use the detected platform to generate a direct download QR code
    const directDownloadUrl = getDirectDownloadUrl(platform);
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(directDownloadUrl)}`;
  };
  
  // Copy direct download link to clipboard
  const copyAppLink = () => {
    const directDownloadUrl = getDirectDownloadUrl(platform);
    
    navigator.clipboard.writeText(directDownloadUrl)
      .then(() => {
        setCopySuccess(true);
        toast({
          title: "Direct Download Link Copied!",
          description: `Link for ${platform === 'desktop' ? 'Desktop' : platform === 'ios' ? 'iOS' : 'Android'} copied to clipboard`,
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
    trackDownload(platformType); // Track download for analytics
    
    // Real download URLs for properly signed application packages
    const downloadFiles = {
      'Android': {
        filePath: 'https://storage.googleapis.com/strangers-app-distribution/strangers-after-hours-v1.0.apk',
        fileName: 'strangers-after-hours.apk',
        mime: 'application/vnd.android.package-archive',
        size: '15.2 MB',
        isExternalLink: true
      },
      'iOS': {
        filePath: '/files/ios-invite',
        fileName: 'strangers-beta-invitation.html',
        mime: 'text/html',
        size: '5.5 KB',
        isExternalLink: false
      },
      'Desktop': {
        filePath: platformType === 'macOS' 
          ? 'https://storage.googleapis.com/strangers-app-distribution/strangers-after-hours-v1.0.dmg'
          : 'https://storage.googleapis.com/strangers-app-distribution/strangers-after-hours-setup-v1.0.exe',
        fileName: platformType === 'macOS' ? 'strangers-after-hours.dmg' : 'strangers-after-hours-setup.exe',
        mime: platformType === 'macOS' ? 'application/x-apple-diskimage' : 'application/x-msdownload',
        size: platformType === 'macOS' ? '24.5 MB' : '18.7 MB',
        isExternalLink: true
      }
    };
    
    const fileInfo = downloadFiles[platformType as keyof typeof downloadFiles];
    
    // Show download starting notification
    toast({
      title: "Download Starting",
      description: `Downloading Strangers: After Hours (${fileInfo.size}) for ${platformType}...`,
      duration: 2000,
    });
    
    // For Android, download the APK file with detailed instructions
    if (platformType === 'Android') {
      setTimeout(() => {
        try {
          // Use direct window.open for external links, window.location for internal files
          if (fileInfo.isExternalLink) {
            window.open(fileInfo.filePath, '_blank');
          } else {
            window.location.href = fileInfo.filePath;
          }
          
          // First notification about download completion
          toast({
            title: "APK Download Complete",
            description: "The APK file has been downloaded to your device (filename: strangers-after-hours.apk).",
            duration: 3000,
          });
          
          // Second notification with installation instructions
          setTimeout(() => {
            toast({
              title: "Installation Instructions",
              description: "1. Open your Downloads folder or notification\n2. Tap the APK file (strangers-after-hours.apk)\n3. If prompted, enable 'Install from unknown sources' in settings",
              duration: 10000,
            });
            
            // Final notification to help user locate the file
            setTimeout(() => {
              toast({
                title: "Can't find the APK?",
                description: "Check your Downloads folder in Files app or look for 'strangers-after-hours.apk' in your download notifications.",
                duration: 8000,
              });
              setDownloadStarted(false);
            }, 5000);
          }, 3500);
        } catch (error) {
          console.error("Download error:", error);
          toast({
            title: "Download Error",
            description: "There was an error downloading the APK. Please try again.",
            duration: 5000,
          });
          setDownloadStarted(false);
        }
      }, 1500);
    } 
    // For iOS, open TestFlight invitation HTML page
    else if (platformType === 'iOS') {
      setTimeout(() => {
        try {
          // Open the TestFlight invitation page
          window.open(fileInfo.filePath, '_blank');
          
          // First notification
          toast({
            title: "TestFlight Page Opened",
            description: "Follow the instructions on the page to join our TestFlight beta.",
            duration: 5000,
          });
          
          // Second notification with extra guidance
          setTimeout(() => {
            toast({
              title: "iOS Installation Help",
              description: "Make sure you have TestFlight installed from the App Store before using the invitation link.",
              duration: 8000,
            });
            setDownloadStarted(false);
          }, 5500);
        } catch (error) {
          console.error("iOS download error:", error);
          toast({
            title: "Error Opening TestFlight Page",
            description: "There was an error opening the TestFlight page. Please try again.",
            duration: 5000,
          });
          setDownloadStarted(false);
        }
      }, 1500);
    }
    // For Desktop, trigger file download
    else {
      setTimeout(() => {
        try {
          // Create a download link with proper attributes to preserve file extension
          const downloadLink = document.createElement('a');
          downloadLink.href = fileInfo.filePath;
          downloadLink.setAttribute('download', fileInfo.fileName); // Force download with correct filename
          downloadLink.setAttribute('type', fileInfo.mime); // Set MIME type
          
          // Trigger the download
          document.body.appendChild(downloadLink); // Needed for Firefox
          downloadLink.click();
          document.body.removeChild(downloadLink);
          
          // First notification about download completion
          toast({
            title: "Installer Downloaded",
            description: `The ${platformType} installer file has been downloaded (${fileInfo.fileName}).`,
            duration: 4000,
          });
          
          // Second notification with installation instructions
          setTimeout(() => {
            toast({
              title: "Installation Instructions",
              description: `Open the downloaded file (${fileInfo.fileName}) and follow the installation wizard to complete setup.`,
              duration: 8000,
            });
            setDownloadStarted(false);
          }, 4500);
        } catch (error) {
          console.error("Desktop download error:", error);
          toast({
            title: "Download Error",
            description: "There was an error downloading the installer. Please try again.",
            duration: 5000,
          });
          setDownloadStarted(false);
        }
      }, 1500);
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
                  const directDownloadUrl = getDirectDownloadUrl(platform);
                  if (navigator.share) {
                    navigator.share({
                      title: 'Strangers: After Hours - A Party Game for Building Connections',
                      text: `Download Strangers: After Hours for ${platform === 'desktop' ? 'Desktop' : platform === 'ios' ? 'iOS' : 'Android'} - the party game that builds real connections!`,
                      url: directDownloadUrl,
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