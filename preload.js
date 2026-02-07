/**
 * Preload Script
 * جسر آمن للتواصل بين Electron Main و Renderer Process
 */

const { contextBridge, ipcRenderer } = require('electron');

// تعريض واجهة آمنة للـ Renderer Process
contextBridge.exposeInMainWorld('electronAPI', {
  // معالجات البيانات المستمرة
  storeGet: (key) => ipcRenderer.invoke('store-get', key),
  storeSet: (key, value) => ipcRenderer.invoke('store-set', key, value),
  storeDelete: (key) => ipcRenderer.invoke('store-delete', key),

  // معالجات المسارات
  selectInstallationPath: () => ipcRenderer.invoke('select-installation-path'),
  openFolder: (folderPath) => ipcRenderer.invoke('open-folder', folderPath),
  deleteFile: (filePath) => ipcRenderer.invoke('delete-file', filePath),

  // معالجات الضغط والاستخراج
  compressData: (sourcePath, outputPath) =>
    ipcRenderer.invoke('compress-data', { sourcePath, outputPath }),
  extractData: (sourcePath, outputPath) =>
    ipcRenderer.invoke('extract-data', { sourcePath, outputPath }),

  // معالجات النسخ الاحتياطية
  createBackup: (dataPath, backupName) =>
    ipcRenderer.invoke('create-backup', { dataPath, backupName }),
  restoreBackup: (backupPath, restorePath) =>
    ipcRenderer.invoke('restore-backup', { backupPath, restorePath }),

  // معالجات التحديثات
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),

  // معالجات معلومات النظام
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),

  // معالجات الأحداث
  onInstallationPathChanged: (callback) => {
    ipcRenderer.on('installation-path-changed', (event, path) => callback(path));
  },
  onBackupCreated: (callback) => {
    ipcRenderer.on('backup-created', (event, data) => callback(data));
  },
  onUpdateAvailable: (callback) => {
    ipcRenderer.on('update-available', (event, data) => callback(data));
  },
});

console.log('✅ Preload script loaded successfully');
