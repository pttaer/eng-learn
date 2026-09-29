const { app, BrowserWindow, shell, session } = require('electron');
const path = require('path');

let mainWindow = null;

function createWindow() {
  const iconPath = process.platform === 'win32'
    ? path.join(__dirname, '../public/icon.ico')
    : path.join(__dirname, '../public/icon-512.png');

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 1024,
    minHeight: 720,
    title: 'English Singularity // C2 Native Mastery',
    icon: iconPath,
    backgroundColor: '#fafaf9',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      devTools: !app.isPackaged
    }
  });

  // Handle audio and media permissions for speech recognition & recording
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    const allowed = ['media', 'microphone', 'audioCapture', 'speech'];
    callback(allowed.includes(permission));
  });

  // Open external links in OS default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  const distIndex = path.join(__dirname, '../dist/index.html');
  mainWindow.loadFile(distIndex);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Ensure single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(createWindow);

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}
