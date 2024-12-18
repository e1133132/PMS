import React, { useState,useEffect }  from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';

export default function Settings({ route,navigation }) {
  const { token, customer_ID , userName  } = route.params; 
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {fetchAllCustomers();}, [userName, token]);

  const handlePasswordChange = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match!');
      return;
    }
    try {
      const response = await axios.post(
        `http://your-api-endpoint/change-password`, 
        { password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Success', 'Password changed successfully!');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to change password. Please try again later.');
    }
  };
  const fetchAllCustomers = async () => {
    try {
      // get all customer info
      const response = await axios.get(`http://115.42.158.153:85/api/SG/Customers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(userName);

      // select
      const customer = response.data.find((customer) => customer.Customer_Name === userName);
      //console.log(customer);
      //navigation.navigate('ElectronicSignature', { customer_ID: customer.customer_ID, token });
      // update user data
      if (customer) {
        setUserData(customer);  
        //console.log(customer.customer_ID);
        navigation.navigate('IssueNoteTab', { customer_ID: customer.customer_ID, token });
        navigation.navigate('RetrieveNoteTab', { customer_ID: customer.customer_ID, token });
        navigation.navigate('Exchange', { customer_ID: customer.customer_ID, token });
      } else {
        console.warn('No customer data found for the provided username');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching customers data:', error);
      setLoading(false);
    }
  };
  return (
    <View style={styles.container}>
    <Text style={styles.header}>Settings</Text>
      <Text style={styles.label}>Customer Information</Text>
      {userData ? (
        <View style={styles.card}>
          <Text style={styles.infoTitle}>Customer ID</Text>
          <Text style={styles.infoValue}>{userData.customer_ID}</Text>

          <Text style={styles.infoTitle}>Status</Text>
          <Text style={styles.infoValue}>{userData.status}</Text>

          <Text style={styles.infoTitle}>Business Type</Text>
          <Text style={styles.infoValue}>{userData.Business_Type}</Text>

          <Text style={styles.infoTitle}>Country</Text>
          <Text style={styles.infoValue}>{userData.Country}</Text>

          <Text style={styles.infoTitle}>Currency</Text>
          <Text style={styles.infoValue}>{userData.Currency}</Text>

          <Text style={styles.infoTitle}>GST</Text>
          <Text style={styles.infoValue}>{userData.GST}</Text>

          <Text style={styles.infoTitle}>Account Balance</Text>
          <Text style={styles.infoValue}>
            {userData.Account_Balance !== null ? userData.Account_Balance : 'NULL'}
          </Text>
        </View>
      ) : (
        <Text style={styles.noData}>No data available for this username.</Text>
      )}

      <Text style={styles.label}>Change Password</Text>
      <TextInput
        style={styles.input}
        placeholder="New Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm New Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <View style={styles.containerb}>
     <TouchableOpacity style={styles.button} onPress={handlePasswordChange}>
        <Text style={styles.buttonText}>Change Password</Text>
      </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  containerb: {
    padding: 3,
    alignItems: 'center',
  },
  button: {
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2, 
    borderColor: '#007BFF', 
    backgroundColor: '#ffffff', 
    marginTop: 15,
    width: 200,
    alignItems: 'center'
  },
  buttonText: {
    color: '#007BFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginTop: 15,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 18,
    color: '#000',
    marginBottom: 10,
  },
  noData: {
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    //marginTop: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    marginTop: 10,
  },
  infoContainer: {
    marginTop: 30,
  },
  info: {
    fontSize: 16,
    color: '#333',
  },
});
