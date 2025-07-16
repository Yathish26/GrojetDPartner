import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { MapPin, ShoppingBag, Truck, Package, IndianRupee } from 'lucide-react-native';

const Homescreen = ({ navigation }) => {
  const [isOnline, setIsOnline] = useState(false);

  const toggleOnlineStatus = () => {
    setIsOnline(previousState => !previousState);
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
    <View className="flex-1 bg-gray-100">
      <View className="p-6 pb-12 flex-row justify-between items-start mb-3 bg-indigo-700 rounded-b-3xl shadow-lg">
        <View className="flex-col">
          <Text className="text-white text-4xl font-extrabold mb-2">Rider!</Text>
          <Text className="text-indigo-200 text-lg">Your next delivery awaits.</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Portal')} className="bg-red-500 rounded-xl p-3 shadow-lg">
          <Text className="text-white text-lg">Logout</Text>
        </TouchableOpacity>
      </View>


      <View className="flex-row justify-between items-center p-5 bg-white mx-5 -mt-10 rounded-2xl shadow-xl z-10 border border-indigo-100">
        <Text className="text-xl font-bold text-gray-800">Status:</Text>
        <View className="flex-row items-center">
          <Text className={`text-xl font-extrabold mr-3 ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
          <Switch
            trackColor={{ false: "#E0E0E0", true: "#A5D6A7" }}
            thumbColor={isOnline ? "#4CAF50" : "#F5F5F5"}
            ios_backgroundColor="#E0E0E0"
            onValueChange={toggleOnlineStatus}
            value={isOnline}
          />
        </View>
      </View>

      <View className="flex-row justify-around mt-8 mx-5">
        <View className="items-center bg-blue-100 p-5 rounded-2xl flex-1 mr-2 shadow-md border border-blue-200">
          <Truck size={36} color="#1E40AF" />
          <Text className="text-blue-800 text-4xl font-extrabold mt-3">12</Text>
          <Text className="text-blue-700 text-base mt-1">Deliveries Today</Text>
        </View>
        <View className="items-center bg-yellow-100 p-5 rounded-2xl flex-1 ml-2 shadow-md border border-yellow-200">
          <IndianRupee size={36} color="#B45309" />
          <Text className="text-yellow-800 text-4xl font-extrabold mt-3">₹85.20</Text>
          <Text className="text-yellow-700 text-base mt-1">Today's Earnings</Text>
        </View>
      </View>

      <Text className="text-2xl font-bold text-gray-800 mt-10 mb-5 mx-5">New Delivery Request</Text>
      {isOnline && newOrder ? (
        <View className="bg-white mx-5 p-6 rounded-2xl shadow-xl border border-gray-200">
          <Text className="text-xl font-extrabold text-gray-900 mb-4">Order #{newOrder.id}</Text>

          <View className="flex-row items-center mb-3">
            <MapPin size={24} color="#DC2626" />
            <Text className="text-gray-700 ml-3 text-base">Pickup: {newOrder.pickup}</Text>
          </View>
          <View className="flex-row items-center mb-4">
            <ShoppingBag size={24} color="#059669" />
            <Text className="text-gray-700 ml-3 text-base">Drop-off: {newOrder.dropoff}</Text>
          </View>

          <Text className="text-2xl font-extrabold text-green-700 mb-6 mt-2">Est. Earnings: ₹{newOrder.earnings}</Text>

          <View className="flex-row justify-around">
            <TouchableOpacity
              className="bg-green-600 px-8 py-4 rounded-xl shadow-lg flex-1 items-center mr-3 active:bg-green-700"
              onPress={handleAcceptOrder}
            >
              <Text className="text-white font-bold text-lg">Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-red-500 px-8 py-4 rounded-xl shadow-lg flex-1 items-center ml-3 active:bg-red-600"
              onPress={handleRejectOrder}
            >
              <Text className="text-white font-bold text-lg">Reject</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View className="bg-white mx-5 p-6 rounded-2xl shadow-xl items-center border border-gray-200">
          <Package size={56} color="#9CA3AF" />
          <Text className="text-2xl font-bold text-gray-700 mt-5 text-center">
            {isOnline ? 'No new orders right now!' : 'Go online to receive delivery requests!'}
          </Text>
          <Text className="text-gray-500 mt-3 text-center text-base">
            {isOnline ? 'Stay tuned, more requests coming soon.' : 'Toggle the switch above to get started.'}
          </Text>
        </View>
      )}
    </View>
  );
};

export default Homescreen;

const styles = StyleSheet.create({});