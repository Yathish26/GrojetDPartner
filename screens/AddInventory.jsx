import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';

export default function AddInventory() {
    const [itemName, setItemName] = useState('');
    const [stockquantity, setStockQuantity] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [loading, setLoading] = useState(false);

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

    const navigate = useNavigation();

    useEffect(() => {
        const verifyToken = async () => {
            const token = await SecureStore.getItemAsync('admintoken');
            if (!token) {
                await SecureStore.deleteItemAsync('admintoken');
                navigate.replace('Portal');
            }
        };
        verifyToken();
    }, []);

    const handleAddItem = async () => {
        if (!itemName || !stockquantity || !price || !category) {
            Alert.alert('Missing Fields', 'Please fill in all fields.');
            return;
        }

        try {
            setLoading(true);
            const token = await SecureStore.getItemAsync('admintoken');

            const response = await fetch('http://192.168.1.35:5000/inventory/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    itemName,
                    stockquantity: Number(stockquantity),
                    price: Number(price),
                    category,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                Alert.alert('Success', 'Item added successfully!');
                navigate.navigate('Inventory');
                setItemName('');
                setStockQuantity('');
                setPrice('');
                setCategory('');
            } else {
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
