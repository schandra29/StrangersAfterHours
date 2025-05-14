import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { type Challenge } from "@shared/schema";

type ChallengeView = "challenge" | "consent" | "recording" | "completion";

interface ChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "Dare" | "Act It Out" | "Take a Sip";
  intensity: number;
  isDrinkingGame: boolean;
}

export default function ChallengeModal({
  isOpen,
  onClose,
  type,
  intensity,
  isDrinkingGame
}: ChallengeModalProps) {
  const [challenge, setChallenge] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ChallengeView>("challenge");
  const [isRecording, setIsRecording] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const { data: challenges } = useQuery<Challenge[]>({
    queryKey: [`/api/challenges?type=${encodeURIComponent(type)}&intensity=${intensity}`],
    enabled: isOpen && type !== "Take a Sip",
  });

  useEffect(() => {
    if (type === "Take a Sip") {
      setChallenge("Take a sip of your drink!");
    } else if (challenges && challenges.length > 0) {
      const randomIndex = Math.floor(Math.random() * challenges.length);
      setChallenge(challenges[randomIndex].text);
    }
  }, [challenges, isOpen, type]);
  
  // Reset view when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentView("challenge");
      setErrorMessage(null);
    } else {
      // Stop recording and clean up when modal closes
      stopRecording();
    }
  }, [isOpen]);
  
  const handleAccept = () => {
    onClose();
  };
  
  const handleAcceptAndRecord = () => {
    if (type === "Take a Sip") {
      // Don't show recording option for "Take a Sip"
      onClose();
      return;
    }
    
    setCurrentView("consent");
  };
  
  const handleConsentConfirm = async () => {
    setCurrentView("recording");
    
    try {
      // Request camera and microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" }, 
        audio: true 
      });
      
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
  };
  
  const handleFinishRecording = () => {
    stopRecording();
    setCurrentView("completion");
  };
  
  const handlePass = () => {
    onClose();
  };
  
  const renderChallengeView = () => (
    <>
      <DialogTitle className="sr-only">Challenge</DialogTitle>
      <div className="text-center mb-6">
        <div className="bg-secondary/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <i className="ri-fire-line text-secondary text-3xl"></i>
        </div>
        <h3 className="font-heading font-bold text-2xl text-white mb-2">Challenge!</h3>
        <p className="text-gray-300">{type} challenge</p>
      </div>
      
      <div className="bg-white/10 rounded-xl p-4 mb-6">
        <p className="text-white font-medium">
          {challenge || "Loading challenge..."}
          {isDrinkingGame && type === "Dare" && challenge && (
            <span className="block mt-2 text-sm text-secondary">
              (If passing, take a sip of your drink)
            </span>
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
        
        {(type === "Dare" || type === "Act It Out") && (
          <Button 
            className="bg-secondary hover:bg-secondary/90 text-white font-bold py-3 rounded-xl"
            onClick={handleAcceptAndRecord}
          >
            <i className="ri-record-circle-line mr-2"></i>
            Accept and Record
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
      
      {isRecording && (
        <div className="text-center mb-4">
          <div className="inline-flex items-center bg-red-500/20 text-red-500 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse"></span>
            Recording
          </div>
        </div>
      )}
      
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
          <i className="ri-trophy-line text-green-500 text-3xl"></i>
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
          onClick={onClose}
        >
          <i className="ri-questionnaire-line mr-2"></i>
          Assign a Dare
        </Button>
        
        <Button 
          className="bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl"
          onClick={onClose}
        >
          <i className="ri-emotion-laugh-line mr-2"></i>
          Assign Act It Out
        </Button>
        
        {isDrinkingGame && (
          <Button 
            className="bg-accent hover:bg-accent/90 text-white font-bold py-3 rounded-xl"
            onClick={onClose}
          >
            <i className="ri-goblet-line mr-2"></i>
            Assign Take a Sip
          </Button>
        )}
        
        <Button 
          variant="outline"
          className="bg-transparent border border-gray-600 text-gray-300 font-bold py-3 rounded-xl"
          onClick={onClose}
        >
          Skip and Continue
        </Button>
      </div>
    </>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card rounded-3xl p-6 max-w-sm mx-4 border border-secondary shadow-xl">
        {currentView === "challenge" && renderChallengeView()}
        {currentView === "consent" && renderConsentView()}
        {currentView === "recording" && renderRecordingView()}
        {currentView === "completion" && renderCompletionView()}
      </DialogContent>
    </Dialog>
  );
}
