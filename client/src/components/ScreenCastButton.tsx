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
  const [presentationRequest, setPresentationRequest] = useState<PresentationRequest | null>(null);
  const [presentationConnection, setPresentationConnection] = useState<PresentationConnection | null>(null);
  const { toast } = useToast();

  // Check if the browser supports the Presentation API
  useEffect(() => {
    if (typeof navigator.presentation !== 'undefined') {
      setIsAvailable(true);
    } else {
      setIsAvailable(false);
    }
  }, []);

  // Setup presentation request
  useEffect(() => {
    if (!isAvailable) return;

    try {
      // Create a presentation request for the current page
      const request = new PresentationRequest([window.location.href]);
      
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
    } catch (error) {
      console.error('Failed to create presentation request:', error);
      setIsAvailable(false);
    }
  }, [isAvailable, toast]);

  // Handle start casting
  const startCasting = async () => {
    if (!presentationRequest) return;
    
    setIsLoading(true);
    
    try {
      // Check if there's already an active connection
      const activeConnection = await presentationRequest.getAvailability();
      
      if (activeConnection.value) {
        // Start the presentation
        await presentationRequest.start();
      } else {
        toast({
          title: "No displays found",
          description: "We couldn't find any compatible displays. Make sure your TV or display device is on the same network.",
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
      presentationConnection.terminate();
      setPresentationConnection(null);
      setIsCasting(false);
      toast({
        title: "Casting stopped",
        description: "Your screen is no longer being cast to the external display.",
      });
    }
  };

  // If the API is not available, don't render anything
  if (!isAvailable) {
    return null;
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