import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, ScrollView, Alert, RefreshControl } from 'react-native';
import { 
  Package, 
  PlusCircle, 
  ClipboardList, 
  LogOut, 
  Users, 
  Truck, 
  Store, 
  Settings, 
  BarChart3, 
  MapPin, 
  ShoppingCart,
  UserCheck,
  Bell,
  CreditCard
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import API_CONFIG, { makeAuthenticatedRequest } from '../config/api.js';

export default function Admin() {
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardStats, setDashboardStats] = useState(null);
  
  const navigation = useNavigation();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);
      const response = await makeAuthenticatedRequest('/admin/dashboard/stats');
      
      if (response.success) {
        setDashboardStats(response.stats);
      } else {
        console.error('Failed to fetch dashboard stats:', response.message);
        // Set default values on error
        setDashboardStats({
          totalUsers: 0,
          totalMerchants: 0,
          totalDeliveryAgents: 0,
          totalOrders: 0,
          pendingOrders: 0,
          totalRevenue: 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      // Set default values on error
      setDashboardStats({
        totalUsers: 0,
        totalMerchants: 0,
        totalDeliveryAgents: 0,
        totalOrders: 0,
        pendingOrders: 0,
        totalRevenue: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardStats();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => navigation.replace('Portal')
        }
      ]
    );
  };

  const adminSections = [
    {
      title: "User Management",
      items: [
        {
          title: "Manage Users",
          subtitle: "View and manage customer accounts",
          icon: <Users size={24} color="#4F46E5" />,
          onPress: () => navigation.navigate('ManageUsers'),
          color: "#4F46E5"
        },
        {
          title: "Delivery Agents",
          subtitle: "Manage delivery partner accounts",
          icon: <Truck size={24} color="#059669" />,
          onPress: () => navigation.navigate('ManageDeliveryAgents'),
          color: "#059669"
        }
      ]
    },
    {
      title: "Business Management",
      items: [
        {
          title: "Merchants",
          subtitle: "Manage restaurant partnerships",
          icon: <Store size={24} color="#DC2626" />,
          onPress: () => navigation.navigate('ManageMerchants'),
          color: "#DC2626"
        },
        {
          title: "Categories",
          subtitle: "Manage food categories",
          icon: <Package size={24} color="#7C3AED" />,
          onPress: () => navigation.navigate('ManageCategories'),
          color: "#7C3AED"
        },
        {
          title: "Products",
          subtitle: "Manage menu items",
          icon: <ShoppingCart size={24} color="#EA580C" />,
          onPress: () => navigation.navigate('ManageProducts'),
          color: "#EA580C"
        }
      ]
    },
    {
      title: "Operations",
      items: [
        {
          title: "Orders",
          subtitle: "View and manage all orders",
          icon: <ClipboardList size={24} color="#0891B2" />,
          onPress: () => navigation.navigate('ManageOrders'),
          color: "#0891B2"
        },
        {
          title: "Delivery Zones",
          subtitle: "Manage delivery areas",
          icon: <MapPin size={24} color="#65A30D" />,
          onPress: () => navigation.navigate('ManageDeliveryZones'),
          color: "#65A30D"
        },
        {
          title: "Assign Orders",
          subtitle: "Manual order assignment",
          icon: <UserCheck size={24} color="#D97706" />,
          onPress: () => navigation.navigate('AssignOrders'),
          color: "#D97706"
        }
      ]
    },
    {
      title: "Analytics & Reports",
      items: [
        {
          title: "Analytics",
          subtitle: "View platform analytics",
          icon: <BarChart3 size={24} color="#BE185D" />,
          onPress: () => navigation.navigate('Analytics'),
          color: "#BE185D"
        },
        {
          title: "Financial Reports",
          subtitle: "Revenue and payment reports",
          icon: <CreditCard size={24} color="#0D9488" />,
          onPress: () => navigation.navigate('FinancialReports'),
          color: "#0D9488"
        }
      ]
    },
    {
      title: "System",
      items: [
        {
          title: "Notifications",
          subtitle: "Send push notifications",
          icon: <Bell size={24} color="#F59E0B" />,
          onPress: () => navigation.navigate('NotificationCenter'),
          color: "#F59E0B"
        },
        {
          title: "System Settings",
          subtitle: "Configure app settings",
          icon: <Settings size={24} color="#6B7280" />,
          onPress: () => navigation.navigate('SystemSettings'),
          color: "#6B7280"
        },
        {
          title: "Inventory",
          subtitle: "Legacy inventory management",
          icon: <Package size={24} color="#4F46E5" />,
          onPress: () => navigation.navigate('Inventory'),
          color: "#4F46E5"
        }
      ]
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Admin Dashboard</Text>
            <Text style={styles.headerSubtitle}>Manage your Grojet platform</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <LogOut size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Platform Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Users size={20} color="#4F46E5" />
              <Text style={styles.statNumber}>{dashboardStats?.totalUsers || 0}</Text>
              <Text style={styles.statLabel}>Users</Text>
            </View>
            <View style={styles.statCard}>
              <Store size={20} color="#DC2626" />
              <Text style={styles.statNumber}>{dashboardStats?.totalMerchants || 0}</Text>
              <Text style={styles.statLabel}>Merchants</Text>
            </View>
            <View style={styles.statCard}>
              <Truck size={20} color="#059669" />
              <Text style={styles.statNumber}>{dashboardStats?.totalDeliveryAgents || 0}</Text>
              <Text style={styles.statLabel}>Delivery Agents</Text>
            </View>
            <View style={styles.statCard}>
              <ClipboardList size={20} color="#0891B2" />
              <Text style={styles.statNumber}>{dashboardStats?.totalOrders || 0}</Text>
              <Text style={styles.statLabel}>Orders</Text>
            </View>
          </View>
        </View>

        {/* Admin Sections */}
        {adminSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={styles.adminCard}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                >
                  <View style={styles.adminCardContent}>
                    <View style={[styles.adminCardIcon, { backgroundColor: `${item.color}15` }]}>
                      {item.icon}
                    </View>
                    <View style={styles.adminCardText}>
                      <Text style={styles.adminCardTitle}>{item.title}</Text>
                      <Text style={styles.adminCardSubtitle}>{item.subtitle}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#4F46E5',
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#C7D2FE',
    fontWeight: '400',
  },
  logoutButton: {
    backgroundColor: '#DC2626',
    padding: 10,
    borderRadius: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '400',
  },
  section: {
    marginBottom: 24,
  },
  sectionContent: {
    gap: 12,
  },
  adminCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  adminCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  adminCardText: {
    flex: 1,
  },
  adminCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  adminCardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '400',
  },
});
