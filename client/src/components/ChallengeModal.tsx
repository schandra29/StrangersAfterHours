import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { type Challenge } from "@shared/schema";
import { Flame, Video, FlipHorizontal, Check, X, Trophy, Wine, User, Camera, FileQuestion } from "lucide-react";

type ChallengeView = "challenge" | "consent" | "recording" | "completion";

interface ChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "Dare" | "R-Rated Dare" | "Take a Sip";
  intensity: number;
  isDrinkingGame: boolean;
  onChallengeComplete?: () => void; // Callback for when challenge is completed
}

export default function ChallengeModal({
  isOpen,
  onClose,
  type,
  intensity,
  isDrinkingGame,
  onChallengeComplete
}: ChallengeModalProps) {
  const [challenge, setChallenge] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ChallengeView>("challenge");
  const [isRecording, setIsRecording] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [usingFrontCamera, setUsingFrontCamera] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // For R-Rated Dares, we get all of them regardless of intensity
  // For regular Dares, we filter by intensity
  const queryKey = type === "R-Rated Dare"
    ? `/api/challenges?type=${encodeURIComponent(type)}`
    : `/api/challenges?type=${encodeURIComponent(type)}&intensity=${intensity}`;
    
  const { data: challenges } = useQuery<Challenge[]>({
    queryKey: [queryKey],
    enabled: isOpen && type !== "Take a Sip",
  });

  // Function to get a random challenge from available challenges
  const getRandomChallenge = () => {
    // Show refreshing animation
    setIsRefreshing(true);
    
    // Short delay for visual feedback
    setTimeout(() => {
      if (type === "Take a Sip") {
        setChallenge("Take a sip of your drink!");
      } else if (challenges && challenges.length > 0) {
        const randomIndex = Math.floor(Math.random() * challenges.length);
        setChallenge(challenges[randomIndex].text);
      }
      setIsRefreshing(false);
    }, 300);
  };

  useEffect(() => {
    getRandomChallenge();
  }, [challenges, isOpen, type]);
  
  // Reset view when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentView("challenge");
      setErrorMessage(null);
      setUsingFrontCamera(false); // Reset camera state
    } else {
      // Stop recording and clean up when modal closes
      stopRecording();
      setUsingFrontCamera(false); // Reset camera state
    }
  }, [isOpen]);
  
  const handleAccept = () => {
    // Call the challenge complete callback before closing
    if (onChallengeComplete) {
      onChallengeComplete();
    }
    onClose();
  };
  
  const handleAcceptAndRecord = () => {
    if (type === "Take a Sip") {
      // Don't show recording option for "Take a Sip"
      if (onChallengeComplete) {
        onChallengeComplete();
      }
      onClose();
      return;
    }
    
    setCurrentView("consent");
  };
  
  const handleConsentConfirm = async () => {
    setCurrentView("recording");
    
    try {
      let stream;
      
      try {
        // First try to get the rear-facing camera
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "environment" }, // Use rear camera first
          audio: true 
        });
        setUsingFrontCamera(false); // Using rear camera
      } catch (error) {
        console.log("Couldn't access rear camera, falling back to front camera:", error);
        // If rear camera fails, fall back to front camera
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "user" }, 
          audio: true 
        });
        setUsingFrontCamera(true); // Using front camera
      }
      
      streamRef.current = stream;
      
      // Display the video feed
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Set up media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        // Create a blob from the recorded chunks
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        chunksRef.current = [];
        
        // Create a download link for the video
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `challenge-${Date.now()}.webm`;
        
        // Trigger the download
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      setErrorMessage(null);
    } catch (error) {
      console.error('Error accessing camera:', error);
      setErrorMessage('Could not access camera. Please check your permissions and try again.');
      setCurrentView("challenge");
    }
  };
  
  const handleConsentCancel = () => {
    setCurrentView("challenge");
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    
    // Stop all tracks from the stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Clear video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    // Reset camera state
    setUsingFrontCamera(false);
  };
  
  const handleFinishRecording = () => {
    stopRecording();
    setCurrentView("completion");
  };
  
  const handlePass = () => {
    // Call the challenge complete callback before closing
    if (onChallengeComplete) {
      onChallengeComplete();
    }
    onClose();
  };
  
  const renderChallengeView = () => (
    <>
      <DialogTitle className="sr-only">Challenge</DialogTitle>
      <div className="text-center mb-6">
        <div className="bg-secondary/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <Flame className="text-secondary w-8 h-8" />
        </div>
        <h3 className="font-heading font-bold text-2xl text-white mb-2">Challenge!</h3>
        <p className="text-gray-300">{type} challenge</p>
      </div>
      
      <div className={`bg-white/10 rounded-xl p-4 mb-6 ${isRefreshing ? 'animate-pulse' : ''}`}>
        <p className="text-white font-medium">
          {isRefreshing ? (
            <span className="flex items-center justify-center py-2">
              <i className="ri-refresh-line text-xl animate-spin mr-2"></i>
              Finding new challenge...
            </span>
          ) : (
            <>
              {challenge || "Loading challenge..."}
              {isDrinkingGame && type === "Dare" && challenge && (
                <span className="block mt-2 text-sm text-secondary">
                  (If passing, take a sip of your drink)
                </span>
              )}
            </>
          )}
        </p>
      </div>
      
      {errorMessage && (
        <Alert className="mb-4 bg-destructive/20 border-destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 gap-3">
        <Button 
          className="bg-accent hover:bg-accent/90 text-white font-bold py-3 rounded-xl"
          onClick={handleAccept}
        >
          Accept
        </Button>
        
        {(type === "Dare" || type === "R-Rated Dare") && (
          <Button 
            className="bg-secondary hover:bg-secondary/90 text-white font-bold py-3 rounded-xl"
            onClick={handleAcceptAndRecord}
          >
            <Video className="w-4 h-4 mr-2" />
            Accept and Record
          </Button>
        )}

        {(type === "Dare" || type === "R-Rated Dare") && (
          <Button 
            className="bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl"
            onClick={getRandomChallenge}
          >
            <i className="ri-refresh-line mr-2"></i>
            Pick Another
          </Button>
        )}
        
        <Button 
          variant="outline"
          className="bg-transparent border border-gray-600 text-gray-300 font-bold py-3 rounded-xl"
          onClick={handlePass}
        >
          Pass
        </Button>
      </div>
    </>
  );
  
  const renderConsentView = () => (
    <>
      <DialogTitle className="sr-only">Recording Consent</DialogTitle>
      <div className="text-center mb-6">
        <div className="bg-primary/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <i className="ri-record-circle-line text-primary text-3xl"></i>
        </div>
        <h3 className="font-heading font-bold text-2xl text-white mb-2">Consent Required</h3>
        <p className="text-gray-300">Please confirm you have permission to record</p>
      </div>
      
      <div className="bg-white/10 rounded-xl p-4 mb-6">
        <p className="text-white">
          Before recording, please ensure:
        </p>
        <ul className="list-disc list-inside text-white mt-2 space-y-1">
          <li>Everyone present has given consent to be recorded</li>
          <li>You have permission to record in this location</li>
          <li>The recording will be saved only to your device</li>
          <li>The app does not store or transmit any recordings</li>
        </ul>
        <div className="mt-3 p-2 bg-secondary/10 rounded-lg text-sm text-gray-300">
          <p><i className="ri-camera-line mr-1"></i> The app will try to use your device's rear camera to record others performing the dare. If unavailable, it will fall back to the front camera.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <Button 
          variant="outline"
          className="bg-transparent border border-gray-600 text-gray-300 font-bold py-3 rounded-xl"
          onClick={handleConsentCancel}
        >
          Cancel
        </Button>
        <Button 
          className="bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl"
          onClick={handleConsentConfirm}
        >
          I Confirm
        </Button>
      </div>
    </>
  );
  
  const renderRecordingView = () => (
    <>
      <DialogTitle className="sr-only">Recording</DialogTitle>
      <div className="text-center mb-4">
        <h3 className="font-heading font-bold text-2xl text-white mb-2">
          {isRecording ? "Recording..." : "Preparing Camera..."}
        </h3>
      </div>
      
      <div className="rounded-xl overflow-hidden mb-4 bg-black aspect-video">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="text-center mb-4 flex flex-col items-center gap-2">
        {isRecording && (
          <div className="inline-flex items-center bg-red-500/20 text-red-500 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse"></span>
            Recording
          </div>
        )}
        
        <div className="text-xs text-gray-400">
          {usingFrontCamera ? (
            <div className="inline-flex items-center">
              <User className="w-3 h-3 mr-1" /> Using front camera (selfie mode)
            </div>
          ) : (
            <div className="inline-flex items-center">
              <Camera className="w-3 h-3 mr-1" /> Using rear camera
            </div>
          )}
        </div>
      </div>
      
      <Button 
        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl"
        onClick={handleFinishRecording}
      >
        {isRecording ? "Finish & Save Recording" : "Cancel"}
      </Button>
    </>
  );

  const renderCompletionView = () => (
    <>
      <DialogTitle className="sr-only">Challenge Completion</DialogTitle>
      <div className="text-center mb-6">
        <div className="bg-green-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <Trophy className="text-green-500 w-8 h-8" />
        </div>
        <h3 className="font-heading font-bold text-2xl text-white mb-2">Congratulations!</h3>
        <p className="text-gray-300">Your brave performance deserves recognition</p>
      </div>
      
      <div className="bg-white/10 rounded-xl p-4 mb-6">
        <p className="text-white text-center">
          For your courage, you can now assign a challenge to someone else! 
          Choose someone in the group to complete a:
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        <Button 
          className="bg-secondary hover:bg-secondary/90 text-white font-bold py-3 rounded-xl"
          onClick={() => {
            if (onChallengeComplete) {
              onChallengeComplete();
            }
            onClose();
          }}
        >
          <FileQuestion className="w-4 h-4 mr-2" />
          Assign a Dare
        </Button>
        
        <Button 
          className="bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl"
          onClick={() => {
            if (onChallengeComplete) {
              onChallengeComplete();
            }
            onClose();
          }}
        >
          <i className="ri-emotion-laugh-line mr-2"></i>
          Assign Act It Out
        </Button>
        
        {isDrinkingGame && (
          <Button 
            className="bg-accent hover:bg-accent/90 text-white font-bold py-3 rounded-xl"
            onClick={() => {
              if (onChallengeComplete) {
                onChallengeComplete();
              }
              onClose();
            }}
          >
            <Wine className="w-4 h-4 mr-2" />
            Assign Take a Sip
          </Button>
        )}
        
        <Button 
          variant="outline"
          className="bg-transparent border border-gray-600 text-gray-300 font-bold py-3 rounded-xl"
          onClick={() => {
            if (onChallengeComplete) {
              onChallengeComplete();
            }
            onClose();
          }}
        >
          Skip and Continue
        </Button>
      </div>
    </>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card rounded-3xl p-6 max-w-sm mx-auto border border-secondary shadow-xl">
        {currentView === "challenge" && renderChallengeView()}
        {currentView === "consent" && renderConsentView()}
        {currentView === "recording" && renderRecordingView()}
        {currentView === "completion" && renderCompletionView()}
      </DialogContent>
    </Dialog>
  );
}
