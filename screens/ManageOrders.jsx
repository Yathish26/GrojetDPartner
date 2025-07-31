import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar, 
  FlatList, 
  TouchableOpacity, 
  Alert, 
  RefreshControl,
  TextInput,
  Modal,
  ScrollView
} from 'react-native';
import { 
  ArrowLeft, 
  Search, 
  ShoppingCart, 
  Plus, 
  MoreVertical, 
  MapPin,
  Clock,
  User,
  Truck,
  Phone,
  Package,
  IndianRupee,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import API_CONFIG, { makeAuthenticatedRequest } from '../config/api.js';

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  
  const navigation = useNavigation();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await makeAuthenticatedRequest('/admin/orders');
      
      if (response.success) {
        setOrders(response.orders || []);
      } else {
        Alert.alert('Error', 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
      Alert.alert('Error', 'Unable to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await makeAuthenticatedRequest(
        `/admin/orders/${orderId}/status`,
        {
          method: 'PUT',
          body: JSON.stringify({ status: newStatus })
        }
      );

      if (response.success) {
        setOrders(orders.map(order => 
          order._id === orderId ? { ...order, status: { ...order.status, current: newStatus } } : order
        ));
        Alert.alert('Success', `Order status updated to ${newStatus}`);
        setShowOrderModal(false);
      } else {
        Alert.alert('Error', response.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Update order status error:', error);
      Alert.alert('Error', 'Unable to update order status');
    }
  };

  const assignOrder = async (orderId, agentId) => {
    try {
      const response = await makeAuthenticatedRequest(
        `/admin/orders/${orderId}/assign`,
        {
          method: 'POST',
          body: JSON.stringify({ agentId })
        }
      );

      if (response.success) {
        fetchOrders(); // Refresh the list
        Alert.alert('Success', 'Order assigned successfully');
        setShowOrderModal(false);
      } else {
        Alert.alert('Error', response.message || 'Failed to assign order');
      }
    } catch (error) {
      console.error('Assign order error:', error);
      Alert.alert('Error', 'Unable to assign order');
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customer?.phone?.includes(searchQuery);
    
    const matchesFilter = filterStatus === 'all' || order.status?.current === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return '#10B981';
      case 'cancelled': return '#EF4444';
      case 'in_transit': case 'picked_up': return '#3B82F6';
      case 'preparing': case 'confirmed': return '#8B5CF6';
      case 'pending': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return <CheckCircle size={14} color="#FFFFFF" />;
      case 'cancelled': return <XCircle size={14} color="#FFFFFF" />;
      case 'in_transit': case 'picked_up': return <Truck size={14} color="#FFFFFF" />;
      case 'preparing': case 'confirmed': return <Clock size={14} color="#FFFFFF" />;
      case 'pending': return <AlertCircle size={14} color="#FFFFFF" />;
      default: return <Clock size={14} color="#FFFFFF" />;
    }
  };

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.orderCard}
      onPress={() => {
        setSelectedOrder(item);
        setShowOrderModal(true);
      }}
    >
      <View style={styles.orderCardContent}>
        <View style={styles.orderHeader}>
          <View style={styles.orderNumber}>
            <ShoppingCart size={20} color="#4F46E5" />
            <Text style={styles.orderNumberText}>#{item.orderNumber}</Text>
          </View>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: getStatusColor(item.status?.current) }
          ]}>
            {getStatusIcon(item.status?.current)}
            <Text style={styles.statusText}>
              {item.status?.current?.replace('_', ' ').toUpperCase() || 'PENDING'}
            </Text>
          </View>
        </View>
        
        <View style={styles.orderInfo}>
          <Text style={styles.customerName}>{item.customer?.name || 'Unknown Customer'}</Text>
          <Text style={styles.restaurantName}>{item.restaurant?.name || 'Unknown Restaurant'}</Text>
          
          <View style={styles.orderMeta}>
            <View style={styles.orderMetaItem}>
              <IndianRupee size={14} color="#059669" />
              <Text style={styles.orderAmount}>₹{item.pricing?.totalAmount || 0}</Text>
            </View>
            
            <View style={styles.orderMetaItem}>
              <Package size={14} color="#6B7280" />
              <Text style={styles.orderItems}>{item.items?.length || 0} items</Text>
            </View>
            
            <View style={styles.orderMetaItem}>
              <Clock size={14} color="#6B7280" />
              <Text style={styles.orderTime}>
                {new Date(item.createdAt).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
            </View>
          </View>
          
          {item.assignment?.deliveryAgent && (
            <View style={styles.agentInfo}>
              <Truck size={14} color="#059669" />
              <Text style={styles.agentText}>Assigned to agent</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const OrderModal = () => (
    <Modal
      visible={showOrderModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowOrderModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowOrderModal(false)}>
            <ArrowLeft size={24} color="#4F46E5" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Order Details</Text>
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                'Order Actions',
                'Choose an action',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Mark as Confirmed',
                    onPress: () => updateOrderStatus(selectedOrder._id, 'confirmed')
                  },
                  {
                    text: 'Mark as Preparing',
                    onPress: () => updateOrderStatus(selectedOrder._id, 'preparing')
                  },
                  {
                    text: 'Mark as Ready',
                    onPress: () => updateOrderStatus(selectedOrder._id, 'ready_for_pickup')
                  },
                  {
                    text: 'Cancel Order',
                    style: 'destructive',
                    onPress: () => updateOrderStatus(selectedOrder._id, 'cancelled')
                  }
                ]
              );
            }}
          >
            <MoreVertical size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {selectedOrder && (
          <ScrollView style={styles.modalContent}>
            <View style={styles.orderDetailCard}>
              {/* Order Header */}
              <View style={styles.orderDetailHeader}>
                <View style={styles.orderDetailNumber}>
                  <ShoppingCart size={24} color="#4F46E5" />
                  <Text style={styles.orderDetailNumberText}>#{selectedOrder.orderNumber}</Text>
                </View>
                <View style={[
                  styles.statusBadge, 
                  { backgroundColor: getStatusColor(selectedOrder.status?.current) }
                ]}>
                  {getStatusIcon(selectedOrder.status?.current)}
                  <Text style={styles.statusText}>
                    {selectedOrder.status?.current?.replace('_', ' ').toUpperCase() || 'PENDING'}
                  </Text>
                </View>
              </View>

              {/* Customer Info */}
              <View style={styles.orderDetailSection}>
                <Text style={styles.sectionTitle}>Customer Information</Text>
                
                <View style={styles.orderDetailItem}>
                  <User size={20} color="#6B7280" />
                  <Text style={styles.orderDetailLabel}>Name</Text>
                  <Text style={styles.orderDetailValue}>{selectedOrder.customer?.name}</Text>
                </View>

                <View style={styles.orderDetailItem}>
                  <Phone size={20} color="#6B7280" />
                  <Text style={styles.orderDetailLabel}>Phone</Text>
                  <Text style={styles.orderDetailValue}>{selectedOrder.customer?.phone}</Text>
                </View>

                <View style={styles.orderDetailItem}>
                  <MapPin size={20} color="#6B7280" />
                  <Text style={styles.orderDetailLabel}>Address</Text>
                  <Text style={styles.orderDetailValue}>
                    {selectedOrder.customer?.address?.street}, {selectedOrder.customer?.address?.city}
                  </Text>
                </View>
              </View>

              {/* Restaurant Info */}
              <View style={styles.orderDetailSection}>
                <Text style={styles.sectionTitle}>Restaurant Information</Text>
                
                <View style={styles.orderDetailItem}>
                  <Package size={20} color="#6B7280" />
                  <Text style={styles.orderDetailLabel}>Restaurant</Text>
                  <Text style={styles.orderDetailValue}>{selectedOrder.restaurant?.name}</Text>
                </View>

                <View style={styles.orderDetailItem}>
                  <Phone size={20} color="#6B7280" />
                  <Text style={styles.orderDetailLabel}>Phone</Text>
                  <Text style={styles.orderDetailValue}>{selectedOrder.restaurant?.phone}</Text>
                </View>
              </View>

              {/* Order Items */}
              <View style={styles.orderDetailSection}>
                <Text style={styles.sectionTitle}>Order Items</Text>
                
                {selectedOrder.items?.map((item, index) => (
                  <View key={index} style={styles.orderItem}>
                    <Text style={styles.orderItemName}>{item.name}</Text>
                    <Text style={styles.orderItemDetails}>
                      Qty: {item.quantity} × ₹{item.price} = ₹{item.quantity * item.price}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Pricing */}
              <View style={styles.orderDetailSection}>
                <Text style={styles.sectionTitle}>Pricing</Text>
                
                <View style={styles.pricingGrid}>
                  <View style={styles.pricingItem}>
                    <Text style={styles.pricingLabel}>Items Total</Text>
                    <Text style={styles.pricingValue}>₹{selectedOrder.pricing?.itemsTotal || 0}</Text>
                  </View>
                  
                  <View style={styles.pricingItem}>
                    <Text style={styles.pricingLabel}>Delivery Fee</Text>
                    <Text style={styles.pricingValue}>₹{selectedOrder.pricing?.deliveryFee || 0}</Text>
                  </View>
                  
                  <View style={styles.pricingItem}>
                    <Text style={styles.pricingLabel}>Taxes</Text>
                    <Text style={styles.pricingValue}>₹{selectedOrder.pricing?.taxes || 0}</Text>
                  </View>
                  
                  <View style={[styles.pricingItem, styles.pricingTotal]}>
                    <Text style={styles.pricingLabelTotal}>Total Amount</Text>
                    <Text style={styles.pricingValueTotal}>₹{selectedOrder.pricing?.totalAmount || 0}</Text>
                  </View>
                </View>
              </View>

              {/* Delivery Agent */}
              {selectedOrder.assignment?.deliveryAgent && (
                <View style={styles.orderDetailSection}>
                  <Text style={styles.sectionTitle}>Delivery Agent</Text>
                  
                  <View style={styles.agentCard}>
                    <Truck size={20} color="#059669" />
                    <Text style={styles.agentName}>Agent Assigned</Text>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Manage Orders</Text>
          <TouchableOpacity>
            <Plus size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search orders..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          {['all', 'pending', 'confirmed', 'preparing', 'ready_for_pickup', 'picked_up', 'in_transit', 'delivered', 'cancelled'].map(status => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterButton,
                filterStatus === status && styles.filterButtonActive
              ]}
              onPress={() => setFilterStatus(status)}
            >
              <Text style={[
                styles.filterButtonText,
                filterStatus === status && styles.filterButtonTextActive
              ]}>
                {status === 'all' ? 'All' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Orders List */}
      <View style={styles.content}>
        <Text style={styles.statsText}>
          {filteredOrders.length} orders • ₹{filteredOrders.reduce((sum, order) => sum + (order.pricing?.totalAmount || 0), 0)} total value
        </Text>
        
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      </View>

      <OrderModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#4F46E5',
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1F2937',
  },
  filterContainer: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#4F46E5',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  statsText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  orderCardContent: {
    gap: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderNumber: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderNumberText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  orderInfo: {
    gap: 8,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  restaurantName: {
    fontSize: 14,
    color: '#6B7280',
  },
  orderMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  orderMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
    marginLeft: 4,
  },
  orderItems: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  orderTime: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  agentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  agentText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
    marginLeft: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  orderDetailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  orderDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  orderDetailNumber: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderDetailNumberText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  orderDetailSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  orderDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },
  orderDetailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: 12,
    minWidth: 70,
  },
  orderDetailValue: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
    marginLeft: 12,
  },
  orderItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    marginBottom: 8,
  },
  orderItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  orderItemDetails: {
    fontSize: 12,
    color: '#6B7280',
  },
  pricingGrid: {
    gap: 8,
  },
  pricingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  pricingTotal: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    marginTop: 8,
  },
  pricingLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  pricingValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  pricingLabelTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  pricingValueTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
  },
  agentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
  },
  agentName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#059669',
    marginLeft: 8,
  },
});
