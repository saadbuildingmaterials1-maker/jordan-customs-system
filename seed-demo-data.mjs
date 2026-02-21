import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './drizzle/schema.js';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const connection = await mysql.createConnection(DATABASE_URL);
const db = drizzle(connection, { schema, mode: 'default' });

console.log('🌱 بدء إضافة البيانات التجريبية...\n');

// 1. إضافة موردين تجريبيين
console.log('📦 إضافة 5 موردين...');
const suppliers = [
  {
    companyName: 'شركة الشرق للاستيراد',
    contactPerson: 'أحمد محمود',
    email: 'ahmad@alsharq.com',
    phone: '+962791234567',
    address: 'عمان، الأردن',
    taxNumber: 'TAX123456',
    status: 'active',
    totalAmount: 50000,
    paidAmount: 30000,
    remainingAmount: 20000,
  },
  {
    companyName: 'مؤسسة النور التجارية',
    contactPerson: 'فاطمة أحمد',
    email: 'fatima@alnoor.com',
    phone: '+962792345678',
    address: 'إربد، الأردن',
    taxNumber: 'TAX234567',
    status: 'active',
    totalAmount: 75000,
    paidAmount: 75000,
    remainingAmount: 0,
  },
  {
    companyName: 'شركة الأمل للتجارة العامة',
    contactPerson: 'محمد علي',
    email: 'mohammad@alamal.com',
    phone: '+962793456789',
    address: 'الزرقاء، الأردن',
    taxNumber: 'TAX345678',
    status: 'active',
    totalAmount: 120000,
    paidAmount: 80000,
    remainingAmount: 40000,
  },
  {
    companyName: 'مؤسسة الفجر للاستيراد والتصدير',
    contactPerson: 'سارة خالد',
    email: 'sara@alfajr.com',
    phone: '+962794567890',
    address: 'العقبة، الأردن',
    taxNumber: 'TAX456789',
    status: 'inactive',
    totalAmount: 30000,
    paidAmount: 10000,
    remainingAmount: 20000,
  },
  {
    companyName: 'شركة النجاح التجارية',
    contactPerson: 'يوسف حسن',
    email: 'yousef@alnajah.com',
    phone: '+962795678901',
    address: 'السلط، الأردن',
    taxNumber: 'TAX567890',
    status: 'active',
    totalAmount: 95000,
    paidAmount: 60000,
    remainingAmount: 35000,
  },
];

const supplierIds = [];
for (const supplier of suppliers) {
  const [result] = await db.insert(schema.suppliers).values(supplier);
  supplierIds.push(Number(result.insertId));
  console.log(`  ✅ تمت إضافة: ${supplier.companyName}`);
}

// 2. إضافة دفعات للموردين
console.log('\n💰 إضافة 10 دفعات...');
const payments = [
  { supplierId: supplierIds[0], amount: 15000, paymentDate: Date.now() - 30 * 24 * 60 * 60 * 1000, paymentMethod: 'تحويل بنكي', referenceNumber: 'PAY001', notes: 'دفعة أولى' },
  { supplierId: supplierIds[0], amount: 15000, paymentDate: Date.now() - 15 * 24 * 60 * 60 * 1000, paymentMethod: 'شيك', referenceNumber: 'PAY002', notes: 'دفعة ثانية' },
  { supplierId: supplierIds[1], amount: 75000, paymentDate: Date.now() - 45 * 24 * 60 * 60 * 1000, paymentMethod: 'تحويل بنكي', referenceNumber: 'PAY003', notes: 'دفعة كاملة' },
  { supplierId: supplierIds[2], amount: 40000, paymentDate: Date.now() - 60 * 24 * 60 * 60 * 1000, paymentMethod: 'نقدي', referenceNumber: 'PAY004', notes: 'دفعة أولى' },
  { supplierId: supplierIds[2], amount: 40000, paymentDate: Date.now() - 20 * 24 * 60 * 60 * 1000, paymentMethod: 'تحويل بنكي', referenceNumber: 'PAY005', notes: 'دفعة ثانية' },
  { supplierId: supplierIds[3], amount: 10000, paymentDate: Date.now() - 90 * 24 * 60 * 60 * 1000, paymentMethod: 'شيك', referenceNumber: 'PAY006', notes: 'دفعة أولى' },
  { supplierId: supplierIds[4], amount: 30000, paymentDate: Date.now() - 50 * 24 * 60 * 60 * 1000, paymentMethod: 'تحويل بنكي', referenceNumber: 'PAY007', notes: 'دفعة أولى' },
  { supplierId: supplierIds[4], amount: 30000, paymentDate: Date.now() - 25 * 24 * 60 * 60 * 1000, paymentMethod: 'تحويل بنكي', referenceNumber: 'PAY008', notes: 'دفعة ثانية' },
  { supplierId: supplierIds[0], amount: 10000, paymentDate: Date.now() - 5 * 24 * 60 * 60 * 1000, paymentMethod: 'نقدي', referenceNumber: 'PAY009', notes: 'دفعة إضافية' },
  { supplierId: supplierIds[2], amount: 20000, paymentDate: Date.now() - 10 * 24 * 60 * 60 * 1000, paymentMethod: 'شيك', referenceNumber: 'PAY010', notes: 'دفعة إضافية' },
];

