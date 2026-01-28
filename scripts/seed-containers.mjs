import mysql from 'mysql2/promise';

// بيانات تجريبية للحاويات مع مواقع جغرافية واقعية
const sampleContainers = [
  {
    userId: 1,
    containerNumber: 'MAEU1234567',
    containerType: '40ft',
    sealNumber: 'SEAL001234',
    shippingCompany: 'Maersk Line',
    billOfLadingNumber: 'MAEU-BL-2026-001',
    portOfLoading: 'ميناء شنغهاي، الصين',
    portOfDischarge: 'ميناء العقبة، الأردن',
    loadingDate: '2026-01-15',
    estimatedArrivalDate: '2026-02-10',
    actualArrivalDate: null,
    status: 'in_transit',
    notes: 'شحنة إلكترونيات - معدات حاسوب',
    currentLat: 25.2744,
    currentLng: 55.2962
  },
  {
    userId: 1,
    containerNumber: 'MSCU7654321',
    containerType: '20ft',
    sealNumber: 'SEAL002345',
    shippingCompany: 'MSC',
    billOfLadingNumber: 'MSC-BL-2026-002',
    portOfLoading: 'ميناء جبل علي، الإمارات',
    portOfDischarge: 'ميناء العقبة، الأردن',
    loadingDate: '2026-01-20',
    estimatedArrivalDate: '2026-01-28',
    actualArrivalDate: '2026-01-27',
    status: 'arrived',
    notes: 'قطع غيار سيارات',
    currentLat: 29.5266,
    currentLng: 35.0078
  },
  {
    userId: 1,
    containerNumber: 'CMAU9876543',
    containerType: '40ftHC',
    sealNumber: 'SEAL003456',
    shippingCompany: 'CMA CGM',
    billOfLadingNumber: 'CMA-BL-2026-003',
    portOfLoading: 'ميناء روتردام، هولندا',
    portOfDischarge: 'ميناء العقبة، الأردن',
    loadingDate: '2026-01-10',
    estimatedArrivalDate: '2026-02-05',
    actualArrivalDate: '2026-02-03',
    status: 'cleared',
    notes: 'آلات صناعية - معدات تصنيع',
    currentLat: 31.9539,
    currentLng: 35.9106
  },
  {
    userId: 1,
    containerNumber: 'HLCU5432109',
    containerType: '40ft',
    sealNumber: 'SEAL004567',
    shippingCompany: 'Hapag-Lloyd',
    billOfLadingNumber: 'HL-BL-2026-004',
    portOfLoading: 'ميناء بوسان، كوريا الجنوبية',
    portOfDischarge: 'ميناء العقبة، الأردن',
    loadingDate: '2026-01-05',
    estimatedArrivalDate: '2026-02-15',
    actualArrivalDate: null,
    status: 'in_transit',
    notes: 'أجهزة كهربائية منزلية',
    currentLat: 12.8797,
    currentLng: 45.0345
  },
  {
    userId: 1,
    containerNumber: 'OOLU8765432',
    containerType: '20ft',
    sealNumber: 'SEAL005678',
    shippingCompany: 'OOCL',
    billOfLadingNumber: 'OOCL-BL-2026-005',
    portOfLoading: 'ميناء سنغافورة',
    portOfDischarge: 'ميناء العقبة، الأردن',
    loadingDate: '2026-01-18',
    estimatedArrivalDate: '2026-02-08',
    actualArrivalDate: null,
    status: 'delayed',
    notes: 'مواد غذائية - تأخير بسبب الطقس',
    currentLat: 21.4858,
    currentLng: 39.1925
  },
  {
    userId: 1,
    containerNumber: 'EGLV3210987',
    containerType: '45ft',
    sealNumber: 'SEAL006789',
    shippingCompany: 'Evergreen',
    billOfLadingNumber: 'EGL-BL-2026-006',
    portOfLoading: 'ميناء هامبورغ، ألمانيا',
    portOfDischarge: 'ميناء العقبة، الأردن',
    loadingDate: '2026-01-22',
    estimatedArrivalDate: '2026-02-18',
    actualArrivalDate: null,
    status: 'in_transit',
    notes: 'معدات طبية',
    currentLat: 35.5138,
    currentLng: 24.0180
  }
];

