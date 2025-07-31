import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TextInput, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Search, MoreVertical, Edit, Trash2, XCircle, CheckCircle, Plus } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import API_CONFIG, { makeAuthenticatedRequest } from '../config/api.js';

// Custom Alert/Modal Component (reused from previous implementation)
const CustomAlert = ({ visible, message, type, onClose }) => {
  const isSuccess = type === 'success';
  const bgColor = isSuccess ? 'bg-green-100' : 'bg-red-100';
  const textColor = isSuccess ? 'text-green-800' : 'text-red-800';
  const iconColor = isSuccess ? '#10B981' : '#EF4444';

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50 px-4">
          <View className={`w-full max-w-sm p-6 rounded-xl shadow-2xl flex-row items-center ${bgColor}`}>
            {isSuccess ? (
              <CheckCircle size={28} color={iconColor} className="mr-4" />
            ) : (
              <XCircle size={28} color={iconColor} className="mr-4" />
            )}
            <View className="flex-1">
              <Text className={`font-bold text-lg mb-1 ${textColor}`}>
                {isSuccess ? 'Success' : 'Error'}
              </Text>
              <Text className={`text-base ${textColor}`}>
                {message}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} className="ml-4 p-1">
              <XCircle size={20} color={isSuccess ? '#065F46' : '#B91C1C'} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// Confirmation Modal for Delete
