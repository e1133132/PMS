import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Button, TextInput,Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; 
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';

export default function IssueNote({ route, navigation }) {
  const { token, customer_ID } = route.params;
  const [hireOrderData, setHireOrderData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHireOrderId, setSelectedHireOrderId] = useState(null);
  const [issueNotesData, setIssueNotesData] = useState({});
  const [searchQuery, setSearchQuery] = useState(''); 
  const [dateFilter, setDateFilter] = useState(null); // save month
  const [showDatePicker, setShowDatePicker] = useState(false); // contrl show of date selector
  const [expandedItems, setExpandedItems] = useState({}); 
  const [expandedIssue, setExpandedIssue] = useState({}); 

  // date changer
  const onDateChange = (event, selectedDate) => {
    if (selectedDate) {
      //setShowDatePicker(false);
      setDateFilter(selectedDate); // set date selected
    } else {
      setShowDatePicker(false);
    }
  };

  const handleSignPress = (issueNoteId) => {
    navigation.navigate('ElectronicSignature', {
      token: token,
      issueNoteId: issueNoteId,
      customer_ID: customer_ID,
    });
  };

  const toggleExpand = (id) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleExpandIssue = (hireOrderId, issueNoteId) => {
    const key = `${hireOrderId}-${issueNoteId}`;
    setExpandedIssue(prevState => ({
      ...prevState,
      [key]: !prevState[key], // change back to Issue Note status
    }));
  };


  useEffect(() => {
    const fetchHireOrders = async () => {
      try {
        const hireOrderResponse = await axios.get(
          `http://172.20.10.9:85/api/SG/Hire_Order/${customer_ID}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
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
//console.log(token);
//console.log(customer_ID);
  const fetchIssueNotes = async (hireOrderId) => {
    if (selectedHireOrderId === hireOrderId) {
      setSelectedHireOrderId(null);
    } else {
      setSelectedHireOrderId(hireOrderId);
      if (!issueNotesData[hireOrderId]) {
        try {
          const response = await axios.get(`http://172.20.10.9:85/api/SG/Issue_Note/GetIssueNoteFromCustomerIdWithCombinedTablesWithHire/${customer_ID}/${hireOrderId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setIssueNotesData(prevState => ({ ...prevState, [hireOrderId]: response.data }));
        } catch (error) {
          if (error.response) {
            console.error(`Error fetching issue note: ${error.response.status} - ${error.response.data}`);
          } else {
            console.error(`Error fetching issue note: ${error.message}`);
          }
      }}
    }
  };
  
  const filteredHireOrderData = hireOrderData.filter((item) => {
    const searchTerm = searchQuery.toLowerCase();
    const hireDate = new Date(item.Hire_Date); // change Hire_Date to object
    const dateMatches = dateFilter 
      ? (hireDate.getMonth() === dateFilter.getMonth() && hireDate.getFullYear() === dateFilter.getFullYear()) 
      : true; // if not selct then show all

    return (
      (item.Hire_Order_ID.toString().includes(searchTerm) ||
        (item.Hire_Order_No && item.Hire_Order_No.toLowerCase().includes(searchTerm)) ||
        (item.Status && item.Status.toLowerCase().includes(searchTerm)) ||
        (item.Hire_Date && item.Hire_Date.toLowerCase().includes(searchTerm)) ||
        (item.Delivery_Address && item.Delivery_Address.toLowerCase().includes(searchTerm))) &&
      dateMatches // add date selection
    );
  });

  const showall = async() =>{
    setDateFilter(null);
 }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Hire Orders & Issue Notes</Text>
        
        {/* calendar icon */}
        <TouchableOpacity onPress={() => setShowDatePicker(!showDatePicker)}>
          <Icon name="calendar" size={30} color="#000" />
        </TouchableOpacity>
      </View>
      
      {showDatePicker && (
      <DateTimePicker
        value={dateFilter || new Date()} 
        mode="date" 
        display="spinner"
        onChange={onDateChange} 
      />
    )}
  
      <TextInput
        style={styles.searchInput}
        placeholder="Search Hire Orders"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      
      <FlatList
        data={filteredHireOrderData}
        keyExtractor={(item) => item.Hire_Order_ID.toString()}
        renderItem={({ item }) => {
          const isExpanded = expandedItems[item.Hire_Order_ID];
          return(
          <TouchableOpacity
            style={styles.orderContainer}
            onPress={() => fetchIssueNotes(item.Hire_Order_ID)}
          >
            <Text style={styles.info}>Hire Order ID: {item.Hire_Order_ID}</Text>
           {isExpanded &&(
            <>
            <Text style={styles.info}>Hire Order No: {item.Hire_Order_No || 'NULL'}</Text>
            <Text style={styles.info}>Status: {item.Status}</Text>
            <Text style={styles.info}>Hire Date: {item.Hire_Date}</Text>
            <Text style={styles.info}>Quantity: {item.Qty !== null ? item.Qty : 'NULL'}</Text>
            <Text style={styles.info}>Delivery Address: {item.Delivery_Address || 'NULL'}</Text>
            </>
           )}
           <TouchableOpacity onPress={() => toggleExpand(item.Hire_Order_ID)}>
           <Text style={styles.expandText}>
             {isExpanded ? 'Show Less' : 'Show More...'}
           </Text>
         </TouchableOpacity>

            {selectedHireOrderId === item.Hire_Order_ID && issueNotesData[item.Hire_Order_ID] ? (
                <FlatList
                data={issueNotesData[item.Hire_Order_ID]} // Iterate through the list of issue notes
                keyExtractor={(issueNoteItem) => issueNoteItem.Issue_Note_ID.toString()}
                renderItem={({ item: issueNoteItem }) => {
                  const isIssueExpanded=expandedIssue[`${item.Hire_Order_ID}-${issueNoteItem.Issue_Note_ID}`];
               return(
                  <View style={styles.issueNoteContainer}>
                    <Text style={styles.info}>Issue Note ID: {issueNoteItem.Issue_Note_ID}</Text>
                    {isIssueExpanded &&(
                    <>
                    <Text style={styles.info}>Issue Note No: {issueNoteItem.Issue_Note_No}</Text>
                    <Text style={styles.info}>Issue Qty: {issueNoteItem.Issue_Qty}</Text>
                    <Text style={styles.info}>Issue Date: {issueNoteItem.Issue_Date}</Text>
                    <Text style={styles.info}>Vehicle No: {issueNoteItem.Vehicle_No || 'NULL'}</Text>
                    <Text style={styles.info}>Driver: {issueNoteItem.Driver || 'NULL'}</Text>
                    <Text style={styles.info}>Driver IC: {issueNoteItem.Driver_IC || 'NULL'}</Text>
                    <Text style={styles.info}>Tpn Company: {issueNoteItem.Tpn_Company}</Text>
                    <Text style={styles.info}>Tpn Charge: {issueNoteItem.Tpn_Charge || 'NULL'}</Text>
                    <Text style={styles.info}>Remarks: {issueNoteItem.Remarks || 'NULL'}</Text>
                    </>
                    )}
                 <TouchableOpacity onPress={() => toggleExpandIssue(item.Hire_Order_ID, issueNoteItem.Issue_Note_ID)}>
                 <Text style={styles.expandText}>
                   {isIssueExpanded ? 'Show Less' : 'Show More...'}
                 </Text>
               </TouchableOpacity>
                    <Button title="Sign" onPress={() => handleSignPress(issueNoteItem.Issue_Note_ID)} />                
               </View>
               );
                }}
              />
            ) : (
              selectedHireOrderId === item.Hire_Order_ID && <Text style={styles.info}>No issue note data for this hire order.</Text>
            )}
           
          </TouchableOpacity>
        );
      }}
        ListEmptyComponent={ 
          <View style={styles.emptyContainer}> 
          <Image source={require('../assets/LHT.png')} style={styles.emptyImage} /> 
          <Text style={styles.emptyText}>
          No hire order data available.
          </Text> 
          </View> }/>
          <Button title="Show all" onPress={() => showall()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // set in the same line
    alignItems: 'center',
    marginBottom: 20,
  },
  expandText: {
    color: '#778899',
    marginTop: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyImage: {
    width: 300, 
    height: 150, 
    marginTop:50,
    marginBottom: 20, 
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#333',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
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
