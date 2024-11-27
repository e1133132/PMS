import 'react-native-gesture-handler';
import React from 'react';
import { Button} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Login from './Login';
import Home from './Home';
import Add from './Add';
import IssueNote from './IssueNote';
import Navbar from './Navbar';
import RetrieveNote from './RetrieveNote';
import ElectronicSignature from './ElectronicSignature';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SplashScreen from 'react-native-splash-screen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import RetrieveSignature from './RetrieveSignature';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// create a stack for IssueNote，including SignatureScreen
const IssueNoteStack = createStackNavigator();
const RetrieveNoteStack=createStackNavigator();

const logout = async (navigation) => {
  try {
    // remove token information
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('password');
    await AsyncStorage.removeItem('username');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }], // reset navigation stack
    });
  } catch (e) {
    console.error('Error logging out', e);
  }
};

function IssueNoteStackScreen({ route }) {
  const { token, userName, userNumber, expiresIn, customer_ID,Role } = route.params || {};
  return (
    <IssueNoteStack.Navigator>
      <IssueNoteStack.Screen 
      name="IssueNote" 
      component={IssueNote} 
      initialParams={{ token, userName, userNumber, expiresIn, customer_ID,Role }} 
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


function RetrieveNoteStackScreen({ route }) {
  const { token, userName, userNumber, expiresIn, customer_ID,Role } = route.params || {};
  return (
    <RetrieveNoteStack.Navigator>
      <RetrieveNoteStack.Screen 
      name="RetrieveNote" 
      component={RetrieveNote} 
      initialParams={{ token, userName, userNumber, expiresIn, customer_ID,Role }} 
      options={{ headerShown: false }}
      />

      <RetrieveNoteStack.Screen 
        name="RetrieveSignature" 
        component={RetrieveSignature} 
        options={{ headerShown: false }}
      />
    </RetrieveNoteStack.Navigator>
  );
}

function BottomTabNavigator({ route }) {
  const { token, userName, userNumber, expiresIn, customer_ID,Role } = route.params || {}; 

  return (
    <Tab.Navigator initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          // set icons
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'IssueNoteTab') {
            iconName = focused ? 'file-tray-full' : 'file-tray-full-outline';
          } else if (route.name === 'RetrieveNoteTab') {
            iconName = focused ? 'hand-right' : 'hand-right-outline';
          }

          // return incons
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        initialParams={{ token, userName, userNumber, expiresIn }}
        options={({ navigation }) => ({
          title: 'Profile',
          headerRight: () => (
            <Button
              onPress={() => logout(navigation)}
              title="Log Out"
              color="#000"
            />
          ),
        })}
      />
      <Tab.Screen
        name="IssueNoteTab"
        component={IssueNoteStackScreen}
        initialParams={{ token, customer_ID,Role }}
        options={({ navigation }) => ({
          title: 'Issue Notes',
          headerRight: () => (
            <Button
              onPress={() => logout(navigation)}
              title="Log Out"
              color="#000"
            />
          ),
        })}
      />
      <Tab.Screen 
      name="RetrieveNoteTab" 
      component={RetrieveNoteStackScreen}
      initialParams={{ token, customer_ID,Role }} 
      options={({ navigation }) => ({
        title: 'Retrieve Notes',
        headerRight: () => (
          <Button
            onPress={() => logout(navigation)}
            title="Log Out"
            color="#000"
          />
        ),
      })}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  // useEffect(() => {
  //   SplashScreen.hide();  
  // }, []);
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
          name="Login" 
          component={Login} 
          //options={{ headerTitle: (props) => <Navbar {...props} /> }}
          options={{ headerShown: false }}
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
