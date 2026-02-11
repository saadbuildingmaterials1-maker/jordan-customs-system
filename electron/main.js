const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { autoUpdater } = require('electron-updater');

let mainWindow;

// إنشاء النافذة الرئيسية
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
    icon: path.join(__dirname, '../assets/icon.png'),
  });

  // تحميل التطبيق
  const startUrl = isDev
    ? 'http://localhost:5173' // Vite dev server
    : `file://${path.join(__dirname, '../dist/index.html')}`; // Production build

  mainWindow.loadURL(startUrl);

  // فتح DevTools في وضع التطوير
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// إنشاء القائمة
function createMenu() {
  const template = [
    {
      label: 'ملف',
      submenu: [
        {
          label: 'خروج',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          },
        },
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
        { label: 'تكبير', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
        { label: 'تصغير', accelerator: 'CmdOrCtrl+Minus', role: 'zoomOut' },
        { label: 'إعادة تعيين', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
        { type: 'separator' },
        { label: 'ملء الشاشة', accelerator: 'F11', role: 'togglefullscreen' },
      ],
    },
    {
      label: 'مساعدة',
      submenu: [
        {
          label: 'حول التطبيق',
          click: () => {
            // يمكن إضافة نافذة معلومات هنا
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// عند بدء التطبيق
app.on('ready', () => {
  createWindow();
  createMenu();

  // التحقق من التحديثات
  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify();
  }
});

// عند إغلاق جميع النوافذ
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// عند تفعيل التطبيق (macOS)
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// معالجة الأخطاء
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// IPC Handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-app-name', () => {
  return 'نظام إدارة تكاليف الشحن والجمارك الأردنية';
});
