import { Button } from "@/components/ui/button";
import { DownloadCloud } from "lucide-react";
import { Link } from 'wouter';

interface InstallButtonProps {
  variant?: "default" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showText?: boolean;
  showIcon?: boolean;
  text?: string;
}

/**
 * A simple button that directs users to the app installation page
 * This has been simplified to remove all PWA-related functionality
 */
export default function InstallButton({
  variant = "default",
  size = "default",
  className = "",
  showText = true,
  showIcon = true,
  text = "Download App"
}: InstallButtonProps) {
  // Check for previously downloaded app
  const isAppDownloaded = localStorage.getItem('app-downloaded') === 'true';
  
  // If user has already downloaded the app, don't show the button
  if (isAppDownloaded) return null;

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      asChild
    >
      <Link href="/install">
        {showIcon && <DownloadCloud className={`h-4 w-4 ${showText ? 'mr-2' : ''}`} />}
        {showText && text}
      </Link>
    </Button>
  );
}