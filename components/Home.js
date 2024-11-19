import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ImageBackground } from 'react-native';
import axios from 'axios';

export default function Home({ route,navigation }) {
  const { token, userName } = route.params;
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { selectedOption } = route.params || {}; 

  useEffect(() => {
    const fetchAllCustomers = async () => {
      try {
        // get all customer info
        const response = await axios.get(`http://172.20.10.9:85/api/SG/Customers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        

        // select
        const customer = response.data.find((customer) => customer.Customer_Name === userName);
        //navigation.navigate('ElectronicSignature', { customer_ID: customer.customer_ID, token });
        // update user data
        if (customer) {
          setUserData(customer);  
          navigation.navigate('IssueNoteTab', { customer_ID: customer.customer_ID, token });
          navigation.navigate('RetrieveNoteTab', { customer_ID: customer.customer_ID, token });
         
        } else {
          console.warn('No customer data found for the provided username');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching customers data:', error);
        setLoading(false);
      }
    };

    fetchAllCustomers();
  }, [userName, token]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
<ImageBackground source={require('../assets/wood.jpg')} style={styles.background} >
    <View style={styles.container}>

      <Text style={styles.header}>Customer Information</Text>
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
      
    </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  background: {
    flex: 1,
    resizeMode: 'cover', 
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
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
});