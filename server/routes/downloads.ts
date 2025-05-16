import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

export const downloadRouter = Router();

// Custom handler for serving downloadable files with proper MIME types and headers
downloadRouter.get('/:platform/:filename', (req: Request, res: Response) => {
  const { platform, filename } = req.params;
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
  
  // Set response headers for download
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  
  // Check if file exists
  if (fs.existsSync(filePath)) {
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } else {
    console.error(`Download file not found: ${filePath}`);
    res.status(404).send('File not found');
  }
});

// Special route for invitation HTML page
downloadRouter.get('/strangers-beta-invitation.html', (req: Request, res: Response) => {
  const filePath = path.join(process.cwd(), 'public', 'download', 'strangers-beta-invitation.html');
  
  res.setHeader('Content-Type', 'text/html');
  
  if (fs.existsSync(filePath)) {
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } else {
    console.error(`HTML file not found: ${filePath}`);
    res.status(404).send('File not found');
  }
});