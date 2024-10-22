import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import axios from 'axios';

export default function RetrieveNote({ route}) {
  const { token, customer_ID } = route.params;
  const [retrieveData, setreRrieveData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { selectedOption } = route.params || {}; 

  useEffect(() => {
    const fetchRetrieves = async () => {
      try {  
        const response = await axios.get(`http://172.20.10.9:85/api/SG/Retrieve_Note/${customer_ID}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const retrieve=response.data;
        // update user data
        if (retrieve) {
            setreRrieveData(retrieve);
          //console.log('Customer ID:', customer.customer_ID);
        } else {
          console.warn('No retrieve data found for the provided id');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching retrieve data:', error);
        setLoading(false);
      }
    };

    fetchRetrieves();
  }, [customer_ID, token]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Retrieve Notes</Text>
      <FlatList
        data={retrieveData}
        keyExtractor={(item) => item.Retrieve_Note_ID.toString()}
        renderItem={({ item }) => (
          <View style={styles.orderContainer}>
            <Text style={styles.info}>Retrieve Note ID: {item.Retrieve_Note_ID}</Text>
            <Text style={styles.info}>Creation Time: {item.Creation_Time }</Text>
            <Text style={styles.info}>Status: {item.Status}</Text>
            <Text style={styles.info}>Retrieve Note No: {item.Retrieve_Note_No}</Text>
            <Text style={styles.info}>Customer ID: {item.Customer_ID}</Text>
            <Text style={styles.info}>Pallet Profile ID: {item.Pallet_Profile_ID}</Text>
            <Text style={styles.info}>Qty: {item.Qty}</Text>
            <Text style={styles.info}>Vehicle No: {item.Vehicle_No}</Text>
            <Text style={styles.info}>Retrieve Date: {item.Retrieve_Date}</Text>
            <Text style={styles.info}>Retrieve Address: {item.Retrieve_Address}</Text>
            <Text style={styles.info}>Retrieve Type: {item.Retrieve_Type}</Text>
            <Text style={styles.info}>Tpn_Company: {item.Tpn_Company}</Text>
            <Text style={styles.info}>Remarks: {item.Remarks}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.info}>No retrieve note data available.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  orderContainer: {
    marginBottom: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3, // shadow
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
