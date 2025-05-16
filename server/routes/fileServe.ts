import { Router } from 'express';
import path from 'path';
import fs from 'fs';

export const fileServeRouter = Router();

// Direct binary file serving for platform-specific downloads
fileServeRouter.get('/android-app', (req, res) => {
  const filePath = path.join(process.cwd(), 'public', 'download', 'android', 'strangers-after-hours.apk');
  
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    
    res.set({
      'Content-Type': 'application/vnd.android.package-archive',
      'Content-Length': stats.size,
      'Content-Disposition': 'attachment; filename="strangers-after-hours.apk"'
    });
    
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.status(404).send('APK file not found');
  }
});

fileServeRouter.get('/macos-app', (req, res) => {
  const filePath = path.join(process.cwd(), 'public', 'download', 'desktop', 'strangers-after-hours.dmg');
  
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    
    res.set({
      'Content-Type': 'application/x-apple-diskimage',
      'Content-Length': stats.size,
      'Content-Disposition': 'attachment; filename="strangers-after-hours.dmg"'
    });
    
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.status(404).send('DMG file not found');
  }
});

fileServeRouter.get('/windows-app', (req, res) => {
  const filePath = path.join(process.cwd(), 'public', 'download', 'desktop', 'strangers-after-hours-setup.exe');
  
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    
    res.set({
      'Content-Type': 'application/x-msdownload',
      'Content-Length': stats.size,
      'Content-Disposition': 'attachment; filename="strangers-after-hours-setup.exe"'
    });
    
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.status(404).send('EXE file not found');
  }
});

fileServeRouter.get('/ios-invite', (req, res) => {
  const filePath = path.join(process.cwd(), 'public', 'download', 'strangers-beta-invitation.html');
  
  if (fs.existsSync(filePath)) {
    res.set('Content-Type', 'text/html');
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.status(404).send('Invitation page not found');
  }
});