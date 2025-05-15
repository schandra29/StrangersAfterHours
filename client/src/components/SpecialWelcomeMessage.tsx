import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface SpecialWelcomeMessageProps {
  type: string;
  onClose: () => void;
}

export function SpecialWelcomeMessage({ type, onClose }: SpecialWelcomeMessageProps) {
  const [visible, setVisible] = useState(true);
  const [animate, setAnimate] = useState(false);
  
  // Add entrance animation
  useEffect(() => {
    // Slight delay for entrance animation
    const timer = setTimeout(() => {
      setAnimate(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleClose = () => {
    setAnimate(false);
    setTimeout(() => {
      setVisible(false);
      onClose();
    }, 300);
  };
  
  // If no longer visible, don't render
  if (!visible) return null;
  
  // Get message based on type
  const getMessage = () => {
    switch (type) {
      case "vivek":
        return {
          title: "Welcome, Vivek and Party!",
          message: "Thank you for being the first users! We hope you discover a lot more about each other while having fun. Have a great night!"
        };
      default:
        return {
          title: "Welcome!",
          message: "Thank you for playing Strangers: After Hours!"
        };
    }
  };
  
  const { title, message } = getMessage();
  
  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 bg-black/50 p-4 transition-opacity duration-300 ${animate ? 'opacity-100' : 'opacity-0'}`}>
      <Card className={`w-full max-w-md mx-auto border border-primary/50 shadow-xl transition-transform duration-300 ${animate ? 'scale-100' : 'scale-90'}`}>
        <CardHeader className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-t-lg">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <CardTitle className="text-xl">{title}</CardTitle>
          </div>
          <CardDescription>Special Message</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 pb-4">
          <p className="text-center text-foreground/90 leading-relaxed">{message}</p>
        </CardContent>
        <CardFooter className="flex justify-center pb-6">
          <Button 
            onClick={handleClose}
            className="px-6 py-2 bg-primary hover:bg-primary/90"
          >
            Let's Start!
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}