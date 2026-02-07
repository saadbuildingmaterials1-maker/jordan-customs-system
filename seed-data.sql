-- إضافة بيانات تجريبية للنظام

-- إضافة مستخدمين
INSERT INTO users (openId, name, email, loginMethod, role, createdAt, updatedAt, lastSignedIn) VALUES
('user-001', 'أحمد محمد', 'ahmed@example.com', 'google', 'user', NOW(), NOW(), NOW()),
('user-002', 'فاطمة علي', 'fatima@example.com', 'manus', 'admin', NOW(), NOW(), NOW()),
('user-003', 'محمود حسن', 'mahmoud@example.com', 'google', 'user', NOW(), NOW(), NOW()),
('user-004', 'سارة إبراهيم', 'sarah@example.com', 'manus', 'user', NOW(), NOW(), NOW());

-- إضافة بيانات جمركية
INSERT INTO customs_declarations (userId, declarationNumber, registrationDate, clearanceCenter, exchangeRate, exportCountry, billOfLadingNumber, grossWeight, netWeight, numberOfPackages, packageType, fobValue, fobValueJod, freightCost, insuranceCost, customsDuty, salesTax, additionalFees, totalCost, landedUnitCost, status, createdAt, updatedAt) VALUES
(1, 'DEC-2024-001', '2024-02-01', 'مركز عمّان الجمركي', 0.709, 'الصين', 'BL-2024-001', 1500.000, 1400.000, 50, 'صناديق كرتونية', 50000.000, 35450.000, 2500.000, 500.000, 3545.000, 5672.000, 0.000, 47667.000, 31.778, 'مكتمل', NOW(), NOW()),
(1, 'DEC-2024-002', '2024-02-05', 'مركز العقبة الجمركي', 0.709, 'الهند', 'BL-2024-002', 2000.000, 1900.000, 75, 'صناديق خشبية', 75000.000, 53175.000, 3500.000, 750.000, 5317.500, 9508.000, 500.000, 72750.500, 38.289, 'قيد المراجعة', NOW(), NOW()),
(2, 'DEC-2024-003', '2024-02-10', 'مركز عمّان الجمركي', 0.709, 'تايلاند', 'BL-2024-003', 1200.000, 1100.000, 40, 'صناديق معدنية', 35000.000, 24815.000, 1800.000, 350.000, 2481.500, 3970.400, 250.000, 33666.900, 30.606, 'معلق', NOW(), NOW()),
(3, 'DEC-2024-004', '2024-02-15', 'مركز العقبة الجمركي', 0.709, 'فيتنام', 'BL-2024-004', 1800.000, 1700.000, 60, 'صناديق كرتونية', 60000.000, 42540.000, 3000.000, 600.000, 4254.000, 6810.400, 0.000, 57204.400, 33.649, 'مكتمل', NOW(), NOW());

-- إضافة شحنات
INSERT INTO shipments (userId, shipmentNumber, containerNumber, status, origin, destination, departureDate, estimatedArrival, currentLocation, latitude, longitude, temperature, humidity, lastUpdate, createdAt, updatedAt) VALUES
(1, 'SHIP-2024-001', 'CONT-001', 'في الطريق', 'شنغهاي، الصين', 'عمّان، الأردن', '2024-02-01', '2024-02-20', 'البحر الأحمر', 20.5, 40.5, 25.5, 65, NOW(), NOW(), NOW()),
(1, 'SHIP-2024-002', 'CONT-002', 'وصل', 'دلهي، الهند', 'عمّان، الأردن', '2024-01-25', '2024-02-10', 'ميناء عمّان', 31.9454, 35.9284, 22.0, 70, NOW(), NOW(), NOW()),
(2, 'SHIP-2024-003', 'CONT-003', 'في الطريق', 'بانكوك، تايلاند', 'عمّان، الأردن', '2024-02-08', '2024-02-25', 'خليج عمّان', 26.0, 56.0, 28.0, 60, NOW(), NOW(), NOW()),
(3, 'SHIP-2024-004', 'CONT-004', 'وصل', 'هوشي منه، فيتنام', 'عمّان، الأردن', '2024-01-20', '2024-02-12', 'مستودع عمّان', 31.9454, 35.9284, 20.0, 75, NOW(), NOW(), NOW());

-- إضافة فواتير
INSERT INTO invoices (userId, invoiceNumber, declarationId, invoiceDate, dueDate, totalAmount, paidAmount, status, paymentMethod, paymentDate, notes, createdAt, updatedAt) VALUES
(1, 'INV-2024-001', 1, '2024-02-01', '2024-02-15', 47667.000, 47667.000, 'مدفوع', 'تحويل بنكي', '2024-02-10', 'تم الدفع كاملاً', NOW(), NOW()),
(1, 'INV-2024-002', 2, '2024-02-05', '2024-02-20', 72750.500, 36375.250, 'جزئي', 'بطاقة ائتمان', '2024-02-12', 'دفعة أولى من الفاتورة', NOW(), NOW()),
(2, 'INV-2024-003', 3, '2024-02-10', '2024-02-25', 33666.900, 0.000, 'معلق', 'لم يتم الدفع', NULL, 'في انتظار الدفع', NOW(), NOW()),
(3, 'INV-2024-004', 4, '2024-02-15', '2024-03-01', 57204.400, 57204.400, 'مدفوع', 'تحويل بنكي', '2024-02-18', 'تم الدفع كاملاً', NOW(), NOW());

-- إضافة عناصر البيان الجمركي
INSERT INTO declaration_items (declarationId, itemNumber, description, quantity, unit, unitPrice, totalPrice, hsCode, origin, createdAt, updatedAt) VALUES
(1, 1, 'أجهزة إلكترونية', 100, 'وحدة', 500.00, 50000.00, '8471.30', 'الصين', NOW(), NOW()),
(2, 1, 'ملابس وأنسجة', 500, 'كيس', 150.00, 75000.00, '6204.62', 'الهند', NOW(), NOW()),
(3, 1, 'قطع غيار سيارات', 200, 'وحدة', 175.00, 35000.00, '8708.99', 'تايلاند', NOW(), NOW()),
(4, 1, 'أثاث منزلي', 80, 'قطعة', 750.00, 60000.00, '9403.20', 'فيتنام', NOW(), NOW());

-- إضافة تحديثات الشحنات
INSERT INTO shipment_updates (shipmentId, status, location, latitude, longitude, temperature, humidity, notes, createdAt) VALUES
(1, 'في الطريق', 'قناة السويس', 29.9, 32.5, 26.0, 62, 'عبور قناة السويس', NOW()),
(2, 'وصل', 'ميناء عمّان', 31.9454, 35.9284, 22.0, 70, 'وصول آمن إلى الميناء', NOW()),
(3, 'في الطريق', 'بحر العرب', 18.0, 60.0, 29.0, 58, 'في منتصف الطريق', NOW()),
(4, 'وصل', 'مستودع عمّان', 31.9454, 35.9284, 20.0, 75, 'تم تفريغ الحاوية', NOW());
