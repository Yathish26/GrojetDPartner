import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export default function Inventory() {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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

    const fetchInventory = async () => {
        try {
            const token = await SecureStore.getItemAsync('admintoken');

            const res = await fetch('http://192.168.1.35:5000/inventory/all', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();

            if (data.success) {
                setInventory(data.inventory);
            } else {
                setError(data.message || 'Failed to load inventory.');
            }
        } catch (err) {
            console.error(err);
            setError('Error fetching inventory.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    return (
        <View className="flex-1 bg-white px-4 pt-6">
            <Text className="text-2xl font-bold text-indigo-700 mb-4 text-center">Inventory</Text>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#4F46E5" />
                    <Text className="text-gray-500 mt-2">Loading inventory...</Text>
                </View>
            ) : error ? (
                <View className="flex-1 items-center justify-center">
                    <Text className="text-red-600 text-center">{error}</Text>
                </View>
            ) : (
                <ScrollView className="mb-4">
                    {inventory.map((item) => (
                        <View
                            key={item._id}
                            className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 shadow-sm"
                        >
                            <Text className="text-lg font-semibold text-gray-800">{item.itemName}</Text>
                            <Text className="text-sm text-gray-600">Category: {item.category}</Text>
                            <Text className="text-sm text-gray-600">Stock: {item.stockquantity}</Text>
                            <Text className="text-sm text-gray-600">Price: ₹{item.price}</Text>
                            <Text className="text-xs text-gray-400 mt-1">
                                Added on {new Date(item.addedAt).toLocaleString()}
                            </Text>
                        </View>
                    ))}
                </ScrollView>
            )}
        </View>
    );
}