// أحداث التتبع التجريبية
const sampleTrackingEvents = [
  // أحداث للحاوية الأولى MAEU1234567
  { containerIndex: 0, eventType: 'booking_confirmed', eventLocation: 'شنغهاي، الصين', eventDescription: 'تم تأكيد الحجز', eventDateTime: '2026-01-10 10:00:00' },
  { containerIndex: 0, eventType: 'container_loaded', eventLocation: 'ميناء شنغهاي', eventDescription: 'تم تحميل الحاوية على السفينة', eventDateTime: '2026-01-15 08:30:00' },
  { containerIndex: 0, eventType: 'departed_port', eventLocation: 'ميناء شنغهاي', eventDescription: 'غادرت السفينة الميناء', eventDateTime: '2026-01-15 14:00:00' },
  { containerIndex: 0, eventType: 'in_transit', eventLocation: 'البحر الأحمر', eventDescription: 'في الطريق - المحيط الهندي', eventDateTime: '2026-01-25 09:00:00' },
  
  // أحداث للحاوية الثانية MSCU7654321
  { containerIndex: 1, eventType: 'booking_confirmed', eventLocation: 'دبي، الإمارات', eventDescription: 'تم تأكيد الحجز', eventDateTime: '2026-01-18 09:00:00' },
  { containerIndex: 1, eventType: 'container_loaded', eventLocation: 'ميناء جبل علي', eventDescription: 'تم تحميل الحاوية', eventDateTime: '2026-01-20 07:00:00' },
  { containerIndex: 1, eventType: 'departed_port', eventLocation: 'ميناء جبل علي', eventDescription: 'غادرت السفينة', eventDateTime: '2026-01-20 16:00:00' },
  { containerIndex: 1, eventType: 'arrived_port', eventLocation: 'ميناء العقبة', eventDescription: 'وصلت السفينة إلى الميناء', eventDateTime: '2026-01-27 06:00:00' },
  
  // أحداث للحاوية الثالثة CMAU9876543
  { containerIndex: 2, eventType: 'booking_confirmed', eventLocation: 'روتردام، هولندا', eventDescription: 'تم تأكيد الحجز', eventDateTime: '2026-01-05 11:00:00' },
  { containerIndex: 2, eventType: 'container_loaded', eventLocation: 'ميناء روتردام', eventDescription: 'تم تحميل الحاوية', eventDateTime: '2026-01-10 09:00:00' },
  { containerIndex: 2, eventType: 'departed_port', eventLocation: 'ميناء روتردام', eventDescription: 'غادرت السفينة', eventDateTime: '2026-01-10 18:00:00' },
  { containerIndex: 2, eventType: 'arrived_port', eventLocation: 'ميناء العقبة', eventDescription: 'وصلت السفينة', eventDateTime: '2026-02-03 07:00:00' },
  { containerIndex: 2, eventType: 'customs_clearance_started', eventLocation: 'جمرك العقبة', eventDescription: 'بدء إجراءات التخليص الجمركي', eventDateTime: '2026-02-03 10:00:00' },
  { containerIndex: 2, eventType: 'customs_clearance_completed', eventLocation: 'جمرك العقبة', eventDescription: 'تم التخليص الجمركي بنجاح', eventDateTime: '2026-02-04 14:00:00' },
  
  // أحداث للحاوية الرابعة HLCU5432109
  { containerIndex: 3, eventType: 'booking_confirmed', eventLocation: 'بوسان، كوريا', eventDescription: 'تم تأكيد الحجز', eventDateTime: '2026-01-02 08:00:00' },
  { containerIndex: 3, eventType: 'container_loaded', eventLocation: 'ميناء بوسان', eventDescription: 'تم تحميل الحاوية', eventDateTime: '2026-01-05 06:00:00' },
  { containerIndex: 3, eventType: 'departed_port', eventLocation: 'ميناء بوسان', eventDescription: 'غادرت السفينة', eventDateTime: '2026-01-05 15:00:00' },
  { containerIndex: 3, eventType: 'in_transit', eventLocation: 'خليج عدن', eventDescription: 'في الطريق - خليج عدن', eventDateTime: '2026-01-28 12:00:00' },
  
  // أحداث للحاوية الخامسة OOLU8765432 (متأخرة)
  { containerIndex: 4, eventType: 'booking_confirmed', eventLocation: 'سنغافورة', eventDescription: 'تم تأكيد الحجز', eventDateTime: '2026-01-15 10:00:00' },
  { containerIndex: 4, eventType: 'container_loaded', eventLocation: 'ميناء سنغافورة', eventDescription: 'تم تحميل الحاوية', eventDateTime: '2026-01-18 08:00:00' },
  { containerIndex: 4, eventType: 'departed_port', eventLocation: 'ميناء سنغافورة', eventDescription: 'غادرت السفينة', eventDateTime: '2026-01-18 17:00:00' },
  { containerIndex: 4, eventType: 'delayed', eventLocation: 'البحر الأحمر', eventDescription: 'تأخير بسبب سوء الأحوال الجوية', eventDateTime: '2026-01-26 09:00:00' },
  
  // أحداث للحاوية السادسة EGLV3210987
  { containerIndex: 5, eventType: 'booking_confirmed', eventLocation: 'هامبورغ، ألمانيا', eventDescription: 'تم تأكيد الحجز', eventDateTime: '2026-01-19 09:00:00' },
  { containerIndex: 5, eventType: 'container_loaded', eventLocation: 'ميناء هامبورغ', eventDescription: 'تم تحميل الحاوية', eventDateTime: '2026-01-22 07:00:00' },
  { containerIndex: 5, eventType: 'departed_port', eventLocation: 'ميناء هامبورغ', eventDescription: 'غادرت السفينة', eventDateTime: '2026-01-22 16:00:00' },
  { containerIndex: 5, eventType: 'in_transit', eventLocation: 'البحر المتوسط', eventDescription: 'في الطريق - البحر المتوسط', eventDateTime: '2026-01-28 10:00:00' }
];

