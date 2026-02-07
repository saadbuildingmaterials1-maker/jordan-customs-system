/**
 * Electron Main Process
 * تطبيق Windows مستقل مع نظام التثبيت والضغط الحقيقي
 */

const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execSync } = require('child_process');
const zlib = require('zlib');
const tar = require('tar');

// متغيرات عامة
const isDev = process.env.NODE_ENV === 'development';
const Store = require('electron-store');
const store = new Store();

let mainWindow;
let installationPath = store.get('installationPath') || path.join(os.homedir(), 'AppData', 'Local', 'JordanCustoms');

/**
 * إنشاء نافذة التطبيق الرئيسية
 */
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
      sandbox: true,
    },
    icon: path.join(__dirname, 'assets/icon.png'),
    show: false, // لا تظهر حتى يتم التحميل
  });

  // تحميل URL
  const startUrl = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../dist/public/index.html')}`;

  mainWindow.loadURL(startUrl);

  // عرض النافذة بعد التحميل
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // فتح DevTools في وضع التطوير
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // معالجة إغلاق النافذة
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // معالجة الأخطاء
  mainWindow.webContents.on('crashed', () => {
    dialog.showErrorBox('خطأ', 'حدث خطأ في التطبيق. يرجى إعادة التشغيل.');
    app.quit();
  });
}

/**
 * التحقق من التثبيت الأول وتشغيل الإعداد التلقائي
 */
async function checkFirstRun() {
  const hasRun = store.get('hasRun');
  
  if (!hasRun) {
    // إنشاء مجلد التثبيت
    if (!fs.existsSync(installationPath)) {
      fs.mkdirSync(installationPath, { recursive: true });
    }

    // إنشاء ملفات الإعدادات الأساسية
    const configPath = path.join(installationPath, 'config.json');
    if (!fs.existsSync(configPath)) {
      const defaultConfig = {
        version: '1.0.1',
        installDate: new Date().toISOString(),
        language: 'ar',
        theme: 'dark',
        autoUpdate: true,
        backupPath: path.join(installationPath, 'backups'),
      };
      fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
    }

    // إنشاء مجلد النسخ الاحتياطية
    const backupPath = path.join(installationPath, 'backups');
    if (!fs.existsSync(backupPath)) {
      fs.mkdirSync(backupPath, { recursive: true });
    }

    // إنشاء مجلد البيانات
    const dataPath = path.join(installationPath, 'data');
    if (!fs.existsSync(dataPath)) {
      fs.mkdirSync(dataPath, { recursive: true });
    }

    // تحديد أن التطبيق قد تم تشغيله
    store.set('hasRun', true);
    store.set('installationPath', installationPath);

    console.log('✅ تم إعداد التطبيق للمرة الأولى');
  }
}

/**
 * معالج حدث app ready
 */
app.on('ready', async () => {
  await checkFirstRun();
  createWindow();
});

/**
 * معالج إغلاق جميع النوافذ
 */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * معالج تفعيل التطبيق
 */
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

/**
 * معالجات IPC للبيانات المستمرة
 */
ipcMain.handle('store-get', (event, key) => {
  return store.get(key);
});

ipcMain.handle('store-set', (event, key, value) => {
  store.set(key, value);
  return true;
});

ipcMain.handle('store-delete', (event, key) => {
  store.delete(key);
  return true;
});

/**
 * معالج اختيار مسار التثبيت
 */
ipcMain.handle('select-installation-path', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'اختر مسار التثبيت',
    defaultPath: installationPath,
    properties: ['openDirectory', 'createDirectory'],
  });

  if (!result.canceled) {
    installationPath = result.filePaths[0];
    store.set('installationPath', installationPath);
    
    // إنشاء المجلدات الأساسية
    if (!fs.existsSync(installationPath)) {
      fs.mkdirSync(installationPath, { recursive: true });
    }
    
    return { success: true, path: installationPath };
  }

  return { success: false, path: null };
});

/**
 * معالج الضغط والاستخراج
 */
