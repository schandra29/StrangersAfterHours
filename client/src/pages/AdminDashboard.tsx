import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Users, BarChart, Clock } from "lucide-react";

interface SessionStats {
  stats: {
    totalSessions: number;
    totalTimeSpent: number;
    avgSessionLength: number;
    totalPromptsAnswered: number;
    avgPromptsPerSession: number;
    totalFullHouseMoments: number;
  };
  sessions: Array<{
    id: number;
    createdAt: string;
    level: number;
    intensity: number;
    timeSpent: number;
    promptsAnswered: number;
  }>;
}

export default function AdminDashboard() {
  const [adminKey, setAdminKey] = useState<string>(() => {
    return localStorage.getItem('strangers_admin_key') || '';
  });
  const [verifiedKey, setVerifiedKey] = useState<string>(() => {
    return localStorage.getItem('strangers_admin_key') || '';
  });
  const { toast } = useToast();

  // Query for fetching session statistics
  const { data: sessionData, isLoading, isError, refetch } = useQuery<SessionStats>({
    queryKey: ['/api/admin/sessions/stats'],
    enabled: !!verifiedKey,
    queryFn: async () => {
      if (!verifiedKey) return { stats: {}, sessions: [] } as SessionStats;

      try {
        const response = await fetch('/api/admin/sessions/stats', {
          headers: {
            'X-Admin-Key': verifiedKey
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch session statistics');
        }

        return response.json();
      } catch (error) {
        console.error('Error fetching stats:', error);
        throw error;
      }
    }
  });

  // Handle admin key verification
  const handleVerifyKey = () => {
    if (!adminKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter an admin key",
        variant: "destructive"
      });
      return;
    }

    // Save admin key to localStorage for future use
    localStorage.setItem('strangers_admin_key', adminKey);
    setVerifiedKey(adminKey);

    toast({
      title: "Admin key set",
      description: "You can now view game statistics"
    });

    // Refetch data with the new key
    refetch();
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (!verifiedKey) {
    return (
      <div className="container max-w-md mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Admin Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Enter admin key"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVerifyKey()}
            />
            <Button onClick={handleVerifyKey} className="w-full">
              Access Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto py-8">
        <div className="text-center">Loading dashboard...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container max-w-6xl mx-auto py-8">
        <div className="text-center text-red-500">
          Error loading dashboard. Please check your admin key.
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Strangers: After Hours - Admin Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BarChart className="h-6 w-6 text-green-500 mr-2" />
              <span className="text-3xl font-bold">
                {sessionData?.stats.totalSessions || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total Game Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="h-6 w-6 text-purple-500 mr-2" />
              <span className="text-3xl font-bold">
                {formatTime(sessionData?.stats.totalTimeSpent || 0)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Prompts Answered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-6 w-6 text-blue-500 mr-2" />
              <span className="text-3xl font-bold">
                {sessionData?.stats.totalPromptsAnswered || 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Game Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {sessionData?.sessions.length === 0 ? (
            <p className="text-muted-foreground">No sessions found</p>
          ) : (
            <div className="space-y-2">
              {sessionData?.sessions.map((session) => (
                <div key={session.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium">Session #{session.id}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(session.createdAt).toLocaleDateString()} - 
                      Level {session.level}, Intensity {session.intensity}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatTime(session.timeSpent)}</div>
                    <div className="text-sm text-muted-foreground">
                      {session.promptsAnswered} prompts
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}