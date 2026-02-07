/**
 * preload
 * 
 * @module ./electron/preload
 */
import { contextBridge, ipcRenderer } from 'electron';

// تعريض واجهات آمنة للتطبيق
contextBridge.exposeInMainWorld('electron', {
  // معلومات التطبيق
  getAppVersion: () => ipcRenderer.invoke('app-version'),
  
  // التحديثات
  checkForUpdates: () => ipcRenderer.send('check-for-updates'),
  onUpdateAvailable: (callback: () => void) => {
    ipcRenderer.on('update-available', callback);
  },
  onUpdateDownloaded: (callback: () => void) => {
    ipcRenderer.on('update-downloaded', callback);
  },
  
  // النسخ الاحتياطية
  openBackupDialog: () => ipcRenderer.invoke('open-backup-dialog'),
  restoreBackup: (filePath: string) => ipcRenderer.invoke('restore-backup', filePath),
  
  // الملفات
  openFile: () => ipcRenderer.invoke('open-file'),
  saveFile: (content: string, defaultPath: string) => 
    ipcRenderer.invoke('save-file', content, defaultPath),
  
  // الطباعة
  print: () => ipcRenderer.invoke('print'),
  
  // إزالة المستمعين
  removeAllListeners: () => {
    ipcRenderer.removeAllListeners('update-available');
    ipcRenderer.removeAllListeners('update-downloaded');
  },
});

// تعريف الأنواع
declare global {
  interface Window {
    electron: {
      getAppVersion: () => Promise<any>;
      checkForUpdates: () => void;
      onUpdateAvailable: (callback: () => void) => void;
      onUpdateDownloaded: (callback: () => void) => void;
      openBackupDialog: () => Promise<string>;
      restoreBackup: (filePath: string) => Promise<void>;
      openFile: () => Promise<string>;
      saveFile: (content: string, defaultPath: string) => Promise<string>;
      print: () => Promise<void>;
      removeAllListeners: () => void;
    };
  }
}