for (const payment of payments) {
  await db.insert(schema.supplierPayments).values(payment);
  console.log(`  ✅ تمت إضافة دفعة: ${payment.amount} د.أ - ${payment.paymentMethod}`);
}

// 3. إضافة أصناف للموردين
console.log('\n📋 إضافة 15 صنف...');
const items = [
  { supplierId: supplierIds[0], itemName: 'هواتف ذكية - Samsung Galaxy S23', quantity: 100, unitPrice: 350, totalPrice: 35000, hsCode: '8517.12.00', notes: 'موديل 2023' },
  { supplierId: supplierIds[0], itemName: 'سماعات لاسلكية - AirPods Pro', quantity: 50, unitPrice: 180, totalPrice: 9000, hsCode: '8518.30.00', notes: 'أصلية' },
  { supplierId: supplierIds[0], itemName: 'شواحن سريعة - 65W', quantity: 200, unitPrice: 25, totalPrice: 5000, hsCode: '8504.40.00', notes: 'Type-C' },
  { supplierId: supplierIds[1], itemName: 'ملابس رجالية - قمصان', quantity: 500, unitPrice: 15, totalPrice: 7500, hsCode: '6205.20.00', notes: 'قطن 100%' },
  { supplierId: supplierIds[1], itemName: 'ملابس نسائية - فساتين', quantity: 300, unitPrice: 30, totalPrice: 9000, hsCode: '6204.42.00', notes: 'موديلات صيفية' },
  { supplierId: supplierIds[1], itemName: 'أحذية رياضية', quantity: 200, unitPrice: 45, totalPrice: 9000, hsCode: '6402.19.00', notes: 'مقاسات متنوعة' },
  { supplierId: supplierIds[2], itemName: 'أجهزة كمبيوتر محمولة - Dell', quantity: 50, unitPrice: 800, totalPrice: 40000, hsCode: '8471.30.00', notes: 'Core i7' },
  { supplierId: supplierIds[2], itemName: 'شاشات LED - 32 بوصة', quantity: 100, unitPrice: 200, totalPrice: 20000, hsCode: '8528.72.00', notes: 'Full HD' },
  { supplierId: supplierIds[2], itemName: 'لوحات مفاتيح وفأرة لاسلكية', quantity: 150, unitPrice: 35, totalPrice: 5250, hsCode: '8471.60.00', notes: 'Logitech' },
  { supplierId: supplierIds[3], itemName: 'مواد غذائية - زيت زيتون', quantity: 500, unitPrice: 12, totalPrice: 6000, hsCode: '1509.10.00', notes: 'بكر ممتاز' },
  { supplierId: supplierIds[3], itemName: 'مواد غذائية - معكرونة', quantity: 1000, unitPrice: 1.5, totalPrice: 1500, hsCode: '1902.19.00', notes: 'إيطالية' },
  { supplierId: supplierIds[3], itemName: 'مواد غذائية - قهوة', quantity: 200, unitPrice: 25, totalPrice: 5000, hsCode: '0901.21.00', notes: 'برازيلية' },
  { supplierId: supplierIds[4], itemName: 'مستحضرات تجميل - كريمات', quantity: 300, unitPrice: 20, totalPrice: 6000, hsCode: '3304.99.00', notes: 'ماركات عالمية' },
  { supplierId: supplierIds[4], itemName: 'مستحضرات تجميل - عطور', quantity: 150, unitPrice: 50, totalPrice: 7500, hsCode: '3303.00.00', notes: 'فرنسية' },
  { supplierId: supplierIds[4], itemName: 'مستحضرات تجميل - شامبو', quantity: 400, unitPrice: 8, totalPrice: 3200, hsCode: '3305.10.00', notes: 'طبيعي' },
];

