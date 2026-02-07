/**
 * خدمة قاعدة البيانات للحسابات والتقارير
 * Database Service for Calculations and Reports
 */

import { 
  savedCalculations, 
  savedReports, 
  userAlerts, 
  userPreferences,
  SavedCalculation,
  InsertSavedCalculation,
  SavedReport,
  InsertSavedReport,
  UserAlert,
  InsertUserAlert,
  UserPreference,
  InsertUserPreference
} from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { getDb } from "./db";

/**
 * الحسابات المحفوظة
 */
export const calculationsDb = {
  // إضافة حساب جديد
  async create(userId: number, data: Omit<InsertSavedCalculation, 'userId'>) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.insert(savedCalculations).values({
      ...data,
      userId,
    });
    return result;
  },

  // الحصول على جميع حسابات المستخدم
  async getByUserId(userId: number) {
    const db = await getDb();
    if (!db) return [];
    return await db
      .select()
      .from(savedCalculations)
      .where(eq(savedCalculations.userId, userId))
      .orderBy(desc(savedCalculations.createdAt));
  },

  // الحصول على حساب واحد
  async getById(id: number) {
    const db = await getDb();
    if (!db) return undefined;
    const result = await db
      .select()
      .from(savedCalculations)
      .where(eq(savedCalculations.id, id));
    return result[0];
  },

  // تحديث حساب
  async update(id: number, data: Partial<InsertSavedCalculation>) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return await db
      .update(savedCalculations)
      .set(data)
      .where(eq(savedCalculations.id, id));
  },

  // حذف حساب
  async delete(id: number) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return await db
      .delete(savedCalculations)
      .where(eq(savedCalculations.id, id));
  },

  // البحث عن حسابات
  async search(userId: number, query: string) {
    const db = await getDb();
    if (!db) return [];
    return await db
      .select()
      .from(savedCalculations)
      .where(
        and(
          eq(savedCalculations.userId, userId),
        )
      )
      .orderBy(desc(savedCalculations.createdAt));
  },
};

/**
 * التقارير المحفوظة
 */
export const reportsDb = {
  // إضافة تقرير جديد
  async create(userId: number, data: Omit<InsertSavedReport, 'userId'>) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.insert(savedReports).values({
      ...data,
      userId,
    });
    return result;
  },

  // الحصول على جميع تقارير المستخدم
  async getByUserId(userId: number) {
    const db = await getDb();
    if (!db) return [];
    return await db
      .select()
      .from(savedReports)
      .where(eq(savedReports.userId, userId))
      .orderBy(desc(savedReports.createdAt));
  },

  // الحصول على تقرير واحد
  async getById(id: number) {
    const db = await getDb();
    if (!db) return undefined;
    const result = await db
      .select()
      .from(savedReports)
      .where(eq(savedReports.id, id));
    return result[0];
  },

  // تحديث تقرير
  async update(id: number, data: Partial<InsertSavedReport>) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return await db
      .update(savedReports)
      .set(data)
      .where(eq(savedReports.id, id));
  },

  // حذف تقرير
  async delete(id: number) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return await db
      .delete(savedReports)
      .where(eq(savedReports.id, id));
  },

  // الحصول على التقارير العامة
  async getPublic() {
    const db = await getDb();
    if (!db) return [];
    return await db
      .select()
      .from(savedReports)
      .where(eq(savedReports.isPublic, true))
      .orderBy(desc(savedReports.createdAt));
  },
};

/**
 * التنبيهات والإشعارات
 */
export const alertsDb = {
  // إضافة تنبيه جديد
  async create(userId: number, data: Omit<InsertUserAlert, 'userId'>) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.insert(userAlerts).values({
      ...data,
      userId,
    });
    return result;
  },

  // الحصول على جميع تنبيهات المستخدم
  async getByUserId(userId: number) {
    const db = await getDb();
    if (!db) return [];
    return await db
      .select()
      .from(userAlerts)
      .where(eq(userAlerts.userId, userId))
      .orderBy(desc(userAlerts.createdAt));
  },

  // الحصول على التنبيهات غير المقروءة
  async getUnread(userId: number) {
    const db = await getDb();
    if (!db) return [];
    return await db
      .select()
      .from(userAlerts)
      .where(
        and(
          eq(userAlerts.userId, userId),
          eq(userAlerts.isRead, false)
        )
      )
      .orderBy(desc(userAlerts.createdAt));
  },

  // تحديث حالة التنبيه
  async markAsRead(id: number) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return await db
      .update(userAlerts)
      .set({ isRead: true })
      .where(eq(userAlerts.id, id));
  },

  // تثبيت/إلغاء تثبيت التنبيه
  async togglePin(id: number, isPinned: boolean) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return await db
      .update(userAlerts)
      .set({ isPinned })
      .where(eq(userAlerts.id, id));
  },

  // حذف تنبيه
  async delete(id: number) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return await db
      .delete(userAlerts)
      .where(eq(userAlerts.id, id));
  },

  // حذف جميع التنبيهات المقروءة
  async deleteRead(userId: number) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return await db
      .delete(userAlerts)
      .where(
        and(
          eq(userAlerts.userId, userId),
          eq(userAlerts.isRead, true)
        )
      );
  },
};

/**
 * تفضيلات المستخدم
 */
export const preferencesDb = {
  // الحصول على تفضيلات المستخدم
  async getByUserId(userId: number) {
    const db = await getDb();
    if (!db) return undefined;
    const result = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));
    return result[0];
  },

  // إنشاء تفضيلات جديدة
  async create(userId: number, data: Omit<InsertUserPreference, 'userId'>) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.insert(userPreferences).values({
      ...data,
      userId,
    });
    return result;
  },

  // تحديث التفضيلات
  async update(userId: number, data: Partial<InsertUserPreference>) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return await db
      .update(userPreferences)
      .set(data)
      .where(eq(userPreferences.userId, userId));
  },

  // تحديث عملة افتراضية
  async updateDefaultCurrency(userId: number, currency: string) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return await db
      .update(userPreferences)
      .set({ defaultCurrency: currency })
      .where(eq(userPreferences.userId, userId));
  },

  // تحديث دولة افتراضية
  async updateDefaultCountry(userId: number, country: string) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return await db
      .update(userPreferences)
      .set({ defaultCountry: country })
      .where(eq(userPreferences.userId, userId));
  },

  // تحديث اللغة
  async updateLanguage(userId: number, language: string) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return await db
      .update(userPreferences)
      .set({ language })
      .where(eq(userPreferences.userId, userId));
  },

  // تحديث المظهر
  async updateTheme(userId: number, theme: string) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return await db
      .update(userPreferences)
      .set({ theme })
      .where(eq(userPreferences.userId, userId));
  },

  // تحديث إعدادات الإشعارات
  async updateNotificationSettings(
    userId: number,
    settings: {
      enableNotifications?: boolean;
      enableEmailNotifications?: boolean;
      enablePriceAlerts?: boolean;
    }
  ) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return await db
      .update(userPreferences)
      .set(settings)
      .where(eq(userPreferences.userId, userId));
  },
};
