import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
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
  financialSummaries
} from "../drizzle/schema";
import { ENV } from './_core/env';

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