for (const item of items) {
  await db.insert(schema.supplierItems).values(item);
  console.log(`  ✅ تمت إضافة: ${item.itemName}`);
}

// 4. إضافة شحنات تجريبية
console.log('\n🚢 إضافة 8 شحنات...');
const shipments = [
  { shipmentNumber: 'SH-2024-001', origin: 'الصين', destination: 'الأردن', departureDate: Date.now() - 45 * 24 * 60 * 60 * 1000, arrivalDate: Date.now() - 15 * 24 * 60 * 60 * 1000, status: 'delivered', carrier: 'Maersk', trackingNumber: 'MAEU1234567', totalWeight: 5000, totalCost: 12000, notes: 'شحنة إلكترونيات' },
  { shipmentNumber: 'SH-2024-002', origin: 'تركيا', destination: 'الأردن', departureDate: Date.now() - 30 * 24 * 60 * 60 * 1000, arrivalDate: Date.now() - 10 * 24 * 60 * 60 * 1000, status: 'delivered', carrier: 'MSC', trackingNumber: 'MSCU2345678', totalWeight: 3000, totalCost: 8000, notes: 'شحنة ملابس' },
  { shipmentNumber: 'SH-2024-003', origin: 'ألمانيا', destination: 'الأردن', departureDate: Date.now() - 60 * 24 * 60 * 60 * 1000, arrivalDate: Date.now() - 30 * 24 * 60 * 60 * 1000, status: 'delivered', carrier: 'CMA CGM', trackingNumber: 'CMAU3456789', totalWeight: 8000, totalCost: 18000, notes: 'شحنة أجهزة كمبيوتر' },
  { shipmentNumber: 'SH-2024-004', origin: 'إيطاليا', destination: 'الأردن', departureDate: Date.now() - 90 * 24 * 60 * 60 * 1000, arrivalDate: Date.now() - 60 * 24 * 60 * 60 * 1000, status: 'delivered', carrier: 'Hapag-Lloyd', trackingNumber: 'HLCU4567890', totalWeight: 2000, totalCost: 5000, notes: 'شحنة مواد غذائية' },
  { shipmentNumber: 'SH-2024-005', origin: 'فرنسا', destination: 'الأردن', departureDate: Date.now() - 50 * 24 * 60 * 60 * 1000, arrivalDate: Date.now() - 25 * 24 * 60 * 60 * 1000, status: 'delivered', carrier: 'ONE', trackingNumber: 'ONEU5678901', totalWeight: 1500, totalCost: 4000, notes: 'شحنة مستحضرات تجميل' },
  { shipmentNumber: 'SH-2024-006', origin: 'الصين', destination: 'الأردن', departureDate: Date.now() - 20 * 24 * 60 * 60 * 1000, arrivalDate: Date.now() + 5 * 24 * 60 * 60 * 1000, status: 'in_transit', carrier: 'COSCO', trackingNumber: 'COSU6789012', totalWeight: 6000, totalCost: 15000, notes: 'شحنة إلكترونيات جديدة' },
  { shipmentNumber: 'SH-2024-007', origin: 'الهند', destination: 'الأردن', departureDate: Date.now() - 10 * 24 * 60 * 60 * 1000, arrivalDate: Date.now() + 15 * 24 * 60 * 60 * 1000, status: 'in_transit', carrier: 'Evergreen', trackingNumber: 'EGHU7890123', totalWeight: 4000, totalCost: 10000, notes: 'شحنة منسوجات' },
  { shipmentNumber: 'SH-2024-008', origin: 'الإمارات', destination: 'الأردن', departureDate: Date.now() - 5 * 24 * 60 * 60 * 1000, arrivalDate: Date.now() + 2 * 24 * 60 * 60 * 1000, status: 'pending', carrier: 'ZIM', trackingNumber: 'ZIMU8901234', totalWeight: 2500, totalCost: 6000, notes: 'شحنة متنوعة' },
];

const shipmentIds = [];
for (const shipment of shipments) {
  const [result] = await db.insert(schema.shipments).values(shipment);
  shipmentIds.push(Number(result.insertId));
  console.log(`  ✅ تمت إضافة: ${shipment.shipmentNumber} - ${shipment.status}`);
}

