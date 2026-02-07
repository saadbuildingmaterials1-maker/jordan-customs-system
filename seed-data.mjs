import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './drizzle/schema.ts';

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'jordan_customs',
});

const db = drizzle(connection, { schema });

// Sample data
const sampleUsers = [
  {
    openId: 'user-001',
    name: 'أحمد محمد',
    email: 'ahmed@example.com',
    loginMethod: 'google',
    role: 'user',
  },
  {
    openId: 'user-002',
    name: 'فاطمة علي',
    email: 'fatima@example.com',
    loginMethod: 'manus',
    role: 'admin',
  },
];

const sampleDeclarations = [
  {
    userId: 1,
    declarationNumber: 'DEC-2024-001',
    registrationDate: new Date('2024-02-01'),
    clearanceCenter: 'مركز عمّان الجمركي',
    exchangeRate: '0.709',
    exportCountry: 'الصين',
    billOfLadingNumber: 'BL-2024-001',
    grossWeight: '1500.000',
    netWeight: '1400.000',
    numberOfPackages: 50,
    packageType: 'صناديق كرتونية',
    fobValue: '50000.000',
    fobValueJod: '35450.000',
    freightCost: '2500.000',
    insuranceCost: '500.000',
    customsDuty: '3545.000',
    salesTax: '5672.000',
    additionalFees: '0.000',
    totalCost: '47667.000',
    landedUnitCost: '31.778',
    status: 'مكتمل',
  },
  {
    userId: 1,
    declarationNumber: 'DEC-2024-002',
    registrationDate: new Date('2024-02-05'),
    clearanceCenter: 'مركز العقبة الجمركي',
    exchangeRate: '0.709',
    exportCountry: 'الهند',
    billOfLadingNumber: 'BL-2024-002',
    grossWeight: '2000.000',
    netWeight: '1900.000',
    numberOfPackages: 75,
    packageType: 'صناديق خشبية',
    fobValue: '75000.000',
    fobValueJod: '53175.000',
    freightCost: '3500.000',
    insuranceCost: '750.000',
    customsDuty: '5317.500',
    salesTax: '9508.000',
    additionalFees: '500.000',
    totalCost: '72750.500',
    landedUnitCost: '38.289',
    status: 'قيد المراجعة',
  },
];

const sampleShipments = [
  {
    userId: 1,
    shipmentNumber: 'SHIP-2024-001',
    containerNumber: 'CONT-001',
    status: 'في الطريق',
    origin: 'شنغهاي، الصين',
    destination: 'عمّان، الأردن',
    departureDate: new Date('2024-02-01'),
    estimatedArrival: new Date('2024-02-20'),
    currentLocation: 'البحر الأحمر',
    latitude: '20.5',
    longitude: '40.5',
    temperature: '25.5',
    humidity: '65',
    lastUpdate: new Date(),
  },
  {
    userId: 1,
    shipmentNumber: 'SHIP-2024-002',
    containerNumber: 'CONT-002',
    status: 'وصل',
    origin: 'دلهي، الهند',
    destination: 'عمّان، الأردن',
    departureDate: new Date('2024-01-25'),
    estimatedArrival: new Date('2024-02-10'),
    currentLocation: 'ميناء عمّان',
    latitude: '31.9454',
    longitude: '35.9284',
    temperature: '22.0',
    humidity: '70',
    lastUpdate: new Date(),
  },
];

const sampleInvoices = [
  {
    userId: 1,
    invoiceNumber: 'INV-2024-001',
    declarationId: 1,
    invoiceDate: new Date('2024-02-01'),
    dueDate: new Date('2024-02-15'),
    totalAmount: '47667.000',
    paidAmount: '47667.000',
    status: 'مدفوع',
    paymentMethod: 'تحويل بنكي',
    paymentDate: new Date('2024-02-10'),
    notes: 'تم الدفع كاملاً',
  },
  {
    userId: 1,
    invoiceNumber: 'INV-2024-002',
    declarationId: 2,
    invoiceDate: new Date('2024-02-05'),
    dueDate: new Date('2024-02-20'),
    totalAmount: '72750.500',
    paidAmount: '36375.250',
    status: 'جزئي',
    paymentMethod: 'بطاقة ائتمان',
    paymentDate: new Date('2024-02-12'),
    notes: 'دفعة أولى من الفاتورة',
  },
];

console.log('🌱 جاري إضافة البيانات التجريبية...');

try {
  // Insert users
  console.log('📝 إضافة المستخدمين...');
  for (const user of sampleUsers) {
    await db.insert(schema.users).values(user);
  }
  console.log('✅ تم إضافة المستخدمين');

  // Insert declarations
  console.log('📝 إضافة البيانات الجمركية...');
  for (const decl of sampleDeclarations) {
    await db.insert(schema.customsDeclarations).values(decl);
  }
  console.log('✅ تم إضافة البيانات الجمركية');

  // Insert shipments
  console.log('📝 إضافة الشحنات...');
  for (const ship of sampleShipments) {
    await db.insert(schema.shipments).values(ship);
  }
  console.log('✅ تم إضافة الشحنات');

  // Insert invoices
  console.log('📝 إضافة الفواتير...');
  for (const inv of sampleInvoices) {
    await db.insert(schema.invoices).values(inv);
  }
  console.log('✅ تم إضافة الفواتير');

  console.log('🎉 تم إضافة جميع البيانات التجريبية بنجاح!');
  process.exit(0);
} catch (error) {
  console.error('❌ خطأ:', error);
  process.exit(1);
}