async function seedContainers() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'gateway01.eu-central-1.prod.aws.tidbcloud.com',
    port: parseInt(process.env.DB_PORT || '4000'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
      rejectUnauthorized: true
    }
  });

  try {
    console.log('🚀 بدء إضافة بيانات الحاويات التجريبية...');
    
    // حذف البيانات القديمة
    await connection.execute('DELETE FROM tracking_events');
    await connection.execute('DELETE FROM containers');
    console.log('✅ تم حذف البيانات القديمة');
    
    // إضافة الحاويات
    const containerIds = [];
    for (const container of sampleContainers) {
      const [result] = await connection.execute(
        `INSERT INTO containers (userId, containerNumber, containerType, sealNumber, shippingCompany, billOfLadingNumber, portOfLoading, portOfDischarge, loadingDate, estimatedArrivalDate, actualArrivalDate, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          container.userId,
          container.containerNumber,
          container.containerType,
          container.sealNumber,
          container.shippingCompany,
          container.billOfLadingNumber,
          container.portOfLoading,
          container.portOfDischarge,
          container.loadingDate,
          container.estimatedArrivalDate,
          container.actualArrivalDate,
          container.status,
          container.notes
        ]
      );
      containerIds.push(result.insertId);
      console.log(`✅ تم إضافة الحاوية: ${container.containerNumber}`);
    }
    
    // إضافة أحداث التتبع
    for (const event of sampleTrackingEvents) {
      const containerId = containerIds[event.containerIndex];
      await connection.execute(
        `INSERT INTO tracking_events (containerId, userId, eventType, eventLocation, eventDescription, eventDateTime) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          containerId,
          1,
          event.eventType,
          event.eventLocation,
          event.eventDescription,
          event.eventDateTime
        ]
      );
    }
    console.log(`✅ تم إضافة ${sampleTrackingEvents.length} حدث تتبع`);
    
    console.log('🎉 تم إضافة جميع البيانات التجريبية بنجاح!');
    console.log(`📦 عدد الحاويات: ${sampleContainers.length}`);
    console.log(`📍 عدد أحداث التتبع: ${sampleTrackingEvents.length}`);
    
  } catch (error) {
    console.error('❌ خطأ:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

seedContainers().catch(console.error);
