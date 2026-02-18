/**
 * db
 * @module ./server/db
 */
import { drizzle } from "drizzle-orm/mysql2";
/**
 * Database Query Helpers
 * 
 * يحتوي على جميع دوال الاستعلام عن قاعدة البيانات
 * تُستخدم في tRPC procedures للتفاعل مع جداول Drizzle
 * 
 * @module server/db
 * @requires drizzle-orm
 * @requires server/_core/env
 */

import { 
  InsertUser, 
  users,
  CustomsDeclaration,
  InsertCustomsDeclaration,
  customsDeclarations,
  Item,
  InsertItem,
  items,
  Variance,
  InsertVariance,
  variances,
  FinancialSummary,
  InsertFinancialSummary,
  financialSummaries,
  Notification,
  InsertNotification,
  notifications,
  Container,
  InsertContainer,
  containers,
  TrackingEvent,
  InsertTrackingEvent,
  trackingEvents,
  ShipmentDetail,
  InsertShipmentDetail,
  shipmentDetails
} from "../drizzle/schema";
import { ENV } from './_core/env';
import { eq, desc, and, lt, or, like } from "drizzle-orm";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

/**
 * ===== عمليات المستخدمين =====
 */

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * ===== عمليات البيانات الجمركية =====
 */

export async function createCustomsDeclaration(
  userId: number,
  data: Omit<InsertCustomsDeclaration, 'userId'>
): Promise<CustomsDeclaration> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(customsDeclarations).values({
    ...data,
    userId,
  });

  // Get the latest inserted record
  const declaration = await db
    .select()
    .from(customsDeclarations)
    .where(eq(customsDeclarations.declarationNumber, data.declarationNumber))
    .limit(1);

  if (!declaration.length) throw new Error("Failed to create declaration");
  return declaration[0];
}

export async function getCustomsDeclarationById(id: number): Promise<CustomsDeclaration | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(customsDeclarations)
    .where(eq(customsDeclarations.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getCustomsDeclarationsByUserId(userId: number): Promise<CustomsDeclaration[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(customsDeclarations)
    .where(eq(customsDeclarations.userId, userId))
    .orderBy(desc(customsDeclarations.createdAt));
}

export async function updateCustomsDeclaration(
  id: number,
  data: Partial<Omit<InsertCustomsDeclaration, 'userId'>>
): Promise<CustomsDeclaration | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  await db.update(customsDeclarations).set(data).where(eq(customsDeclarations.id, id));
  return getCustomsDeclarationById(id);
}

export async function deleteCustomsDeclaration(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  await db.delete(customsDeclarations).where(eq(customsDeclarations.id, id));
  return true;
}

/**
 * ===== عمليات الأصناف =====
 */

export async function createItem(data: InsertItem): Promise<Item> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(items).values(data);

  // Get the latest inserted item for this declaration
  const item = await db
    .select()
    .from(items)
    .where(eq(items.declarationId, data.declarationId))
    .orderBy(desc(items.id))
    .limit(1);
    
  if (!item.length) throw new Error("Failed to create item");
  return item[0];
}

