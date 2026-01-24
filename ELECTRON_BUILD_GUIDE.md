# دليل Electron والبناء الشامل

## المقدمة

دليل شامل لبناء وتوزيع تطبيق Electron لنظام إدارة تكاليف الشحن والجمارك الأردنية على جميع الأنظمة الأساسية.

---

## 1. إعداد Electron

### التثبيت

```bash
# تثبيت Electron
npm install --save-dev electron

# تثبيت أدوات البناء
npm install --save-dev electron-builder
npm install --save-dev electron-packager
```

### هيكل المشروع

```
jordan-customs-system/
├── electron/
│   ├── main.ts              # نقطة الدخول الرئيسية
│   ├── preload.ts           # Preload script
│   ├── utils.ts             # دوال مساعدة
│   └── config.ts            # إعدادات Electron
├── dist-electron/           # ملفات مبنية
├── src/                     # كود React
├── package.json
└── electron-builder.json    # إعدادات البناء
```

---

## 2. ملف main.ts

### إنشاء النافذة الرئيسية

```typescript
import { app, BrowserWindow, Menu, ipcMain } from 'electron';
import path from 'path';
import isDev from 'electron-is-dev';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
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
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../dist/index.html')}`;

  mainWindow.loadURL(startUrl);

  // فتح أدوات المطور في وضع التطوير
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// إنشاء النافذة عند جاهزية التطبيق
app.on('ready', createWindow);

// إغلاق التطبيق عند إغلاق جميع النوافذ (ما عدا macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// إعادة إنشاء النافذة عند تنشيط التطبيق (macOS)
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
```

---

## 3. ملف preload.ts

### الجسر الآمن

```typescript
import { contextBridge, ipcRenderer } from 'electron';

// تعريض الدوال الآمنة للـ Renderer Process
contextBridge.exposeInMainWorld('electron', {
  // الملفات
  selectFile: () => ipcRenderer.invoke('select-file'),
  saveFile: (content: string, filename: string) =>
    ipcRenderer.invoke('save-file', { content, filename }),
  
  // النسخ الاحتياطية
  backupDatabase: () => ipcRenderer.invoke('backup-database'),
  restoreDatabase: (filePath: string) =>
    ipcRenderer.invoke('restore-database', { filePath }),
  
  // الطباعة
  printDocument: (html: string) =>
    ipcRenderer.invoke('print-document', { html }),
  
  // النظام
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
});

// تعريف الأنواع
declare global {
  interface Window {
    electron: {
      selectFile: () => Promise<string | null>;
      saveFile: (content: string, filename: string) => Promise<boolean>;
      backupDatabase: () => Promise<string>;
      restoreDatabase: (filePath: string) => Promise<boolean>;
      printDocument: (html: string) => Promise<void>;
      getSystemInfo: () => Promise<any>;
      getAppVersion: () => Promise<string>;
    };
  }
}
```

---

## 4. معالجات IPC

### معالجات الملفات

```typescript
import { ipcMain, dialog, app } from 'electron';
import fs from 'fs';
import path from 'path';

// اختيار ملف
ipcMain.handle('select-file', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'PDF Files', extensions: ['pdf'] },
      { name: 'Excel Files', extensions: ['xlsx', 'xls'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  });

  return result.filePaths[0] || null;
});

// حفظ ملف
ipcMain.handle('save-file', async (event, { content, filename }) => {
  try {
    const result = await dialog.showSaveDialog({
      defaultPath: filename,
      filters: [
        { name: 'PDF Files', extensions: ['pdf'] },
        { name: 'Excel Files', extensions: ['xlsx'] },
      ],
    });

    if (!result.canceled) {
      fs.writeFileSync(result.filePath, content);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error saving file:', error);
    return false;
  }
});
```

### معالجات النسخ الاحتياطية

```typescript
// النسخ الاحتياطية
ipcMain.handle('backup-database', async () => {
  try {
    const backupDir = path.join(app.getPath('userData'), 'backups');
    
    // إنشاء مجلد النسخ الاحتياطية إذا لم يكن موجوداً
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // إنشاء اسم ملف بناءً على التاريخ
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `backup-${timestamp}.db`);
    
    // نسخ قاعدة البيانات
    const dbPath = path.join(app.getPath('userData'), 'database.db');
    fs.copyFileSync(dbPath, backupPath);
    
    return backupPath;
  } catch (error) {
    console.error('Error backing up database:', error);
    throw error;
  }
});

