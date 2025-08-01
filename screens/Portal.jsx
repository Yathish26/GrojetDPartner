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
  StatusBar,
  SafeAreaView,
  Dimensions
} from 'react-native';
import { Package, Mail, Lock, XCircle, Eye, EyeOff, AlertCircle, CircleCheck } from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';
import NetInfo from '@react-native-community/netinfo';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import API_CONFIG, { makeAuthenticatedRequest } from '../config/api.js';
import { setToken, setDeliveryAgent, isAuthenticated } from '../utils/AuthManager.js';

const { width, height } = Dimensions.get('window');

const CustomAlert = ({ visible, message, type = 'error', onClose }) => {
  let icon, bg, border, text, button;
  switch (type) {
    case 'success':
      icon = <CircleCheck size={28} color="#16a34a" />;
      bg = 'bg-green-50';
      border = 'border-green-200';
      text = 'text-green-800';
      button = 'bg-green-600';
      break;
    case 'warning':
      icon = <AlertCircle size={28} color="#eab308" />;
      bg = 'bg-yellow-50';
      border = 'border-yellow-200';
      text = 'text-yellow-800';
      button = 'bg-yellow-600';
      break;
    default:
      icon = <XCircle size={28} color="#dc2626" />;
      bg = 'bg-red-50';
      border = 'border-red-200';
      text = 'text-red-800';
      button = 'bg-red-600';
  }

  const title = type === 'success'
    ? 'Success'
    : type === 'warning'
    ? 'Warning'
    : 'Error';

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 justify-center items-center bg-black/40 px-6">
          <View className={`w-full max-w-xs rounded-xl p-6 border ${bg} ${border}`}>
            <View className="items-center mb-3">{icon}</View>
            <Text className={`text-lg font-semibold text-center mb-1 ${text}`}>{title}</Text>
            <Text className="text-base text-gray-600 text-center mb-4">{message}</Text>
            <TouchableOpacity
              onPress={onClose}
              className={`py-2 rounded-lg items-center ${button} mt-1`}
              activeOpacity={0.9}
            >
              <Text className="text-white font-medium text-base">OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const InputField = ({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  editable,
  error,
  showPasswordToggle,
  onTogglePassword,
  isPasswordVisible,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  let border = 'border-gray-300';
  let background = 'bg-gray-50';
  if (isFocused) {
    border = 'border-indigo-600';
    background = 'bg-white';
  }
  if (error) {
    border = 'border-red-600';
    background = 'bg-red-50';
  }

  return (
    <View className="mb-4">
      <View className={`flex-row items-center rounded-lg px-3 py-3 border ${border} ${background}`}>
        {React.cloneElement(icon, {
          size: 20,
          color: error ? '#DC2626' : isFocused ? '#4F46E5' : '#6B7280',
        })}
        <TextInput
          className="flex-1 ml-3 text-base text-gray-900 font-normal"
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          keyboardType={keyboardType}
          autoCapitalize="none"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          editable={editable}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {showPasswordToggle && (
          <TouchableOpacity
            onPress={onTogglePassword}
            className="p-1"
            activeOpacity={0.7}
          >
            {isPasswordVisible ? (
              <EyeOff size={18} color="#6B7280" />
            ) : (
              <Eye size={18} color="#6B7280" />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <View className="flex-row items-center mt-1 ml-1">
          <XCircle size={14} color="#DC2626" />
          <Text className="text-sm text-red-600 ml-1 font-normal">{error}</Text>
        </View>
      )}
    </View>
  );
};

const Portal = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('error');
  const [isConnected, setIsConnected] = useState(true);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const authenticated = await isAuthenticated();
        if (authenticated) {
          navigation.replace('Home');
        }
      } catch (error) {
        console.error('Error checking authentication status:', error);
      }
    };

    checkAuthStatus();
  }, [navigation]);

  useFocusEffect(
    React.useCallback(() => {
      const checkAuthOnFocus = async () => {
        try {
          const authenticated = await isAuthenticated();
          if (authenticated) {
            navigation.replace('Home');
          }
        } catch (error) {
          console.error('Error checking authentication on focus:', error);
        }
      };

      checkAuthOnFocus();
    }, [navigation])
  );

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      return 'Email is required';
    }
    if (!emailRegex.test(email.trim())) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validatePassword = (password) => {
    if (!password.trim()) {
      return 'Password is required';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return '';
  };

  const clearErrors = () => {
    setEmailError('');
    setPasswordError('');
  };

  const showAlert = (message, type) => {
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
  };

  const hideAlert = () => {
    setAlertVisible(false);
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    if (emailError) {
      setEmailError('');
    }
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (passwordError) {
      setPasswordError('');
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleDeliveryLogin = async () => {
    clearErrors();

    const emailValidationError = validateEmail(email);
    const passwordValidationError = validatePassword(password);

    if (emailValidationError) setEmailError(emailValidationError);
    if (passwordValidationError) setPasswordError(passwordValidationError);

    if (emailValidationError || passwordValidationError) return;

    if (!isConnected) {
      showAlert('No internet connection detected. Please check your network and try again.', 'error');
      return;
    }

    setLoading(true);
    setAttemptCount(prev => prev + 1);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DELIVERY_LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Platform': 'react-native',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
          platform: 'react-native'
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: 'Server error occurred' };
        }

        if (response.status === 401) {
          if (errorData.message?.toLowerCase().includes('password')) {
            setPasswordError('Incorrect password');
            showAlert('The password you entered is incorrect. Please check and try again.', 'warning');
          } else if (errorData.message?.toLowerCase().includes('email') || errorData.message?.toLowerCase().includes('user')) {
            setEmailError('Email not found');
            showAlert('No account found with this email address.', 'warning');
          } else {
            showAlert('Invalid email or password. Please check your credentials and try again.', 'warning');
          }
        } else if (response.status === 403) {
          showAlert('Your account has been disabled. Please contact support for assistance.', 'error');
        } else if (response.status === 429) {
          showAlert('Too many login attempts. Please wait a moment before trying again.', 'warning');
        } else if (response.status >= 500) {
          showAlert('Server is temporarily unavailable. Please try again in a few moments.', 'error');
        } else {
          showAlert(errorData.message || `Authentication failed (${response.status})`, 'error');
        }
        return;
      }

      const data = await response.json();

      if (!data.success) {
        if (data.message?.toLowerCase().includes('password')) {
          setPasswordError('Incorrect password');
          showAlert('The password you entered is incorrect.', 'warning');
        } else {
          showAlert(data.message || 'Login failed. Please try again.', 'error');
        }
        return;
      }

      if (!data.token || !data.agent) {
        showAlert('Invalid response from server. Please try again.', 'error');
        return;
      }

      await setToken(data.token);
      await setDeliveryAgent(data.agent);

      showAlert(`Welcome back, ${data.agent.name || 'Partner'}! You're now signed in.`, 'success');

      setEmail('');
      setPassword('');
      setAttemptCount(0);

      setTimeout(() => {
        hideAlert();
        navigation.navigate('Home');
      }, 2000);

    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('Network request failed')) {
        showAlert('Unable to connect to server. Please check your internet connection and try again.', 'error');
      } else if (error.name === 'SyntaxError') {
        showAlert('Server returned invalid response. Please try again.', 'error');
      } else {
        showAlert(error.message || 'An unexpected error occurred. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <CustomAlert
          visible={alertVisible}
          message={alertMessage}
          type={alertType}
          onClose={hideAlert}
        />

        <View className="flex-1 items-center justify-center px-5 pt-10">
          {/* Logo and Header */}
          <View className="items-center mb-10">
            <View className="w-15 h-15 bg-indigo-600 p-4 rounded-xl items-center justify-center mb-4">
              <Package size={32} color="#FFFFFF" />
            </View>
            <Text className="text-2xl font-semibold text-gray-900 mb-1">Grojet Delivery</Text>
            <Text className="text-base text-gray-500 font-normal">Partner Portal</Text>
          </View>

          {/* Login Card */}
          <View className="w-full max-w-md bg-white rounded-xl p-6 border border-gray-200">
            <Text className="text-xl font-medium text-center mb-6 text-gray-900">Sign In</Text>

            {attemptCount > 2 && (
              <View className="flex-row items-center bg-yellow-100 rounded-lg p-3 mb-4 border border-yellow-400">
                <AlertCircle size={16} color="#D97706" />
                <Text className="text-xs text-yellow-900 ml-2 flex-1 font-normal">
                  Multiple login attempts detected. Please check your credentials.
                </Text>
              </View>
            )}

            <InputField
              icon={<Mail />}
              placeholder="Email Address"
              value={email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              editable={!loading}
              error={emailError}
            />

            <InputField
              icon={<Lock />}
              placeholder="Password"
              value={password}
              onChangeText={handlePasswordChange}
              secureTextEntry={true}
              editable={!loading}
              error={passwordError}
              showPasswordToggle={true}
              onTogglePassword={togglePasswordVisibility}
              isPasswordVisible={isPasswordVisible}
            />

            <TouchableOpacity
              className={`mt-2 mb-4 bg-indigo-600 py-3 rounded-lg items-center justify-center ${loading ? 'bg-gray-400' : ''}`}
              onPress={handleDeliveryLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <View className="flex-row items-center">
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text className="text-white text-base font-medium ml-2">Signing In...</Text>
                </View>
              ) : (
                <Text className="text-white text-base font-medium">Sign In</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="mt-8 items-center">
            <Text className="text-gray-400 text-sm text-center font-normal">
              Powered by Grojet
            </Text>
          </View>
        </View>

        {/* Network Status */}
        {!isConnected && (
          <View className="absolute bottom-0 w-full bg-red-600 py-3 items-center justify-center">
            <Text className="text-white font-medium text-sm">No Internet Connection</Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Portal;