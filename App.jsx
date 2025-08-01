import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import './global.css';
import Homescreen from 'screens/Homescreen';
import Portal from 'screens/Portal';

const Stack = createNativeStackNavigator();

export default function App() {


  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <NavigationContainer
        >
          <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Portal">
            <Stack.Screen name="Portal" component={Portal} />
            <Stack.Screen name="Home" component={Homescreen} />
          </Stack.Navigator>

          <StatusBar style="auto" />
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
