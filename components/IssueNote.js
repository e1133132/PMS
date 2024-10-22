import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity,Button } from 'react-native';
import axios from 'axios';
import SignatureScreen from './SignatureScreen';

export default function IssueNote({ route,navigation }) {
  const { token, customer_ID } = route.params;
  const [hireOrderData, setHireOrderData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHireOrderId, setSelectedHireOrderId] = useState(null);
  const [issueNotesData, setIssueNotesData] = useState({});
  
  const handleSignPress = (issueNoteId) => {
    //navigation.navigate('SignatureScreen');
    navigation.navigate('ElectronicSignature', {
      token: token,
      issueNoteId: issueNoteId,
      customer_ID: customer_ID,
    });
  };
  
  useEffect(() => {
      //  console.log('Token:', token);
        console.log('Customer ID:', customer_ID);
    const fetchHireOrders = async () => {
      try {
        const hireOrderResponse = await axios.get(
          `http://172.20.10.9:85/api/SG/Hire_Order/${customer_ID}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

     //   console.log('hireOrderResponse.data:', hireOrderResponse.data);

        setHireOrderData(hireOrderResponse.data);
      } catch (error) {
        console.error('Error fetching hire orders data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (customer_ID && token) {
      fetchHireOrders();
    } else {
      console.warn('customer_ID or token is missing');
    }
  }, [customer_ID, token]);



  const fetchIssueNotes = async (hireOrderId) => {
    if (selectedHireOrderId === hireOrderId) {
        // cancel
        setSelectedHireOrderId(null);
      } else {
        // get Issue Note 
        setSelectedHireOrderId(hireOrderId);
        if (!issueNotesData[hireOrderId]) { // check whether have loaded data
          try {
            const response = await axios.get(`http://172.20.10.9:85/api/SG/Issue_Note/${hireOrderId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setIssueNotesData(prevState => ({ ...prevState, [hireOrderId]: response.data }));
          } catch (error) {
            console.error(`Error fetching issue note for Hire Order ID ${hireOrderId}:`, error);
          }
        }
      }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Hire Orders & Issue Notes</Text>
      <FlatList
        data={hireOrderData}
        keyExtractor={(item) => item.Hire_Order_ID.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.orderContainer}
            onPress={() => fetchIssueNotes(item.Hire_Order_ID)}
          >
            <Text style={styles.info}>Hire Order ID: {item.Hire_Order_ID}</Text>
            <Text style={styles.info}>Hire Order No: {item.Hire_Order_No || 'NULL'}</Text>
            <Text style={styles.info}>Status: {item.Status}</Text>
            <Text style={styles.info}>Hire Date: {item.Hire_Date}</Text>
            <Text style={styles.info}>Quantity: {item.Qty !== null ? item.Qty : 'NULL'}</Text>
            <Text style={styles.info}>Delivery Address: {item.Delivery_Address || 'NULL'}</Text>

            
            {selectedHireOrderId === item.Hire_Order_ID && issueNotesData[item.Hire_Order_ID] ? (
              <View style={styles.issueNoteContainer}>
                 <Text style={styles.info}>Issue Note No: {issueNotesData[item.Hire_Order_ID].Issue_Note_ID}</Text>
                <Text style={styles.info}>Issue Note No: {issueNotesData[item.Hire_Order_ID].Issue_Note_No}</Text>
                <Text style={styles.info}>Issue Qty: {issueNotesData[item.Hire_Order_ID].Issue_Qty}</Text>
                <Text style={styles.info}>Issue Date: {issueNotesData[item.Hire_Order_ID].Issue_Date}</Text>
                <Text style={styles.info}>Vehicle No: {issueNotesData[item.Hire_Order_ID].Vehicle_No || 'NULL'}</Text>
                <Text style={styles.info}>Driver: {issueNotesData[item.Hire_Order_ID].Driver || 'NULL'}</Text>
                <Text style={styles.info}>Driver IC: {issueNotesData[item.Hire_Order_ID].Driver_IC || 'NULL'}</Text>
                <Text style={styles.info}>Tpn Company: {issueNotesData[item.Hire_Order_ID].Tpn_Company}</Text>
                <Text style={styles.info}>Tpn Charge: {issueNotesData[item.Hire_Order_ID].Tpn_Charge || 'NULL'}</Text>
                <Text style={styles.info}>Remarks: {issueNotesData[item.Hire_Order_ID].Remarks || 'NULL'}</Text>
                <Button title="Sign" onPress={() => handleSignPress(issueNotesData[item.Hire_Order_ID].Issue_Note_ID)} />
              </View>
            ) : (
              selectedHireOrderId === item.Hire_Order_ID && <Text style={styles.info}>No issue note data for this hire order.</Text>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.info}>No hire order data available.</Text>}
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
  issueNoteContainer: {
    marginTop: 10,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  info: {
    fontSize: 18,
    marginVertical: 2,
  },
});
