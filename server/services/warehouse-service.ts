/**
 * Warehouse Service
 * 
 * خدمة إدارة المستودعات والمخزون
 * تتبع المخزون وإدارة الشحنات من المستودعات المختلفة
 * 
 * @module server/services/warehouse-service
 */

/**
 * معلومات المستودع
 */
export interface Warehouse {
  id: string;
  name: string;
  location: string;
  country: string;
  capacity: number;
  currentStock: number;
  manager: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive' | 'maintenance';
}

/**
 * معلومات المنتج في المستودع
 */
export interface WarehouseProduct {
  id: string;
  productId: string;
  productName: string;
  warehouseId: string;
  quantity: number;
  minStock: number;
  maxStock: number;
  location: string;
  lastUpdated: Date;
  expiryDate?: Date;
}

/**
 * معلومات الشحنة
 */
export interface Shipment {
  id: string;
  shipmentNumber: string;
  sourceWarehouseId: string;
  destinationWarehouseId: string;
  products: Array<{
    productId: string;
    quantity: number;
  }>;
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
  createdDate: Date;
  estimatedDelivery: Date;
  actualDelivery?: Date;
  trackingNumber?: string;
}

/**
 * تنبيه المخزون
 */
export interface StockAlert {
  id: string;
  productId: string;
  productName: string;
  warehouseId: string;
  currentStock: number;
  minStock: number;
  alertType: 'low_stock' | 'out_of_stock' | 'overstock';
  severity: 'low' | 'medium' | 'high';
  createdDate: Date;
  acknowledged: boolean;
}

/**
 * خدمة المستودعات
 */
export class WarehouseService {
  private warehouses: Map<string, Warehouse> = new Map();
  private products: Map<string, WarehouseProduct> = new Map();
  private shipments: Map<string, Shipment> = new Map();
  private alerts: Map<string, StockAlert> = new Map();

  constructor() {
    this.initializeDefaultWarehouses();
    console.log('✅ تم تهيئة خدمة المستودعات');
  }

  /**
   * تهيئة المستودعات الافتراضية
   */
  private initializeDefaultWarehouses(): void {
    const defaultWarehouses: Warehouse[] = [
      {
        id: 'wh-amman',
        name: 'مستودع عمّان الرئيسي',
        location: 'عمّان',
        country: 'JO',
        capacity: 10000,
        currentStock: 5000,
        manager: 'أحمد محمد',
        phone: '+962-6-123-4567',
        email: 'amman@warehouse.jo',
        status: 'active',
      },
      {
        id: 'wh-zarqa',
        name: 'مستودع الزرقاء',
        location: 'الزرقاء',
        country: 'JO',
        capacity: 8000,
        currentStock: 3500,
        manager: 'فاطمة علي',
        phone: '+962-5-234-5678',
        email: 'zarqa@warehouse.jo',
        status: 'active',
      },
      {
        id: 'wh-aqaba',
        name: 'مستودع العقبة',
        location: 'العقبة',
        country: 'JO',
        capacity: 5000,
        currentStock: 2000,
        manager: 'محمود سالم',
        phone: '+962-3-345-6789',
        email: 'aqaba@warehouse.jo',
        status: 'active',
      },
      {
        id: 'wh-dubai',
        name: 'مستودع دبي',
        location: 'دبي',
        country: 'AE',
        capacity: 15000,
        currentStock: 8000,
        manager: 'علي محمود',
        phone: '+971-4-456-7890',
        email: 'dubai@warehouse.ae',
        status: 'active',
      },
    ];

    defaultWarehouses.forEach((wh) => {
      this.warehouses.set(wh.id, wh);
    });

    console.log(`✅ تم إنشاء ${defaultWarehouses.length} مستودعات افتراضية`);
  }

  /**
   * الحصول على جميع المستودعات
   */
  getAllWarehouses(): Warehouse[] {
    return Array.from(this.warehouses.values());
  }

  /**
   * الحصول على مستودع محدد
   */
  getWarehouse(warehouseId: string): Warehouse | null {
    return this.warehouses.get(warehouseId) || null;
  }

  /**
   * إضافة مستودع جديد
   */
  addWarehouse(warehouse: Warehouse): boolean {
    try {
      if (this.warehouses.has(warehouse.id)) {
        console.error('❌ المستودع موجود بالفعل');
        return false;
      }

      this.warehouses.set(warehouse.id, warehouse);
      console.log(`✅ تم إضافة المستودع: ${warehouse.name}`);
      return true;
    } catch (error) {
      console.error('❌ خطأ في إضافة المستودع:', error);
      return false;
    }
  }

