/**
 * Hook للإبلاغ عن الأخطاء
 * يوفر طريقة سهلة للإبلاغ عن الأخطاء من أي مكان في التطبيق
 */

import { useState, useCallback } from "react";

export interface ErrorInfo {
  title: string;
  description: string;
  stackTrace?: string;
}

export function useErrorReporter() {
  const [showDialog, setShowDialog] = useState(false);
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | undefined>();

  const reportError = useCallback((error: ErrorInfo) => {
    setErrorInfo(error);
    setShowDialog(true);
  }, []);

  const reportException = useCallback((exception: Error) => {
    reportError({
      title: exception.name || "خطأ غير معروف",
      description: exception.message,
      stackTrace: exception.stack,
    });
  }, [reportError]);

  const closeDialog = useCallback(() => {
    setShowDialog(false);
    setErrorInfo(undefined);
  }, []);

  return {
    showDialog,
    setShowDialog,
    errorInfo,
    reportError,
    reportException,
    closeDialog,
  };
}
