import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Login from './Login';
import Home from './Home';
import Add from './Add';
import IssueNote from './IssueNote';
import Navbar from './Navbar';
import RetrieveNote from './RetrieveNote';
import SignatureScreen from './SignatureScreen';
import ElectronicSignature from './ElectronicSignature';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// 为 IssueNote 页面创建一个堆栈，包含 SignatureScreen
const IssueNoteStack = createStackNavigator();

function IssueNoteStackScreen({ route }) {
  const { token, userName, userNumber, expiresIn, customer_ID } = route.params || {};
  return (
    <IssueNoteStack.Navigator>

      <IssueNoteStack.Screen 
      name="IssueNote" 
      component={IssueNote} 
      initialParams={{ token, userName, userNumber, expiresIn, customer_ID }} 
      options={{ headerShown: false }}
      />

      <IssueNoteStack.Screen 
        name="ElectronicSignature" 
        component={ElectronicSignature} 
        options={{ headerShown: false }}
      />
    </IssueNoteStack.Navigator>
  );
}

function BottomTabNavigator({ route }) {
  const { token, userName, userNumber, expiresIn, customer_ID } = route.params || {}; 

  return (
    <Tab.Navigator initialRouteName="Home">
      <Tab.Screen
        name="Home"
        component={Home}
        initialParams={{ token, userName, userNumber, expiresIn }}
        options={{ title: 'Persona' }}
      />
      <Tab.Screen
        name="IssueNoteTab"
        component={IssueNoteStackScreen}
        initialParams={{ token, customer_ID }}
        options={{ title: 'Issue Notes' }}
      />
      <Tab.Screen name="RetrieveNote" 
      component={RetrieveNote} 
      options={{ title: 'Retrieve Notes' }} 
      />
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
