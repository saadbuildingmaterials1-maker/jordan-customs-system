import EventEmitter from 'events';

/**
 * نظام مزامنة البيانات الفورية
 * يتعامل مع المزامنة الفورية بين قاعدة البيانات المحلية والنظام الحكومي
 */

interface SyncEvent {
  id: string;
  type: 'declaration' | 'payment' | 'shipment' | 'tariff';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: Date;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  retryCount: number;
  error?: string;
}

interface SyncQueue {
  events: SyncEvent[];
  isProcessing: boolean;
  lastSyncTime: Date;
}

/**
 * فئة خدمة المزامنة
 */
export class DataSyncService extends EventEmitter {
  private queue: SyncQueue = {
    events: [],
    isProcessing: false,
    lastSyncTime: new Date(),
  };

  private maxRetries = 3;
  private syncInterval = 5000; // 5 ثوان
  private batchSize = 10;
  private syncTimer: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.initializeSyncService();
  }

  /**
   * تهيئة خدمة المزامنة
   */
  private initializeSyncService(): void {
    console.log('✅ تم تهيئة خدمة مزامنة البيانات');

    // بدء المزامنة الدورية
    this.startPeriodicSync();

    // الاستماع للأحداث
    this.on('sync-complete', this.onSyncComplete.bind(this));
    this.on('sync-error', this.onSyncError.bind(this));
  }

  /**
   * إضافة حدث إلى قائمة المزامنة
   */
  addSyncEvent(
    type: SyncEvent['type'],
    action: SyncEvent['action'],
    data: any
  ): string {
    const event: SyncEvent = {
      id: `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      action,
      data,
      timestamp: new Date(),
      status: 'pending',
      retryCount: 0,
    };

    this.queue.events.push(event);
    console.log(`📝 تم إضافة حدث مزامنة: ${event.id}`);

    // إطلاق حدث إضافة
    this.emit('event-added', event);

    return event.id;
  }

  /**
   * بدء المزامنة الدورية
   */
  private startPeriodicSync(): void {
    this.syncTimer = setInterval(() => {
      this.processSyncQueue();
    }, this.syncInterval);
  }

  /**
   * إيقاف المزامنة الدورية
   */
  stopPeriodicSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
      console.log('⏸️ تم إيقاف المزامنة الدورية');
    }
  }

  /**
   * معالجة قائمة المزامنة
   */
  private async processSyncQueue(): Promise<void> {
    // تجنب المعالجة المتزامنة
    if (this.queue.isProcessing || this.queue.events.length === 0) {
      return;
    }

    this.queue.isProcessing = true;

    try {
      // الحصول على دفعة من الأحداث
      const batch = this.queue.events.splice(0, this.batchSize);

      for (const event of batch) {
        await this.syncEvent(event);
      }

      this.queue.lastSyncTime = new Date();
      this.emit('sync-complete', {
        batchSize: batch.length,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('❌ خطأ في معالجة قائمة المزامنة:', error);
      this.emit('sync-error', error);
    } finally {
      this.queue.isProcessing = false;
    }
  }

  /**
   * مزامنة حدث واحد
   */
  private async syncEvent(event: SyncEvent): Promise<void> {
    event.status = 'syncing';

    try {
      // محاكاة المزامنة مع النظام الحكومي
      await this.sendToGovernmentSystem(event);

      event.status = 'synced';
      console.log(`✅ تم مزامنة الحدث: ${event.id}`);

      // إطلاق حدث النجاح
      this.emit('event-synced', event);
    } catch (error: any) {
      event.retryCount++;

      if (event.retryCount < this.maxRetries) {
        event.status = 'pending';
        event.error = error.message;
        console.log(
          `⚠️ فشل الحدث ${event.id}، إعادة المحاولة ${event.retryCount}/${this.maxRetries}`
        );

        // إعادة الحدث إلى القائمة
        this.queue.events.push(event);
      } else {
        event.status = 'failed';
        event.error = error.message;
        console.error(`❌ فشل الحدث ${event.id} بعد ${this.maxRetries} محاولات`);

        // إطلاق حدث الفشل
        this.emit('event-failed', event);
      }
    }
  }

  /**
   * إرسال الحدث إلى النظام الحكومي
   */
  private async sendToGovernmentSystem(event: SyncEvent): Promise<void> {
    // محاكاة الاتصال بالنظام الحكومي
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // محاكاة احتمالية الفشل (10%)
        if (Math.random() < 0.1) {
          reject(new Error('فشل الاتصال بالنظام الحكومي'));
        } else {
          resolve();
        }
      }, 1000);
    });
  }

  /**
   * معالج حدث اكتمال المزامنة
   */
  private onSyncComplete(data: any): void {
    console.log(`📊 اكتملت المزامنة: ${data.batchSize} حدث`);
  }

  /**
   * معالج حدث خطأ المزامنة
   */
  private onSyncError(error: any): void {
    console.error('🚨 خطأ في المزامنة:', error.message);
  }

  /**
   * الحصول على حالة قائمة المزامنة
   */
  getQueueStatus(): {
    totalEvents: number;
    pendingEvents: number;
    syncingEvents: number;
    failedEvents: number;
    isProcessing: boolean;
    lastSyncTime: Date;
  } {
    const pendingEvents = this.queue.events.filter((e) => e.status === 'pending').length;
    const syncingEvents = this.queue.events.filter((e) => e.status === 'syncing').length;
    const failedEvents = this.queue.events.filter((e) => e.status === 'failed').length;

    return {
      totalEvents: this.queue.events.length,
      pendingEvents,
      syncingEvents,
      failedEvents,
      isProcessing: this.queue.isProcessing,
      lastSyncTime: this.queue.lastSyncTime,
    };
  }

  /**
   * الحصول على قائمة الأحداث
   */
  getSyncEvents(
    status?: SyncEvent['status'],
    limit: number = 50
  ): SyncEvent[] {
    let events = this.queue.events;

    if (status) {
      events = events.filter((e) => e.status === status);
    }

    return events.slice(0, limit);
  }

  /**
   * إعادة محاولة حدث فاشل
   */
  retrySyncEvent(eventId: string): boolean {
    const event = this.queue.events.find((e) => e.id === eventId);

    if (!event) {
      return false;
    }

    event.retryCount = 0;
    event.status = 'pending';
    event.error = undefined;

    console.log(`🔄 تم إعادة تعيين الحدث: ${eventId}`);
    return true;
  }

  /**
   * حذف حدث من القائمة
   */
  removeSyncEvent(eventId: string): boolean {
    const index = this.queue.events.findIndex((e) => e.id === eventId);

    if (index === -1) {
      return false;
    }

    this.queue.events.splice(index, 1);
    console.log(`🗑️ تم حذف الحدث: ${eventId}`);
    return true;
  }

  /**
   * مسح جميع الأحداث الفاشلة
   */
  clearFailedEvents(): number {
    const failedCount = this.queue.events.filter((e) => e.status === 'failed').length;
    this.queue.events = this.queue.events.filter((e) => e.status !== 'failed');
    console.log(`🧹 تم حذف ${failedCount} أحداث فاشلة`);
    return failedCount;
  }

  /**
   * مسح جميع الأحداث
   */
  clearAllEvents(): number {
    const count = this.queue.events.length;
    this.queue.events = [];
    console.log(`🧹 تم حذف جميع الأحداث (${count})`);
    return count;
  }

  /**
   * الحصول على إحصائيات المزامنة
   */
  getStatistics(): {
    totalSynced: number;
    totalFailed: number;
    totalRetried: number;
    averageSyncTime: number;
    successRate: number;
  } {
    const total = this.queue.events.length;
    const synced = this.queue.events.filter((e) => e.status === 'synced').length;
    const failed = this.queue.events.filter((e) => e.status === 'failed').length;
    const retried = this.queue.events.reduce((sum, e) => sum + e.retryCount, 0);

    return {
      totalSynced: synced,
      totalFailed: failed,
      totalRetried: retried,
      averageSyncTime: 1000, // محاكاة
      successRate: total > 0 ? (synced / total) * 100 : 0,
    };
  }
}

/**
 * إنشاء نسخة واحدة من الخدمة
 */
let dataSyncService: DataSyncService | null = null;

export function initializeDataSync(): DataSyncService {
  if (!dataSyncService) {
    dataSyncService = new DataSyncService();
  }
  return dataSyncService;
}

export function getDataSync(): DataSyncService {
  if (!dataSyncService) {
    return initializeDataSync();
  }
  return dataSyncService;
}
