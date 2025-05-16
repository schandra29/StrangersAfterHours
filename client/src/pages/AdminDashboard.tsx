import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Loader2, BarChart, Users, Clock } from "lucide-react";

// Types for our statistics
interface SessionStats {
  totalSessions: number;
  totalTimeSpent: number;
  avgSessionLength: number;
  totalPromptsAnswered: number;
  avgPromptsPerSession: number;
  totalFullHouseMoments: number;
}

interface RecentSession {
  id: number;
  createdAt: string;
  level: number;
  intensity: number;
  timeSpent: number;
  promptsAnswered: number;
}

interface AccessCodeStats {
  code: string;
  description: string | null;
  isActive: boolean;
  usageCount: number;
  maxUsages: number | null;
  createdAt: string;
  sessions: RecentSession[];
  stats: SessionStats;
}

// Format time in seconds to readable format
function formatTime(seconds: number): string {
  if (!seconds) return '0m 0s';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes < 60) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
  }
}

export default function AdminDashboard() {
  const [adminKey, setAdminKey] = useState<string>('');
  const [verifiedKey, setVerifiedKey] = useState<string | null>(null);
  const { toast } = useToast();

  // Load saved admin key from localStorage when component mounts
  useEffect(() => {
    const savedKey = localStorage.getItem('strangers_admin_key');
    if (savedKey) {
      setAdminKey(savedKey);
      setVerifiedKey(savedKey);
    }
  }, []);

  // Query for fetching access code statistics
  const { data: accessCodes, isLoading, isError, refetch } = useQuery<AccessCodeStats[]>({
    queryKey: ['/api/admin/access-codes/stats'],
    enabled: !!verifiedKey,
    queryFn: async () => {
      if (!verifiedKey) return [];
      
      try {
        const response = await fetch('/api/admin/access-codes/stats', {
          headers: {
            'X-Admin-Key': verifiedKey
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch access code statistics');
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
      description: "You can now view access code statistics"
    });
    
    // Refetch data with the new key
    refetch();
  };

  if (!verifiedKey) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Admin Dashboard</CardTitle>
            <CardDescription>
              Enter your admin key to view access code statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <Label htmlFor="admin-key">Admin Key</Label>
              <Input 
                id="admin-key" 
                type="password" 
                placeholder="Enter admin key" 
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleVerifyKey}>Verify Admin Key</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <Card className="bg-destructive/10 border-destructive">
          <CardHeader>
            <CardTitle>Error Loading Data</CardTitle>
            <CardDescription>
              There was an error loading the admin dashboard. Your admin key may be invalid.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="destructive" onClick={() => setVerifiedKey(null)}>
              Try Different Key
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Strangers: After Hours - Admin Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Active Access Codes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-6 w-6 text-blue-500 mr-2" />
              <span className="text-3xl font-bold">{accessCodes?.filter(code => code.isActive).length || 0}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BarChart className="h-6 w-6 text-green-500 mr-2" />
              <span className="text-3xl font-bold">
                {accessCodes?.reduce((sum, code) => sum + code.stats.totalSessions, 0) || 0}
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
                {formatTime(accessCodes?.reduce((sum, code) => sum + code.stats.totalTimeSpent, 0) || 0)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <h2 className="text-2xl font-bold mb-4">Access Code Statistics</h2>
      
      {accessCodes?.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">No access codes found in the database</p>
          </CardContent>
        </Card>
      ) : (
        accessCodes?.map((code) => (
          <Card key={code.code} className="mb-8">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{code.code}</CardTitle>
                  <CardDescription>{code.description || 'No description'}</CardDescription>
                </div>
                <div className="flex items-center">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${code.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {code.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Usage Information</h3>
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                    <div className="bg-secondary/10 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Usage Count</p>
                      <p className="text-2xl font-bold">
                        {code.usageCount} / {code.maxUsages === null ? '∞' : code.maxUsages}
                      </p>
                    </div>
                    
                    <div className="bg-secondary/10 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Created On</p>
                      <p className="text-lg font-medium">
                        {new Date(code.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="bg-secondary/10 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Total Sessions</p>
                      <p className="text-2xl font-bold">{code.stats.totalSessions}</p>
                    </div>
                  </div>
                </div>
                
                {code.stats.totalSessions > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-3">Session Statistics</h3>
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                      <div className="bg-primary/10 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground">Total Time Spent</p>
                        <p className="text-xl font-medium">{formatTime(code.stats.totalTimeSpent)}</p>
                      </div>
                      
                      <div className="bg-primary/10 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground">Avg. Session Length</p>
                        <p className="text-xl font-medium">{formatTime(code.stats.avgSessionLength)}</p>
                      </div>
                      
                      <div className="bg-primary/10 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground">Total Prompts Answered</p>
                        <p className="text-xl font-medium">{code.stats.totalPromptsAnswered}</p>
                      </div>
                      
                      <div className="bg-primary/10 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground">Avg. Prompts Per Session</p>
                        <p className="text-xl font-medium">{code.stats.avgPromptsPerSession.toFixed(1)}</p>
                      </div>
                      
                      <div className="bg-primary/10 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground">Full House Moments</p>
                        <p className="text-xl font-medium">{code.stats.totalFullHouseMoments}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {code.sessions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-3">Recent Sessions</h3>
                    <Table>
                      <TableCaption>Recent game sessions using this access code</TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Level</TableHead>
                          <TableHead>Intensity</TableHead>
                          <TableHead>Time Spent</TableHead>
                          <TableHead>Prompts</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {code.sessions.map((session) => (
                          <TableRow key={session.id}>
                            <TableCell>{new Date(session.createdAt).toLocaleString()}</TableCell>
                            <TableCell>{session.level}</TableCell>
                            <TableCell>{session.intensity}</TableCell>
                            <TableCell>{formatTime(session.timeSpent)}</TableCell>
                            <TableCell>{session.promptsAnswered}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
      
      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={() => setVerifiedKey(null)}>
          Change Admin Key
        </Button>
        <Button onClick={() => refetch()}>
          Refresh Data
        </Button>
      </div>
    </div>
  );
}