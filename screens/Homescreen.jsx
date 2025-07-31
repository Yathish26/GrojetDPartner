import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet, SafeAreaView, StatusBar, Alert, RefreshControl, ScrollView } from 'react-native';
import { Truck, Package, IndianRupee, LogOut, User, Clock } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import API_CONFIG, { makeAuthenticatedRequest } from '../config/api.js';

const Homescreen = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [agentData, setAgentData] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  const navigation = useNavigation();

  // Check authentication on component mount and when screen comes into focus
  useEffect(() => {
    checkAuthentication();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      checkAuthentication();
    }, [])
  );

  const checkAuthentication = async () => {
    try {
      setIsLoading(true);
      const token = await SecureStore.getItemAsync('deliveryToken');
      
      if (!token) {
        console.log('No delivery token found, redirecting to login');
        setIsAuthenticated(false);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Portal' }],
        });
        return;
      }

      console.log('Delivery token found, user authenticated');
      setIsAuthenticated(true);
      await fetchAgentData();
    } catch (error) {
      console.error('Authentication check error:', error);
      setIsAuthenticated(false);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Portal' }],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAgentData = async () => {
    try {
      console.log('Fetching agent profile data...');
      const response = await makeAuthenticatedRequest(API_CONFIG.ENDPOINTS.DELIVERY_PROFILE);
      
      console.log('API Response:', response);
      
      if (response && response.success) {
        console.log('Agent data fetched successfully:', response.agent);
        setAgentData(response.agent);
        setIsOnline(response.agent.status.isOnline);
      } else {
        const errorMessage = response?.message || 'Unknown error occurred';
        console.error('Failed to fetch agent data:', errorMessage);
        console.error('Full response:', response);
        Alert.alert('Error', `Failed to load profile data: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Fetch agent data error:', error);
      console.error('Error details:', error.message);
      Alert.alert('Error', 'Unable to load profile data. Please check your connection and try again.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAgentData();
    setRefreshing(false);
  };

  const toggleOnlineStatus = async () => {
    if (statusLoading) return;
    
    try {
      setStatusLoading(true);
      console.log('Toggling online status...');
      
      const response = await makeAuthenticatedRequest(
        API_CONFIG.ENDPOINTS.DELIVERY_STATUS_TOGGLE,
        { method: 'POST' }
      );
      
      if (response.success) {
        setIsOnline(response.isOnline);
        console.log(`Status updated to: ${response.isOnline ? 'online' : 'offline'}`);
        
        // Refresh agent data to get updated stats
        await fetchAgentData();
      } else {
        Alert.alert('Status Update Failed', response.message || 'Unable to update status');
      }
    } catch (error) {
      console.error('Toggle status error:', error);
      Alert.alert('Error', 'Unable to update status. Please try again.');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              // Call logout API to update server status
              await makeAuthenticatedRequest(
                API_CONFIG.ENDPOINTS.DELIVERY_LOGOUT,
                { method: 'POST' }
              );
              
              await SecureStore.deleteItemAsync('deliveryToken');
              console.log('Delivery token removed, logging out');
              navigation.reset({
                index: 0,
                routes: [{ name: 'Portal' }],
              });
            } catch (error) {
              console.error('Logout error:', error);
              // Force navigation even if logout API fails
              await SecureStore.deleteItemAsync('deliveryToken');
              navigation.reset({
                index: 0,
                routes: [{ name: 'Portal' }],
              });
            }
          }
        }
      ]
    );
  };

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  // Don't render main content if not authenticated (extra safety)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />
      
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeText}>
                Welcome Back, {agentData?.name?.split(' ')[0] || 'Agent'}
              </Text>
              <Text style={styles.riderText}>
                {agentData?.status?.applicationStatus === 'approved' 
                  ? (isOnline ? 'You are online and ready for deliveries!' : 'Toggle online to start receiving orders') 
                  : `Status: ${agentData?.status?.applicationStatus || 'Pending'}`}
              </Text>
              {agentData?.status?.deliveryZone && (
                <Text style={styles.zoneText}>Zone: {agentData.status.deliveryZone}</Text>
              )}
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <LogOut size={18} color="#FFFFFF" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          {/* Agent Info Card */}
          <View style={styles.agentInfoCard}>
            <View style={styles.agentInfoHeader}>
              <View style={styles.agentInfoLeft}>
                <User size={24} color="#4F46E5" />
                <View style={styles.agentInfoText}>
                  <Text style={styles.agentName}>{agentData?.name || 'Loading...'}</Text>
                  <Text style={styles.agentRating}>
                    ⭐ {agentData?.status?.rating?.toFixed(1) || '5.0'} • ID: {agentData?.id?.slice(-6) || '------'}
                  </Text>
                </View>
              </View>
              <View style={[styles.statusBadge, { 
                backgroundColor: agentData?.status?.applicationStatus === 'approved' ? '#10B981' : '#F59E0B' 
              }]}>
                <Text style={styles.statusBadgeText}>
                  {agentData?.status?.applicationStatus?.toUpperCase() || 'PENDING'}
                </Text>
              </View>
            </View>
          </View>

          {/* Status Card */}
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <Text style={styles.statusLabel}>Delivery Status</Text>
              {agentData?.status?.applicationStatus !== 'approved' && (
                <Text style={styles.statusWarning}>Approval required to go online</Text>
              )}
            </View>
            <View style={styles.statusRow}>
              <View style={styles.statusTextContainer}>
                <Text style={[styles.statusText, { color: isOnline ? '#059669' : '#DC2626' }]}>
                  {isOnline ? 'Online & Available' : 'Offline'}
                </Text>
                {isOnline ? (
                  <Text style={styles.statusSubText}>Ready to receive orders</Text>
                ) : (
                  <Text style={styles.statusSubText}>Toggle to go online and receive orders</Text>
                )}
              </View>
              <Switch
                trackColor={{ false: "#E5E7EB", true: "#BBF7D0" }}
                thumbColor={isOnline ? "#059669" : "#6B7280"}
                ios_backgroundColor="#E5E7EB"
                onValueChange={toggleOnlineStatus}
                value={isOnline}
                disabled={statusLoading || agentData?.status?.applicationStatus !== 'approved'}
              />
            </View>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Truck size={24} color="#4F46E5" />
              </View>
              <Text style={styles.statNumber}>
                {agentData?.stats?.todayDeliveries || 0}
              </Text>
              <Text style={styles.statLabel}>Today's Deliveries</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <IndianRupee size={24} color="#059669" />
              </View>
              <Text style={styles.statNumber}>
                ₹{agentData?.stats?.earnings?.today || '0.00'}
              </Text>
              <Text style={styles.statLabel}>Today's Earnings</Text>
            </View>
          </View>

          {/* Additional Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Package size={24} color="#F59E0B" />
              </View>
              <Text style={styles.statNumber}>
                {agentData?.stats?.totalDeliveries || 0}
              </Text>
              <Text style={styles.statLabel}>Total Deliveries</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Clock size={24} color="#8B5CF6" />
              </View>
              <Text style={styles.statNumber}>
                ₹{agentData?.stats?.earnings?.thisMonth || '0.00'}
              </Text>
              <Text style={styles.statLabel}>This Month</Text>
            </View>
          </View>

          {/* Orders Section */}
          <Text style={styles.sectionTitle}>Delivery Requests</Text>
          
          {isOnline && agentData?.status?.applicationStatus === 'approved' ? (
            <View style={styles.emptyCard}>
              <Package size={48} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No new orders</Text>
              <Text style={styles.emptySubtitle}>Stay online to receive delivery requests when they become available</Text>
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Package size={48} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>
                {!isOnline 
                  ? 'Go online to receive requests' 
                  : agentData?.status?.applicationStatus !== 'approved'
                    ? 'Account approval pending'
                    : 'No new orders right now'
                }
              </Text>
              <Text style={styles.emptySubtitle}>
                {!isOnline 
                  ? 'Toggle the switch above to get started'
                  : agentData?.status?.applicationStatus !== 'approved'
                    ? 'Please wait for admin approval to start delivering'
                    : 'Check back later for more requests'
                }
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#4F46E5',
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  riderText: {
    fontSize: 16,
    color: '#C7D2FE',
    fontWeight: '400',
    marginBottom: 4,
  },
  zoneText: {
    fontSize: 14,
    color: '#E0E7FF',
    fontWeight: '400',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  agentInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  agentInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  agentInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  agentInfoText: {
    marginLeft: 12,
    flex: 1,
  },
  agentName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  agentRating: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '400',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statusHeader: {
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  statusWarning: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '400',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusTextContainer: {
    flex: 1,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  statusSubText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '400',
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '400',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  orderDistance: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  orderDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderText: {
    fontSize: 15,
    color: '#4B5563',
    marginLeft: 12,
    fontWeight: '400',
    flex: 1,
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  earningsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#059669',
  },
  itemsText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '400',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#059669',
  },
  rejectButton: {
    backgroundColor: '#DC2626',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  rejectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4B5563',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    fontWeight: '400',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '400',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '400',
  },
});

export default Homescreen;
