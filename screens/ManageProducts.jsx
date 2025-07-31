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
  Package, 
  Plus, 
  MoreVertical, 
  Edit,
  Trash,
  Store,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Tag,
  DollarSign,
  Star,
  Users,
  Calendar,
  ImageIcon
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import API_CONFIG, { makeAuthenticatedRequest } from '../config/api.js';

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  
  const navigation = useNavigation();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await makeAuthenticatedRequest('/admin/products');
      
      if (response.success) {
        setProducts(response.products || []);
      } else {
        Alert.alert('Error', 'Failed to fetch products');
      }
    } catch (error) {
      console.error('Fetch products error:', error);
      Alert.alert('Error', 'Unable to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await makeAuthenticatedRequest('/admin/categories');
      if (response.success) {
        setCategories(response.categories || []);
      }
    } catch (error) {
      console.error('Fetch categories error:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  const toggleProductStatus = async (productId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      const response = await makeAuthenticatedRequest(
        `/admin/products/${productId}/status`,
        {
          method: 'PUT',
          body: JSON.stringify({ isAvailable: newStatus })
        }
      );

      if (response.success) {
        setProducts(products.map(product => 
          product._id === productId ? { ...product, isAvailable: newStatus } : product
        ));
        Alert.alert('Success', `Product ${newStatus ? 'enabled' : 'disabled'} successfully`);
      } else {
        Alert.alert('Error', response.message || 'Failed to update product status');
      }
    } catch (error) {
      console.error('Toggle product status error:', error);
      Alert.alert('Error', 'Unable to update product status');
    }
  };

  const deleteProduct = async (productId) => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await makeAuthenticatedRequest(
                `/admin/products/${productId}`,
                { method: 'DELETE' }
              );

              if (response.success) {
                setProducts(products.filter(product => product._id !== productId));
                Alert.alert('Success', 'Product deleted successfully');
                setShowProductModal(false);
              } else {
                Alert.alert('Error', response.message || 'Failed to delete product');
              }
            } catch (error) {
              console.error('Delete product error:', error);
              Alert.alert('Error', 'Unable to delete product');
            }
          }
        }
      ]
    );
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.restaurant?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getProductImage = (product) => {
    if (product.image && product.image.length > 0) {
      return { uri: product.image[0] };
    }
    return null;
  };

  const renderProductItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => {
        setSelectedProduct(item);
        setShowProductModal(true);
      }}
    >
      <View style={styles.productCardContent}>
        <View style={styles.productHeader}>
          <View style={styles.productImageContainer}>
            {getProductImage(item) ? (
              <Image source={getProductImage(item)} style={styles.productImage} />
            ) : (
              <View style={styles.productImagePlaceholder}>
                <Package size={20} color="#6B7280" />
              </View>
            )}
          </View>
          
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.restaurantName}>{item.restaurant?.name || 'Unknown Restaurant'}</Text>
            <Text style={styles.productDescription} numberOfLines={2}>
              {item.description || 'No description available'}
            </Text>
          </View>

          <View style={styles.productActions}>
            <View style={[
              styles.statusIndicator,
              { backgroundColor: item.isAvailable ? '#10B981' : '#EF4444' }
            ]}>
              {item.isAvailable ? <Eye size={14} color="#FFFFFF" /> : <EyeOff size={14} color="#FFFFFF" />}
            </View>
          </View>
        </View>
        
        <View style={styles.productMeta}>
          <View style={styles.productMetaItem}>
            <DollarSign size={14} color="#059669" />
            <Text style={styles.productPrice}>₹{item.price}</Text>
          </View>
          
          <View style={styles.productMetaItem}>
            <Tag size={14} color="#6B7280" />
            <Text style={styles.productCategory}>{item.category || 'Uncategorized'}</Text>
          </View>
          
          <View style={styles.productMetaItem}>
            <Star size={14} color="#F59E0B" />
            <Text style={styles.productRating}>
              {item.rating?.average || 0} ({item.rating?.count || 0})
            </Text>
          </View>
        </View>

        <View style={styles.productStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.orderCount || 0}</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>₹{item.revenue || 0}</Text>
            <Text style={styles.statLabel}>Revenue</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.views || 0}</Text>
            <Text style={styles.statLabel}>Views</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const ProductModal = () => (
    <Modal
      visible={showProductModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowProductModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowProductModal(false)}>
            <ArrowLeft size={24} color="#4F46E5" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Product Details</Text>
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                'Product Actions',
                'Choose an action',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: selectedProduct?.isAvailable ? 'Disable' : 'Enable',
                    onPress: () => toggleProductStatus(selectedProduct._id, selectedProduct.isAvailable)
                  },
                  {
                    text: 'Edit',
                    onPress: () => {
                      // TODO: Implement edit functionality
                      Alert.alert('Edit', 'Edit functionality coming soon');
                    }
                  },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deleteProduct(selectedProduct._id)
                  }
                ]
              );
            }}
          >
            <MoreVertical size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {selectedProduct && (
          <ScrollView style={styles.modalContent}>
            <View style={styles.productDetailCard}>
              {/* Product Header */}
              <View style={styles.productDetailHeader}>
                <View style={styles.productDetailImageContainer}>
                  {getProductImage(selectedProduct) ? (
                    <Image source={getProductImage(selectedProduct)} style={styles.productDetailImage} />
                  ) : (
                    <View style={styles.productDetailImagePlaceholder}>
                      <Package size={40} color="#6B7280" />
                    </View>
                  )}
                </View>
                
                <View style={styles.productDetailInfo}>
                  <Text style={styles.productDetailName}>{selectedProduct.name}</Text>
                  <Text style={styles.productDetailRestaurant}>{selectedProduct.restaurant?.name}</Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: selectedProduct.isAvailable ? '#10B981' : '#EF4444' }
                  ]}>
                    {selectedProduct.isAvailable ? <CheckCircle size={14} color="#FFFFFF" /> : <XCircle size={14} color="#FFFFFF" />}
                    <Text style={styles.statusText}>
                      {selectedProduct.isAvailable ? 'AVAILABLE' : 'UNAVAILABLE'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Product Information */}
              <View style={styles.productDetailSection}>
                <Text style={styles.sectionTitle}>Product Information</Text>
                
                <View style={styles.productDetailItem}>
                  <Package size={20} color="#6B7280" />
                  <Text style={styles.productDetailLabel}>Name</Text>
                  <Text style={styles.productDetailValue}>{selectedProduct.name}</Text>
                </View>

                <View style={styles.productDetailItem}>
                  <DollarSign size={20} color="#6B7280" />
                  <Text style={styles.productDetailLabel}>Price</Text>
                  <Text style={styles.productDetailValue}>₹{selectedProduct.price}</Text>
                </View>

                <View style={styles.productDetailItem}>
                  <Tag size={20} color="#6B7280" />
                  <Text style={styles.productDetailLabel}>Category</Text>
                  <Text style={styles.productDetailValue}>{selectedProduct.category || 'Uncategorized'}</Text>
                </View>

                <View style={styles.productDetailItem}>
                  <Star size={20} color="#6B7280" />
                  <Text style={styles.productDetailLabel}>Rating</Text>
                  <Text style={styles.productDetailValue}>
                    {selectedProduct.rating?.average || 0} ({selectedProduct.rating?.count || 0} reviews)
                  </Text>
                </View>
              </View>

              {/* Description */}
              <View style={styles.productDetailSection}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.productDescription}>
                  {selectedProduct.description || 'No description available'}
                </Text>
              </View>

              {/* Restaurant Information */}
              <View style={styles.productDetailSection}>
                <Text style={styles.sectionTitle}>Restaurant Information</Text>
                
                <View style={styles.productDetailItem}>
                  <Store size={20} color="#6B7280" />
                  <Text style={styles.productDetailLabel}>Restaurant</Text>
                  <Text style={styles.productDetailValue}>{selectedProduct.restaurant?.name}</Text>
                </View>

                <View style={styles.productDetailItem}>
                  <Users size={20} color="#6B7280" />
                  <Text style={styles.productDetailLabel}>Owner</Text>
                  <Text style={styles.productDetailValue}>{selectedProduct.restaurant?.ownerName || 'N/A'}</Text>
                </View>
              </View>

              {/* Performance Metrics */}
              <View style={styles.productDetailSection}>
                <Text style={styles.sectionTitle}>Performance Metrics</Text>
                
                <View style={styles.metricsGrid}>
                  <View style={styles.metricCard}>
                    <Package size={24} color="#3B82F6" />
                    <Text style={styles.metricValue}>{selectedProduct.orderCount || 0}</Text>
                    <Text style={styles.metricLabel}>Total Orders</Text>
                  </View>
                  
                  <View style={styles.metricCard}>
                    <DollarSign size={24} color="#059669" />
                    <Text style={styles.metricValue}>₹{selectedProduct.revenue || 0}</Text>
                    <Text style={styles.metricLabel}>Revenue</Text>
                  </View>
                  
                  <View style={styles.metricCard}>
                    <Eye size={24} color="#F59E0B" />
                    <Text style={styles.metricValue}>{selectedProduct.views || 0}</Text>
                    <Text style={styles.metricLabel}>Views</Text>
                  </View>
                  
                  <View style={styles.metricCard}>
                    <Star size={24} color="#8B5CF6" />
                    <Text style={styles.metricValue}>{selectedProduct.rating?.average || 0}</Text>
                    <Text style={styles.metricLabel}>Rating</Text>
                  </View>
                </View>
              </View>

              {/* Creation Date */}
              <View style={styles.productDetailSection}>
                <Text style={styles.sectionTitle}>Creation Information</Text>
                
                <View style={styles.productDetailItem}>
                  <Calendar size={20} color="#6B7280" />
                  <Text style={styles.productDetailLabel}>Created</Text>
                  <Text style={styles.productDetailValue}>
                    {new Date(selectedProduct.createdAt).toLocaleDateString()}
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
          <Text style={styles.headerTitle}>Manage Products</Text>
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
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterCategory === 'all' && styles.filterButtonActive
            ]}
            onPress={() => setFilterCategory('all')}
          >
            <Text style={[
              styles.filterButtonText,
              filterCategory === 'all' && styles.filterButtonTextActive
            ]}>
              All
            </Text>
          </TouchableOpacity>
          
          {categories.map(category => (
            <TouchableOpacity
              key={category._id}
              style={[
                styles.filterButton,
                filterCategory === category.name && styles.filterButtonActive
              ]}
              onPress={() => setFilterCategory(category.name)}
            >
              <Text style={[
                styles.filterButtonText,
                filterCategory === category.name && styles.filterButtonTextActive
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Products List */}
      <View style={styles.content}>
        <Text style={styles.statsText}>
          {filteredProducts.length} products • ₹{filteredProducts.reduce((sum, product) => sum + (product.revenue || 0), 0)} total revenue
        </Text>
        
        <FlatList
          data={filteredProducts}
          renderItem={renderProductItem}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      </View>

      <ProductModal />
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
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  productCardContent: {
    gap: 12,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  productImageContainer: {
    marginRight: 12,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  productImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
    marginRight: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  restaurantName: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 16,
  },
  productActions: {
    alignItems: 'center',
  },
  statusIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productMeta: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  productMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
    marginLeft: 4,
  },
  productCategory: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  productRating: {
    fontSize: 14,
    color: '#F59E0B',
    marginLeft: 4,
  },
  productStats: {
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
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
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
  productDetailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  productDetailHeader: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  productDetailImageContainer: {
    marginRight: 16,
  },
  productDetailImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  productDetailImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productDetailInfo: {
    flex: 1,
  },
  productDetailName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  productDetailRestaurant: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  productDetailSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  productDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },
  productDetailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: 12,
    minWidth: 70,
  },
  productDetailValue: {
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
});