export async function getItemById(id: number): Promise<Item | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(items)
    .where(eq(items.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getItemsByDeclarationId(declarationId: number): Promise<Item[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(items)
    .where(eq(items.declarationId, declarationId))
    .orderBy(items.id);
}

export async function updateItem(id: number, data: Partial<InsertItem>): Promise<Item | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  await db.update(items).set(data).where(eq(items.id, id));
  const result = await db.select().from(items).where(eq(items.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function deleteItem(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  await db.delete(items).where(eq(items.id, id));
  return true;
}

export async function deleteItemsByDeclarationId(declarationId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  await db.delete(items).where(eq(items.declarationId, declarationId));
  return true;
}

/**
 * ===== عمليات الانحرافات =====
 */

export async function createOrUpdateVariance(data: InsertVariance): Promise<Variance> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(variances)
    .where(eq(variances.declarationId, data.declarationId))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(variances)
      .set(data)
      .where(eq(variances.declarationId, data.declarationId));
  } else {
    await db.insert(variances).values(data);
  }

  const result = await db
    .select()
    .from(variances)
    .where(eq(variances.declarationId, data.declarationId))
    .limit(1);

  if (!result.length) throw new Error("Failed to create/update variance");
  return result[0];
}

export async function getVarianceByDeclarationId(declarationId: number): Promise<Variance | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(variances)
    .where(eq(variances.declarationId, declarationId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * ===== عمليات الملخصات المالية =====
 */

export async function createOrUpdateFinancialSummary(
  data: InsertFinancialSummary
): Promise<FinancialSummary> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(financialSummaries)
    .where(eq(financialSummaries.declarationId, data.declarationId))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(financialSummaries)
      .set(data)
      .where(eq(financialSummaries.declarationId, data.declarationId));
  } else {
    await db.insert(financialSummaries).values(data);
  }

  const result = await db
    .select()
    .from(financialSummaries)
    .where(eq(financialSummaries.declarationId, data.declarationId))
    .limit(1);

  if (!result.length) throw new Error("Failed to create/update financial summary");
  return result[0];
}

export async function getFinancialSummaryByDeclarationId(
  declarationId: number
): Promise<FinancialSummary | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(financialSummaries)
    .where(eq(financialSummaries.declarationId, declarationId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * ===== عمليات الإشعارات =====
 */

export async function createNotification(
  data: InsertNotification
): Promise<Notification> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(notifications).values(data);

  const result = await db
    .select()
    .from(notifications)
    .orderBy(desc(notifications.createdAt))
    .limit(1);

  if (!result.length) throw new Error("Failed to create notification");
  return result[0];
}

export async function getNotificationsByUserId(
  userId: number,
  limit: number = 50,
  offset: number = 0
): Promise<Notification[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getUnreadNotificationCount(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .select()
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));

  return result.length;
}

export async function markNotificationAsRead(notificationId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.id, notificationId));
}

export async function markAllNotificationsAsRead(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.userId, userId));
}

export async function deleteNotification(notificationId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .delete(notifications)
    .where(eq(notifications.id, notificationId));
}

export async function deleteOldNotifications(userId: number, daysOld: number = 30): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  await db
    .delete(notifications)
    .where(and(eq(notifications.userId, userId), lt(notifications.createdAt, cutoffDate)));
}


/**
 * ===== عمليات الحاويات والتتبع =====
 */

export async function createContainer(data: {
  userId: number;
  containerNumber: string;
  containerType: string;
  shippingCompany: string;
  billOfLadingNumber: string;
  portOfLoading: string;
  portOfDischarge: string;
  sealNumber?: string;
  loadingDate?: string;
  estimatedArrivalDate?: string;
  notes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(containers).values({
    userId: data.userId,
    containerNumber: data.containerNumber,
    containerType: data.containerType as any,
    shippingCompany: data.shippingCompany,
    billOfLadingNumber: data.billOfLadingNumber,
    portOfLoading: data.portOfLoading,
    portOfDischarge: data.portOfDischarge,
    sealNumber: data.sealNumber,
    loadingDate: data.loadingDate ? new Date(data.loadingDate) : null,
    estimatedArrivalDate: data.estimatedArrivalDate ? new Date(data.estimatedArrivalDate) : null,
    notes: data.notes,
  });
  
  return result;
}

export async function getContainerByNumber(containerNumber: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(containers).where(
    eq(containers.containerNumber, containerNumber)
  );
  
  return result[0] || null;
}

export async function getUserContainers(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(containers).where(
    eq(containers.userId, userId)
  ).orderBy(desc(containers.createdAt));
  
  return result;
}

export async function searchContainers(userId: number, query: string) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(containers).where(
    and(
      eq(containers.userId, userId),
      or(
        like(containers.containerNumber, `%${query}%`),
        like(containers.billOfLadingNumber, `%${query}%`),
        like(containers.shippingCompany, `%${query}%`)
      )
    )
  );
  
  return result;
}