const ConfirmationModal = ({ visible, message, onConfirm, onCancel }) => {
  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50 px-4">
          <View className="w-full max-w-sm bg-white rounded-xl shadow-2xl p-6">
            <Text className="text-xl font-bold text-center mb-4 text-gray-800">Confirm Action</Text>
            <Text className="text-base text-center mb-6 text-gray-600">{message}</Text>
            <View className="flex-row justify-around">
              <TouchableOpacity
                className="bg-red-500 py-3 px-6 rounded-lg shadow-md"
                onPress={onConfirm}
              >
                <Text className="text-white font-semibold text-lg">Confirm</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-gray-300 py-3 px-6 rounded-lg shadow-md"
                onPress={onCancel}
              >
                <Text className="text-gray-800 font-semibold text-lg">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// Edit Item Modal
const EditItemModal = ({ visible, item, onSave, onCancel, isLoading }) => {
  const [itemName, setItemName] = useState(item?.itemName || '');
  const [category, setCategory] = useState(item?.category || '');
  const [stockQuantity, setStockQuantity] = useState(String(item?.stockquantity || ''));
  const [price, setPrice] = useState(String(item?.price || ''));

  useEffect(() => {
    if (item) {
      setItemName(item.itemName);
      setCategory(item.category);
      setStockQuantity(String(item.stockquantity));
      setPrice(String(item.price));
    }
  }, [item]);

  const handleSave = () => {
    onSave({
      _id: item._id,
      itemName,
      category,
      stockquantity: parseInt(stockQuantity),
      price: parseFloat(price),
    });
  };

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50 px-4">
          <View className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6">
            <Text className="text-2xl font-bold text-center mb-6 text-indigo-700">Edit Item</Text>

            <View className="mb-4">
              <Text className="text-gray-700 text-base mb-1">Item Name</Text>
              <TextInput
                className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-lg text-gray-800"
                value={itemName}
                onChangeText={setItemName}
                editable={!isLoading}
              />
            </View>
            <View className="mb-4">
              <Text className="text-gray-700 text-base mb-1">Category</Text>
              <TextInput
                className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-lg text-gray-800"
                value={category}
                onChangeText={setCategory}
                editable={!isLoading}
              />
            </View>
            <View className="mb-4">
              <Text className="text-gray-700 text-base mb-1">Stock Quantity</Text>
              <TextInput
                className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-lg text-gray-800"
                value={stockQuantity}
                onChangeText={setStockQuantity}
                keyboardType="numeric"
                editable={!isLoading}
              />
            </View>
            <View className="mb-6">
              <Text className="text-gray-700 text-base mb-1">Price (₹)</Text>
              <TextInput
                className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-lg text-gray-800"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                editable={!isLoading}
              />
            </View>

            <View className="flex-row justify-around">
              <TouchableOpacity
                className={`py-3 px-6 rounded-lg shadow-md ${isLoading ? 'bg-gray-400' : 'bg-indigo-600'}`}
                onPress={handleSave}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text className="text-white font-semibold text-lg">Save</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-gray-300 py-3 px-6 rounded-lg shadow-md"
                onPress={onCancel}
                disabled={isLoading}
              >
                <Text className="text-gray-800 font-semibold text-lg">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// New ItemMenuModal Component for the three-dot menu
const ItemMenuModal = ({ visible, item, onClose, onEdit, onDelete, position }) => {
  if (!visible || !item || !position) return null;

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      {/* Transparent background to capture taps outside the menu */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.05)' }}>
          {/* Menu content, positioned absolutely */}
          <View
            style={{
              position: 'absolute',
              top: position.y,
              left: position.x - 120, // Adjust left to position menu relative to icon
              backgroundColor: 'white',
              borderColor: '#E5E7EB', // Tailwind gray-200
              borderWidth: 1,
              borderRadius: 8,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 5, // Android shadow
              zIndex: 10,
              width: 120, // w-32 equivalent
            }}
          >
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}
              onPress={() => {
                onEdit(item);
                onClose();
              }}
            >
              <Edit size={16} color="#4F46E5" style={{ marginRight: 8 }} />
              <Text style={{ color: '#4F46E5', fontSize: 14 }}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', padding: 12 }}
              onPress={() => {
                onDelete(item._id);
                onClose();
              }}
            >
              <Trash2 size={16} color="#EF4444" style={{ marginRight: 8 }} />
              <Text style={{ color: '#EF4444', fontSize: 14 }}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};


export default function Inventory() {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState('error');
    const [menuVisible, setMenuVisible] = useState(false); // Boolean to control ItemMenuModal visibility
    const [selectedMenuItem, setSelectedMenuItem] = useState(null); // Stores the item for the menu
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 }); // Position to display menu
    const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
    const [itemIdToDelete, setItemIdToDelete] = useState(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [itemToEdit, setItemToEdit] = useState(null);
    const [isEditingLoading, setIsEditingLoading] = useState(false);


    const navigation = useNavigation();

    const showAlert = (message, type) => {
      setAlertMessage(message);
      setAlertType(type);
      setAlertVisible(true);
    };

    const hideAlert = () => {
      setAlertVisible(false);
      setAlertMessage('');
    };

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
        setLoading(true);
        setError('');
        try {
            const response = await makeAuthenticatedRequest(API_CONFIG.ENDPOINTS.INVENTORY_ALL);

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 401) {
                    showAlert('Authentication failed. Please log in again.', 'error');
                    navigation.replace('Portal');
                    return;
                }
                throw new Error(errorData.message || 'Failed to fetch inventory.');
            }

            const data = await response.json();

            if (data.success) {
                setInventory(data.data.items);
            } else {
                setError(data.message || 'Failed to load inventory.');
                showAlert(data.message || 'Failed to load inventory.', 'error');
            }
        } catch (err) {
            console.error(err);
            setError('Error fetching inventory: ' + err.message);
            showAlert('Error fetching inventory: ' + err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const filteredInventory = inventory.filter(item =>
        item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDeleteItem = async () => {
        if (!itemIdToDelete) return;

        setConfirmDeleteVisible(false); // Hide confirmation modal
        setLoading(true); // Show main loading indicator
        setError('');

        try {
            const response = await makeAuthenticatedRequest(`${API_CONFIG.ENDPOINTS.INVENTORY_DELETE}/${itemIdToDelete}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 401) {
                    showAlert('Authentication failed. Please log in again.', 'error');
                    navigation.replace('Portal');
                    return;
                }
                throw new Error(errorData.message || 'Failed to delete item.');
            }

            const data = await response.json();
            if (data.success) {
                showAlert('Item deleted successfully!', 'success');
                fetchInventory(); // Refresh the list
            } else {
                showAlert(data.message || 'Failed to delete item.', 'error');
            }
        } catch (err) {
            console.error(err);
            showAlert('Error deleting item: ' + err.message, 'error');
        } finally {
            setLoading(false);
            setItemIdToDelete(null);
            setSelectedMenuItem(null); // Ensure menu item is cleared
            setMenuVisible(false); // Close menu
        }
    };

    const handleEditItem = async (updatedItem) => {
        if (!updatedItem || !updatedItem._id) return;

        setIsEditingLoading(true); // Show loading inside edit modal
        setError('');

        try {
            const response = await makeAuthenticatedRequest(`${API_CONFIG.ENDPOINTS.INVENTORY_EDIT}/${updatedItem._id}`, {
                method: 'PUT',
                body: JSON.stringify(updatedItem)
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 401) {
                    showAlert('Authentication failed. Please log in again.', 'error');
                    navigation.replace('Portal');
                    return;
                }
                throw new Error(errorData.message || 'Failed to update item.');
            }

            const data = await response.json();
            if (data.success) {
                showAlert('Item updated successfully!', 'success');
                setEditModalVisible(false); // Close edit modal
                fetchInventory(); // Refresh the list
            } else {
                showAlert(data.message || 'Failed to update item.', 'error');
            }
        } catch (err) {
            console.error(err);
            showAlert('Error updating item: ' + err.message, 'error');
        } finally {
            setIsEditingLoading(false);
            setSelectedMenuItem(null); // Ensure menu item is cleared
            setMenuVisible(false); // Close menu
        }
    };

    // Function to handle opening the menu and capturing position
    const openMenu = (item, event) => {
        // Measure the position of the MoreVertical icon
        event.target.measure((fx, fy, width, height, px, py) => {
            setMenuPosition({ x: px + width, y: py }); // Position menu relative to icon's top-right
            setSelectedMenuItem(item);
            setMenuVisible(true);
        });
    };

    return (
        <View className="flex-1 bg-white px-4 pt-6">
            <CustomAlert
                visible={alertVisible}
                message={alertMessage}
                type={alertType}
                onClose={hideAlert}
            />

            <ConfirmationModal
                visible={confirmDeleteVisible}
                message="Are you sure you want to delete this item? This action cannot be undone."
                onConfirm={handleDeleteItem}
                onCancel={() => {
                    setConfirmDeleteVisible(false);
                    setItemIdToDelete(null);
                    setSelectedMenuItem(null);
                    setMenuVisible(false);
                }}
            />

            {itemToEdit && (
                <EditItemModal
                    visible={editModalVisible}
                    item={itemToEdit}
                    onSave={handleEditItem}
                    onCancel={() => {
                        setEditModalVisible(false);
                        setItemToEdit(null);
                        setSelectedMenuItem(null);
                        setMenuVisible(false);
                    }}
                    isLoading={isEditingLoading}
                />
            )}

            {/* Item Menu Modal */}
            <ItemMenuModal
                visible={menuVisible}
                item={selectedMenuItem}
                onClose={() => setMenuVisible(false)}
                onEdit={(item) => {
                    setItemToEdit(item);
                    setEditModalVisible(true);
                }}
                onDelete={(itemId) => {
                    setConfirmDeleteVisible(true);
                    setItemIdToDelete(itemId);
                }}
                position={menuPosition}
            />

            <Text className="text-2xl font-bold text-indigo-700 mb-4 text-center">Inventory</Text>

            <View className="flex-row items-center bg-gray-50 rounded-full px-4 mb-4 border border-gray-200 shadow-md ">
                <Search size={20} color="#6B7280" />
                <TextInput
                    className="flex-1 ml-3 text-lg text-gray-800"
                    placeholder="Search inventory..."
                    placeholderTextColor="#9CA3AF"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

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
                <ScrollView className="flex-1">
                    {filteredInventory.length > 0 ? (
                        filteredInventory.map((item) => (
                            <View
                                key={item._id}
                                className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm relative"
                            >
                                <View className="flex-row justify-between items-start mb-2">
                                    <Text className="text-lg font-semibold text-gray-800 flex-1 pr-8">{item.itemName}</Text>
                                    <TouchableOpacity
                                        className="p-1"
                                        onPress={(event) => openMenu(item, event)} // Pass event to capture position
                                    >
                                        <MoreVertical size={20} color="#6B7280" />
                                    </TouchableOpacity>
                                </View>
                                <Text className="text-sm text-gray-600 mb-1">Category: {item.category}</Text>
                                <Text className="text-sm text-gray-600 mb-1">Stock: {item.stockquantity}</Text>
                                <Text className="text-sm text-gray-600">Price: ₹{item.price.toFixed(2)}</Text>
                                <Text className="text-xs text-gray-400 mt-2">
                                    Added on {new Date(item.addedAt).toLocaleString()}
                                </Text>
                            </View>
                        ))
                    ) : (
                        <View className="flex-1 items-center justify-center mt-8">
                            <Text className="text-gray-500 text-lg">No items found matching your search.</Text>
                        </View>
                    )}
                </ScrollView>
            )}

            {/* Floating Add Button */}
            <TouchableOpacity
                className="absolute bottom-6 right-6 bg-indigo-600 p-4 rounded-full shadow-lg"
                onPress={() => navigation.navigate('AddInventory')}
            >
                <Plus size={30} color="#ffffff" />
            </TouchableOpacity>
        </View>
    );
}
