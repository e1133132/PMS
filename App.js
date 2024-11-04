import React from 'react';
import AppNavigator from './components/AppNavigator'; 
import Toast from 'react-native-toast-message';

export default function App() {
  return  (
    <>
      <AppNavigator />
      
      <Toast ref={(ref) => Toast.setRef(ref)} />
    </>
  );
}