export async function addTrackingEvent(data: {
  containerId: number;
  userId: number;
  eventType: string;
  eventLocation?: string;
  eventDescription?: string;
  eventDateTime: Date;
  documentUrl?: string;
  notes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(trackingEvents).values({
    containerId: data.containerId,
    userId: data.userId,
    eventType: data.eventType as any,
    eventLocation: data.eventLocation,
    eventDescription: data.eventDescription,
    eventDateTime: data.eventDateTime,
    documentUrl: data.documentUrl,
    notes: data.notes,
  });
  
  return result;
}

export async function getContainerTrackingHistory(containerId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(trackingEvents).where(
    eq(trackingEvents.containerId, containerId)
  ).orderBy(desc(trackingEvents.eventDateTime));
  
  return result;
}

export async function updateContainerStatus(containerId: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.update(containers).set({
    status: status as any,
    updatedAt: new Date(),
  }).where(eq(containers.id, containerId));
  
  return result;
}

export async function createShipmentDetail(data: {
  containerId: number;
  userId: number;
  shipmentNumber: string;
  totalWeight: number;
  totalVolume?: number;
  numberOfPackages: number;
  packageType?: string;
  shipper: string;
  consignee: string;
  freightCharges?: number;
  insuranceCharges?: number;
  handlingCharges?: number;
  otherCharges?: number;
  notes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(shipmentDetails).values({
    containerId: data.containerId,
    userId: data.userId,
    shipmentNumber: data.shipmentNumber,
    totalWeight: data.totalWeight.toString(),
    totalVolume: data.totalVolume?.toString(),
    numberOfPackages: data.numberOfPackages,
    packageType: data.packageType,
    shipper: data.shipper,
    consignee: data.consignee,
    freightCharges: data.freightCharges?.toString(),
    insuranceCharges: data.insuranceCharges?.toString(),
    handlingCharges: data.handlingCharges?.toString(),
    otherCharges: data.otherCharges?.toString(),
    notes: data.notes,
  });
  
  return result;
}

export async function getShipmentDetail(containerId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(shipmentDetails).where(
    eq(shipmentDetails.containerId, containerId)
  );
  
  return result[0] || null;
}


/**
 * ===== دوال التنبيهات التلقائية =====
 */

export async function sendShipmentStatusNotification(
  userId: number,
  containerId: number,
  status: string,
  message: string
) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(notifications).values({
    userId,
    title: `تحديث حالة الشحنة - ${status}`,
    message,
    type: "info",
    relatedEntityType: "container",
    relatedEntityId: containerId,
    isRead: false,
  });

  return result;
}

export async function sendDelayedShipmentAlert(
  userId: number,
  containerId: number,
  containerNumber: string,
  estimatedDate: Date
) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(notifications).values({
    userId,
    title: `تنبيه: تأخر في الشحنة ${containerNumber}`,
    message: `الحاوية ${containerNumber} تأخرت عن موعد الوصول المتوقع (${estimatedDate.toLocaleDateString("ar-JO")})`,
    type: "warning",
    relatedEntityType: "container",
    relatedEntityId: containerId,
    isRead: false,
  });

  return result;
}

export async function sendCustomsClearanceNotification(
  userId: number,
  containerId: number,
  containerNumber: string
) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(notifications).values({
    userId,
    title: `تخليص جمركي - ${containerNumber}`,
    message: `تم تخليص الحاوية ${containerNumber} جمركياً بنجاح`,
    type: "success",
    relatedEntityType: "container",
    relatedEntityId: containerId,
    isRead: false,
  });

  return result;
}

export async function sendDeliveryNotification(
  userId: number,
  containerId: number,
  containerNumber: string,
  deliveryDate: Date
) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(notifications).values({
    userId,
    title: `تسليم الشحنة - ${containerNumber}`,
    message: `تم تسليم الحاوية ${containerNumber} بنجاح في ${deliveryDate.toLocaleDateString("ar-JO")}`,
    type: "success",
    relatedEntityType: "container",
    relatedEntityId: containerId,
    isRead: false,
  });

  return result;
}

export async function getContainerNotifications(containerId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.select().from(notifications).where(
    eq(notifications.relatedEntityId, containerId)
  ).orderBy(desc(notifications.createdAt));

  return result;
}
