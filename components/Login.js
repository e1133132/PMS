import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';

export default function Login({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errMsg, setErrMsg] = useState('');

  const handleLogin = async () => {
    try {
      const data = `grant_type=password&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
      const response = await axios.post('http://172.20.10.9:85/token', data, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
  
      if (response.data && response.data.access_token) {
        
        const { access_token, userName, userNumber, expires_in } = response.data;
        
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
      <Text style={styles.title}>Login</Text>
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
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
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
    backgroundColor: '#FDF7E4',
    padding: 20,
  },
  title: {
    fontSize: 30,
    marginBottom: 30,
    fontWeight: 'bold',
    color: '#333',
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
