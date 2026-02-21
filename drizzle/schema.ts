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

// Customs declarations table
export const customsDeclarations = mysqlTable("customsDeclarations", {
  id: int("id").autoincrement().primaryKey(),
  shipmentId: int("shipmentId").notNull().unique(),
  declarationNumber: varchar("declarationNumber", { length: 100 }).notNull().unique(),
  declarantName: varchar("declarantName", { length: 255 }).notNull(),
  declarantId: varchar("declarantId", { length: 50 }).notNull(),
  itemDescription: text("itemDescription").notNull(),
  hsCode: varchar("hsCode", { length: 20 }), // Harmonized System Code
  countryOfOrigin: varchar("countryOfOrigin", { length: 100 }).notNull(),
  invoiceValue: int("invoiceValue").notNull(),
  customsDutyRate: int("customsDutyRate").notNull(), // percentage * 100
  customsDutyAmount: int("customsDutyAmount").notNull(),
  salesTaxAmount: int("salesTaxAmount").notNull(),
  totalAmount: int("totalAmount").notNull(),
  status: mysqlEnum("status", ["draft", "submitted", "approved", "rejected"]).default("draft").notNull(),
  submittedAt: timestamp("submittedAt"),
  approvedAt: timestamp("approvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CustomsDeclaration = typeof customsDeclarations.$inferSelect;
export type InsertCustomsDeclaration = typeof customsDeclarations.$inferInsert;

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