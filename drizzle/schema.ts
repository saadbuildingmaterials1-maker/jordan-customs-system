import { 
  int, 
  mysqlEnum, 
  mysqlTable, 
  text, 
  timestamp, 
  varchar,
  decimal,
  date,
  boolean
} from "drizzle-orm/mysql-core";

/**
 * جدول المستخدمين - الأساس للمصادقة
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
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

/**
 * جدول البيانات الجمركية الرئيسية
 * يحتوي على معلومات البيان الجمركي الأساسية
 */
export const customsDeclarations = mysqlTable("customs_declarations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // معلومات البيان الجمركي
  declarationNumber: varchar("declarationNumber", { length: 50 }).notNull().unique(),
  registrationDate: date("registrationDate").notNull(),
  clearanceCenter: varchar("clearanceCenter", { length: 100 }).notNull(),
  exchangeRate: decimal("exchangeRate", { precision: 10, scale: 6 }).notNull(), // سعر التعادل
  exportCountry: varchar("exportCountry", { length: 100 }).notNull(),
  billOfLadingNumber: varchar("billOfLadingNumber", { length: 50 }).notNull(),
  
  // معلومات الأوزان والطرود
  grossWeight: decimal("grossWeight", { precision: 12, scale: 3 }).notNull(),
  netWeight: decimal("netWeight", { precision: 12, scale: 3 }).notNull(),
  numberOfPackages: int("numberOfPackages").notNull(),
  packageType: varchar("packageType", { length: 50 }).notNull(),
  
  // القيم المالية الأساسية
  fobValue: decimal("fobValue", { precision: 15, scale: 3 }).notNull(),
  fobValueJod: decimal("fobValueJod", { precision: 15, scale: 3 }).notNull(),
  
  freightCost: decimal("freightCost", { precision: 12, scale: 3 }).notNull(),
  insuranceCost: decimal("insuranceCost", { precision: 12, scale: 3 }).notNull(),
  
  customsDuty: decimal("customsDuty", { precision: 12, scale: 3 }).notNull(),
  salesTax: decimal("salesTax", { precision: 12, scale: 3 }).notNull(),
  additionalFees: decimal("additionalFees", { precision: 12, scale: 3 }).default("0"),
  customsServiceFee: decimal("customsServiceFee", { precision: 12, scale: 3 }).default("0"),
  penalties: decimal("penalties", { precision: 12, scale: 3 }).default("0"),
  
  estimatedFobValue: decimal("estimatedFobValue", { precision: 15, scale: 3 }).default("0"),
  estimatedFreight: decimal("estimatedFreight", { precision: 12, scale: 3 }).default("0"),
  estimatedInsurance: decimal("estimatedInsurance", { precision: 12, scale: 3 }).default("0"),
  estimatedCustomsDuty: decimal("estimatedCustomsDuty", { precision: 12, scale: 3 }).default("0"),
  estimatedSalesTax: decimal("estimatedSalesTax", { precision: 12, scale: 3 }).default("0"),
  estimatedAdditionalFees: decimal("estimatedAdditionalFees", { precision: 12, scale: 3 }).default("0"),
  
  // الإجماليات
  totalLandedCost: decimal("totalLandedCost", { precision: 15, scale: 3 }).notNull(), // التكلفة الكلية النهائية
  additionalExpensesRatio: decimal("additionalExpensesRatio", { precision: 5, scale: 2 }).notNull(), // نسبة المصاريف الإضافية
  
  // معلومات إضافية متقدمة
  barcodeNumber: varchar("barcodeNumber", { length: 50 }),
  egyptianReferenceNumber: varchar("egyptianReferenceNumber", { length: 50 }),
  importerLicenseNumber: varchar("importerLicenseNumber", { length: 50 }),
  importerTaxNumber: varchar("importerTaxNumber", { length: 50 }),
  importerSequentialNumber: varchar("importerSequentialNumber", { length: 50 }),
  importerName: varchar("importerName", { length: 200 }),
  exporterLicenseNumber: varchar("exporterLicenseNumber", { length: 50 }),
  exporterName: varchar("exporterName", { length: 200 }),
  certificateNumber: varchar("certificateNumber", { length: 50 }),
  transactionNumber: varchar("transactionNumber", { length: 50 }),
  volumeCbm: decimal("volumeCbm", { precision: 10, scale: 3 }), // الحجم بالمتر المكعب
  customsCode: varchar("customsCode", { length: 50 }), // الكود الجمركي
  
  // الحالة والملاحظات
  status: mysqlEnum("status", ["draft", "submitted", "approved", "cleared"]).default("draft"),
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CustomsDeclaration = typeof customsDeclarations.$inferSelect;
export type InsertCustomsDeclaration = typeof customsDeclarations.$inferInsert;

/**
 * جدول الأصناف (Items/SKUs)
 * يحتوي على تفاصيل كل صنف في الشحنة
 */
export const items = mysqlTable("items", {
  id: int("id").autoincrement().primaryKey(),
  declarationId: int("declarationId").notNull(),
  
  // معلومات الصنف
  itemName: varchar("itemName", { length: 255 }).notNull(),
  quantity: decimal("quantity", { precision: 12, scale: 3 }).notNull(),
  unitPriceForeign: decimal("unitPriceForeign", { precision: 12, scale: 3 }).notNull(), // سعر الوحدة (أجنبي)
  totalPriceForeign: decimal("totalPriceForeign", { precision: 15, scale: 3 }).notNull(), // إجمالي السعر (أجنبي)
  totalPriceJod: decimal("totalPriceJod", { precision: 15, scale: 3 }).notNull(), // إجمالي السعر (JOD)
  
  // النسب والتوزيع
  valuePercentage: decimal("valuePercentage", { precision: 5, scale: 2 }).notNull(), // نسبة القيمة من الشحنة
  itemExpensesShare: decimal("itemExpensesShare", { precision: 15, scale: 3 }).notNull(), // حصة الصنف من المصاريف
  
   // التكاليف النهاية
  totalItemCostJod: decimal("totalItemCostJod", { precision: 15, scale: 3 }).notNull(), // إجمالي تكلفة الصنف واصل
  unitCostJod: decimal("unitCostJod", { precision: 12, scale: 3 }).notNull(), // تكلفة الوحدة الواحدة (JOD)
  
  // معلومات إضافية للأصناف
  customsCode: varchar("customsCode", { length: 50 }), // الكود الجمركي للصنف
  itemNumber: varchar("itemNumber", { length: 50 }), // رقم الصنف
  description: text("description"), // وصف تفصيلي للصنف
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Item = typeof items.$inferSelect;
export type InsertItem = typeof items.$inferInsert;

/**
 * جدول الانحرافات والمقارنات
 * يحتوي على مقارنة التكاليف الفعلية مع التقديرية
 */
export const variances = mysqlTable("variances", {
  id: int("id").autoincrement().primaryKey(),
  declarationId: int("declarationId").notNull().unique(),
  
  // الانحرافات
  fobVariance: decimal("fobVariance", { precision: 15, scale: 3 }).notNull(),
  freightVariance: decimal("freightVariance", { precision: 12, scale: 3 }).notNull(),
  insuranceVariance: decimal("insuranceVariance", { precision: 12, scale: 3 }).notNull(),
  customsDutyVariance: decimal("customsDutyVariance", { precision: 12, scale: 3 }).notNull(),
  salesTaxVariance: decimal("salesTaxVariance", { precision: 12, scale: 3 }).notNull(),
  totalVariance: decimal("totalVariance", { precision: 15, scale: 3 }).notNull(),
  
  // نسب الانحراف المئوية
  fobVariancePercent: decimal("fobVariancePercent", { precision: 6, scale: 2 }).notNull(),
  freightVariancePercent: decimal("freightVariancePercent", { precision: 6, scale: 2 }).notNull(),
  insuranceVariancePercent: decimal("insuranceVariancePercent", { precision: 6, scale: 2 }).notNull(),
  customsDutyVariancePercent: decimal("customsDutyVariancePercent", { precision: 6, scale: 2 }).notNull(),
  salesTaxVariancePercent: decimal("salesTaxVariancePercent", { precision: 6, scale: 2 }).notNull(),
  totalVariancePercent: decimal("totalVariancePercent", { precision: 6, scale: 2 }).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Variance = typeof variances.$inferSelect;
export type InsertVariance = typeof variances.$inferInsert;

/**
 * جدول الملخصات المالية
 * يحتوي على ملخص شامل للتكاليف لكل بيان جمركي
 */
export const financialSummaries = mysqlTable("financial_summaries", {
  id: int("id").autoincrement().primaryKey(),
  declarationId: int("declarationId").notNull().unique(),
  
  // إجمالي قيمة البضاعة
  totalFobValue: decimal("totalFobValue", { precision: 15, scale: 3 }).notNull(),
  
  // إجمالي مصاريف الشحن والتأمين
  totalFreightAndInsurance: decimal("totalFreightAndInsurance", { precision: 12, scale: 3 }).notNull(),
  
  // إجمالي الرسوم والضرائب الجمركية
  totalCustomsAndTaxes: decimal("totalCustomsAndTaxes", { precision: 12, scale: 3 }).notNull(),
  
  // التكلفة الكلية النهائية للشحنة
  totalLandedCost: decimal("totalLandedCost", { precision: 15, scale: 3 }).notNull(),
  
  // نسبة المصاريف الإضافية من إجمالي القيمة
  additionalExpensesRatio: decimal("additionalExpensesRatio", { precision: 5, scale: 2 }).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FinancialSummary = typeof financialSummaries.$inferSelect;
export type InsertFinancialSummary = typeof financialSummaries.$inferInsert;
