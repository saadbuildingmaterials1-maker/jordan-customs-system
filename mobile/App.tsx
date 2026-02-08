import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

interface ShippingData {
  id: string;
  origin: string;
  destination: string;
  weight: number;
  cost: number;
  status: 'pending' | 'in_transit' | 'delivered';
  timestamp: string;
}

interface SyncState {
  isSyncing: boolean;
  lastSync: string | null;
  isOnline: boolean;
  pendingChanges: number;
}

export default function App() {
  const [shippingData, setShippingData] = useState<ShippingData[]>([]);
  const [syncState, setSyncState] = useState<SyncState>({
    isSyncing: false,
    lastSync: null,
    isOnline: true,
    pendingChanges: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'shipments' | 'alerts' | 'settings'>('home');

  // Initialize app and check network status
  useEffect(() => {
    initializeApp();
    setupNetworkListener();
  }, []);

  // Setup network listener
  const setupNetworkListener = async () => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setSyncState((prev) => ({
        ...prev,
        isOnline: state.isConnected ?? false,
      }));

      // Auto-sync when connection is restored
      if (state.isConnected) {
        syncWithServer();
      }
    });

    return unsubscribe;
  };

  // Initialize app with local data
  const initializeApp = async () => {
    try {
      // Load local data
      const localData = await AsyncStorage.getItem('shippingData');
      if (localData) {
        setShippingData(JSON.parse(localData));
      }

      // Load sync state
      const lastSync = await AsyncStorage.getItem('lastSync');
      setSyncState((prev) => ({
        ...prev,
        lastSync: lastSync,
      }));

      // Load pending changes
      const pending = await AsyncStorage.getItem('pendingChanges');
      if (pending) {
        setSyncState((prev) => ({
          ...prev,
          pendingChanges: JSON.parse(pending).length,
        }));
      }

      // Try to sync if online
      if (syncState.isOnline) {
        await syncWithServer();
      }
    } catch (error) {
      console.error('Failed to initialize app:', error);
      Alert.alert('خطأ', 'فشل تحميل البيانات');
    }
  };

  // Sync with server
  const syncWithServer = async () => {
    if (!syncState.isOnline) {
      Alert.alert('تنبيه', 'لا توجد اتصال بالإنترنت');
      return;
    }

    setSyncState((prev) => ({ ...prev, isSyncing: true }));

    try {
      // Fetch data from server
      const response = await fetch('https://your-api.com/api/shipments', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer YOUR_API_KEY',
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const serverData = await response.json();
        
        // Merge with local data
        const mergedData = mergeData(shippingData, serverData);
        setShippingData(mergedData);

        // Save to local storage
        await AsyncStorage.setItem('shippingData', JSON.stringify(mergedData));
        await AsyncStorage.setItem('lastSync', new Date().toISOString());

        // Clear pending changes
        await AsyncStorage.removeItem('pendingChanges');

        setSyncState((prev) => ({
          ...prev,
          lastSync: new Date().toISOString(),
          pendingChanges: 0,
        }));

        Alert.alert('نجح', 'تم مزامنة البيانات بنجاح');
      } else {
        Alert.alert('خطأ', 'فشل في الاتصال بالخادم');
      }
    } catch (error) {
      console.error('Sync failed:', error);
      Alert.alert('خطأ', 'فشل في مزامنة البيانات');
    } finally {
      setSyncState((prev) => ({ ...prev, isSyncing: false }));
    }
  };

  // Merge local and server data
  const mergeData = (local: ShippingData[], server: ShippingData[]): ShippingData[] => {
    const merged = [...local];
    
    server.forEach((serverItem) => {
      const existingIndex = merged.findIndex((item) => item.id === serverItem.id);
      
      if (existingIndex >= 0) {
        // Update existing item
        const localTimestamp = new Date(merged[existingIndex].timestamp).getTime();
        const serverTimestamp = new Date(serverItem.timestamp).getTime();
        
        if (serverTimestamp > localTimestamp) {
          merged[existingIndex] = serverItem;
        }
      } else {
        // Add new item
        merged.push(serverItem);
      }
    });

    return merged;
  };

  // Add new shipment
  const addShipment = async (shipment: Omit<ShippingData, 'id' | 'timestamp'>) => {
    const newShipment: ShippingData = {
      ...shipment,
      id: `ship_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    const updated = [...shippingData, newShipment];
    setShippingData(updated);

    // Save to local storage
    await AsyncStorage.setItem('shippingData', JSON.stringify(updated));

    // Add to pending changes
    const pending = await AsyncStorage.getItem('pendingChanges');
    const pendingList = pending ? JSON.parse(pending) : [];
    pendingList.push(newShipment);
    await AsyncStorage.setItem('pendingChanges', JSON.stringify(pendingList));

    setSyncState((prev) => ({
      ...prev,
      pendingChanges: prev.pendingChanges + 1,
    }));

    // Try to sync if online
    if (syncState.isOnline) {
      await syncWithServer();
    }
  };

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await syncWithServer();
    setRefreshing(false);
  };

  // Render home screen
  const renderHome = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>نظام إدارة الشحن</Text>
        <Text style={styles.subtitle}>إدارة الشحنات والجمارك بسهولة</Text>
      </View>

      {/* Sync Status */}
      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>حالة المزامنة</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>الاتصال:</Text>
          <Text style={[styles.statusValue, syncState.isOnline ? styles.online : styles.offline]}>
            {syncState.isOnline ? 'متصل' : 'غير متصل'}
          </Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>آخر مزامنة:</Text>
          <Text style={styles.statusValue}>
            {syncState.lastSync ? new Date(syncState.lastSync).toLocaleDateString('ar-JO') : 'لم تتم'}
          </Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>تغييرات معلقة:</Text>
          <Text style={styles.statusValue}>{syncState.pendingChanges}</Text>
        </View>
      </View>

      {/* Sync Button */}
      <TouchableOpacity
        style={[styles.syncButton, syncState.isSyncing && styles.syncButtonDisabled]}
        onPress={syncWithServer}
        disabled={syncState.isSyncing}
      >
        {syncState.isSyncing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.syncButtonText}>مزامنة الآن</Text>
        )}
      </TouchableOpacity>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{shippingData.length}</Text>
          <Text style={styles.statLabel}>إجمالي الشحنات</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {shippingData.filter((s) => s.status === 'delivered').length}
          </Text>
          <Text style={styles.statLabel}>مسلمة</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {shippingData.filter((s) => s.status === 'in_transit').length}
          </Text>
          <Text style={styles.statLabel}>قيد الشحن</Text>
        </View>
      </View>
    </ScrollView>
  );

  // Render shipments screen
  const renderShipments = () => (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.screenTitle}>الشحنات</Text>
      
      {shippingData.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>لا توجد شحنات</Text>
        </View>
      ) : (
        shippingData.map((shipment) => (
          <View key={shipment.id} style={styles.shipmentCard}>
            <View style={styles.shipmentHeader}>
              <Text style={styles.shipmentId}>{shipment.id}</Text>
              <Text style={[styles.statusBadge, styles[`status_${shipment.status}`]]}>
                {shipment.status === 'delivered' && 'مسلمة'}
                {shipment.status === 'in_transit' && 'قيد الشحن'}
                {shipment.status === 'pending' && 'معلقة'}
              </Text>
            </View>
            <View style={styles.shipmentDetails}>
              <Text style={styles.detailText}>من: {shipment.origin}</Text>
              <Text style={styles.detailText}>إلى: {shipment.destination}</Text>
              <Text style={styles.detailText}>الوزن: {shipment.weight} كغ</Text>
              <Text style={styles.detailText}>التكلفة: {shipment.cost} JOD</Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );

  // Render alerts screen
  const renderAlerts = () => (
    <ScrollView style={styles.container}>
      <Text style={styles.screenTitle}>التنبيهات</Text>
      <View style={styles.alertCard}>
        <Text style={styles.alertTitle}>✓ نظام التنبيهات الذكية</Text>
        <Text style={styles.alertText}>
          سيتم إرسال تنبيهات فورية عند:
        </Text>
        <Text style={styles.alertItem}>• تحديث حالة الشحنة</Text>
        <Text style={styles.alertItem}>• تغيير الأسعار</Text>
        <Text style={styles.alertItem}>• مشاكل في الشحن</Text>
      </View>
    </ScrollView>
  );

  // Render settings screen
  const renderSettings = () => (
    <ScrollView style={styles.container}>
      <Text style={styles.screenTitle}>الإعدادات</Text>
      <View style={styles.settingsCard}>
        <Text style={styles.settingLabel}>إصدار التطبيق</Text>
        <Text style={styles.settingValue}>1.0.0</Text>
      </View>
      <View style={styles.settingsCard}>
        <Text style={styles.settingLabel}>حجم البيانات المحلية</Text>
        <Text style={styles.settingValue}>
          {(JSON.stringify(shippingData).length / 1024).toFixed(2)} KB
        </Text>
      </View>
      <TouchableOpacity style={styles.dangerButton}>
        <Text style={styles.dangerButtonText}>حذف البيانات المحلية</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <View style={styles.app}>
      {/* Content */}
      {activeTab === 'home' && renderHome()}
      {activeTab === 'shipments' && renderShipments()}
      {activeTab === 'alerts' && renderAlerts()}
      {activeTab === 'settings' && renderSettings()}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'home' && styles.navItemActive]}
          onPress={() => setActiveTab('home')}
        >
          <Text style={styles.navLabel}>الرئيسية</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'shipments' && styles.navItemActive]}
          onPress={() => setActiveTab('shipments')}
        >
          <Text style={styles.navLabel}>الشحنات</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'alerts' && styles.navItemActive]}
          onPress={() => setActiveTab('alerts')}
        >
          <Text style={styles.navLabel}>التنبيهات</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'settings' && styles.navItemActive]}
          onPress={() => setActiveTab('settings')}
        >
          <Text style={styles.navLabel}>الإعدادات</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 60,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1a1a1a',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  online: {
    color: '#10b981',
  },
  offline: {
    color: '#ef4444',
  },
  syncButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  syncButtonDisabled: {
    opacity: 0.6,
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  shipmentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shipmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  shipmentId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  status_delivered: {
    backgroundColor: '#10b981',
  },
  status_in_transit: {
    backgroundColor: '#f59e0b',
  },
  status_pending: {
    backgroundColor: '#6b7280',
  },
  shipmentDetails: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
  },
  alertCard: {
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
  },
  alertText: {
    fontSize: 14,
    color: '#1e40af',
    marginBottom: 8,
  },
  alertItem: {
    fontSize: 13,
    color: '#1e40af',
    marginBottom: 4,
  },
  settingsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 14,
    color: '#666',
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  dangerButton: {
    backgroundColor: '#ef4444',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    height: 60,
  },
  navItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 3,
    borderTopColor: 'transparent',
  },
  navItemActive: {
    borderTopColor: '#3b82f6',
  },
  navLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});
