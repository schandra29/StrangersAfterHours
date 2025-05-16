import { useEffect } from "react";
import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import AccessCodeScreen from "@/components/AccessCodeScreen";
import AdminDashboard from "@/pages/AdminDashboard";

function ProtectedRoute({ component: Component, ...rest }: any) {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading screen while checking auth status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to access code screen if not authenticated
  if (!isAuthenticated) {
    // Use more forceful redirect to ensure it happens
    window.location.href = "/access";
    return null;
  }

  return <Component {...rest} />;
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  
  return (
    <Switch>
      <Route path="/access">
        {() => {
          // If loading, show loading screen
          if (isLoading) {
            return (
              <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
              </div>
            );
          }
          
          // If authenticated, redirect to home page
          if (isAuthenticated) {
            return <Redirect to="/" />;
          }
          
          // If not authenticated, show access code screen
          return <AccessCodeScreen />;
        }}
      </Route>
      <Route path="/admin">
        <AdminDashboard />
      </Route>
      <Route path="/">
        {(params) => <ProtectedRoute component={Home} params={params} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Update social media sharing meta tags when the app loads
  useEffect(() => {
    // Get the base URL (protocol + hostname)
    const baseUrl = window.location.origin;
    
    // Set the og:url to the current page URL
    const ogUrlTag = document.querySelector('meta[property="og:url"]');
    if (ogUrlTag) {
      ogUrlTag.setAttribute('content', window.location.href);
    }
    
    // Update image URLs to absolute URLs
    const ogImageTag = document.querySelector('meta[property="og:image"]');
    if (ogImageTag) {
      const imageUrl = ogImageTag.getAttribute('content');
      if (imageUrl && imageUrl.startsWith('/')) {
        const absoluteImageUrl = `${baseUrl}${imageUrl}`;
        ogImageTag.setAttribute('content', absoluteImageUrl);
      }
    }
    
    // Update secure image URL
    const ogSecureImageTag = document.querySelector('meta[property="og:image:secure_url"]');
    if (ogSecureImageTag) {
      const imageUrl = document.querySelector('meta[property="og:image"]')?.getAttribute('content');
      if (imageUrl) {
        ogSecureImageTag.setAttribute('content', imageUrl);
      }
    }
    
    // Update Twitter image
    const twitterImageTag = document.querySelector('meta[name="twitter:image"]');
    if (twitterImageTag) {
      const imageUrl = document.querySelector('meta[property="og:image"]')?.getAttribute('content');
      if (imageUrl) {
        twitterImageTag.setAttribute('content', imageUrl);
      }
    }
  }, []);

  // Handle dynamic updating of Open Graph meta tags for social sharing
  useEffect(() => {
    // Get the base URL (protocol + hostname)
    const baseUrl = window.location.origin;
    
    // Update image URLs to absolute URLs for social media sharing
    const ogImageTag = document.querySelector('meta[property="og:image"]');
    if (ogImageTag) {
      const imageUrl = ogImageTag.getAttribute('content');
      if (imageUrl && imageUrl.startsWith('/')) {
        ogImageTag.setAttribute('content', `${baseUrl}${imageUrl}`);
      }
    }
    
    // Set the og:url to the current page URL
    const ogUrlTag = document.querySelector('meta[property="og:url"]');
    if (ogUrlTag) {
      ogUrlTag.setAttribute('content', window.location.href);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
