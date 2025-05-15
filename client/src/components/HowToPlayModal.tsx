import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { 
  Settings, 
  Users, 
  Timer, 
  History, 
  Flame, 
  Sparkles, 
  Video, 
  BarChart2, 
  Info 
} from "lucide-react";

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Define feature item type
interface FeatureItem {
  title: string;
  description: string;
  Icon: React.ElementType; // Component type for Lucide icons
}

export default function HowToPlayModal({ isOpen, onClose }: HowToPlayModalProps) {
  // Basic steps for quick start guide
  const basicSteps = [
    "Choose a starting Level (topic depth) and Intensity (how revealing)",
    "One person controls the app and reads prompts to the group",
    "Players take turns answering the prompts verbally",
    "Use the 'Full-house' button when everyone has participated",
    "Progress naturally to deeper levels for more meaningful connections"
  ];

  // Detailed feature descriptions with icons
  const features: FeatureItem[] = [
    {
      title: "Levels & Intensity",
      Icon: Settings,
      description: "Levels (1-3) control conversation depth from casual to deep. Intensity (1-3) controls how revealing questions are. Use the 'Select Level/Intensity' button to customize your experience."
    },
    {
      title: "Full-house Button",
      Icon: Users,
      description: "Click this when everyone in your group has participated in answering a prompt. This tracks group participation and builds a sense of accomplishment. The game keeps score of these moments!"
    },
    {
      title: "Timer",
      Icon: Timer,
      description: "Use the timer to keep track of how long your group spends on deep conversations. Start it when someone begins answering and it will be recorded in your session statistics."
    },
    {
      title: "Prompt Tracking & Reset",
      Icon: History,
      description: "The game automatically tracks prompts you've seen to avoid repetition. With 900 unique prompts across different levels and intensities, you can enjoy many game sessions without seeing the same prompts twice! Use the 'Reset Game' button in the menu to start fresh."
    },
    {
      title: "Challenges",
      Icon: Flame,
      description: "If someone doesn't want to answer a prompt, they can choose a Dare, R-Rated Dare, or Take a Sip (in drinking mode). This keeps the game flowing and adds variety."
    },
    {
      title: "Take a Chance",
      Icon: Sparkles,
      description: "Click this button to get a completely random prompt from any level or intensity. Great for mixing things up!"
    },
    {
      title: "Recording Features",
      Icon: Video,
      description: "When accepting dares, you can record the performance using your device's camera. These recordings are saved only to your device and are never uploaded anywhere."
    },
    {
      title: "Game Summary",
      Icon: BarChart2,
      description: "At the end of your session, review statistics about your group's engagement, most popular conversation depth, and total time spent connecting with each other."
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card rounded-3xl p-6 max-w-lg mx-auto border border-primary shadow-xl overflow-auto max-h-[85vh]">
        <DialogTitle className="font-heading font-bold text-2xl text-white mb-4 text-center">
          How to Play
        </DialogTitle>
        
        {/* Quick Start Guide */}
        <div className="mb-6">
          <h3 className="font-heading font-bold text-xl text-white mb-3">Quick Start Guide</h3>
          <div className="space-y-4">
            {basicSteps.map((step, index) => (
              <div className="flex" key={index}>
                <div className="bg-primary/20 rounded-full w-8 h-8 flex items-center justify-center mr-3 shrink-0">
                  <span className="text-white font-bold">{index + 1}</span>
                </div>
                <p className="text-gray-300">{step}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Game Features */}
        <div className="mb-6">
          <h3 className="font-heading font-bold text-xl text-white mb-3">Game Features</h3>
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div className="bg-primary/10 rounded-xl p-4" key={index}>
                <h4 className="font-heading font-bold text-lg text-white mb-1 flex items-center">
                  <feature.Icon className="w-5 h-5 mr-2 text-primary" />
                  {feature.title}
                </h4>
                <p className="text-gray-300 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Safety Note */}
        <div className="bg-warning/20 rounded-xl p-4 mb-6">
          <div className="flex">
            <Info className="text-warning mr-3 w-5 h-5 mt-0.5 shrink-0" />
            <p className="text-sm text-gray-300">
              Remember, everyone should feel comfortable. Anyone can skip a prompt or challenge at any time. 
              This game is designed to build connections, not embarrass participants.
            </p>
          </div>
        </div>
        
        <Button 
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl"
          onClick={onClose}
        >
          Got it!
        </Button>
      </DialogContent>
    </Dialog>
  );
}
