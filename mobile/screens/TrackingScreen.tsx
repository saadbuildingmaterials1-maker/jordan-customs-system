import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';

interface Shipment {
  id: string;
  trackingNumber: string;
  status: 'pending' | 'shipped' | 'in_transit' | 'delivered';
  origin: string;
  destination: string;
  estimatedDelivery: string;
  lastUpdate: string;
  progress: number;
}

const TrackingScreen: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      // محاكاة جلب البيانات من الخادم
      const mockShipments: Shipment[] = [
        {
          id: '1',
          trackingNumber: 'JO-2024-001',
          status: 'in_transit',
          origin: 'Shanghai',
          destination: 'Amman',
          estimatedDelivery: '2024-02-15',
          lastUpdate: '2024-02-08 14:30',
          progress: 65,
        },
        {
          id: '2',
          trackingNumber: 'JO-2024-002',
          status: 'shipped',
          origin: 'Bangkok',
          destination: 'Amman',
          estimatedDelivery: '2024-02-20',
          lastUpdate: '2024-02-08 10:00',
          progress: 30,
        },
        {
          id: '3',
          trackingNumber: 'JO-2024-003',
          status: 'delivered',
          origin: 'Dubai',
          destination: 'Amman',
          estimatedDelivery: '2024-02-05',
          lastUpdate: '2024-02-05 16:45',
          progress: 100,
        },
      ];
      setShipments(mockShipments);
    } catch (error) {
      console.error('Error fetching shipments:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchShipments();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FFA500';
      case 'shipped':
        return '#4CAF50';
      case 'in_transit':
        return '#2196F3';
      case 'delivered':
        return '#8BC34A';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      pending: 'قيد الانتظار',
      shipped: 'تم الشحن',
      in_transit: 'قيد النقل',
      delivered: 'تم التسليم',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>تتبع الشحنات</Text>
        <Text style={styles.subtitle}>عدد الشحنات النشطة: {shipments.length}</Text>
      </View>

      {shipments.map((shipment) => (
        <TouchableOpacity key={shipment.id} style={styles.shipmentCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.trackingNumber}>{shipment.trackingNumber}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(shipment.status) },
              ]}
            >
              <Text style={styles.statusText}>{getStatusLabel(shipment.status)}</Text>
            </View>
          </View>

          <View style={styles.routeInfo}>
            <Text style={styles.location}>{shipment.origin}</Text>
            <View style={styles.arrow}>
              <Text>→</Text>
            </View>
            <Text style={styles.location}>{shipment.destination}</Text>
          </View>

          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${shipment.progress}%`,
                  backgroundColor: getStatusColor(shipment.status),
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{shipment.progress}% مكتمل</Text>

          <View style={styles.detailsRow}>
            <Text style={styles.detailLabel}>التسليم المتوقع:</Text>
            <Text style={styles.detailValue}>{shipment.estimatedDelivery}</Text>
          </View>

          <View style={styles.detailsRow}>
            <Text style={styles.detailLabel}>آخر تحديث:</Text>
            <Text style={styles.detailValue}>{shipment.lastUpdate}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  shipmentCard: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  trackingNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  routeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  location: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  arrow: {
    marginHorizontal: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
  },
  detailValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
});

export default TrackingScreen;
