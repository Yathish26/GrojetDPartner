import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  TouchableWithoutFeedback,
  StyleSheet,
  Image
} from 'react-native';
import { Package, Mail, Lock, XCircle, CheckCircle } from 'lucide-react-native'; // Removed User, ChevronLeft
import * as SecureStore from 'expo-secure-store';
import NetInfo from '@react-native-community/netinfo';
import { useNavigation } from '@react-navigation/native';

const CustomAlert = ({ visible, message, type, onClose }) => {
  const isSuccess = type === 'success';
  const iconColor = isSuccess ? '#15803D' : '#B91C1C';
  const borderColor = isSuccess ? 'border-green-200' : 'border-red-200';

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 justify-center items-center bg-black/50 px-5">
          <View className={`w-full max-w-sm rounded-2xl p-5 bg-white border ${borderColor}`}>
            <View className="flex-row items-center space-x-3">
              {isSuccess ? (
                <CheckCircle size={28} color={iconColor} />
              ) : (
                <XCircle size={28} color={iconColor} />
              )}
              <View className="flex-1">
                <Text className={`text-lg font-semibold ${isSuccess ? 'text-green-700' : 'text-red-700'}`}>
                  {isSuccess ? 'Success' : 'Error'}
                </Text>
                <Text className="text-gray-700 mt-1 text-sm">
                  {message}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const InputField = ({ icon, placeholder, value, onChangeText, secureTextEntry, keyboardType, editable, color }) => {
  const borderColor = color === 'primary' ? 'border-indigo-500' : 'border-green-500';
  const iconColor = color === 'primary' ? '#4F46E5' : '#059669';

  return (
    <View className={`flex-row items-center bg-gray-50 rounded-lg p-3 mb-4 border border-gray-200 focus-within:border-${color === 'primary' ? 'indigo' : 'green'}-500`}>
      {React.cloneElement(icon, { size: 20, color: iconColor })}
      <TextInput
        className="flex-1 ml-3 text-base text-gray-800"
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        keyboardType={keyboardType}
        autoCapitalize="none"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        editable={editable}
      />
    </View>
  );
};

const Portal = () => {
  // Removed loginType state as it's no longer needed for conditional rendering of forms
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('error');
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  const showAlert = (message, type) => {
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
  };

  const hideAlert = () => {
    setAlertVisible(false);
  };

  const navigation = useNavigation();

  const handleDeliveryLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showAlert('Please enter both email and password.', 'error');
      return;
    }

    if (!isConnected) {
      showAlert('No internet connection. Please check your network.', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://192.168.1.35:5000/delivery/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Delivery login failed');
      }

      const data = await response.json();
      await SecureStore.setItemAsync('deliverytoken', data.token);
      
      showAlert('Delivery login successful!', 'success');
      setTimeout(() => {
        hideAlert(); // Hide alert before navigating
        navigation.navigate('Home');
      }, 1500);
    } catch (error) {
      showAlert(error.message || 'Delivery login failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Removed handleAdminLogin function as it's no longer handled here

  return (
    <KeyboardAvoidingView
      behavior='padding'
      className="flex-1 bg-gray-50"
    >
      <CustomAlert
        visible={alertVisible}
        message={alertMessage}
        type={alertType}
        onClose={hideAlert}
      />

      <View className="flex-1 items-center justify-center p-6">
        <View className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">
          {/* Only Delivery Partner Login form is rendered */}
          <Text className="text-2xl font-bold text-center mb-8 text-indigo-700">
            Delivery Partner Login
          </Text>

          <InputField
            icon={<Mail />}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            editable={!loading}
            color="primary"
          />

          <InputField
            icon={<Lock />}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
            color="primary"
          />

          <TouchableOpacity
            className="py-3 rounded-xl bg-indigo-600 shadow-lg items-center justify-center"
            onPress={handleDeliveryLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text className="text-white text-lg font-bold">Login</Text>
            )}
          </TouchableOpacity>

          {/* This button now navigates directly to AdminPortal */}
          <TouchableOpacity 
            className="mt-6 self-center"
            onPress={() => navigation.navigate('AdminPortal')} // Navigate to AdminPortal
            disabled={loading}
          >
            <Text className="text-indigo-500 text-sm font-medium">
              Go to Admin Portal
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {!isConnected && (
        <View className="absolute bottom-5 w-full bg-red-500 p-3 items-center justify-center">
          <Text className="text-white font-semibold">No Internet Connection</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default Portal;
