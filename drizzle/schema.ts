import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Shipments table
export const shipments = mysqlTable("shipments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  trackingNumber: varchar("trackingNumber", { length: 100 }).notNull().unique(),
  senderName: varchar("senderName", { length: 255 }).notNull(),
  senderCountry: varchar("senderCountry", { length: 100 }).notNull(),
  recipientName: varchar("recipientName", { length: 255 }).notNull(),
  recipientAddress: text("recipientAddress").notNull(),
  recipientPhone: varchar("recipientPhone", { length: 50 }).notNull(),
  productType: varchar("productType", { length: 100 }).notNull(),
  productValue: int("productValue").notNull(), // in JOD
  weight: int("weight").notNull(), // in grams
  status: mysqlEnum("status", [
    "pending",
    "in_transit",
    "customs_clearance",
    "out_for_delivery",
    "delivered",
    "cancelled"
  ]).default("pending").notNull(),
  customsDuty: int("customsDuty"), // calculated customs duty
  salesTax: int("salesTax"), // calculated sales tax
  shippingCost: int("shippingCost"), // shipping cost
  totalCost: int("totalCost"), // total cost
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Shipment = typeof shipments.$inferSelect;
export type InsertShipment = typeof shipments.$inferInsert;

// Shipment status history table
export const shipmentStatusHistory = mysqlTable("shipmentStatusHistory", {
  id: int("id").autoincrement().primaryKey(),
  shipmentId: int("shipmentId").notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  location: varchar("location", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ShipmentStatusHistory = typeof shipmentStatusHistory.$inferSelect;
export type InsertShipmentStatusHistory = typeof shipmentStatusHistory.$inferInsert;

// Customs declarations table (based on Jordanian customs declaration)
export const customsDeclarations = mysqlTable("customsDeclarations", {
  id: int("id").autoincrement().primaryKey(),
  containerId: int("containerId"), // link to container (optional)
  declarationNumber: varchar("declarationNumber", { length: 100 }).notNull().unique(),
  declarationDate: timestamp("declarationDate").notNull(),
  customsCenter: varchar("customsCenter", { length: 100 }).notNull(), // e.g., "220 - جمرك العقبة"
  customsRegime: varchar("customsRegime", { length: 10 }).notNull(), // e.g., "IM" for import
  
  // Importer information
  importerName: varchar("importerName", { length: 255 }).notNull(),
  importerTaxId: varchar("importerTaxId", { length: 50 }).notNull(),
  importerPhone: varchar("importerPhone", { length: 50 }),
  importerAddress: text("importerAddress"),
  
  // Shipment information
  containerNumber: varchar("containerNumber", { length: 100 }),
  shippingLine: varchar("shippingLine", { length: 255 }),
  countryOfOrigin: varchar("countryOfOrigin", { length: 10 }), // ISO code e.g., "CN"
  countryOfExport: varchar("countryOfExport", { length: 10 }),
  portOfDischarge: varchar("portOfDischarge", { length: 255 }),
  numberOfPackages: int("numberOfPackages"),
  totalWeight: int("totalWeight"), // in grams
  containerType: varchar("containerType", { length: 50 }),
  
  // Financial information (in fils: 1 JOD = 1000 fils)
  totalGoodsValue: int("totalGoodsValue").notNull(), // قيمة البضاعة الإجمالية
  salesTaxRate: int("salesTaxRate").default(16).notNull(), // 16% for Jordan
  salesTaxAmount: int("salesTaxAmount").notNull(), // ضريبة المبيعات
  additionalFees: int("additionalFees").default(0), // الرسوم الإضافية
  declarationFees: int("declarationFees").default(0), // الرسوم على البيان
  totalFees: int("totalFees").notNull(), // مجموع الرسوم
  grandTotal: int("grandTotal").notNull(), // التكلفة النهائية الإجمالية
  
  // Status and approval
  status: mysqlEnum("status", ["draft", "submitted", "approved", "rejected"]).default("draft").notNull(),
  approvalNumber: varchar("approvalNumber", { length: 100 }),
  submittedAt: timestamp("submittedAt"),
  approvedAt: timestamp("approvedAt"),
  
  // Metadata
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CustomsDeclaration = typeof customsDeclarations.$inferSelect;
export type InsertCustomsDeclaration = typeof customsDeclarations.$inferInsert;

// Declaration items table (for cost distribution)
export const declarationItems = mysqlTable("declarationItems", {
  id: int("id").autoincrement().primaryKey(),
  declarationId: int("declarationId").notNull(),
  
  // Item information
  itemCode: varchar("itemCode", { length: 50 }),
  itemDescription: text("itemDescription").notNull(),
  hsCode: varchar("hsCode", { length: 20 }), // Harmonized System Code
  quantity: int("quantity").notNull(),
  unit: varchar("unit", { length: 50 }).notNull(),
  unitPrice: int("unitPrice").notNull(), // in fils
  itemValue: int("itemValue").notNull(), // in fils
  itemWeight: int("itemWeight"), // in grams
  
  // Cost distribution (in fils)
  valuePercentage: int("valuePercentage").notNull(), // percentage * 100 (e.g., 4975 = 49.75%)
  customsDutyRate: int("customsDutyRate").default(0), // percentage * 100
  customsDutyAmount: int("customsDutyAmount").default(0),
  salesTaxAmount: int("salesTaxAmount").notNull(), // distributed sales tax
  additionalFeesDistributed: int("additionalFeesDistributed").default(0),
  declarationFeesDistributed: int("declarationFeesDistributed").default(0),
  totalItemCost: int("totalItemCost").notNull(), // final cost for this item
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DeclarationItem = typeof declarationItems.$inferSelect;
export type InsertDeclarationItem = typeof declarationItems.$inferInsert;

// Containers table
export const containers = mysqlTable("containers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  containerNumber: varchar("containerNumber", { length: 100 }).notNull().unique(),
  sealNumber: varchar("sealNumber", { length: 100 }),
  containerType: varchar("containerType", { length: 50 }).notNull(), // 20ft, 40ft, 40ft HC
  shippingLine: varchar("shippingLine", { length: 255 }).notNull(),
  vesselName: varchar("vesselName", { length: 255 }),
  voyageNumber: varchar("voyageNumber", { length: 100 }),
  portOfLoading: varchar("portOfLoading", { length: 255 }).notNull(),
  portOfDischarge: varchar("portOfDischarge", { length: 255 }).notNull(),
  estimatedDeparture: timestamp("estimatedDeparture"),
  estimatedArrival: timestamp("estimatedArrival"),
  actualDeparture: timestamp("actualDeparture"),
  actualArrival: timestamp("actualArrival"),
  status: mysqlEnum("status", [
    "booked",
    "loaded",
    "in_transit",
    "arrived",
    "customs_clearance",
    "released",
    "delivered"
  ]).default("booked").notNull(),
  cargoDescription: text("cargoDescription"),
  totalValue: int("totalValue"), // in fils
  totalWeight: int("totalWeight"), // in grams
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Container = typeof containers.$inferSelect;
export type InsertContainer = typeof containers.$inferInsert;

// Container tracking events table
export const containerTrackingEvents = mysqlTable("containerTrackingEvents", {
  id: int("id").autoincrement().primaryKey(),
  containerId: int("containerId").notNull(),
  eventType: varchar("eventType", { length: 100 }).notNull(),
  location: varchar("location", { length: 255 }),
  vessel: varchar("vessel", { length: 255 }),
  description: text("description"),
  eventDate: timestamp("eventDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContainerTrackingEvent = typeof containerTrackingEvents.$inferSelect;
export type InsertContainerTrackingEvent = typeof containerTrackingEvents.$inferInsert;