ipcMain.handle('compress-data', async (event, { sourcePath, outputPath }) => {
  try {
    return new Promise((resolve, reject) => {
      const gzip = zlib.createGzip();
      const source = fs.createReadStream(sourcePath);
      const destination = fs.createWriteStream(outputPath);

      source
        .pipe(gzip)
        .pipe(destination)
        .on('finish', () => {
          const stats = fs.statSync(outputPath);
          resolve({
            success: true,
            size: stats.size,
            path: outputPath,
          });
        })
        .on('error', reject);
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('extract-data', async (event, { sourcePath, outputPath }) => {
  try {
    return new Promise((resolve, reject) => {
      const gunzip = zlib.createGunzip();
      const source = fs.createReadStream(sourcePath);
      const destination = fs.createWriteStream(outputPath);

      source
        .pipe(gunzip)
        .pipe(destination)
        .on('finish', () => {
          resolve({
            success: true,
            path: outputPath,
          });
        })
        .on('error', reject);
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
});

/**
 * معالج النسخ الاحتياطية
 */
ipcMain.handle('create-backup', async (event, { dataPath, backupName }) => {
  try {
    const backupDir = path.join(installationPath, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const backupPath = path.join(backupDir, `${backupName}-${Date.now()}.tar.gz`);
    
    return new Promise((resolve, reject) => {
      tar
        .create(
          {
            gzip: true,
            file: backupPath,
            cwd: path.dirname(dataPath),
          },
          [path.basename(dataPath)]
        )
        .then(() => {
          const stats = fs.statSync(backupPath);
          resolve({
            success: true,
            path: backupPath,
            size: stats.size,
            date: new Date().toISOString(),
          });
        })
        .catch(reject);
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('restore-backup', async (event, { backupPath, restorePath }) => {
  try {
    // إنشاء المجلد المستهدف إذا لم يكن موجوداً
    if (!fs.existsSync(restorePath)) {
      fs.mkdirSync(restorePath, { recursive: true });
    }

    return new Promise((resolve, reject) => {
      tar
        .extract({
          file: backupPath,
          cwd: restorePath,
        })
        .then(() => {
          resolve({
            success: true,
            path: restorePath,
          });
        })
        .catch(reject);
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
});

/**
 * معالج التحديثات التلقائية
 */
ipcMain.handle('check-for-updates', async () => {
  try {
    // يمكن إضافة منطق التحديث الفعلي هنا
    return {
      updateAvailable: false,
      currentVersion: '1.0.1',
      latestVersion: '1.0.1',
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

/**
 * معالج الحصول على معلومات النظام
 */
ipcMain.handle('get-system-info', async () => {
  return {
    platform: process.platform,
    arch: process.arch,
    version: app.getVersion(),
    installationPath,
    appPath: app.getAppPath(),
    userData: app.getPath('userData'),
    documents: app.getPath('documents'),
    downloads: app.getPath('downloads'),
  };
});

/**
 * معالج فتح المجلدات
 */
ipcMain.handle('open-folder', async (event, folderPath) => {
  try {
    const { shell } = require('electron');
    shell.openPath(folderPath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

/**
 * معالج حذف الملفات
 */
ipcMain.handle('delete-file', async (event, filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return { success: true };
    }
    return { success: false, error: 'الملف غير موجود' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

/**
 * إنشاء القائمة
 */
const template = [
  {
    label: 'ملف',
    submenu: [
      {
        label: 'اختر مسار التثبيت',
        accelerator: 'CmdOrCtrl+I',
        click: async () => {
          const result = await ipcMain.invoke('select-installation-path');
          if (result.success) {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'نجح',
              message: `تم تعيين مسار التثبيت: ${result.path}`,
            });
          }
        },
      },
      { type: 'separator' },
      {
        label: 'خروج',
        accelerator: 'CmdOrCtrl+Q',
        click: () => app.quit(),
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
      { label: 'تحديث', accelerator: 'CmdOrCtrl+R', role: 'reload' },
      { label: 'تحديث كامل', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
      { label: 'أدوات المطور', accelerator: 'CmdOrCtrl+Shift+I', role: 'toggleDevTools' },
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
          dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'حول نظام إدارة تكاليف الشحن والجمارك الأردنية',
            message: 'نظام إدارة تكاليف الشحن والجمارك الأردنية',
            detail: `الإصدار: 1.0.1\nمسار التثبيت: ${installationPath}`,
          });
        },
      },
      {
        label: 'دعم',
        click: () => {
          const { shell } = require('electron');
          shell.openExternal('https://help.manus.im');
        },
      },
    ],
  },
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

module.exports = { store, installationPath };