// 5. إضافة حاويات تجريبية
console.log('\n📦 إضافة 6 حاويات...');
const containers = [
  { containerNumber: 'EMCU1234567', shipmentId: shipmentIds[0], type: '40ft', status: 'delivered', origin: 'شنغهاي، الصين', destination: 'ميناء العقبة، الأردن', departureDate: Date.now() - 45 * 24 * 60 * 60 * 1000, arrivalDate: Date.now() - 15 * 24 * 60 * 60 * 1000, estimatedArrival: Date.now() - 15 * 24 * 60 * 60 * 1000, currentLocation: 'ميناء العقبة', weight: 5000, sealNumber: 'SEAL001', notes: 'حاوية إلكترونيات' },
  { containerNumber: 'MSCU2345678', shipmentId: shipmentIds[1], type: '20ft', status: 'delivered', origin: 'إسطنبول، تركيا', destination: 'ميناء العقبة، الأردن', departureDate: Date.now() - 30 * 24 * 60 * 60 * 1000, arrivalDate: Date.now() - 10 * 24 * 60 * 60 * 1000, estimatedArrival: Date.now() - 10 * 24 * 60 * 60 * 1000, currentLocation: 'ميناء العقبة', weight: 3000, sealNumber: 'SEAL002', notes: 'حاوية ملابس' },
  { containerNumber: 'CMAU3456789', shipmentId: shipmentIds[2], type: '40ft HC', status: 'delivered', origin: 'هامبورغ، ألمانيا', destination: 'ميناء العقبة، الأردن', departureDate: Date.now() - 60 * 24 * 60 * 60 * 1000, arrivalDate: Date.now() - 30 * 24 * 60 * 60 * 1000, estimatedArrival: Date.now() - 30 * 24 * 60 * 60 * 1000, currentLocation: 'ميناء العقبة', weight: 8000, sealNumber: 'SEAL003', notes: 'حاوية أجهزة كمبيوتر' },
  { containerNumber: 'HLCU4567890', shipmentId: shipmentIds[3], type: '20ft', status: 'delivered', origin: 'جنوة، إيطاليا', destination: 'ميناء العقبة، الأردن', departureDate: Date.now() - 90 * 24 * 60 * 60 * 1000, arrivalDate: Date.now() - 60 * 24 * 60 * 60 * 1000, estimatedArrival: Date.now() - 60 * 24 * 60 * 60 * 1000, currentLocation: 'ميناء العقبة', weight: 2000, sealNumber: 'SEAL004', notes: 'حاوية مواد غذائية' },
  { containerNumber: 'COSU6789012', shipmentId: shipmentIds[5], type: '40ft', status: 'in_transit', origin: 'قوانغتشو، الصين', destination: 'ميناء العقبة، الأردن', departureDate: Date.now() - 20 * 24 * 60 * 60 * 1000, arrivalDate: null, estimatedArrival: Date.now() + 5 * 24 * 60 * 60 * 1000, currentLocation: 'قناة السويس', weight: 6000, sealNumber: 'SEAL006', notes: 'حاوية إلكترونيات جديدة' },
  { containerNumber: 'EGHU7890123', shipmentId: shipmentIds[6], type: '20ft', status: 'in_transit', origin: 'مومباي، الهند', destination: 'ميناء العقبة، الأردن', departureDate: Date.now() - 10 * 24 * 60 * 60 * 1000, arrivalDate: null, estimatedArrival: Date.now() + 15 * 24 * 60 * 60 * 1000, currentLocation: 'البحر الأحمر', weight: 4000, sealNumber: 'SEAL007', notes: 'حاوية منسوجات' },
];

const containerIds = [];
for (const container of containers) {
  const [result] = await db.insert(schema.containers).values(container);
  containerIds.push(Number(result.insertId));
  console.log(`  ✅ تمت إضافة: ${container.containerNumber} - ${container.status}`);
}

