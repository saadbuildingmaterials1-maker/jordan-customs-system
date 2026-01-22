import { app, BrowserWindow, Menu, ipcMain, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import * as path from 'path';
import * as isDev from 'electron-is-dev';

let mainWindow: BrowserWindow | null = null;

// إنشاء نافذة التطبيق
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.ts'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
    icon: path.join(__dirname, '../assets/icon.png'),
  });

  // تحميل التطبيق
  const startUrl = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../dist/index.html')}`;

  mainWindow.loadURL(startUrl);

  // فتح أدوات المطور في وضع التطوير
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // إنشاء القائمة
  createMenu();

  // التحقق من التحديثات
  checkForUpdates();
}

// إنشاء القائمة
function createMenu() {
  const template: any[] = [
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
        { label: 'إعادة', accelerator: 'CmdOrCtrl+Shift+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'قص', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'نسخ', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'لصق', accelerator: 'CmdOrCtrl+V', role: 'paste' },
      ],
    },
    {
      label: 'عرض',
      submenu: [
        {
          label: 'تكبير',
          accelerator: 'CmdOrCtrl+Plus',
          click: () => {
            if (mainWindow) {
              const zoomFactor = mainWindow.webContents.getZoomFactor();
              mainWindow.webContents.setZoomFactor(zoomFactor + 0.1);
            }
          },
        },
        {
          label: 'تصغير',
          accelerator: 'CmdOrCtrl+Minus',
          click: () => {
            if (mainWindow) {
              const zoomFactor = mainWindow.webContents.getZoomFactor();
              mainWindow.webContents.setZoomFactor(zoomFactor - 0.1);
            }
          },
        },
        {
          label: 'إعادة تعيين الحجم',
          accelerator: 'CmdOrCtrl+0',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.setZoomFactor(1);
            }
          },
        },
        { type: 'separator' },
        {
          label: 'ملء الشاشة',
          accelerator: 'F11',
          click: () => {
            if (mainWindow) {
              mainWindow.setFullScreen(!mainWindow.isFullScreen());
            }
          },
        },
      ],
    },
    {
      label: 'تحديث',
      submenu: [
        {
          label: 'التحقق من التحديثات',
          click: () => {
            checkForUpdates();
          },
        },
      ],
    },
    {
      label: 'مساعدة',
      submenu: [
        {
          label: 'حول التطبيق',
          click: () => {
            dialog.showMessageBox(mainWindow!, {
              type: 'info',
              title: 'حول نظام إدارة تكاليف الشحن والجمارك',
              message: 'نظام إدارة تكاليف الشحن والجمارك الأردنية',
              detail: 'الإصدار: 1.0.0\nصانع التطبيق: Manus Development Team\nالبريد: support@manus.im',
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// التحقق من التحديثات
function checkForUpdates() {
  if (isDev) return;

  autoUpdater.checkForUpdatesAndNotify().catch((err) => {
    console.error('خطأ في التحقق من التحديثات:', err);
  });
}

// معالجات IPC
ipcMain.on('app-version', (event) => {
  event.reply('app-version', {
    app: app.getVersion(),
    electron: process.versions.electron,
    node: process.versions.node,
  });
});

ipcMain.on('check-for-updates', () => {
  checkForUpdates();
});

// أحداث التطبيق
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

// معالجات التحديثات
autoUpdater.on('update-available', () => {
  dialog.showMessageBox(mainWindow!, {
    type: 'info',
    title: 'تحديث متاح',
    message: 'يوجد تحديث جديد للتطبيق',
    detail: 'سيتم تنزيل التحديث وتثبيته تلقائياً',
  });
});

autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox(mainWindow!, {
    type: 'info',
    title: 'تحديث جاهز',
    message: 'تم تنزيل التحديث بنجاح',
    detail: 'سيتم إعادة تشغيل التطبيق الآن',
    buttons: ['إعادة التشغيل', 'لاحقاً'],
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});

autoUpdater.on('error', (err) => {
  dialog.showErrorBox('خطأ في التحديث', 'حدث خطأ أثناء التحقق من التحديثات');
  console.error('خطأ في التحديث:', err);
});
