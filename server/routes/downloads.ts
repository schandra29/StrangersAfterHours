import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

export const downloadRouter = Router();

// Add verbose logging for debugging
function logRequest(req: Request, message: string) {
  console.log(`[DOWNLOAD] ${message} - ${req.path}`);
}

// Custom handler for serving downloadable files with proper MIME types and headers
downloadRouter.get('/:platform/:filename', (req: Request, res: Response) => {
  const { platform, filename } = req.params;
  logRequest(req, `Attempting to download ${platform}/${filename}`);
  
  const filePath = path.join(process.cwd(), 'public', 'download', platform, filename);
  
  // Determine the content type based on file extension
  const ext = path.extname(filename).toLowerCase();
  let contentType = 'application/octet-stream'; // Default binary content type
  
  if (ext === '.apk') {
    contentType = 'application/vnd.android.package-archive';
  } else if (ext === '.dmg') {
    contentType = 'application/x-apple-diskimage';
  } else if (ext === '.exe') {
    contentType = 'application/x-msdownload';
  }
  
  // Check if file exists
  if (fs.existsSync(filePath)) {
    logRequest(req, `File found: ${filePath} - Serving with content-type: ${contentType}`);
    
    // Get file stats to set content length
    const stats = fs.statSync(filePath);
    
    // Set appropriate headers for binary download
    res.set({
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    // Stream the file directly to the response
    const fileStream = fs.createReadStream(filePath);
    fileStream.on('error', (error) => {
      logRequest(req, `Error streaming file: ${error.message}`);
      if (!res.headersSent) {
        res.status(500).send('Error streaming file');
      }
    });
    
    fileStream.pipe(res);
  } else {
    logRequest(req, `File not found: ${filePath}`);
    res.status(404).send('File not found');
  }
});

// Special route for invitation HTML page
downloadRouter.get('/strangers-beta-invitation.html', (req: Request, res: Response) => {
  logRequest(req, 'Accessing TestFlight invitation page');
  const filePath = path.join(process.cwd(), 'public', 'download', 'strangers-beta-invitation.html');
  
  if (fs.existsSync(filePath)) {
    logRequest(req, 'TestFlight invitation page found');
    res.set({
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache'
    });
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.on('error', (error) => {
      logRequest(req, `Error streaming HTML file: ${error.message}`);
      if (!res.headersSent) {
        res.status(500).send('Error displaying page');
      }
    });
    
    fileStream.pipe(res);
  } else {
    logRequest(req, `HTML file not found: ${filePath}`);
    res.status(404).send('Page not found');
  }
});