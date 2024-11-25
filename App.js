import React from 'react';
import { View, Text } from 'react-native';
import AppNavigator from './components/AppNavigator'; 
import Toast from 'react-native-toast-message';

if (__DEV__) {
  const originalConsoleLog = console.log;
  console.log = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Running "main" with')) {
      return; 
    }
    originalConsoleLog(...args);
  };
}

export default function App() {
  return  (
    <>
      <AppNavigator />
      
      <Toast />
    </>
  );
}
