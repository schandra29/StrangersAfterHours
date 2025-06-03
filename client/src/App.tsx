import React, { useEffect } from "react";
import { Switch, Route, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query"; // This import might become unused, but let's keep for now if other parts of App.tsx use it directly, though unlikely.
// Import components with relative paths instead of aliases
import TestConnection from "./pages/test-connection";

// Placeholder components until we implement the real ones
const Toaster = () => <div>Toaster Component</div>;
const TooltipProvider = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
const Home = () => <div>Home Page</div>;
const NotFound = () => <div>404 Not Found</div>;

const AdminDashboard = () => <div>Admin Dashboard</div>;

// Mock auth context until we implement the real one
const AuthContext = React.createContext<{
  isAuthenticated: boolean;
  isLoading: boolean;
}>({ isAuthenticated: false, isLoading: false });

const useAuth = () => React.useContext(AuthContext);
const AuthProvider = ({ children }: { children: React.ReactNode }) => (
  <AuthContext.Provider value={{ isAuthenticated: true, isLoading: false }}>
    {children}
  </AuthContext.Provider>
);

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
          return <Home />; // or your main entry component
        }}
      </Route>
      <Route path="/admin">
        <AdminDashboard />
      </Route>
      <Route path="/">
        {(params) => <ProtectedRoute component={Home} params={params} />}
      </Route>
      <Route path="/test-connection">
        <TestConnection />
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
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Router />
      </AuthProvider>
    </TooltipProvider>
  );
}

export default App;
