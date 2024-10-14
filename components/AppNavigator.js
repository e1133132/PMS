import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Login from './Login';
import Home from './Home';
import Add from './Add';
import EditScreen from './EditScreen';
import Navbar from './Navbar';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function BottomTabNavigator({ route }) {
  const { token, userName, userNumber, expiresIn } = route.params || {}; 

  return (
    <Tab.Navigator initialRouteName="Home">
      <Tab.Screen
        name="Home"
        component={Home}
        initialParams={{ token, userName, userNumber, expiresIn }}
        options={{ title: 'Persona' }}
      />
      <Tab.Screen name="Add" component={Add} options={{ title: 'Issue Notes' }} />
      <Tab.Screen name="Edit" component={Add} options={{ title: 'Retrieve Notes' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
          name="Login" 
          component={Login} 
          options={{ headerTitle: (props) => <Navbar {...props} /> }}
        />
        <Stack.Screen 
          name="HomeTabs" 
          component={BottomTabNavigator} 
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
