import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface CustomChallengeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CustomChallengeForm({ isOpen, onClose, onSuccess }: CustomChallengeFormProps) {
  const [type, setType] = useState<string>("Dare");
  const [intensity, setIntensity] = useState<string>("1");
  const [text, setText] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) {
      toast({
        title: "Missing Text",
        description: "Please enter the text for your challenge",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await fetch("/api/challenges", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          type,
          text,
          intensity: parseInt(intensity),
          isCustom: true
        })
      });
      
      toast({
        title: "Challenge Created",
        description: "Your custom challenge has been added!"
      });
      
      // Reset form
      setText("");
      setType("Dare");
      setIntensity("1");
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (error) {
      console.error("Failed to create challenge:", error);
      toast({
        title: "Error",
        description: "Failed to create your challenge. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card rounded-3xl p-6 max-w-md mx-4 border border-primary shadow-xl">
        <DialogHeader>
          <DialogTitle className="font-heading font-bold text-2xl text-white">Create Custom Challenge</DialogTitle>
          <DialogDescription className="text-gray-300">
            Add your own challenge to the game. It will be saved for future games.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-white">Challenge Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="type" className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dare">Dare</SelectItem>
                  <SelectItem value="Act It Out">Act It Out</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="intensity" className="text-white">Intensity Level</Label>
              <Select value={intensity} onValueChange={setIntensity}>
                <SelectTrigger id="intensity" className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select intensity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Mild</SelectItem>
                  <SelectItem value="2">2 - Medium</SelectItem>
                  <SelectItem value="3">3 - Wild</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="text" className="text-white">Challenge Text</Label>
            <Textarea 
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={type === "Dare" 
                ? "Describe your dare challenge" 
                : "Describe what to act out"}
              className="h-24 bg-white/10 border-white/20 text-white"
            />
            <p className="text-xs text-gray-400">
              {type === "Dare" 
                ? "For Dares, describe an interesting or challenging task for players to perform." 
                : "For Act It Out, describe what the player should act out."}
            </p>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-transparent border border-gray-600 text-gray-300 font-bold py-3 rounded-xl"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Challenge"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}