// 6. إضافة أحداث تتبع للحاويات
console.log('\n📍 إضافة 18 حدث تتبع...');
const trackingEvents = [
  // Container 1 (delivered)
  { containerId: containerIds[0], eventDate: Date.now() - 45 * 24 * 60 * 60 * 1000, location: 'شنغهاي، الصين', status: 'departed', description: 'غادرت الميناء' },
  { containerId: containerIds[0], eventDate: Date.now() - 35 * 24 * 60 * 60 * 1000, location: 'سنغافورة', status: 'in_transit', description: 'في الطريق - توقف في سنغافورة' },
  { containerId: containerIds[0], eventDate: Date.now() - 25 * 24 * 60 * 60 * 1000, location: 'قناة السويس', status: 'in_transit', description: 'عبور قناة السويس' },
  { containerId: containerIds[0], eventDate: Date.now() - 15 * 24 * 60 * 60 * 1000, location: 'ميناء العقبة، الأردن', status: 'arrived', description: 'وصلت إلى الميناء' },
  { containerId: containerIds[0], eventDate: Date.now() - 14 * 24 * 60 * 60 * 1000, location: 'ميناء العقبة، الأردن', status: 'delivered', description: 'تم التسليم' },
  
  // Container 2 (delivered)
  { containerId: containerIds[1], eventDate: Date.now() - 30 * 24 * 60 * 60 * 1000, location: 'إسطنبول، تركيا', status: 'departed', description: 'غادرت الميناء' },
  { containerId: containerIds[1], eventDate: Date.now() - 20 * 24 * 60 * 60 * 1000, location: 'البحر المتوسط', status: 'in_transit', description: 'في الطريق' },
  { containerId: containerIds[1], eventDate: Date.now() - 10 * 24 * 60 * 60 * 1000, location: 'ميناء العقبة، الأردن', status: 'arrived', description: 'وصلت إلى الميناء' },
  { containerId: containerIds[1], eventDate: Date.now() - 9 * 24 * 60 * 60 * 1000, location: 'ميناء العقبة، الأردن', status: 'delivered', description: 'تم التسليم' },
  
  // Container 3 (delivered)
  { containerId: containerIds[2], eventDate: Date.now() - 60 * 24 * 60 * 60 * 1000, location: 'هامبورغ، ألمانيا', status: 'departed', description: 'غادرت الميناء' },
  { containerId: containerIds[2], eventDate: Date.now() - 45 * 24 * 60 * 60 * 1000, location: 'قناة السويس', status: 'in_transit', description: 'عبور قناة السويس' },
  { containerId: containerIds[2], eventDate: Date.now() - 30 * 24 * 60 * 60 * 1000, location: 'ميناء العقبة، الأردن', status: 'arrived', description: 'وصلت إلى الميناء' },
  { containerId: containerIds[2], eventDate: Date.now() - 29 * 24 * 60 * 60 * 1000, location: 'ميناء العقبة، الأردن', status: 'delivered', description: 'تم التسليم' },
  
  // Container 5 (in_transit)
  { containerId: containerIds[4], eventDate: Date.now() - 20 * 24 * 60 * 60 * 1000, location: 'قوانغتشو، الصين', status: 'departed', description: 'غادرت الميناء' },
  { containerId: containerIds[4], eventDate: Date.now() - 10 * 24 * 60 * 60 * 1000, location: 'سنغافورة', status: 'in_transit', description: 'في الطريق - توقف في سنغافورة' },
  { containerId: containerIds[4], eventDate: Date.now() - 3 * 24 * 60 * 60 * 1000, location: 'قناة السويس', status: 'in_transit', description: 'عبور قناة السويس' },
  
  // Container 6 (in_transit)
  { containerId: containerIds[5], eventDate: Date.now() - 10 * 24 * 60 * 60 * 1000, location: 'مومباي، الهند', status: 'departed', description: 'غادرت الميناء' },
  { containerId: containerIds[5], eventDate: Date.now() - 5 * 24 * 60 * 60 * 1000, location: 'البحر الأحمر', status: 'in_transit', description: 'في الطريق' },
];

for (const event of trackingEvents) {
  await db.insert(schema.containerTrackingEvents).values(event);
  console.log(`  ✅ تمت إضافة حدث: ${event.location} - ${event.status}`);
}

console.log('\n✅ تمت إضافة جميع البيانات التجريبية بنجاح!');
console.log('\n📊 ملخص البيانات المضافة:');
console.log(`  - ${suppliers.length} موردين`);
console.log(`  - ${payments.length} دفعات`);
console.log(`  - ${items.length} صنف`);
console.log(`  - ${shipments.length} شحنات`);
console.log(`  - ${containers.length} حاويات`);
console.log(`  - ${trackingEvents.length} حدث تتبع`);

await connection.end();
process.exit(0);
