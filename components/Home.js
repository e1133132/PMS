import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
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

        // update user data
        if (customer) {
          setUserData(customer);
          navigation.navigate('IssueNote', { customer_ID: customer.customer_ID, token });
          navigation.navigate('RetrieveNote', { customer_ID: customer.customer_ID, token });
          navigation.navigate('IssueNoteStack', { screen: 'IssueNote', params: { customer_ID: customer.customer_ID, token } });
          console.log('Customer ID:', customer.customer_ID);
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
    <View style={styles.container}>
      <Text style={styles.header}>Customer Information</Text>
      {userData ? (
        <View>
          <Text style={styles.info}>Customer ID: {userData.customer_ID}</Text>
          <Text style={styles.info}>Status: {userData.status}</Text>
          <Text style={styles.info}>Business Type: {userData.Business_Type}</Text>
          <Text style={styles.info}>Country: {userData.Country}</Text>
          <Text style={styles.info}>Currency: {userData.Currency}</Text>
          <Text style={styles.info}>GST: {userData.GST}</Text>
          <Text style={styles.info}>Account Balance: {userData.Account_Balance !== null ? userData.Account_Balance : 'NULL'}</Text>
          {/* Add other fields as needed */}
        </View>
      ) : (
        <Text style={styles.info}>No data available for this username.</Text>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FDF7E4',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  info: {
    fontSize: 18,
    marginVertical: 5,
  },
});
