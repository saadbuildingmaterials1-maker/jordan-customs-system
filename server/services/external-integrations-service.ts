/**
 * خدمة التكامل مع الأنظمة الخارجية
 * External Integrations Service - QuickBooks, Xero
 */

export interface IntegrationConfig {
  id: string;
  type: "quickbooks" | "xero" | "other";
  name: string;
  apiKey: string;
  apiSecret?: string;
  realmId?: string;
  enabled: boolean;
  lastSyncAt?: Date;
  syncStatus: "idle" | "syncing" | "error";
  errorMessage?: string;
}

export interface SyncLog {
  id: string;
  integrationId: string;
  syncType: "invoice" | "expense" | "payment" | "customer" | "all";
  status: "success" | "partial" | "failed";
  recordsSynced: number;
  recordsFailed: number;
  startedAt: Date;
  completedAt?: Date;
  errorDetails?: string;
}

export interface QuickBooksConfig extends IntegrationConfig {
  type: "quickbooks";
  realmId: string;
}

export interface XeroConfig extends IntegrationConfig {
  type: "xero";
}

class ExternalIntegrationsService {
  private integrations: Map<string, IntegrationConfig> = new Map();
  private syncLogs: Map<string, SyncLog[]> = new Map();

  /**
   * إضافة تكامل جديد
   * Add new integration
   */
  async addIntegration(
    config: Omit<IntegrationConfig, "id">
  ): Promise<IntegrationConfig> {
    const integration: IntegrationConfig = {
      ...config,
      id: `integration-${Date.now()}`,
    };

    this.integrations.set(integration.id, integration);
    this.syncLogs.set(integration.id, []);

    console.log(`Integration added: ${integration.id} (${integration.type})`);
    return integration;
  }

  /**
   * الحصول على التكامل
   * Get integration
   */
  async getIntegration(integrationId: string): Promise<IntegrationConfig | undefined> {
    return this.integrations.get(integrationId);
  }

  /**
   * الحصول على جميع التكاملات
   * Get all integrations
   */
  async getAllIntegrations(): Promise<IntegrationConfig[]> {
    return Array.from(this.integrations.values());
  }

  /**
   * تحديث التكامل
   * Update integration
   */
  async updateIntegration(
    integrationId: string,
    updates: Partial<IntegrationConfig>
  ): Promise<void> {
    const integration = this.integrations.get(integrationId);
    if (integration) {
      Object.assign(integration, updates);
      console.log(`Integration updated: ${integrationId}`);
    }
  }

  /**
   * حذف التكامل
   * Delete integration
   */
  async deleteIntegration(integrationId: string): Promise<void> {
    this.integrations.delete(integrationId);
    this.syncLogs.delete(integrationId);
    console.log(`Integration deleted: ${integrationId}`);
  }

  /**
   * مزامنة البيانات مع QuickBooks
   * Sync data with QuickBooks
   */
  async syncWithQuickBooks(
    integrationId: string,
    syncType: SyncLog["syncType"] = "all"
  ): Promise<SyncLog> {
    const integration = this.integrations.get(integrationId);
    if (!integration || integration.type !== "quickbooks") {
      throw new Error("QuickBooks integration not found");
    }

    const syncLog: SyncLog = {
      id: `sync-${Date.now()}`,
      integrationId,
      syncType,
      status: "success",
      recordsSynced: 0,
      recordsFailed: 0,
      startedAt: new Date(),
    };

    try {
      integration.syncStatus = "syncing";

      // محاكاة مزامنة البيانات
      switch (syncType) {
        case "invoice":
          syncLog.recordsSynced = 25;
          break;
        case "expense":
          syncLog.recordsSynced = 15;
          break;
        case "payment":
          syncLog.recordsSynced = 10;
          break;
        case "customer":
          syncLog.recordsSynced = 50;
          break;
        case "all":
          syncLog.recordsSynced = 100;
          break;
      }

      syncLog.completedAt = new Date();
      integration.syncStatus = "idle";
      integration.lastSyncAt = new Date();

      const logs = this.syncLogs.get(integrationId) || [];
      logs.push(syncLog);
      this.syncLogs.set(integrationId, logs);

      console.log(
        `QuickBooks sync completed: ${syncLog.recordsSynced} records synced`
      );
      return syncLog;
    } catch (error) {
      syncLog.status = "failed";
      syncLog.completedAt = new Date();
      syncLog.errorDetails = (error as Error).message;
      integration.syncStatus = "error";
      integration.errorMessage = (error as Error).message;

      const logs = this.syncLogs.get(integrationId) || [];
      logs.push(syncLog);
      this.syncLogs.set(integrationId, logs);

      throw error;
    }
  }

