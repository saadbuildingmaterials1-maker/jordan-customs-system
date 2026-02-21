import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, shipments, InsertShipment, shipmentStatusHistory, InsertShipmentStatusHistory } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
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
    console.error("[Database] Failed to upsert user:", error);
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

// Shipment helpers
export async function getUserShipments(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(shipments).where(eq(shipments.userId, userId)).orderBy(desc(shipments.createdAt));
}

export async function getShipmentById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(shipments)
    .where(and(eq(shipments.id, id), eq(shipments.userId, userId)))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function createShipment(data: Omit<InsertShipment, 'trackingNumber'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Generate tracking number
  const trackingNumber = `JO${Date.now()}${Math.floor(Math.random() * 1000)}`;
  
  // Calculate costs
  const customsDutyRate = getCustomsDutyRate(data.productType);
  const customsDuty = Math.round(data.productValue * customsDutyRate);
  const salesTax = Math.round((data.productValue + customsDuty) * 0.16);
  const shippingCost = Math.round((data.weight / 1000) * 3.5 * 100); // 3.5 JOD per kg, stored in fils
  const totalCost = data.productValue + customsDuty + salesTax + shippingCost;
  
  const shipmentData: InsertShipment = {
    ...data,
    trackingNumber,
    customsDuty,
    salesTax,
    shippingCost,
    totalCost,
  };
  
  const result = await db.insert(shipments).values(shipmentData);
  
  // Add initial status
  await db.insert(shipmentStatusHistory).values({
    shipmentId: Number(result.insertId),
    status: 'pending',
    location: data.senderCountry,
    notes: 'Shipment created',
  });
  
  return { id: Number(result.insertId), trackingNumber };
}

export async function updateShipmentStatus(
  id: number,
  status: string,
  userId: number,
  location?: string,
  notes?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Verify ownership
  const shipment = await getShipmentById(id, userId);
  if (!shipment) throw new Error("Shipment not found");
  
  // Update shipment status
  await db.update(shipments)
    .set({ status: status as any })
    .where(eq(shipments.id, id));
  
  // Add status history
  await db.insert(shipmentStatusHistory).values({
    shipmentId: id,
    status,
    location,
    notes,
  });
  
  return { success: true };
}

export async function trackShipment(trackingNumber: string) {
  const db = await getDb();
  if (!db) return null;
  
  const shipmentResult = await db.select().from(shipments)
    .where(eq(shipments.trackingNumber, trackingNumber))
    .limit(1);
  
  if (shipmentResult.length === 0) return null;
  
  const shipment = shipmentResult[0];
  
  // Get status history
  const history = await db.select().from(shipmentStatusHistory)
    .where(eq(shipmentStatusHistory.shipmentId, shipment.id))
    .orderBy(desc(shipmentStatusHistory.createdAt));
  
  return { shipment, history };
}

function getCustomsDutyRate(productType: string): number {
  const rates: Record<string, number> = {
    'إلكترونيات': 0.05,
    'ملابس': 0.15,
    'أحذية': 0.20,
    'مجوهرات': 0.25,
    'كتب': 0.00,
    'أخرى': 0.10,
  };
  
  return rates[productType] || 0.10;
}
