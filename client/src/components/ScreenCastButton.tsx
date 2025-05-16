import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { Cast, X as CastOff, Loader2 } from "lucide-react";

interface ScreenCastButtonProps {
  className?: string;
}

export default function ScreenCastButton({ className }: ScreenCastButtonProps) {
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [isCasting, setIsCasting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [presentationRequest, setPresentationRequest] = useState<any | null>(null);
  const [presentationConnection, setPresentationConnection] = useState<any | null>(null);
  const { toast } = useToast();

  // Check if the browser supports the Presentation API or Chrome casting
  useEffect(() => {
    // Modern browser support for Presentation API
    if (navigator && 
        (typeof (navigator as any).presentation !== 'undefined' || 
         typeof (window as any).chrome?.cast !== 'undefined')) {
      setIsAvailable(true);
    } else {
      setIsAvailable(false);
    }
  }, []);

  // Setup presentation request
  useEffect(() => {
    if (!isAvailable) return;

    // Chrome Cast support
    if (typeof (window as any).chrome?.cast !== 'undefined') {
      // Initialize Chrome Cast API
      const initializeCastApi = () => {
        const cast = (window as any).chrome.cast;
        
        cast.initialize(
          new cast.ApiConfig(
            new cast.SessionRequest(cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID),
            sessionListener,
            receiverListener
          )
        );
      };
      
      const sessionListener = (session: any) => {
        setPresentationConnection(session);
        setIsCasting(true);
      };
      
      const receiverListener = (availability: string) => {
        if (availability === 'available') {
          setIsAvailable(true);
        }
      };
      
      // Wait for Cast API to be available
      if ((window as any).__onGCastApiAvailable) {
        (window as any).__onGCastApiAvailable = (isAvailable: boolean) => {
          if (isAvailable) {
            initializeCastApi();
          }
        };
      }
      
      return;
    }

    // Presentation API support
    try {
      if (typeof (navigator as any).presentation !== 'undefined') {
        // Create a presentation request for the current page
        const request = new (window as any).PresentationRequest([window.location.href]);
        
        // Listen for connect events
        request.addEventListener('connectionavailable', (event: any) => {
          const connection = event.connection;
          setPresentationConnection(connection);
          setIsCasting(true);
          setIsLoading(false);
          
          // Listen for connection changes
          connection.addEventListener('close', () => {
            setPresentationConnection(null);
            setIsCasting(false);
            toast({
              title: "Casting stopped",
              description: "Your screen is no longer being cast to the external display.",
            });
          });
          
          connection.addEventListener('terminate', () => {
            setPresentationConnection(null);
            setIsCasting(false);
          });
          
          toast({
            title: "Casting started",
            description: "Your screen is now being cast to the external display!",
          });
        });
        
        setPresentationRequest(request);
      }
    } catch (error) {
      console.error('Failed to create presentation request:', error);
      setIsAvailable(false);
    }
  }, [isAvailable, toast]);

  // Handle start casting
  const startCasting = async () => {
    setIsLoading(true);
    
    try {
      // Chrome Cast
      if (typeof (window as any).chrome?.cast !== 'undefined') {
        (window as any).chrome.cast.requestSession(
          (session: any) => {
            setPresentationConnection(session);
            setIsCasting(true);
            setIsLoading(false);
            
            toast({
              title: "Casting started",
              description: "Your screen is now being cast to the external display!",
            });
          },
          (error: any) => {
            console.error('Failed to start Chrome casting:', error);
            toast({
              title: "Casting failed",
              description: error.description || "Unable to connect to the display",
              variant: "destructive",
            });
            setIsLoading(false);
          }
        );
        return;
      }
      
      // Presentation API
      if (presentationRequest) {
        try {
          // Start the presentation
          await presentationRequest.start();
        } catch (error: any) {
          if (error.name === 'NotFoundError') {
            toast({
              title: "No displays found",
              description: "We couldn't find any compatible displays. Make sure your TV or display device is on the same network.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Casting failed",
              description: "Unable to connect to the display. Please check your network and try again.",
              variant: "destructive",
            });
          }
          setIsLoading(false);
        }
      } else {
        // Fallback if no casting solution is available
        toast({
          title: "Casting not available",
          description: "Your browser doesn't support screen casting. Please try using Chrome or Edge.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Failed to start casting:', error);
      toast({
        title: "Casting failed",
        description: "Unable to connect to the display. Please check your network and try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  // Handle stop casting
  const stopCasting = () => {
    if (presentationConnection) {
      // Chrome Cast
      if (typeof (window as any).chrome?.cast !== 'undefined' && 
          presentationConnection.disconnect) {
        presentationConnection.disconnect();
        setPresentationConnection(null);
        setIsCasting(false);
        toast({
          title: "Casting stopped",
          description: "Your screen is no longer being cast to the external display.",
        });
        return;
      }
      
      // Presentation API
      if (presentationConnection.terminate) {
        presentationConnection.terminate();
        setPresentationConnection(null);
        setIsCasting(false);
        toast({
          title: "Casting stopped",
          description: "Your screen is no longer being cast to the external display.",
        });
      }
    }
  };

  // If neither API is available, still render the button but show a toast explaining compatibility
  if (!isAvailable) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={className}
              onClick={() => {
                toast({
                  title: "Screen casting not supported",
                  description: "Your browser doesn't support screen casting. Please try using Chrome or Edge for this feature.",
                  variant: "destructive",
                });
              }}
            >
              <Cast className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Cast to TV (not supported in this browser)</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className={className}
            onClick={isCasting ? stopCasting : startCasting}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isCasting ? (
              <CastOff className="h-4 w-4" />
            ) : (
              <Cast className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isCasting ? "Stop casting" : "Cast to TV"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}