  /**
   * تحديث معلومات المستودع
   */
  updateWarehouse(warehouseId: string, updates: Partial<Warehouse>): boolean {
    try {
      const warehouse = this.warehouses.get(warehouseId);
      if (!warehouse) {
        console.error('❌ المستودع غير موجود');
        return false;
      }

      const updated = { ...warehouse, ...updates, id: warehouse.id };
      this.warehouses.set(warehouseId, updated);
      console.log(`✅ تم تحديث المستودع: ${warehouse.name}`);
      return true;
    } catch (error) {
      console.error('❌ خطأ في تحديث المستودع:', error);
      return false;
    }
  }

  /**
   * إضافة منتج إلى المستودع
   */
  addProductToWarehouse(product: WarehouseProduct): boolean {
    try {
      const productKey = `${product.warehouseId}-${product.productId}`;
      if (this.products.has(productKey)) {
        console.error('❌ المنتج موجود بالفعل في هذا المستودع');
        return false;
      }

      this.products.set(productKey, product);
      this.updateWarehouseStock(product.warehouseId, product.quantity);
      this.checkStockLevels(product.warehouseId, product.productId);

      console.log(`✅ تم إضافة المنتج: ${product.productName} إلى المستودع`);
      return true;
    } catch (error) {
      console.error('❌ خطأ في إضافة المنتج:', error);
      return false;
    }
  }

  /**
   * تحديث كمية المنتج
   */
  updateProductQuantity(
    warehouseId: string,
    productId: string,
    newQuantity: number
  ): boolean {
    try {
      const productKey = `${warehouseId}-${productId}`;
      const product = this.products.get(productKey);

      if (!product) {
        console.error('❌ المنتج غير موجود في هذا المستودع');
        return false;
      }

      const difference = newQuantity - product.quantity;
      product.quantity = newQuantity;
      product.lastUpdated = new Date();

      this.products.set(productKey, product);
      this.updateWarehouseStock(warehouseId, difference);
      this.checkStockLevels(warehouseId, productId);

      console.log(`✅ تم تحديث كمية المنتج: ${product.productName}`);
      return true;
    } catch (error) {
      console.error('❌ خطأ في تحديث كمية المنتج:', error);
      return false;
    }
  }

  /**
   * الحصول على المنتجات في المستودع
   */
  getWarehouseProducts(warehouseId: string): WarehouseProduct[] {
    return Array.from(this.products.values()).filter(
      (p) => p.warehouseId === warehouseId
    );
  }

