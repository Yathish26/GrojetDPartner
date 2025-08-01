import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Switch, SafeAreaView, StatusBar, Alert, RefreshControl, ScrollView, ActivityIndicator } from 'react-native';
import { Truck, Package, IndianRupee, Power, User, Clock } from 'lucide-react-native';
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
        setIsAuthenticated(false);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Portal' }],
        });
        return;
      }

      setIsAuthenticated(true);
      await fetchAgentData();
    } catch (error) {
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
      const response = await makeAuthenticatedRequest(API_CONFIG.ENDPOINTS.DELIVERY_PROFILE);
      if (response && response.success) {
        setAgentData(response.agent);
        setIsOnline(response.agent.status.isOnline);
      } else {
        const errorMessage = response?.message || 'Unknown error occurred';
        Alert.alert('Error', `Failed to load profile data: ${errorMessage}`);
      }
    } catch (error) {
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
      const response = await makeAuthenticatedRequest(
        API_CONFIG.ENDPOINTS.DELIVERY_STATUS_TOGGLE,
        { method: 'POST' }
      );
      if (response.success) {
        setIsOnline(response.isOnline);
        await fetchAgentData();
      } else {
        Alert.alert('Status Update Failed', response.message || 'Unable to update status');
      }
    } catch (error) {
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
              await makeAuthenticatedRequest(
                API_CONFIG.ENDPOINTS.DELIVERY_LOGOUT,
                { method: 'POST' }
              );
              await SecureStore.deleteItemAsync('deliveryToken');
              navigation.reset({
                index: 0,
                routes: [{ name: 'Portal' }],
              });
            } catch (error) {
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

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="text-base text-gray-500 font-normal mt-2">Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className="bg-indigo-700 pb-5">
          <View className="flex-row justify-between items-start px-5 pt-5">
            <View className="flex-1">
              <Text className="text-2xl font-semibold text-white mb-1">Welcome Back,</Text>
              <Text className="text-2xl font-semibold text-white mb-1">{agentData?.name?.split(' ')[0] || 'Agent'}</Text>
              <Text className="text-base text-indigo-100 font-normal mb-1">
                {agentData?.status?.applicationStatus === 'approved'
                  ? (isOnline ? 'You are online and ready for deliveries!' : 'Toggle online to start receiving orders')
                  : `Status: ${agentData?.status?.applicationStatus || 'Pending'}`}
              </Text>
              {agentData?.status?.deliveryZone && (
                <Text className="text-sm text-indigo-100 font-normal">Zone: {agentData.status.deliveryZone}</Text>
              )}
            </View>
            <TouchableOpacity onPress={handleLogout} className="bg-red-600 p-4 rounded-full flex-row items-center">
              <Power size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-1 px-5 pt-5">
          {/* Agent Info Card */}
          <View className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center flex-1">
                <User size={24} color="#4F46E5" />
                <View className="ml-3 flex-1">
                  <Text className="text-lg font-semibold text-gray-900 mb-0.5">{agentData?.name || 'Loading...'}</Text>
                  <Text className="text-xs text-gray-500 font-normal">
                    ⭐ {agentData?.status?.rating?.toFixed(1) || '5.0'} • ID: {agentData?.id?.slice(-6) || '------'}
                  </Text>
                </View>
              </View>
              <View className={`px-2 py-1 rounded-md ${agentData?.status?.applicationStatus === 'approved' ? 'bg-green-500' : 'bg-yellow-400'}`}>
                <Text className="text-xs font-bold text-white">
                  {agentData?.status?.applicationStatus?.toUpperCase() || 'PENDING'}
                </Text>
              </View>
            </View>
          </View>

          {/* Status Card */}
          <View className="bg-white rounded-xl p-5 mb-5 border border-gray-200">
            <View className="mb-3">
              <Text className="text-base font-medium text-gray-900 mb-1">Delivery Status</Text>
              {agentData?.status?.applicationStatus !== 'approved' && (
                <Text className="text-xs text-yellow-500 font-normal">Approval required to go online</Text>
              )}
            </View>
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className={`text-lg font-semibold mb-1 ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                  {isOnline ? 'Online & Available' : 'Offline'}
                </Text>
                <Text className="text-sm text-gray-500 font-normal">
                  {isOnline ? 'Ready to receive orders' : 'Toggle to go online and receive orders'}
                </Text>
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

          <View className="flex-row mb-5">
            <View className="flex-1">
              <View className="flex-row flex-wrap bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Today's Deliveries */}
                <View className="w-1/2 p-4 items-center border-b border-r border-gray-100">
                  <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mb-3">
                    <Truck size={24} color="#4F46E5" />
                  </View>
                  <Text className="text-xl font-semibold text-gray-900 mb-1">{agentData?.stats?.todayDeliveries || 0}</Text>
                  <Text className="text-xs text-gray-500 text-center font-normal">Today's Deliveries</Text>
                </View>
                {/* Today's Earnings */}
                <View className="w-1/2 p-4 items-center border-b border-gray-100">
                  <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mb-3">
                    <IndianRupee size={24} color="#059669" />
                  </View>
                  <Text className="text-xl font-semibold text-gray-900 mb-1">₹{agentData?.stats?.earnings?.today || '0.00'}</Text>
                  <Text className="text-xs text-gray-500 text-center font-normal">Today's Earnings</Text>
                </View>
                {/* Total Deliveries */}
                <View className="w-1/2 p-4 items-center border-r border-gray-100">
                  <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mb-3">
                    <Package size={24} color="#F59E0B" />
                  </View>
                  <Text className="text-xl font-semibold text-gray-900 mb-1">{agentData?.stats?.totalDeliveries || 0}</Text>
                  <Text className="text-xs text-gray-500 text-center font-normal">Total Deliveries</Text>
                </View>
                {/* This Month Earnings */}
                <View className="w-1/2 p-4 items-center">
                  <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mb-3">
                    <Clock size={24} color="#8B5CF6" />
                  </View>
                  <Text className="text-xl font-semibold text-gray-900 mb-1">₹{agentData?.stats?.earnings?.thisMonth || '0.00'}</Text>
                  <Text className="text-xs text-gray-500 text-center font-normal">This Month</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Orders Section */}
          <Text className="text-lg font-semibold text-gray-900 mb-4">Delivery Requests</Text>
          {isOnline && agentData?.status?.applicationStatus === 'approved' ? (
            <View className="bg-white rounded-xl px-8 py-10 items-center border border-gray-200 mb-5">
              <Package size={48} color="#9CA3AF" />
              <Text className="text-base font-medium text-gray-700 text-center mt-4 mb-2">No new orders</Text>
              <Text className="text-sm text-gray-400 text-center font-normal">Stay online to receive delivery requests when they become available</Text>
            </View>
          ) : (
            <View className="bg-white rounded-xl px-8 py-10 items-center border border-gray-200 mb-5">
              <Package size={48} color="#9CA3AF" />
              <Text className="text-base font-medium text-gray-700 text-center mt-4 mb-2">
                {!isOnline
                  ? 'Go online to receive requests'
                  : agentData?.status?.applicationStatus !== 'approved'
                    ? 'Account approval pending'
                    : 'No new orders right now'
                }
              </Text>
              <Text className="text-sm text-gray-400 text-center font-normal">
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

export default Homescreen;