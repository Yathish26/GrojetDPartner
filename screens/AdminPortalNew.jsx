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
  SafeAreaView,
  StatusBar
} from 'react-native';
import { User, Mail, Lock, XCircle, CheckCircle, ChevronLeft, Eye, EyeOff } from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';
import NetInfo from '@react-native-community/netinfo';
import { useNavigation } from '@react-navigation/native';
import API_CONFIG, { makeAuthenticatedRequest } from '../config/api.js';

const CustomAlert = ({ visible, message, type, onClose }) => {
  const isSuccess = type === 'success';
  
  let iconColor, bgColor, borderColor, textColor, buttonColor;
  
  if (isSuccess) {
    iconColor = '#059669';
    bgColor = '#F0FDF4';
    borderColor = '#BBF7D0';
    textColor = '#065F46';
    buttonColor = '#059669';
  } else {
    iconColor = '#DC2626';
    bgColor = '#FEF2F2';
    borderColor = '#FECACA';
    textColor = '#991B1B';
    buttonColor = '#DC2626';
  }

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <View style={[styles.alertContainer, { backgroundColor: bgColor, borderColor }]}>
            <View style={styles.alertContent}>
              <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
                {isSuccess ? (
                  <CheckCircle size={24} color={iconColor} />
                ) : (
                  <XCircle size={24} color={iconColor} />
                )}
              </View>
              <View style={styles.alertTextContainer}>
                <Text style={[styles.alertTitle, { color: textColor }]}>
                  {isSuccess ? 'Success' : 'Error'}
                </Text>
                <Text style={styles.alertMessage}>
                  {message}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.alertButton, { backgroundColor: buttonColor }]}
              activeOpacity={0.8}
            >
              <Text style={styles.alertButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const InputField = ({ icon, placeholder, value, onChangeText, secureTextEntry, keyboardType, editable, error, showPasswordToggle, onTogglePassword, isPasswordVisible }) => {
  const [isFocused, setIsFocused] = useState(false);
  
  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  return (
    <View style={styles.inputFieldContainer}>
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputFocused,
        error && styles.inputError
      ]}>
        {React.cloneElement(icon, { 
          size: 20, 
          color: error ? '#DC2626' : isFocused ? '#4F46E5' : '#6B7280' 
        })}
        <TextInput
          style={styles.textInput}
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
            style={styles.passwordToggle}
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
        <View style={styles.errorContainer}>
          <XCircle size={14} color="#DC2626" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const AdminPortal = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('error');
  const [isConnected, setIsConnected] = useState(true);
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  const validateName = (name) => {
    if (!name.trim()) {
      return 'Name is required';
    }
    if (name.length < 2) {
      return 'Name must be at least 2 characters';
    }
    return '';
  };

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
    setNameError('');
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

  const handleNameChange = (text) => {
    setName(text);
    if (nameError) {
      setNameError('');
    }
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

  const handleAdminLogin = async () => {
    clearErrors();

    const nameValidationError = validateName(name);
    const emailValidationError = validateEmail(email);
    const passwordValidationError = validatePassword(password);

    if (nameValidationError) {
      setNameError(nameValidationError);
    }
    if (emailValidationError) {
      setEmailError(emailValidationError);
    }
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
    }

    if (nameValidationError || emailValidationError || passwordValidationError) {
      return;
    }

    if (!isConnected) {
      showAlert('No internet connection detected. Please check your network and try again.', 'error');
      return;
    }

    setLoading(true);

    try {
      console.log('Attempting admin login to:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ADMIN_LOGIN}`);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ADMIN_LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Platform': 'react-native',
        },
        body: JSON.stringify({ 
          name: name.trim(),
          email: email.trim(), 
          password: password.trim(),
          platform: 'react-native'
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: 'Server error occurred' };
        }

        if (response.status === 401) {
          showAlert('Invalid credentials. Please check your information and try again.', 'error');
        } else if (response.status >= 500) {
          showAlert('Server is temporarily unavailable. Please try again in a few moments.', 'error');
        } else {
          showAlert(errorData.message || `Authentication failed (${response.status})`, 'error');
        }
        
        return;
      }

      const data = await response.json();
      console.log('Login response:', data);
      
      if (!data.success) {
        showAlert(data.message || 'Login failed. Please try again.', 'error');
        return;
      }

      if (!data.token) {
        showAlert('Invalid response from server. Please try again.', 'error');
        return;
      }

      await SecureStore.setItemAsync('admintoken', data.token);
      
      console.log('Admin login successful');
      
      showAlert(`Welcome ${name}! You're now signed in.`, 'success');
      
      setName('');
      setEmail('');
      setPassword('');
      
      setTimeout(() => {
        hideAlert();
        navigation.navigate('Admin');
      }, 2000);
      
    } catch (error) {
      console.error('Admin login error:', error);
      
      if (error.name === 'TypeError' && error.message.includes('Network request failed')) {
        showAlert('Unable to connect to server. Please check your internet connection and try again.', 'error');
      } else {
        showAlert(error.message || 'An unexpected error occurred. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <CustomAlert
          visible={alertVisible}
          message={alertMessage}
          type={alertType}
          onClose={hideAlert}
        />

        <View style={styles.contentContainer}>
          {/* Header */}
          <View style={styles.headerContainer}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <ChevronLeft size={24} color="#4F46E5" />
            </TouchableOpacity>
            
            <View style={styles.logoContainer}>
              <User size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.mainTitle}>Admin Portal</Text>
            <Text style={styles.subtitle}>Management Access</Text>
          </View>

          {/* Login Card */}
          <View style={styles.loginCard}>
            <Text style={styles.cardTitle}>Admin Sign In</Text>

            <InputField
              icon={<User />}
              placeholder="Full Name"
              value={name}
              onChangeText={handleNameChange}
              keyboardType="default"
              editable={!loading}
              error={nameError}
            />

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
              style={[
                styles.loginButton,
                loading && styles.loginButtonDisabled,
              ]}
              onPress={handleAdminLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={styles.loadingText}>Signing In...</Text>
                </View>
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Back to Delivery Portal Link */}
            <TouchableOpacity 
              style={styles.deliveryLinkContainer}
              onPress={() => navigation.navigate('Portal')}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.deliveryLinkText}>
                ← Back to Delivery Portal
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>
              Grojet Admin Dashboard
            </Text>
          </View>
        </View>

        {/* Network Status */}
        {!isConnected && (
          <View style={styles.networkBanner}>
            <Text style={styles.networkBannerText}>No Internet Connection</Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  logoContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    marginTop: 20,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '400',
  },
  loginCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignSelf: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 24,
    color: '#1F2937',
  },
  inputFieldContainer: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  inputFocused: {
    borderColor: '#4F46E5',
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  textInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '400',
  },
  passwordToggle: {
    padding: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginLeft: 4,
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    marginLeft: 6,
    fontWeight: '400',
  },
  loginButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  loginButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  deliveryLinkContainer: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  deliveryLinkText: {
    color: '#4F46E5',
    fontSize: 15,
    fontWeight: '400',
  },
  footerContainer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '400',
  },
  networkBanner: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  networkBannerText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
  },
  alertContainer: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  alertTextContainer: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    fontWeight: '400',
  },
  alertButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  alertButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
});

export default AdminPortal;
