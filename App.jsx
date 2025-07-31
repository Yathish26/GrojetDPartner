import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import './global.css';
import Homescreen from 'screens/Homescreen';
import Portal from 'screens/Portal';
import Admin from 'screens/Admin';
import Inventory from 'screens/Inventory';
import AddInventory from 'screens/AddInventory';
import AssignOrders from 'screens/AssignOrders';
import AdminPortal from 'screens/AdminPortal';
import ManageUsers from 'screens/ManageUsers';
import ManageOrders from 'screens/ManageOrders';
import ManageMerchants from 'screens/ManageMerchants';
import ManageCategories from 'screens/ManageCategories';
import ManageProducts from 'screens/ManageProducts';

const Stack = createNativeStackNavigator();

export default function App() {


  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <NavigationContainer
        >
          <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Portal">
            <Stack.Screen name="Portal" component={Portal} />
            <Stack.Screen name="AdminPortal" component={AdminPortal} />
            <Stack.Screen name="Home" component={Homescreen} />
            <Stack.Screen name="Admin" component={Admin} />
            <Stack.Screen name="Inventory" component={Inventory} />
            <Stack.Screen name="AddInventory" component={AddInventory} />
            <Stack.Screen name="AssignOrders" component={AssignOrders} />
            <Stack.Screen name="ManageUsers" component={ManageUsers} />
            <Stack.Screen name="ManageOrders" component={ManageOrders} />
            <Stack.Screen name="ManageMerchants" component={ManageMerchants} />
            <Stack.Screen name="ManageCategories" component={ManageCategories} />
            <Stack.Screen name="ManageProducts" component={ManageProducts} />
          </Stack.Navigator>

          <StatusBar style="auto" />
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