  /**
   * مزامنة البيانات مع Xero
   * Sync data with Xero
   */
  async syncWithXero(
    integrationId: string,
    syncType: SyncLog["syncType"] = "all"
  ): Promise<SyncLog> {
    const integration = this.integrations.get(integrationId);
    if (!integration || integration.type !== "xero") {
      throw new Error("Xero integration not found");
    }

    const syncLog: SyncLog = {
      id: `sync-${Date.now()}`,
      integrationId,
      syncType,
      status: "success",
      recordsSynced: 0,
      recordsFailed: 0,
      startedAt: new Date(),
    };

    try {
      integration.syncStatus = "syncing";

      // محاكاة مزامنة البيانات
      switch (syncType) {
        case "invoice":
          syncLog.recordsSynced = 30;
          break;
        case "expense":
          syncLog.recordsSynced = 20;
          break;
        case "payment":
          syncLog.recordsSynced = 12;
          break;
        case "customer":
          syncLog.recordsSynced = 60;
          break;
        case "all":
          syncLog.recordsSynced = 122;
          break;
      }

      syncLog.completedAt = new Date();
      integration.syncStatus = "idle";
      integration.lastSyncAt = new Date();

      const logs = this.syncLogs.get(integrationId) || [];
      logs.push(syncLog);
      this.syncLogs.set(integrationId, logs);

      console.log(
        `Xero sync completed: ${syncLog.recordsSynced} records synced`
      );
      return syncLog;
    } catch (error) {
      syncLog.status = "failed";
      syncLog.completedAt = new Date();
      syncLog.errorDetails = (error as Error).message;
      integration.syncStatus = "error";
      integration.errorMessage = (error as Error).message;

      const logs = this.syncLogs.get(integrationId) || [];
      logs.push(syncLog);
      this.syncLogs.set(integrationId, logs);

      throw error;
    }
  }

  /**
   * الحصول على سجل المزامنة
   * Get sync logs
   */
  async getSyncLogs(integrationId: string): Promise<SyncLog[]> {
    return this.syncLogs.get(integrationId) || [];
  }

  /**
   * الحصول على آخر مزامنة ناجحة
   * Get last successful sync
   */
  async getLastSuccessfulSync(integrationId: string): Promise<SyncLog | undefined> {
    const logs = this.syncLogs.get(integrationId) || [];
    return logs.find((log) => log.status === "success");
  }

  /**
   * جدولة المزامنة التلقائية
   * Schedule automatic sync
   */
  async scheduleAutoSync(
    integrationId: string,
    intervalMinutes: number = 60
  ): Promise<void> {
    const integration = this.integrations.get(integrationId);
    if (!integration) {
      throw new Error("Integration not found");
    }

    console.log(
      `Auto sync scheduled for ${integrationId} every ${intervalMinutes} minutes`
    );

    // في التطبيق الحقيقي، يتم استخدام job scheduler
    setInterval(async () => {
      try {
        if (integration.type === "quickbooks") {
          await this.syncWithQuickBooks(integrationId);
        } else if (integration.type === "xero") {
          await this.syncWithXero(integrationId);
        }
      } catch (error) {
        console.error(`Auto sync failed for ${integrationId}:`, error);
      }
    }, intervalMinutes * 60 * 1000);
  }

  /**
   * الحصول على إحصائيات المزامنة
   * Get sync statistics
   */
  async getSyncStatistics(integrationId: string) {
    const logs = this.syncLogs.get(integrationId) || [];
    const successfulSyncs = logs.filter((l) => l.status === "success").length;
    const failedSyncs = logs.filter((l) => l.status === "failed").length;
    const totalRecordsSynced = logs.reduce(
      (sum, l) => sum + l.recordsSynced,
      0
    );
    const totalRecordsFailed = logs.reduce(
      (sum, l) => sum + l.recordsFailed,
      0
    );

    const avgSyncTime =
      successfulSyncs > 0
        ? logs
            .filter((l) => l.status === "success" && l.completedAt)
            .reduce((sum, l) => {
              if (l.completedAt) {
                return (
                  sum +
                  (l.completedAt.getTime() - l.startedAt.getTime()) / 1000
                );
              }
              return sum;
            }, 0) / successfulSyncs
        : 0;

    return {
      totalSyncs: logs.length,
      successfulSyncs,
      failedSyncs,
      successRate:
        logs.length > 0
          ? ((successfulSyncs / logs.length) * 100).toFixed(2)
          : 0,
      totalRecordsSynced,
      totalRecordsFailed,
      averageSyncTime: avgSyncTime.toFixed(2),
      lastSync: logs[logs.length - 1]?.completedAt,
    };
  }

  /**
   * اختبار الاتصال بالتكامل
   * Test integration connection
   */
  async testConnection(integrationId: string): Promise<boolean> {
    const integration = this.integrations.get(integrationId);
    if (!integration) {
      return false;
    }

    try {
      // محاكاة اختبار الاتصال
      console.log(`Testing connection for ${integration.type}...`);

      // في التطبيق الحقيقي، يتم إرسال طلب API فعلي
      return true;
    } catch (error) {
      console.error(`Connection test failed:`, error);
      return false;
    }
  }
}

export const externalIntegrationsService = new ExternalIntegrationsService();
