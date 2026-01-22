import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface ElectronContextType {
  isElectron: boolean;
  appVersion: string | null;
  checkForUpdates: () => void;
  openBackupDialog: () => Promise<string | null>;
  restoreBackup: (filePath: string) => Promise<void>;
  openFile: () => Promise<string | null>;
  saveFile: (content: string, defaultPath: string) => Promise<string | null>;
  print: () => Promise<void>;
}

const ElectronContext = createContext<ElectronContextType | undefined>(undefined);

export function ElectronProvider({ children }: { children: React.ReactNode }) {
  const [isElectron, setIsElectron] = useState(false);
  const [appVersion, setAppVersion] = useState<string | null>(null);

  useEffect(() => {
    // التحقق من وجود Electron
    if (typeof window !== 'undefined' && (window as any).electron) {
      setIsElectron(true);

      // الحصول على معلومات التطبيق
      (window as any).electron.getAppVersion().then((version: any) => {
        setAppVersion(version.app);
      });

      // الاستماع لتنبيهات التحديثات
      (window as any).electron.onUpdateAvailable(() => {
        toast.info('تحديث متاح', {
          description: 'يوجد تحديث جديد للتطبيق. سيتم التنزيل تلقائياً.',
        });
      });

      (window as any).electron.onUpdateDownloaded(() => {
        toast.success('تحديث جاهز', {
          description: 'تم تنزيل التحديث. سيتم إعادة التشغيل الآن.',
        });
      });

      return () => {
        (window as any).electron.removeAllListeners();
      };
    }
  }, []);

  const checkForUpdates = () => {
    if (isElectron && (window as any).electron) {
      (window as any).electron.checkForUpdates();
      toast.loading('جاري البحث عن التحديثات...');
    }
  };

  const openBackupDialog = async () => {
    if (isElectron && (window as any).electron) {
      try {
        return await (window as any).electron.openBackupDialog();
      } catch (error) {
        toast.error('خطأ', { description: 'فشل فتح نافذة النسخ الاحتياطي' });
        return null;
      }
    }
    return null;
  };

  const restoreBackup = async (filePath: string) => {
    if (isElectron && (window as any).electron) {
      try {
        await (window as any).electron.restoreBackup(filePath);
        toast.success('نجح', { description: 'تم استعادة النسخة الاحتياطية بنجاح' });
      } catch (error) {
        toast.error('خطأ', { description: 'فشل استعادة النسخة الاحتياطية' });
      }
    }
  };

  const openFile = async () => {
    if (isElectron && (window as any).electron) {
      try {
        return await (window as any).electron.openFile();
      } catch (error) {
        toast.error('خطأ', { description: 'فشل فتح الملف' });
        return null;
      }
    }
    return null;
  };

  const saveFile = async (content: string, defaultPath: string) => {
    if (isElectron && (window as any).electron) {
      try {
        return await (window as any).electron.saveFile(content, defaultPath);
      } catch (error) {
        toast.error('خطأ', { description: 'فشل حفظ الملف' });
        return null;
      }
    }
    return null;
  };

  const print = async () => {
    if (isElectron && (window as any).electron) {
      try {
        await (window as any).electron.print();
        toast.success('نجح', { description: 'تم إرسال الملف للطباعة' });
      } catch (error) {
        toast.error('خطأ', { description: 'فشل الطباعة' });
      }
    }
  };

  return (
    <ElectronContext.Provider
      value={{
        isElectron,
        appVersion,
        checkForUpdates,
        openBackupDialog,
        restoreBackup,
        openFile,
        saveFile,
        print,
      }}
    >
      {children}
    </ElectronContext.Provider>
  );
}

export function useElectron() {
  const context = useContext(ElectronContext);
  if (!context) {
    throw new Error('useElectron must be used within ElectronProvider');
  }
  return context;
}