// استعادة النسخة الاحتياطية
ipcMain.handle('restore-database', async (event, { filePath }) => {
  try {
    const dbPath = path.join(app.getPath('userData'), 'database.db');
    fs.copyFileSync(filePath, dbPath);
    return true;
  } catch (error) {
    console.error('Error restoring database:', error);
    return false;
  }
});
```

---

## 5. إعدادات البناء

### ملف electron-builder.json

```json
{
  "appId": "com.jordan-customs.app",
  "productName": "نظام إدارة تكاليف الشحن والجمارك الأردنية",
  "directories": {
    "buildResources": "assets",
    "output": "dist-electron"
  },
  "files": [
    "dist/**/*",
    "dist-electron/**/*",
    "node_modules/**/*",
    "package.json"
  ],
  "win": {
    "target": [
      {
        "target": "nsis",
        "arch": ["x64", "ia32"]
      },
      {
        "target": "portable",
        "arch": ["x64"]
      }
    ],
    "certificateFile": null,
    "certificatePassword": null
  },
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true,
    "createDesktopShortcut": true,
    "createStartMenuShortcut": true
  },
  "mac": {
    "target": [
      "dmg",
      "zip"
    ],
    "category": "public.app-category.business"
  },
  "linux": {
    "target": [
      "AppImage",
      "deb"
    ],
    "category": "Office"
  }
}
```

---

## 6. سكريبتات البناء

### package.json

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:web\" \"npm run dev:electron\"",
    "dev:web": "vite",
    "dev:electron": "wait-on http://localhost:3000 && electron .",
    "build": "npm run build:web && npm run build:electron",
    "build:web": "vite build",
    "build:electron": "tsc electron/main.ts --outDir dist-electron && electron-builder",
    "build:win": "npm run build:web && electron-builder --win",
    "build:mac": "npm run build:web && electron-builder --mac",
    "build:linux": "npm run build:web && electron-builder --linux",
    "build:all": "npm run build:web && electron-builder -mwl"
  }
}
```

---

## 7. واجهة React

### استخدام Electron في React

```typescript
import { useEffect, useState } from 'react';

export function BackupPage() {
  const [backupPath, setBackupPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleBackup = async () => {
    setLoading(true);
    try {
      const path = await window.electron.backupDatabase();
      setBackupPath(path);
      alert('تم النسخ الاحتياطي بنجاح: ' + path);
    } catch (error) {
      alert('فشل النسخ الاحتياطي: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    const filePath = await window.electron.selectFile();
    if (filePath) {
      setLoading(true);
      try {
        const success = await window.electron.restoreDatabase(filePath);
        if (success) {
          alert('تم استعادة النسخة الاحتياطية بنجاح');
        }
      } catch (error) {
        alert('فشل استعادة النسخة الاحتياطية: ' + error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="space-y-4">
      <h1>النسخ الاحتياطية والاستعادة</h1>
      
      <div className="space-y-2">
        <button
          onClick={handleBackup}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? 'جاري النسخ...' : 'عمل نسخة احتياطية'}
        </button>
        
        <button
          onClick={handleRestore}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          {loading ? 'جاري الاستعادة...' : 'استعادة نسخة احتياطية'}
        </button>
      </div>
      
      {backupPath && (
        <div className="bg-green-50 p-4 rounded">
          <p>آخر نسخة احتياطية: {backupPath}</p>
        </div>
      )}
    </div>
  );
}
```

---

## 8. الاختبار والتوزيع

### اختبار البناء المحلي

```bash
# بناء التطبيق
npm run build

# اختبار التطبيق المبني
npm run dev:electron

# بناء على Windows
npm run build:win

# بناء على macOS
npm run build:mac

# بناء على Linux
npm run build:linux

# بناء على جميع الأنظمة
npm run build:all
```

### التوزيع

```bash
# نشر على GitHub Releases
electron-builder --publish always

# نشر على S3
electron-builder --publish s3

# نشر محلي فقط
npm run build
```

---

## 9. الخلاصة

تم توثيق نظام Electron والبناء الشامل مع جميع المميزات والتكوينات المتقدمة.