  /**
   * إنشاء شحنة
   */
  createShipment(
    sourceWarehouseId: string,
    destinationWarehouseId: string,
    products: Array<{ productId: string; quantity: number }>
  ): Shipment | null {
    try {
      // التحقق من توفر المنتجات
      for (const item of products) {
        const productKey = `${sourceWarehouseId}-${item.productId}`;
        const product = this.products.get(productKey);

        if (!product || product.quantity < item.quantity) {
          console.error(`❌ المنتج ${item.productId} غير متوفر بالكمية المطلوبة`);
          return null;
        }
      }

      // إنشاء الشحنة
      const shipment: Shipment = {
        id: `ship-${Date.now()}`,
        shipmentNumber: `SHP-${Date.now()}`,
        sourceWarehouseId,
        destinationWarehouseId,
        products,
        status: 'pending',
        createdDate: new Date(),
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      // تحديث المخزون
      for (const item of products) {
        this.updateProductQuantity(
          sourceWarehouseId,
          item.productId,
          (this.products.get(`${sourceWarehouseId}-${item.productId}`)?.quantity || 0) -
            item.quantity
        );
      }

      this.shipments.set(shipment.id, shipment);
      console.log(`✅ تم إنشاء شحنة: ${shipment.shipmentNumber}`);
      return shipment;
    } catch (error) {
      console.error('❌ خطأ في إنشاء الشحنة:', error);
      return null;
    }
  }

  /**
   * تحديث حالة الشحنة
   */
  updateShipmentStatus(
    shipmentId: string,
    status: Shipment['status'],
    trackingNumber?: string
  ): boolean {
    try {
      const shipment = this.shipments.get(shipmentId);
      if (!shipment) {
        console.error('❌ الشحنة غير موجودة');
        return false;
      }

      shipment.status = status;
      if (trackingNumber) {
        shipment.trackingNumber = trackingNumber;
      }

      if (status === 'delivered') {
        shipment.actualDelivery = new Date();
        // إضافة المنتجات إلى المستودع الوجهة
        for (const item of shipment.products) {
          const destProductKey = `${shipment.destinationWarehouseId}-${item.productId}`;
          const destProduct = this.products.get(destProductKey);

          if (destProduct) {
            this.updateProductQuantity(
              shipment.destinationWarehouseId,
              item.productId,
              destProduct.quantity + item.quantity
            );
          } else {
            // إنشاء منتج جديد في المستودع الوجهة
            const sourceProduct = this.products.get(
              `${shipment.sourceWarehouseId}-${item.productId}`
            );
            if (sourceProduct) {
              this.addProductToWarehouse({
                ...sourceProduct,
                warehouseId: shipment.destinationWarehouseId,
                quantity: item.quantity,
              });
            }
          }
        }
      }

      this.shipments.set(shipmentId, shipment);
      console.log(`✅ تم تحديث حالة الشحنة: ${status}`);
      return true;
    } catch (error) {
      console.error('❌ خطأ في تحديث حالة الشحنة:', error);
      return false;
    }
  }

  /**
   * الحصول على الشحنات
   */
  getShipments(warehouseId?: string): Shipment[] {
    let shipments = Array.from(this.shipments.values());

    if (warehouseId) {
      shipments = shipments.filter(
        (s) => s.sourceWarehouseId === warehouseId || s.destinationWarehouseId === warehouseId
      );
    }

    return shipments;
  }

  /**
   * الحصول على تنبيهات المخزون
   */
  getStockAlerts(warehouseId?: string): StockAlert[] {
    let alerts = Array.from(this.alerts.values());

    if (warehouseId) {
      alerts = alerts.filter((a) => a.warehouseId === warehouseId);
    }

    return alerts;
  }

  /**
   * التحقق من مستويات المخزون
   */
  private checkStockLevels(warehouseId: string, productId: string): void {
    const productKey = `${warehouseId}-${productId}`;
    const product = this.products.get(productKey);

    if (!product) return;

    const alertKey = `${warehouseId}-${productId}`;
    const existingAlert = this.alerts.get(alertKey);

    // حذف التنبيه القديم إذا كان موجوداً
    if (existingAlert) {
      this.alerts.delete(alertKey);
    }

    // إنشاء تنبيه جديد إذا لزم الأمر
    if (product.quantity === 0) {
      this.alerts.set(alertKey, {
        id: alertKey,
        productId,
        productName: product.productName,
        warehouseId,
        currentStock: product.quantity,
        minStock: product.minStock,
        alertType: 'out_of_stock',
        severity: 'high',
        createdDate: new Date(),
        acknowledged: false,
      });
    } else if (product.quantity <= product.minStock) {
      this.alerts.set(alertKey, {
        id: alertKey,
        productId,
        productName: product.productName,
        warehouseId,
        currentStock: product.quantity,
        minStock: product.minStock,
        alertType: 'low_stock',
        severity: 'medium',
        createdDate: new Date(),
        acknowledged: false,
      });
    } else if (product.quantity >= product.maxStock) {
      this.alerts.set(alertKey, {
        id: alertKey,
        productId,
        productName: product.productName,
        warehouseId,
        currentStock: product.quantity,
        minStock: product.minStock,
        alertType: 'overstock',
        severity: 'low',
        createdDate: new Date(),
        acknowledged: false,
      });
    }
  }

  /**
   * تحديث مخزون المستودع
   */
  private updateWarehouseStock(warehouseId: string, quantity: number): void {
    const warehouse = this.warehouses.get(warehouseId);
    if (warehouse) {
      warehouse.currentStock += quantity;
    }
  }

  /**
   * الإقرار بالتنبيه
   */
  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.acknowledged = true;
      console.log(`✅ تم الإقرار بالتنبيه: ${alertId}`);
      return true;
    }
    return false;
  }

  /**
   * الحصول على تقرير المستودع
   */
  getWarehouseReport(warehouseId: string): any {
    const warehouse = this.warehouses.get(warehouseId);
    if (!warehouse) return null;

    const products = this.getWarehouseProducts(warehouseId);
    const shipments = this.getShipments(warehouseId);
    const alerts = this.getStockAlerts(warehouseId);

    return {
      warehouse,
      products: products.length,
      totalValue: products.reduce((sum, p) => sum + p.quantity, 0),
      shipments: shipments.length,
      activeShipments: shipments.filter((s) => s.status === 'in_transit').length,
      alerts: alerts.length,
      criticalAlerts: alerts.filter((a) => a.severity === 'high').length,
    };
  }
}

// تصدير مثيل واحد من الخدمة
export const warehouseService = new WarehouseService();
