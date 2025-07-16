import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { User, Package, Mail, Lock } from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';

const Portal = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('delivery');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    if (activeTab === 'admin') {
      try {
        setLoading(true);
        const response = await fetch('http://192.168.1.35:5000/admin/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok && data.token) {
          await SecureStore.setItemAsync('admintoken', data.token);
          navigation.navigate('Admin');
        } else {
          Alert.alert('Login Failed', data.message || 'Invalid credentials');
        }
      } catch (err) {
        Alert.alert('Error', err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    } else {
      // For delivery tab (no backend for now)
      navigation.navigate('Home');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-gray-100"
    >
      <View className="flex-1 items-center justify-center p-6">
        <View className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <Text
            className={`text-3xl font-extrabold text-center mb-8 ${
              activeTab === 'admin' ? 'text-green-700' : 'text-indigo-700'
            }`}
          >
            {activeTab === 'delivery' ? 'Delivery Login' : 'Admin Login'}
          </Text>

          <View className="mb-6">
            <View className="flex-row items-center bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
              <Mail size={20} color="#6B7280" />
              <TextInput
                className="flex-1 ml-3 text-lg text-gray-800"
                placeholder="Email"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View className="flex-row items-center bg-gray-50 rounded-lg p-4 border border-gray-200">
              <Lock size={20} color="#6B7280" />
              <TextInput
                className="flex-1 ml-3 text-lg text-gray-800"
                placeholder="Password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>

          <TouchableOpacity
            className={`py-4 rounded-xl shadow-lg items-center ${
              activeTab === 'admin' ? 'bg-green-600' : 'bg-indigo-600'
            }`}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text className="text-white text-xl font-bold">
              {loading ? 'Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="mt-6">
            <Text
              className={`text-center ${
                activeTab === 'admin' ? 'text-green-500' : 'text-indigo-500'
              } text-base font-semibold`}
            >
              Forgot Password?
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-row bg-white border-t border-gray-200 shadow-lg py-3 px-4 w-full">
        <TouchableOpacity
          className={`flex-1 items-center py-3 rounded-xl mx-1 ${
            activeTab === 'delivery' ? 'bg-indigo-100' : ''
          }`}
          onPress={() => setActiveTab('delivery')}
        >
          <Package size={24} color={activeTab === 'delivery' ? '#4F46E5' : '#6B7280'} />
          <Text
            className={`text-sm font-semibold mt-1 ${
              activeTab === 'delivery' ? 'text-indigo-700' : 'text-gray-700'
            }`}
          >
            Delivery Partner
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 items-center py-3 rounded-xl mx-1 ${
            activeTab === 'admin' ? 'bg-green-100' : ''
          }`}
          onPress={() => setActiveTab('admin')}
        >
          <User size={24} color={activeTab === 'admin' ? '#059669' : '#6B7280'} />
          <Text
            className={`text-sm font-semibold mt-1 ${
              activeTab === 'admin' ? 'text-green-700' : 'text-gray-700'
            }`}
          >
            Admin
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Portal;
