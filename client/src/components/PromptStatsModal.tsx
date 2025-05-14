import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  getPromptStats, 
  resetUsedPrompts, 
  getCompletionPercentage, 
  updatePromptStats 
} from "@/lib/utils";
import { useState, useEffect } from "react";
import { getLevelName } from "@/lib/gameData";

interface PromptStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PromptStatsModal({ isOpen, onClose }: PromptStatsModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState(getPromptStats());
  const completionPercentage = getCompletionPercentage();
  
  // Update stats when the modal opens
  useEffect(() => {
    if (isOpen) {
      refreshStats();
    }
  }, [isOpen]);
  
  const refreshStats = async () => {
    try {
      setIsLoading(true);
      await updatePromptStats();
      setStats(getPromptStats());
    } catch (error) {
      console.error('Error updating prompt stats:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReset = async () => {
    try {
      setIsLoading(true);
      resetUsedPrompts();
      await refreshStats();
    } catch (error) {
      console.error('Error resetting prompt stats:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Prompt Collection Progress</DialogTitle>
          <DialogDescription>
            Track how many unique prompts you've experienced and how many remain to be discovered.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          {/* Overall progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Total Collection Progress</span>
              <span className="text-muted-foreground">{stats.used.total} / {stats.total.total} prompts</span>
            </div>
            <Progress value={completionPercentage} className="h-3" />
            <p className="text-center text-sm text-muted-foreground">
              You've experienced {completionPercentage}% of all available prompts
            </p>
          </div>
          
          {/* Level progress cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(level => {
              const levelKey = `level${level}` as keyof typeof stats.total;
              const usedCount = stats.used[levelKey];
              const totalCount = stats.total[levelKey];
              const levelProgress = totalCount > 0 ? Math.round((usedCount / totalCount) * 100) : 0;
              
              return (
                <Card key={level}>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base">{getLevelName(level)}</CardTitle>
                    <CardDescription className="text-xs">Level {level} Prompts</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <Progress value={levelProgress} className="h-2 mb-2" />
                    <div className="flex justify-between text-xs">
                      <span>{usedCount} used</span>
                      <span>{totalCount - usedCount} remaining</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            <p>
              All used prompts are tracked on this device only.
              <br />Reset to start fresh and experience all prompts again.
            </p>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="destructive" 
            onClick={handleReset} 
            className="sm:mr-auto"
            disabled={isLoading}
          >
            Reset All Used Prompts
          </Button>
          <Button 
            onClick={refreshStats} 
            variant="outline" 
            disabled={isLoading}
          >
            Refresh Stats
          </Button>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}