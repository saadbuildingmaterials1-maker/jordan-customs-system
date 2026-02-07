/**
 * Hook للتحديثات التلقائية
 * يفحص التحديثات كل 7 أيام ويخطر المستخدم
 */

import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";

const LAST_UPDATE_CHECK_KEY = "lastUpdateCheck";
const CHECK_INTERVAL = 7 * 24 * 60 * 60 * 1000; // 7 days

export function useAutoUpdate() {
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [hasUpdate, setHasUpdate] = useState(false);
  const { data: updateStatus } = trpc.updates.checkForUpdates.useQuery(
    undefined,
    { enabled: showUpdateDialog }
  );

  useEffect(() => {
    // التحقق من آخر فحص
    const lastCheck = localStorage.getItem(LAST_UPDATE_CHECK_KEY);
    const now = Date.now();

    if (!lastCheck || now - parseInt(lastCheck) > CHECK_INTERVAL) {
      // حان وقت الفحص
      checkForUpdates();
    }
  }, []);

  const checkForUpdates = async () => {
    try {
      // تحديث آخر فحص
      localStorage.setItem(LAST_UPDATE_CHECK_KEY, Date.now().toString());
      
      // فتح نافذة الحوار
      setShowUpdateDialog(true);
    } catch (error) {
      console.error("Error checking for updates:", error);
    }
  };

  useEffect(() => {
    if (updateStatus?.data?.hasUpdate) {
      setHasUpdate(true);
    }
  }, [updateStatus]);

  return {
    showUpdateDialog,
    setShowUpdateDialog,
    hasUpdate,
    checkForUpdates,
  };
}
