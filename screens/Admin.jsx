import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Package, PlusCircle, ClipboardList, LogOut } from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';

export default function Admin({ navigation }) {
  useEffect(() => {
    const verifyToken = async () => {
      const token = await SecureStore.getItemAsync('admintoken');
      if (!token) {
        await SecureStore.deleteItemAsync('admintoken');
        navigation.replace('Portal');
      }
    };
    verifyToken();
  }, []);

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('admintoken');
    navigation.replace('Portal');
  };

  return (
    <View className="flex-1 bg-gray-50 items-center justify-center px-4">
      <Text className="text-3xl font-bold text-indigo-700 mb-6">Admin Dashboard</Text>
      <Text className="text-gray-500 mb-10">Choose an action to manage the platform</Text>

      <TouchableOpacity
        className="bg-white border border-indigo-100 w-full p-4 rounded-xl mb-4 flex-row items-center shadow-sm"
        onPress={() => navigation.navigate('Inventory')}
      >
        <Package size={24} color="#4F46E5" />
        <Text className="ml-3 text-lg font-semibold text-indigo-700">View Inventory</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-white border border-indigo-100 w-full p-4 rounded-xl mb-4 flex-row items-center shadow-sm"
        onPress={() => navigation.navigate('AddInventory')}
      >
        <PlusCircle size={24} color="#059669" />
        <Text className="ml-3 text-lg font-semibold text-green-700">Add Inventory</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-white border border-indigo-100 w-full p-4 rounded-xl mb-6 flex-row items-center shadow-sm"
        onPress={() => navigation.navigate('AssignOrders')}
      >
        <ClipboardList size={24} color="#D97706" />
        <Text className="ml-3 text-lg font-semibold text-yellow-700">Assign Orders</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="mt-6 px-5 py-3 bg-red-100 rounded-xl"
        onPress={handleLogout}
      >
        <View className="flex-row items-center">
          <LogOut size={20} color="#DC2626" />
          <Text className="ml-2 text-red-600 font-semibold">Logout</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
