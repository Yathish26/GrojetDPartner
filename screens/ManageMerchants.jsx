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
  ScrollView,
  Switch,
  Image
} from 'react-native';
import { 
  ArrowLeft, 
  Search, 
  Store, 
  Plus, 
  MoreVertical, 
  MapPin,
  Clock,
  User,
  Phone,
  Mail,
  Package,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Users,
  Calendar
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import API_CONFIG, { makeAuthenticatedRequest } from '../config/api.js';

export default function ManageMerchants() {
  const [merchants, setMerchants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [showMerchantModal, setShowMerchantModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  
  const navigation = useNavigation();

  useEffect(() => {
    fetchMerchants();
  }, []);

  const fetchMerchants = async () => {
    try {
      setIsLoading(true);
      const response = await makeAuthenticatedRequest('/admin/merchants');
      
      if (response.success) {
        setMerchants(response.merchants || []);
      } else {
        Alert.alert('Error', 'Failed to fetch merchants');
      }
    } catch (error) {
      console.error('Fetch merchants error:', error);
      Alert.alert('Error', 'Unable to load merchants');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMerchants();
    setRefreshing(false);
  };

  const toggleMerchantStatus = async (merchantId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const response = await makeAuthenticatedRequest(
        `/admin/merchants/${merchantId}/status`,
        {
          method: 'PUT',
          body: JSON.stringify({ status: newStatus })
        }
      );

      if (response.success) {
        setMerchants(merchants.map(merchant => 
          merchant._id === merchantId ? { ...merchant, status: newStatus } : merchant
        ));
        Alert.alert('Success', `Merchant ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
      } else {
        Alert.alert('Error', response.message || 'Failed to update merchant status');
      }
    } catch (error) {
      console.error('Toggle merchant status error:', error);
      Alert.alert('Error', 'Unable to update merchant status');
    }
  };

  const approveMerchant = async (merchantId) => {
    try {
      const response = await makeAuthenticatedRequest(
        `/admin/merchants/${merchantId}/approve`,
        {
          method: 'PUT'
        }
      );

      if (response.success) {
        setMerchants(merchants.map(merchant => 
          merchant._id === merchantId ? { ...merchant, approvalStatus: 'approved', status: 'active' } : merchant
        ));
        Alert.alert('Success', 'Merchant approved successfully');
        setShowMerchantModal(false);
      } else {
        Alert.alert('Error', response.message || 'Failed to approve merchant');
      }
    } catch (error) {
      console.error('Approve merchant error:', error);
      Alert.alert('Error', 'Unable to approve merchant');
    }
  };

  const rejectMerchant = async (merchantId) => {
    try {
      const response = await makeAuthenticatedRequest(
        `/admin/merchants/${merchantId}/reject`,
        {
          method: 'PUT'
        }
      );

      if (response.success) {
        setMerchants(merchants.map(merchant => 
          merchant._id === merchantId ? { ...merchant, approvalStatus: 'rejected', status: 'inactive' } : merchant
        ));
        Alert.alert('Success', 'Merchant rejected');
        setShowMerchantModal(false);
      } else {
        Alert.alert('Error', response.message || 'Failed to reject merchant');
      }
    } catch (error) {
      console.error('Reject merchant error:', error);
      Alert.alert('Error', 'Unable to reject merchant');
    }
  };

  const deleteMerchant = async (merchantId) => {
    Alert.alert(
      'Delete Merchant',
      'Are you sure you want to delete this merchant? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await makeAuthenticatedRequest(
                `/admin/merchants/${merchantId}`,
                { method: 'DELETE' }
              );

              if (response.success) {
                setMerchants(merchants.filter(merchant => merchant._id !== merchantId));
                Alert.alert('Success', 'Merchant deleted successfully');
                setShowMerchantModal(false);
              } else {
                Alert.alert('Error', response.message || 'Failed to delete merchant');
              }
            } catch (error) {
              console.error('Delete merchant error:', error);
              Alert.alert('Error', 'Unable to delete merchant');
            }
          }
        }
      ]
    );
  };

  const filteredMerchants = merchants.filter(merchant => {
    const matchesSearch = merchant.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         merchant.ownerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         merchant.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         merchant.phone?.includes(searchQuery);
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'pending' && merchant.approvalStatus === 'pending') ||
                         (filterStatus === 'approved' && merchant.approvalStatus === 'approved') ||
                         (filterStatus === 'rejected' && merchant.approvalStatus === 'rejected') ||
                         (filterStatus === 'active' && merchant.status === 'active') ||
                         (filterStatus === 'inactive' && merchant.status === 'inactive');
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status, approvalStatus) => {
    if (approvalStatus === 'pending') return '#F59E0B';
    if (approvalStatus === 'rejected') return '#EF4444';
    if (status === 'active') return '#10B981';
    return '#6B7280';
  };

  const getStatusText = (status, approvalStatus) => {
    if (approvalStatus === 'pending') return 'PENDING APPROVAL';
    if (approvalStatus === 'rejected') return 'REJECTED';
    if (status === 'active') return 'ACTIVE';
    return 'INACTIVE';
  };

  const getStatusIcon = (status, approvalStatus) => {
    if (approvalStatus === 'pending') return <AlertCircle size={14} color="#FFFFFF" />;
    if (approvalStatus === 'rejected') return <XCircle size={14} color="#FFFFFF" />;
    if (status === 'active') return <CheckCircle size={14} color="#FFFFFF" />;
    return <XCircle size={14} color="#FFFFFF" />;
  };

  const renderMerchantItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.merchantCard}
      onPress={() => {
        setSelectedMerchant(item);
        setShowMerchantModal(true);
      }}
    >
      <View style={styles.merchantCardContent}>
        <View style={styles.merchantHeader}>
          <View style={styles.merchantInfo}>
            <View style={styles.merchantIcon}>
              <Store size={20} color="#4F46E5" />
            </View>
            <View style={styles.merchantDetails}>
              <Text style={styles.businessName}>{item.businessName}</Text>
              <Text style={styles.ownerName}>{item.ownerName}</Text>
            </View>
          </View>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: getStatusColor(item.status, item.approvalStatus) }
          ]}>
            {getStatusIcon(item.status, item.approvalStatus)}
            <Text style={styles.statusText}>
              {getStatusText(item.status, item.approvalStatus)}
            </Text>
          </View>
        </View>
        
        <View style={styles.merchantMeta}>
          <View style={styles.merchantMetaItem}>
            <MapPin size={14} color="#6B7280" />
            <Text style={styles.merchantLocation}>
              {item.address?.city || 'Unknown Location'}
            </Text>
          </View>
          
          <View style={styles.merchantMetaItem}>
            <Package size={14} color="#6B7280" />
            <Text style={styles.merchantProducts}>
              {item.menuItems?.length || 0} items
            </Text>
          </View>
          
          <View style={styles.merchantMetaItem}>
            <Star size={14} color="#F59E0B" />
            <Text style={styles.merchantRating}>
              {item.rating?.average || 0} ({item.rating?.count || 0})
            </Text>
          </View>
        </View>

        <View style={styles.merchantStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>₹{item.analytics?.totalRevenue || 0}</Text>
            <Text style={styles.statLabel}>Revenue</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.analytics?.totalOrders || 0}</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.analytics?.completionRate || 0}%</Text>
            <Text style={styles.statLabel}>Completion</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const MerchantModal = () => (
    <Modal
      visible={showMerchantModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowMerchantModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowMerchantModal(false)}>
            <ArrowLeft size={24} color="#4F46E5" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Merchant Details</Text>
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                'Merchant Actions',
                'Choose an action',
                [
                  { text: 'Cancel', style: 'cancel' },
                  ...(selectedMerchant?.approvalStatus === 'pending' ? [
                    {
                      text: 'Approve',
                      onPress: () => approveMerchant(selectedMerchant._id)
                    },
                    {
                      text: 'Reject',
                      style: 'destructive',
                      onPress: () => rejectMerchant(selectedMerchant._id)
                    }
                  ] : []),
                  {
                    text: selectedMerchant?.status === 'active' ? 'Deactivate' : 'Activate',
                    onPress: () => toggleMerchantStatus(selectedMerchant._id, selectedMerchant.status)
                  },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deleteMerchant(selectedMerchant._id)
                  }
                ]
              );
            }}
          >
            <MoreVertical size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {selectedMerchant && (
          <ScrollView style={styles.modalContent}>
            <View style={styles.merchantDetailCard}>
              {/* Merchant Header */}
              <View style={styles.merchantDetailHeader}>
                <View style={styles.merchantDetailInfo}>
                  <Store size={32} color="#4F46E5" />
                  <View style={styles.merchantDetailText}>
                    <Text style={styles.merchantDetailName}>{selectedMerchant.businessName}</Text>
                    <Text style={styles.merchantDetailOwner}>Owner: {selectedMerchant.ownerName}</Text>
                  </View>
                </View>
                <View style={[
                  styles.statusBadge, 
                  { backgroundColor: getStatusColor(selectedMerchant.status, selectedMerchant.approvalStatus) }
                ]}>
                  {getStatusIcon(selectedMerchant.status, selectedMerchant.approvalStatus)}
                  <Text style={styles.statusText}>
                    {getStatusText(selectedMerchant.status, selectedMerchant.approvalStatus)}
                  </Text>
                </View>
              </View>

              {/* Contact Information */}
              <View style={styles.merchantDetailSection}>
                <Text style={styles.sectionTitle}>Contact Information</Text>
                
                <View style={styles.merchantDetailItem}>
                  <Phone size={20} color="#6B7280" />
                  <Text style={styles.merchantDetailLabel}>Phone</Text>
                  <Text style={styles.merchantDetailValue}>{selectedMerchant.phone}</Text>
                </View>

                <View style={styles.merchantDetailItem}>
                  <Mail size={20} color="#6B7280" />
                  <Text style={styles.merchantDetailLabel}>Email</Text>
                  <Text style={styles.merchantDetailValue}>{selectedMerchant.email}</Text>
                </View>

                <View style={styles.merchantDetailItem}>
                  <MapPin size={20} color="#6B7280" />
                  <Text style={styles.merchantDetailLabel}>Address</Text>
                  <Text style={styles.merchantDetailValue}>
                    {selectedMerchant.address?.street}, {selectedMerchant.address?.city}, {selectedMerchant.address?.state} {selectedMerchant.address?.zipCode}
                  </Text>
                </View>
              </View>

              {/* Business Information */}
              <View style={styles.merchantDetailSection}>
                <Text style={styles.sectionTitle}>Business Information</Text>
                
                <View style={styles.merchantDetailItem}>
                  <Store size={20} color="#6B7280" />
                  <Text style={styles.merchantDetailLabel}>Cuisine Type</Text>
                  <Text style={styles.merchantDetailValue}>{selectedMerchant.cuisineType || 'Not specified'}</Text>
                </View>

                <View style={styles.merchantDetailItem}>
                  <Clock size={20} color="#6B7280" />
                  <Text style={styles.merchantDetailLabel}>Operating Hours</Text>
                  <Text style={styles.merchantDetailValue}>
                    {selectedMerchant.operatingHours?.open || '9:00'} - {selectedMerchant.operatingHours?.close || '22:00'}
                  </Text>
                </View>

                <View style={styles.merchantDetailItem}>
                  <DollarSign size={20} color="#6B7280" />
                  <Text style={styles.merchantDetailLabel}>Commission Rate</Text>
                  <Text style={styles.merchantDetailValue}>{selectedMerchant.commissionRate || 15}%</Text>
                </View>
              </View>

              {/* Performance Metrics */}
              <View style={styles.merchantDetailSection}>
                <Text style={styles.sectionTitle}>Performance Metrics</Text>
                
                <View style={styles.metricsGrid}>
                  <View style={styles.metricCard}>
                    <TrendingUp size={24} color="#059669" />
                    <Text style={styles.metricValue}>₹{selectedMerchant.analytics?.totalRevenue || 0}</Text>
                    <Text style={styles.metricLabel}>Total Revenue</Text>
                  </View>
                  
                  <View style={styles.metricCard}>
                    <Package size={24} color="#3B82F6" />
                    <Text style={styles.metricValue}>{selectedMerchant.analytics?.totalOrders || 0}</Text>
                    <Text style={styles.metricLabel}>Total Orders</Text>
                  </View>
                  
                  <View style={styles.metricCard}>
                    <Star size={24} color="#F59E0B" />
                    <Text style={styles.metricValue}>{selectedMerchant.rating?.average || 0}</Text>
                    <Text style={styles.metricLabel}>Rating</Text>
                  </View>
                  
                  <View style={styles.metricCard}>
                    <CheckCircle size={24} color="#8B5CF6" />
                    <Text style={styles.metricValue}>{selectedMerchant.analytics?.completionRate || 0}%</Text>
                    <Text style={styles.metricLabel}>Completion Rate</Text>
                  </View>
                </View>
              </View>

              {/* Menu Items */}
              <View style={styles.merchantDetailSection}>
                <Text style={styles.sectionTitle}>Menu Items ({selectedMerchant.menuItems?.length || 0})</Text>
                
                {selectedMerchant.menuItems?.slice(0, 5).map((item, index) => (
                  <View key={index} style={styles.menuItem}>
                    <Text style={styles.menuItemName}>{item.name}</Text>
                    <Text style={styles.menuItemPrice}>₹{item.price}</Text>
                  </View>
                ))}
                
                {selectedMerchant.menuItems?.length > 5 && (
                  <Text style={styles.moreItemsText}>
                    +{selectedMerchant.menuItems.length - 5} more items
                  </Text>
                )}
              </View>

              {/* Registration Date */}
              <View style={styles.merchantDetailSection}>
                <Text style={styles.sectionTitle}>Registration Information</Text>
                
                <View style={styles.merchantDetailItem}>
                  <Calendar size={20} color="#6B7280" />
                  <Text style={styles.merchantDetailLabel}>Registered</Text>
                  <Text style={styles.merchantDetailValue}>
                    {new Date(selectedMerchant.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
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
          <Text style={styles.headerTitle}>Manage Merchants</Text>
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
            placeholder="Search merchants..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          {['all', 'pending', 'approved', 'rejected', 'active', 'inactive'].map(status => (
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
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Merchants List */}
      <View style={styles.content}>
        <Text style={styles.statsText}>
          {filteredMerchants.length} merchants • ₹{filteredMerchants.reduce((sum, merchant) => sum + (merchant.analytics?.totalRevenue || 0), 0)} total revenue
        </Text>
        
        <FlatList
          data={filteredMerchants}
          renderItem={renderMerchantItem}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      </View>

      <MerchantModal />
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
  merchantCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  merchantCardContent: {
    gap: 12,
  },
  merchantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  merchantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  merchantIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  merchantDetails: {
    flex: 1,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  ownerName: {
    fontSize: 14,
    color: '#6B7280',
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
  merchantMeta: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  merchantMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  merchantLocation: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  merchantProducts: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  merchantRating: {
    fontSize: 14,
    color: '#F59E0B',
    marginLeft: 4,
  },
  merchantStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
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
  merchantDetailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  merchantDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  merchantDetailInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  merchantDetailText: {
    marginLeft: 12,
    flex: 1,
  },
  merchantDetailName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  merchantDetailOwner: {
    fontSize: 14,
    color: '#6B7280',
  },
  merchantDetailSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  merchantDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },
  merchantDetailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: 12,
    minWidth: 70,
  },
  merchantDetailValue: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
    marginLeft: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginVertical: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    marginBottom: 8,
  },
  menuItemName: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
  },
  menuItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  moreItemsText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
});
