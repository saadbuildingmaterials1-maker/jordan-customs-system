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
import * as fs from 'fs';

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

// حفظ البيانات محلياً
ipcMain.handle('save-data', async (event, data) => {
  try {
    const dataPath = path.join(app.getPath('userData'), 'data.json');
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    return { success: true };
  } catch (error) {
    console.error('Error saving data:', error);
    return { success: false, error: (error as Error).message };
  }
});

// تحميل البيانات المحفوظة
ipcMain.handle('load-data', async (event) => {
  try {
    const dataPath = path.join(app.getPath('userData'), 'data.json');
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, 'utf-8');
      return { success: true, data: JSON.parse(data) };
    }
    return { success: true, data: null };
  } catch (error) {
    console.error('Error loading data:', error);
    return { success: false, error: (error as Error).message };
  }
});

// إنشاء نسخة احتياطية
ipcMain.handle('create-backup', async (event) => {
  try {
    const dataPath = path.join(app.getPath('userData'), 'data.json');
    const backupDir = path.join(app.getPath('userData'), 'backups');

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `backup-${timestamp}.json`);

    if (fs.existsSync(dataPath)) {
      fs.copyFileSync(dataPath, backupPath);
      return { success: true, backupPath };
    }

    return { success: false, error: 'No data to backup' };
  } catch (error) {
    console.error('Error creating backup:', error);
    return { success: false, error: (error as Error).message };
  }
});

// استعادة من نسخة احتياطية
ipcMain.handle('restore-backup', async (event, backupPath) => {
  try {
    const dataPath = path.join(app.getPath('userData'), 'data.json');
    fs.copyFileSync(backupPath, dataPath);
    return { success: true };
  } catch (error) {
    console.error('Error restoring backup:', error);
    return { success: false, error: (error as Error).message };
  }
});

// قائمة النسخ الاحتياطية
ipcMain.handle('list-backups', async (event) => {
  try {
    const backupDir = path.join(app.getPath('userData'), 'backups');

    if (!fs.existsSync(backupDir)) {
      return { success: true, backups: [] };
    }

    const files = fs.readdirSync(backupDir);
    const backups = files
      .filter((f) => f.startsWith('backup-') && f.endsWith('.json'))
      .map((f) => ({
        name: f,
        path: path.join(backupDir, f),
        date: fs.statSync(path.join(backupDir, f)).mtime,
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    return { success: true, backups };
  } catch (error) {
    console.error('Error listing backups:', error);
    return { success: false, error: (error as Error).message };
  }
});

// حذف نسخة احتياطية
ipcMain.handle('delete-backup', async (event, backupPath) => {
  try {
    fs.unlinkSync(backupPath);
    return { success: true };
  } catch (error) {
    console.error('Error deleting backup:', error);
    return { success: false, error: (error as Error).message };
  }
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
