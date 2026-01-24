const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const Store = require('electron-store');

const store = new Store();
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
    icon: path.join(__dirname, 'assets/icon.png'),
  });

  const startUrl = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../build/index.html')}`;

  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC Handlers for data persistence
ipcMain.handle('store-get', (event, key) => {
  return store.get(key);
});

ipcMain.handle('store-set', (event, key, value) => {
  store.set(key, value);
});

ipcMain.handle('store-delete', (event, key) => {
  store.delete(key);
});

// Auto-update handler
ipcMain.handle('check-for-updates', async () => {
  // Implementation for auto-update
  return { updateAvailable: false };
});

// Backup handler
ipcMain.handle('create-backup', async (event, data) => {
  const backupPath = path.join(app.getPath('userData'), 'backups');
  // Implementation for creating backup
  return { success: true, path: backupPath };
});

// Restore handler
ipcMain.handle('restore-backup', async (event, backupPath) => {
  // Implementation for restoring backup
  return { success: true };
});

// Menu
const template = [
  {
    label: 'ملف',
    submenu: [
      { label: 'خروج', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() },
    ],
  },
  {
    label: 'تحرير',
    submenu: [
      { label: 'تراجع', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
      { label: 'إعادة', accelerator: 'CmdOrCtrl+Y', role: 'redo' },
      { type: 'separator' },
      { label: 'قص', accelerator: 'CmdOrCtrl+X', role: 'cut' },
      { label: 'نسخ', accelerator: 'CmdOrCtrl+C', role: 'copy' },
      { label: 'لصق', accelerator: 'CmdOrCtrl+V', role: 'paste' },
    ],
  },
  {
    label: 'عرض',
    submenu: [
      { label: 'تحديث', accelerator: 'CmdOrCtrl+R', role: 'reload' },
      { label: 'أدوات المطور', accelerator: 'CmdOrCtrl+Shift+I', role: 'toggleDevTools' },
    ],
  },
  {
    label: 'مساعدة',
    submenu: [
      { label: 'حول', click: () => { /* Show about dialog */ } },
      { label: 'دعم', click: () => { /* Open support */ } },
    ],
  },
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

module.exports = { store };
