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
          </Stack.Navigator>

          <StatusBar style="auto" />
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
