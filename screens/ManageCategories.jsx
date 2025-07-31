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
  Grid, 
  Plus, 
  MoreVertical, 
  Edit,
  Trash,
  Package,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Tag,
  TrendingUp,
  Users,
  Calendar
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import API_CONFIG, { makeAuthenticatedRequest } from '../config/api.js';

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    isActive: true
  });
  
  const navigation = useNavigation();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await makeAuthenticatedRequest('/admin/categories');
      
      if (response.success) {
        setCategories(response.categories || []);
      } else {
        Alert.alert('Error', 'Failed to fetch categories');
      }
    } catch (error) {
      console.error('Fetch categories error:', error);
      Alert.alert('Error', 'Unable to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCategories();
    setRefreshing(false);
  };

  const createCategory = async () => {
    try {
      if (!newCategory.name.trim()) {
        Alert.alert('Error', 'Category name is required');
        return;
      }

      const response = await makeAuthenticatedRequest('/admin/categories', {
        method: 'POST',
        body: JSON.stringify(newCategory)
      });

      if (response.success) {
        setCategories([...categories, response.category]);
        Alert.alert('Success', 'Category created successfully');
        setShowAddModal(false);
        setNewCategory({ name: '', description: '', isActive: true });
      } else {
        Alert.alert('Error', response.message || 'Failed to create category');
      }
    } catch (error) {
      console.error('Create category error:', error);
      Alert.alert('Error', 'Unable to create category');
    }
  };

  const updateCategory = async (categoryId, updates) => {
    try {
      const response = await makeAuthenticatedRequest(
        `/admin/categories/${categoryId}`,
        {
          method: 'PUT',
          body: JSON.stringify(updates)
        }
      );

      if (response.success) {
        setCategories(categories.map(category => 
          category._id === categoryId ? { ...category, ...updates } : category
        ));
        Alert.alert('Success', 'Category updated successfully');
      } else {
        Alert.alert('Error', response.message || 'Failed to update category');
      }
    } catch (error) {
      console.error('Update category error:', error);
      Alert.alert('Error', 'Unable to update category');
    }
  };

  const toggleCategoryStatus = async (categoryId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await updateCategory(categoryId, { isActive: newStatus });
    } catch (error) {
      console.error('Toggle category status error:', error);
      Alert.alert('Error', 'Unable to update category status');
    }
  };

  const deleteCategory = async (categoryId) => {
    Alert.alert(
      'Delete Category',
      'Are you sure you want to delete this category? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await makeAuthenticatedRequest(
                `/admin/categories/${categoryId}`,
                { method: 'DELETE' }
              );

              if (response.success) {
                setCategories(categories.filter(category => category._id !== categoryId));
                Alert.alert('Success', 'Category deleted successfully');
                setShowCategoryModal(false);
              } else {
                Alert.alert('Error', response.message || 'Failed to delete category');
              }
            } catch (error) {
              console.error('Delete category error:', error);
              Alert.alert('Error', 'Unable to delete category');
            }
          }
        }
      ]
    );
  };

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         category.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const getCategoryIcon = (category) => {
    // Simple icon mapping based on category name
    const name = category.name?.toLowerCase() || '';
    if (name.includes('food') || name.includes('meal')) return '🍽️';
    if (name.includes('drink') || name.includes('beverage')) return '🥤';
    if (name.includes('dessert') || name.includes('sweet')) return '🍰';
    if (name.includes('pizza')) return '🍕';
    if (name.includes('burger')) return '🍔';
    if (name.includes('chinese') || name.includes('asian')) return '🥡';
    if (name.includes('indian')) return '🍛';
    return '📦';
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.categoryCard}
      onPress={() => {
        setSelectedCategory(item);
        setShowCategoryModal(true);
      }}
    >
      <View style={styles.categoryCardContent}>
        <View style={styles.categoryHeader}>
          <View style={styles.categoryInfo}>
            <View style={styles.categoryIconContainer}>
              <Image
                source={{ uri: item.image }}
                style={styles.categoryIcon}
                resizeMode='contain'
                className='w-12 h-12 rounded-full'
              />
            </View>
            <View style={styles.categoryDetails}>
              <Text style={styles.categoryName}>{item.name}</Text>
              <Text style={styles.categoryDescription} numberOfLines={2}>
                {item.description || 'No description available'}
              </Text>
            </View>
          </View>
          <View style={styles.categoryActions}>
            <View style={[
              styles.statusIndicator,
              { backgroundColor: item.isActive ? '#10B981' : '#EF4444' }
            ]}>
              {item.isActive ? <Eye size={14} color="#FFFFFF" /> : <EyeOff size={14} color="#FFFFFF" />}
            </View>
          </View>
        </View>
        
        <View style={styles.categoryStats}>
          <View style={styles.statItem}>
            <Package size={16} color="#6B7280" />
            <Text style={styles.statValue}>{item.productCount || 0}</Text>
            <Text style={styles.statLabel}>Products</Text>
          </View>
          
          <View style={styles.statItem}>
            <Users size={16} color="#6B7280" />
            <Text style={styles.statValue}>{item.merchantCount || 0}</Text>
            <Text style={styles.statLabel}>Merchants</Text>
          </View>
          
          <View style={styles.statItem}>
            <TrendingUp size={16} color="#6B7280" />
            <Text style={styles.statValue}>{item.orderCount || 0}</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const CategoryModal = () => (
    <Modal
      visible={showCategoryModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowCategoryModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
            <ArrowLeft size={24} color="#4F46E5" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Category Details</Text>
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                'Category Actions',
                'Choose an action',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: selectedCategory?.isActive ? 'Deactivate' : 'Activate',
                    onPress: () => toggleCategoryStatus(selectedCategory._id, selectedCategory.isActive)
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
                    onPress: () => deleteCategory(selectedCategory._id)
                  }
                ]
              );
            }}
          >
            <MoreVertical size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {selectedCategory && (
          <ScrollView style={styles.modalContent}>
            <View style={styles.categoryDetailCard}>
              {/* Category Header */}
              <View style={styles.categoryDetailHeader}>
                <View style={styles.categoryDetailInfo}>
                  <View style={styles.categoryDetailIconContainer}>
                    <Text style={styles.categoryDetailIcon}>{getCategoryIcon(selectedCategory)}</Text>
                  </View>
                  <View style={styles.categoryDetailText}>
                    <Text style={styles.categoryDetailName}>{selectedCategory.name}</Text>
                    <Text style={styles.categoryDetailDescription}>
                      {selectedCategory.description || 'No description available'}
                    </Text>
                  </View>
                </View>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: selectedCategory.isActive ? '#10B981' : '#EF4444' }
                ]}>
                  {selectedCategory.isActive ? <CheckCircle size={14} color="#FFFFFF" /> : <XCircle size={14} color="#FFFFFF" />}
                  <Text style={styles.statusText}>
                    {selectedCategory.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </Text>
                </View>
              </View>

              {/* Statistics */}
              <View style={styles.categoryDetailSection}>
                <Text style={styles.sectionTitle}>Statistics</Text>
                
                <View style={styles.statsGrid}>
                  <View style={styles.statCard}>
                    <Package size={24} color="#3B82F6" />
                    <Text style={styles.statCardValue}>{selectedCategory.productCount || 0}</Text>
                    <Text style={styles.statCardLabel}>Products</Text>
                  </View>
                  
                  <View style={styles.statCard}>
                    <Users size={24} color="#059669" />
                    <Text style={styles.statCardValue}>{selectedCategory.merchantCount || 0}</Text>
                    <Text style={styles.statCardLabel}>Merchants</Text>
                  </View>
                  
                  <View style={styles.statCard}>
                    <TrendingUp size={24} color="#F59E0B" />
                    <Text style={styles.statCardValue}>{selectedCategory.orderCount || 0}</Text>
                    <Text style={styles.statCardLabel}>Orders</Text>
                  </View>
                  
                  <View style={styles.statCard}>
                    <Tag size={24} color="#8B5CF6" />
                    <Text style={styles.statCardValue}>₹{selectedCategory.revenue || 0}</Text>
                    <Text style={styles.statCardLabel}>Revenue</Text>
                  </View>
                </View>
              </View>

              {/* Category Information */}
              <View style={styles.categoryDetailSection}>
                <Text style={styles.sectionTitle}>Category Information</Text>
                
                <View style={styles.categoryDetailItem}>
                  <Tag size={20} color="#6B7280" />
                  <Text style={styles.categoryDetailLabel}>Name</Text>
                  <Text style={styles.categoryDetailValue}>{selectedCategory.name}</Text>
                </View>

                <View style={styles.categoryDetailItem}>
                  <Grid size={20} color="#6B7280" />
                  <Text style={styles.categoryDetailLabel}>Description</Text>
                  <Text style={styles.categoryDetailValue}>
                    {selectedCategory.description || 'No description available'}
                  </Text>
                </View>

                <View style={styles.categoryDetailItem}>
                  <Calendar size={20} color="#6B7280" />
                  <Text style={styles.categoryDetailLabel}>Created</Text>
                  <Text style={styles.categoryDetailValue}>
                    {new Date(selectedCategory.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              {/* Recent Products */}
              {selectedCategory.recentProducts && selectedCategory.recentProducts.length > 0 && (
                <View style={styles.categoryDetailSection}>
                  <Text style={styles.sectionTitle}>Recent Products</Text>
                  
                  {selectedCategory.recentProducts.slice(0, 5).map((product, index) => (
                    <View key={index} style={styles.productItem}>
                      <Text style={styles.productName}>{product.name}</Text>
                      <Text style={styles.productPrice}>₹{product.price}</Text>
                    </View>
                  ))}
                  
                  {selectedCategory.recentProducts.length > 5 && (
                    <Text style={styles.moreItemsText}>
                      +{selectedCategory.recentProducts.length - 5} more products
                    </Text>
                  )}
                </View>
              )}
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );

  const AddCategoryModal = () => (
    <Modal
      visible={showAddModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowAddModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowAddModal(false)}>
            <ArrowLeft size={24} color="#4F46E5" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Add Category</Text>
          <TouchableOpacity onPress={createCategory}>
            <Text style={styles.saveButton}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.addCategoryForm}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Category Name</Text>
              <TextInput
                style={styles.formInput}
                value={newCategory.name}
                onChangeText={(text) => setNewCategory({ ...newCategory, name: text })}
                placeholder="Enter category name"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Description</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea]}
                value={newCategory.description}
                onChangeText={(text) => setNewCategory({ ...newCategory, description: text })}
                placeholder="Enter category description"
                multiline={true}
                numberOfLines={4}
              />
            </View>

            <View style={styles.formGroup}>
              <View style={styles.switchRow}>
                <Text style={styles.formLabel}>Active Status</Text>
                <Switch
                  value={newCategory.isActive}
                  onValueChange={(value) => setNewCategory({ ...newCategory, isActive: value })}
                  trackColor={{ false: '#E5E7EB', true: '#10B981' }}
                  thumbColor={newCategory.isActive ? '#FFFFFF' : '#F3F4F6'}
                />
              </View>
            </View>
          </View>
        </ScrollView>
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
          <Text style={styles.headerTitle}>Manage Categories</Text>
          <TouchableOpacity onPress={() => setShowAddModal(true)}>
            <Plus size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search categories..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Categories List */}
      <View style={styles.content}>
        <Text style={styles.statsText}>
          {filteredCategories.length} categories • {filteredCategories.filter(c => c.isActive).length} active
        </Text>
        
        <FlatList
          data={filteredCategories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      </View>

      <CategoryModal />
      <AddCategoryModal />
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
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1F2937',
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
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryCardContent: {
    gap: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  categoryActions: {
    alignItems: 'center',
  },
  statusIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
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
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  categoryDetailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  categoryDetailInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryDetailIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryDetailIcon: {
    fontSize: 32,
  },
  categoryDetailText: {
    flex: 1,
  },
  categoryDetailName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  categoryDetailDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
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
  categoryDetailSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  statCardValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginVertical: 4,
  },
  statCardLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  categoryDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },
  categoryDetailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: 12,
    minWidth: 80,
  },
  categoryDetailValue: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
    marginLeft: 12,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    marginBottom: 8,
  },
  productName: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
  },
  productPrice: {
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
  addCategoryForm: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  formTextArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
