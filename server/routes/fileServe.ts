import { Router } from 'express';
import path from 'path';
import fs from 'fs';

export const fileServeRouter = Router();

// Generic file serving endpoint for static assets that require special headers
fileServeRouter.get('/assets/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(process.cwd(), 'public', 'assets', filename);
  
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    const ext = path.extname(filename).toLowerCase();
    
    let contentType = 'application/octet-stream';
    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    if (ext === '.png') contentType = 'image/png';
    if (ext === '.svg') contentType = 'image/svg+xml';
    if (ext === '.pdf') contentType = 'application/pdf';
    
    res.set({
      'Content-Type': contentType,
      'Content-Length': stats.size
    });
    
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.status(404).send('File not found');
  }
});