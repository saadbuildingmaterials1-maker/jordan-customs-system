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

// Customs Declarations helpers
export async function getUserCustomsDeclarations(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const { customsDeclarations } = await import("../drizzle/schema");
  return db.select().from(customsDeclarations)
    .where(eq(customsDeclarations.userId, userId))
    .orderBy(desc(customsDeclarations.createdAt));
}

export async function getCustomsDeclarationById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const { customsDeclarations, declarationItems } = await import("../drizzle/schema");
  
  const declarationResult = await db.select().from(customsDeclarations)
    .where(and(eq(customsDeclarations.id, id), eq(customsDeclarations.userId, userId)))
    .limit(1);
  
  if (declarationResult.length === 0) return null;
  
  const declaration = declarationResult[0];
  
  // Get items
  const items = await db.select().from(declarationItems)
    .where(eq(declarationItems.declarationId, id));
  
  return { ...declaration, items };
}

export async function createCustomsDeclaration(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { customsDeclarations, declarationItems } = await import("../drizzle/schema");
  
  const { items, ...declarationData } = data;
  
  // Calculate total cost
  const totalCost = declarationData.totalValue + 
                    declarationData.salesTax + 
                    declarationData.additionalFees + 
                    declarationData.declarationFees;
  
  const result = await db.insert(customsDeclarations).values({
    ...declarationData,
    totalCost,
  });
  
  const declarationId = Number(result.insertId);
  
  // Insert items
  if (items && items.length > 0) {
    await db.insert(declarationItems).values(
      items.map((item: any) => ({
        declarationId,
        ...item,
      }))
    );
  }
  
  return { id: declarationId };
}

// Containers helpers
export async function getUserContainers(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const { containers } = await import("../drizzle/schema");
  return db.select().from(containers)
    .where(eq(containers.userId, userId))
    .orderBy(desc(containers.createdAt));
}

export async function getContainerById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const { containers } = await import("../drizzle/schema");
  
  const result = await db.select().from(containers)
    .where(and(eq(containers.id, id), eq(containers.userId, userId)))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function trackContainer(containerNumber: string) {
  const db = await getDb();
  if (!db) return null;
  
  const { containers, containerTracking } = await import("../drizzle/schema");
  
  const containerResult = await db.select().from(containers)
    .where(eq(containers.containerNumber, containerNumber))
    .limit(1);
  
  if (containerResult.length === 0) return null;
  
  const container = containerResult[0];
  
  // Get tracking history
  const history = await db.select().from(containerTracking)
    .where(eq(containerTracking.containerId, container.id))
    .orderBy(desc(containerTracking.eventDate));
  
  return { container, history };
}

export async function createContainer(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { containers, containerTracking } = await import("../drizzle/schema");
  
  const result = await db.insert(containers).values(data);
  
  const containerId = Number(result.insertId);
  
  // Add initial tracking event
  await db.insert(containerTracking).values({
    containerId,
    eventType: 'container_created',
    location: data.originPort,
    description: 'Container registered in system',
  });
  
  return { id: containerId };
}

// Suppliers helpers
export async function getUserSuppliers(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const { suppliers } = await import("../drizzle/schema");
  return db.select().from(suppliers)
    .where(eq(suppliers.userId, userId))
    .orderBy(desc(suppliers.createdAt));
}

export async function getSupplierById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const { suppliers } = await import("../drizzle/schema");
  
  const result = await db.select().from(suppliers)
    .where(and(eq(suppliers.id, id), eq(suppliers.userId, userId)))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function createSupplier(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { suppliers } = await import("../drizzle/schema");
  
  const result = await db.insert(suppliers).values(data);
  
  return { id: Number(result.insertId) };
}

export async function updateSupplier(id: number, userId: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { suppliers } = await import("../drizzle/schema");
  
  // Verify ownership
  const supplier = await getSupplierById(id, userId);
  if (!supplier) throw new Error("Supplier not found");
  
  await db.update(suppliers)
    .set(data)
    .where(eq(suppliers.id, id));
  
  return { success: true };
}

export async function deleteSupplier(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { suppliers } = await import("../drizzle/schema");
  
  // Verify ownership
  const supplier = await getSupplierById(id, userId);
  if (!supplier) throw new Error("Supplier not found");
  
  await db.delete(suppliers).where(eq(suppliers.id, id));
  
  return { success: true };
}

// Supplier Payments helpers
export async function getSupplierPayments(supplierId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const { supplierPayments, suppliers } = await import("../drizzle/schema");
  
  // Verify supplier ownership
  const supplier = await getSupplierById(supplierId, userId);
  if (!supplier) return [];
  
  return db.select().from(supplierPayments)
    .where(eq(supplierPayments.supplierId, supplierId))
    .orderBy(desc(supplierPayments.paymentDate));
}

export async function createSupplierPayment(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { supplierPayments, suppliers } = await import("../drizzle/schema");
  
  const result = await db.insert(supplierPayments).values(data);
  
  // Update supplier paid amount
  const supplier = await db.select().from(suppliers)
    .where(eq(suppliers.id, data.supplierId))
    .limit(1);
  
  if (supplier.length > 0) {
    const newPaidAmount = supplier[0].paidAmount + data.amount;
    const newRemainingAmount = supplier[0].totalAmount - newPaidAmount;
    
    await db.update(suppliers)
      .set({ 
        paidAmount: newPaidAmount,
        remainingAmount: newRemainingAmount 
      })
      .where(eq(suppliers.id, data.supplierId));
  }
  
  return { id: Number(result.insertId) };
}

// Supplier Items helpers
export async function getSupplierItems(supplierId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const { supplierItems, suppliers } = await import("../drizzle/schema");
  
  // Verify supplier ownership
  const supplier = await getSupplierById(supplierId, userId);
  if (!supplier) return [];
  
  return db.select().from(supplierItems)
    .where(eq(supplierItems.supplierId, supplierId))
    .orderBy(desc(supplierItems.createdAt));
}

export async function createSupplierItem(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { supplierItems } = await import("../drizzle/schema");
  
  const result = await db.insert(supplierItems).values(data);
  
  return { id: Number(result.insertId) };
}

export async function updateSupplierItem(id: number, userId: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { supplierItems, suppliers } = await import("../drizzle/schema");
  
  // Verify ownership through supplier
  const itemResult = await db.select().from(supplierItems)
    .where(eq(supplierItems.id, id))
    .limit(1);
  
  if (itemResult.length === 0) throw new Error("Item not found");
  
  const supplier = await getSupplierById(itemResult[0].supplierId, userId);
  if (!supplier) throw new Error("Unauthorized");
  
  await db.update(supplierItems)
    .set(data)
    .where(eq(supplierItems.id, id));
  
  return { success: true };
}

export async function deleteSupplierItem(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { supplierItems, suppliers } = await import("../drizzle/schema");
  
  // Verify ownership through supplier
  const itemResult = await db.select().from(supplierItems)
    .where(eq(supplierItems.id, id))
    .limit(1);
  
  if (itemResult.length === 0) throw new Error("Item not found");
  
  const supplier = await getSupplierById(itemResult[0].supplierId, userId);
  if (!supplier) throw new Error("Unauthorized");
  
  await db.delete(supplierItems).where(eq(supplierItems.id, id));
  
  return { success: true };
}
