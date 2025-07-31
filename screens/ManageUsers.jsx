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
  Modal
} from 'react-native';
import { 
  ArrowLeft, 
  Search, 
  Users, 
  Plus, 
  MoreVertical, 
  UserX, 
  UserCheck,
  Mail,
  Phone,
  Calendar
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import API_CONFIG, { makeAuthenticatedRequest } from '../config/api.js';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  
  const navigation = useNavigation();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await makeAuthenticatedRequest('/admin/users');
      
      if (response.success) {
        setUsers(response.users || []);
      } else {
        Alert.alert('Error', response.message || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Fetch users error:', error);
      Alert.alert('Error', 'Unable to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      const response = await makeAuthenticatedRequest(
        `/admin/users/${userId}/status`,
        {
          method: 'PUT',
          body: JSON.stringify({ isActive: newStatus })
        }
      );

      if (response.success) {
        setUsers(users.map(user => 
          user._id === userId ? { ...user, isActive: newStatus } : user
        ));
        Alert.alert('Success', `User ${newStatus ? 'activated' : 'deactivated'} successfully`);
      } else {
        Alert.alert('Error', response.message || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Toggle user status error:', error);
      Alert.alert('Error', 'Unable to update user status');
    }
  };

  const deleteUser = async (userId) => {
    Alert.alert(
      'Delete User',
      'Are you sure you want to delete this user? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await makeAuthenticatedRequest(
                `/admin/users/${userId}`,
                { method: 'DELETE' }
              );

              if (response.success) {
                setUsers(users.filter(user => user._id !== userId));
                Alert.alert('Success', 'User deleted successfully');
              } else {
                Alert.alert('Error', response.message || 'Failed to delete user');
              }
            } catch (error) {
              console.error('Delete user error:', error);
              Alert.alert('Error', 'Unable to delete user');
            }
          }
        }
      ]
    );
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone?.includes(searchQuery)
  );

  const renderUserItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.userCard}
      onPress={() => {
        setSelectedUser(item);
        setShowUserModal(true);
      }}
    >
      <View style={styles.userCardContent}>
        <View style={styles.userAvatar}>
          <Users size={24} color="#4F46E5" />
        </View>
        
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name || 'Unknown User'}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
          <Text style={styles.userPhone}>{item.phone}</Text>
        </View>
        
        <View style={styles.userActions}>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: item.isActive ? '#10B981' : '#EF4444' }
          ]}>
            <Text style={styles.statusText}>
              {item.isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => toggleUserStatus(item._id, item.isActive)}
          >
            {item.isActive ? (
              <UserX size={18} color="#EF4444" />
            ) : (
              <UserCheck size={18} color="#10B981" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const UserModal = () => (
    <Modal
      visible={showUserModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowUserModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowUserModal(false)}>
            <ArrowLeft size={24} color="#4F46E5" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>User Details</Text>
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                'User Actions',
                'Choose an action',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: selectedUser?.isActive ? 'Deactivate' : 'Activate',
                    onPress: () => {
                      toggleUserStatus(selectedUser._id, selectedUser.isActive);
                      setShowUserModal(false);
                    }
                  },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                      deleteUser(selectedUser._id);
                      setShowUserModal(false);
                    }
                  }
                ]
              );
            }}
          >
            <MoreVertical size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {selectedUser && (
          <View style={styles.modalContent}>
            <View style={styles.userDetailCard}>
              <View style={styles.userDetailHeader}>
                <View style={styles.userAvatarLarge}>
                  <Users size={32} color="#4F46E5" />
                </View>
                <View style={styles.userDetailInfo}>
                  <Text style={styles.userDetailName}>{selectedUser.name}</Text>
                  <View style={[
                    styles.statusBadge, 
                    { backgroundColor: selectedUser.isActive ? '#10B981' : '#EF4444' }
                  ]}>
                    <Text style={styles.statusText}>
                      {selectedUser.isActive ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.userDetailSection}>
                <View style={styles.userDetailItem}>
                  <Mail size={20} color="#6B7280" />
                  <Text style={styles.userDetailLabel}>Email</Text>
                  <Text style={styles.userDetailValue}>{selectedUser.email}</Text>
                </View>

                <View style={styles.userDetailItem}>
                  <Phone size={20} color="#6B7280" />
                  <Text style={styles.userDetailLabel}>Phone</Text>
                  <Text style={styles.userDetailValue}>{selectedUser.phone}</Text>
                </View>

                <View style={styles.userDetailItem}>
                  <Calendar size={20} color="#6B7280" />
                  <Text style={styles.userDetailLabel}>Joined</Text>
                  <Text style={styles.userDetailValue}>
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </View>
          </View>
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
          <Text style={styles.headerTitle}>Manage Users</Text>
          <TouchableOpacity>
            <Plus size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Users List */}
      <View style={styles.content}>
        <Text style={styles.statsText}>
          Total Users: {filteredUsers.length}
        </Text>
        
        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      </View>

      <UserModal />
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
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  userCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: '#6B7280',
  },
  userActions: {
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
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
  userDetailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  userDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  userAvatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  userDetailInfo: {
    flex: 1,
  },
  userDetailName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  userDetailSection: {
    gap: 16,
  },
  userDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  userDetailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: 12,
    minWidth: 60,
  },
  userDetailValue: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
    marginLeft: 12,
  },
});
