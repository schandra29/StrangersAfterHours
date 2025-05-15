import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Heart } from "lucide-react";

interface AboutGameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutGameModal({ isOpen, onClose }: AboutGameModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            About this Game
          </DialogTitle>
          <DialogDescription>
            Our mission and purpose
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="mt-4 pr-4 max-h-[60vh]">
          <div className="space-y-4 text-foreground/90">
            <p>
              Have you ever looked around at a party and felt...disconnected? Like you're surrounded by people, but no one really <em>sees</em> you? We have. That's why we created Strangers: After Hours.
            </p>
            
            <p>
              This isn't just another party game. It's an invitation. An invitation to step outside the small talk, to ditch the surface-level pleasantries, and to actually <em>connect</em> with the people around you. We believe that everyone has a story to tell, a perspective to share, and a hidden depth waiting to be discovered. But sometimes, it just takes the right prompt to unlock it.
            </p>
            
            <p>
              This game isn't about winning or losing. It's about building bridges, finding common ground, and maybe even forging some unexpected friendships. It's about being brave enough to be vulnerable, to be honest, and to be yourself, even with people you've just met.
            </p>
            
            <p>
              We know it can be scary. Putting yourself out there takes courage. But we also know that the rewards are worth it. The laughter, the shared tears, the moments of genuine connection – that's what makes life truly meaningful.
            </p>
            
            <p>
              So, grab your friends (or some soon-to-be friends), dim the lights, and get ready to go After Hours. Who knows what amazing stories you'll uncover? What surprising connections you'll make? What unforgettable memories you'll create?
            </p>
            
            <p>
              Just remember: it's all about taking that leap… into the wonderfully weird and wildly wonderful world of <em>real</em> human connection! Let the good times roll (and the truth bombs drop!).
            </p>
          </div>
        </ScrollArea>
        
        <DialogFooter className="mt-6">
          <DialogClose asChild>
            <Button className="w-full">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}