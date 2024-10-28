import React, { useState,useEffect } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity,ActivityIndicator, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const savedUsername = await AsyncStorage.getItem('username');
      const savedPassword = await AsyncStorage.getItem('password');
  
      if (token && savedUsername && savedPassword) {
        await handleLogin(savedUsername, savedPassword);
      } else { 
        navigation.navigate('Login');
      }
    } catch (e) {
      console.error('Error checking login status', e);
    }
  };
  
 
  const handleLogin = async (savedUsername, savedPassword) => {
    try {
      setIsLoading(true);
      const usernameToUse = savedUsername || username;
      const passwordToUse = savedPassword || password;
  
      const data = `grant_type=password&username=${encodeURIComponent(usernameToUse)}&password=${encodeURIComponent(passwordToUse)}`;
      const response = await axios.post('http://172.20.10.9:85/token', data, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
  
      if (response.data && response.data.access_token) {
        const { access_token, userName, userNumber, expires_in } = response.data;
  
       
        await AsyncStorage.setItem('token', access_token);
        await AsyncStorage.setItem('username', usernameToUse);
        await AsyncStorage.setItem('password', passwordToUse);
        navigation.navigate('HomeTabs', { token: access_token, userName, userNumber, expiresIn: expires_in });
  
        setUsername('');
        setPassword('');
        setErrMsg('');
      } else {
        setErrMsg('Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error("Error response:", error.response?.data);
      setErrMsg('Invalid username or password');
    }
  };
  

  return (
    <View style={styles.container}>
    <Image source={require('../assets/LHT.png')} style={styles.logo} />
    <Text style={styles.title1}>Pallet Management System</Text>
    <Text style={styles.title2}>企业管理系统</Text>
      <Text style={styles.title}>Login Here</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        onChangeText={(text) => setUsername(text)}
        value={username}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        onChangeText={(text) => setPassword(text)}
        value={password}
        secureTextEntry={true}
      />
      <TouchableOpacity style={styles.loginButton} 
      onPress={() => handleLogin()}
      disabled={isLoading}>
        {isLoading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <Text style={styles.buttonText}>Authenticate</Text>
      )}
      </TouchableOpacity>
      <Text style={styles.error}>{errMsg}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  title: {
    fontSize: 30,
    marginTop: 80,
    marginBottom: 30,
    fontWeight: 'bold',
    color: '#333',
  },
  title1: {
    fontSize: 20,
    //marginBottom: 20,
    marginTop: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  title2: {
    fontSize: 20,
    marginBottom: 20,
    //marginTop: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  logo: {
    width: 170,
    height: 100,
    alignSelf: 'center',
    marginTop: -200,
  },
  input: {
    height: 40,
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingLeft: 10,
  },
  loginButton: {
    backgroundColor: '#436850',
    padding: 10,
    width: '100%',
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  error: {
    color: '#FF0000',
    marginTop: 6,
  },
});
