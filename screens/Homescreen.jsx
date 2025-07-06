import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { MapPin, ShoppingBag, Truck, DollarSign, Package } from 'lucide-react-native'; // Changed import to lucide-react-native

const Homescreen = ({ navigation }) => {
  const [isOnline, setIsOnline] = useState(false);

  const toggleOnlineStatus = () => {
    setIsOnline(previousState => !previousState);
    alert(isOnline ? 'Going Offline...' : 'Going Online!');
  };

  const handleAcceptOrder = () => {
    alert('Order Accepted! Navigating to Order Details...');
    navigation.navigate('Orders');
  };

  const handleRejectOrder = () => {
    alert('Order Rejected.');
  };

  const newOrder = {
    id: 'GJD7890',
    pickup: '123 Main St, Cityville',
    dropoff: '456 Oak Ave, Townsville',
    earnings: '7.50',
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="p-6 bg-indigo-700 rounded-b-2xl shadow-lg">
        <Text className="text-white text-3xl font-bold mb-2">Welcome, Rider!</Text>
        <Text className="text-indigo-100 text-lg">Your next delivery awaits.</Text>
      </View>

      <View className="flex-row justify-between items-center p-4 bg-white mx-4 -mt-8 rounded-xl shadow-md z-10">
        <Text className="text-xl font-semibold text-gray-800">Status: </Text>
        <View className="flex-row items-center">
          <Text className={`text-lg font-bold mr-2 ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
          <Switch
            trackColor={{ false: "#E5E7EB", true: "#81C784" }}
            thumbColor={isOnline ? "#4CAF50" : "#F3F4F6"}
            ios_backgroundColor="#E5E7EB"
            onValueChange={toggleOnlineStatus}
            value={isOnline}
          />
        </View>
      </View>

      <View className="flex-row justify-around mt-6 mx-4">
        <View className="items-center bg-blue-50 p-4 rounded-xl w-[48%] shadow-sm">
          {/* Removed 'weight' prop as it's not applicable to lucide-react-native */}
          <Truck size={32} color="#2563EB" />
          <Text className="text-blue-700 text-3xl font-bold mt-2">12</Text>
          <Text className="text-blue-600 text-base mt-1">Deliveries Today</Text>
        </View>
        <View className="items-center bg-yellow-50 p-4 rounded-xl w-[48%] shadow-sm">
          {/* Removed 'weight' prop */}
          <DollarSign size={32} color="#D97706" />
          <Text className="text-yellow-700 text-3xl font-bold mt-2">$85.20</Text>
          <Text className="text-yellow-600 text-base mt-1">Today's Earnings</Text>
        </View>
      </View>

      <Text className="text-2xl font-bold text-gray-800 mt-8 mb-4 mx-4">New Delivery Request</Text>
      {isOnline && newOrder ? (
        <View className="bg-white mx-4 p-5 rounded-xl shadow-md">
          <Text className="text-lg font-semibold text-gray-900 mb-3">Order #{newOrder.id}</Text>

          <View className="flex-row items-center mb-2">
            {/* Removed 'weight' prop */}
            <MapPin size={20} color="#EF4444" />
            <Text className="text-gray-700 ml-2 text-base">Pickup: {newOrder.pickup}</Text>
          </View>
          <View className="flex-row items-center mb-3">
            {/* Removed 'weight' prop */}
            <ShoppingBag size={20} color="#10B981" />
            <Text className="text-gray-700 ml-2 text-base">Drop-off: {newOrder.dropoff}</Text>
          </View>

          <Text className="text-xl font-bold text-green-700 mb-4">Est. Earnings: ${newOrder.earnings}</Text>

          <View className="flex-row justify-around">
            <TouchableOpacity
              className="bg-green-600 px-6 py-3 rounded-lg shadow-sm flex-1 items-center mr-2"
              onPress={handleAcceptOrder}
            >
              <Text className="text-white font-bold text-lg">Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-red-500 px-6 py-3 rounded-lg shadow-sm flex-1 items-center ml-2"
              onPress={handleRejectOrder}
            >
              <Text className="text-white font-bold text-lg">Reject</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View className="bg-white mx-4 p-5 rounded-xl shadow-md items-center">
          {/* Removed 'weight' prop */}
          <Package size={48} color="#9CA3AF" />
          <Text className="text-xl font-semibold text-gray-700 mt-4 text-center">
            {isOnline ? 'No new orders right now!' : 'Go online to receive delivery requests!'}
          </Text>
          <Text className="text-gray-500 mt-2 text-center">
            {isOnline ? 'Stay tuned, more requests coming soon.' : 'Toggle the switch above to get started.'}
          </Text>
        </View>
      )}

      <TouchableOpacity
        className="bg-indigo-500 py-4 rounded-xl shadow-md mt-8 mx-4 items-center"
        onPress={() => navigation.navigate('Orders')}
      >
        <Text className="text-white text-lg font-bold">View All My Deliveries</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Homescreen;
