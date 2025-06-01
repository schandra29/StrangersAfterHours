import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function AccessCodeScreen() {
  const [accessCode, setAccessCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessCode.trim()) {
      toast({
        title: "Missing Access Code",
        description: "Please enter an access code to continue.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await login(accessCode);
      
      if (result.success) {
        toast({
          title: "Access Granted",
          description: "Welcome to Strangers: After Hours!",
        });
        
        // Wait for toast to be visible, then redirect using React router
        setTimeout(() => {
          setLocation("/");
        }, 500);
      } else {
        toast({
          title: "Access Denied",
          description: result.message || "Invalid access code. Please try again.",
          variant: "destructive",
        });
        setIsSubmitting(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Strangers: After Hours</CardTitle>
          <CardDescription className="text-center">
            Enter your access code to continue
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                id="accessCode"
                placeholder="Enter access code"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="text-center uppercase tracking-widest"
                autoComplete="off"
                autoCapitalize="characters"
                autoFocus
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2"></span>
                  Verifying...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
      <div className="mt-6 flex flex-col gap-3">
        {/* App download prompt removed per client request */}
        <p className="mt-2 text-sm text-muted-foreground text-center">
          This is a private beta. Contact the team if you need an access code.
        </p>
      </div>
    </div>
  );
}