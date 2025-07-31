import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';
import API_CONFIG, { makeAuthenticatedRequest } from '../config/api.js';

export default function AddInventory() {
    const [itemName, setItemName] = useState('');
    const [stockquantity, setStockQuantity] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();

    useEffect(() => {
        const verifyToken = async () => {
            const deliveryAgent = await SecureStore.getItemAsync('deliveryAgent');
            if (!deliveryAgent) {
                navigation.replace('Portal');
            }
        };
        verifyToken();
    }, []);

    const navigate = useNavigation();

    useEffect(() => {
        const verifyToken = async () => {
            const deliveryAgent = await SecureStore.getItemAsync('deliveryAgent');
            if (!deliveryAgent) {
                navigation.replace('Portal');
            }
        };
        verifyToken();
    }, [navigation]);

    const handleAddItem = async () => {
        if (!itemName || !stockquantity || !price || !category) {
            Alert.alert('Missing Fields', 'Please fill in all fields.');
            return;
        }

        try {
            setLoading(true);

            const response = await makeAuthenticatedRequest(API_CONFIG.ENDPOINTS.INVENTORY_ADD, {
                method: 'POST',
                body: JSON.stringify({
                    name: itemName,
                    quantity: Number(stockquantity),
                    price: Number(price),
                    category,
                    unit: 'pieces' // Default unit
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                Alert.alert('Success', 'Item added successfully!');
                navigation.navigate('Inventory');
                setItemName('');
                setStockQuantity('');
                setPrice('');
                setCategory('');
            } else {
                if (response.status === 401) {
                    Alert.alert('Authentication Error', 'Please log in again.');
                    navigation.replace('Portal');
                    return;
                }
                Alert.alert('Error', data.message || 'Failed to add item.');
            }
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-white p-6">
            <Text className="text-2xl font-bold text-green-700 mb-6 text-center">Add Inventory</Text>

            <TextInput
                className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 mb-4 text-gray-800"
                placeholder="Item Name"
                value={itemName}
                onChangeText={setItemName}
            />
            <TextInput
                className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 mb-4 text-gray-800"
                placeholder="Stock Quantity"
                keyboardType="numeric"
                value={stockquantity}
                onChangeText={setStockQuantity}
            />
            <TextInput
                className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 mb-4 text-gray-800"
                placeholder="Price"
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
            />
            <TextInput
                className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 mb-6 text-gray-800"
                placeholder="Category"
                value={category}
                onChangeText={setCategory}
            />

            <TouchableOpacity
                className="bg-green-600 py-4 rounded-xl items-center"
                onPress={handleAddItem}
                disabled={loading}
            >
                <Text className="text-white font-semibold text-lg">
                    {loading ? 'Adding...' : 'Add Item'}
                </Text>
            </TouchableOpacity>
        </View>
    );
}
