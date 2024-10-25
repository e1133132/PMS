import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator,TouchableOpacity, FlatList, TextInput,Image,Button } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';


export default function RetrieveNote({ route}) {
  const { token, customer_ID } = route.params;
  const [retrieveData, setreRrieveData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { selectedOption } = route.params || {}; 
  const [searchQuery, setSearchQuery] = useState(''); 
  const [dateFilter, setDateFilter] = useState(null); // save month
  const [showDatePicker, setShowDatePicker] = useState(false); // contrl show of date selector
  const [expandedItems, setExpandedItems] = useState({}); 

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

  // date changer
  const onDateChange = (event, selectedDate) => {
    if (selectedDate) {
      //setShowDatePicker(false);
      setDateFilter(selectedDate); // set date selected
    } else {
      setShowDatePicker(false);
    }
  };

  const showall = async() =>{
    setDateFilter(null);
 }

 const toggleExpand = (id) => {
  setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
};

  const filteredRetrieveNoteData = retrieveData.filter((item) => {
    const searchTerm = searchQuery.toLowerCase();
    const retrieveDate = new Date(item.Retrieve_Date); // change Hire_Date to object
    const dateMatches = dateFilter 
      ? (retrieveDate.getMonth() === dateFilter.getMonth() && retrieveDate.getFullYear() === dateFilter.getFullYear()) 
      : true; // if not selct then show all
    return (
      (item.Retrieve_Note_ID.toString().includes(searchTerm) ||
      (item.Creation_Time && item.Creation_Time.toLowerCase().includes(searchTerm)) ||
      (item.Status && item.Status.toLowerCase().includes(searchTerm)) ||
      (item.Retrieve_Note_No && item.Retrieve_Note_No.toLowerCase().includes(searchTerm)) ||
      (item.Customer_ID && item.Customer_ID.toString().includes(searchTerm)) ||
      (item.Pallet_Profile_ID && item.Pallet_Profile_ID.toString().includes(searchTerm)) ||
      (item.Qty && item.Qty.toString().includes(searchTerm)) ||
      (item.Vehicle_No && item.Vehicle_No.toLowerCase().includes(searchTerm)) ||
      (item.Retrieve_Date && item.Retrieve_Date.toLowerCase().includes(searchTerm)) ||
      (item.Retrieve_Address && item.Retrieve_Address.toLowerCase().includes(searchTerm)) ||
      (item.Retrieve_Type && item.Retrieve_Type.toLowerCase().includes(searchTerm)) ||
      (item.Tpn_Company && item.Tpn_Company.toLowerCase().includes(searchTerm)) ||
      (item.Remarks && item.Remarks.toLowerCase().includes(searchTerm)))&&dateMatches
    );
  });
  

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
      <Text style={styles.header}>Retrieve Notes</Text>
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
        placeholder="Search Retrieve Notes"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

<FlatList
        data={filteredRetrieveNoteData}
        keyExtractor={(item) => item.Retrieve_Note_ID.toString()}
        renderItem={({ item }) => {
          const isExpanded = expandedItems[item.Retrieve_Note_ID]; // Check if this item is expanded
          return (
            <View style={styles.orderContainer}>
              <Text style={styles.info}>Retrieve Note ID: {item.Retrieve_Note_ID}</Text>
              <Text style={styles.info}>Creation Time: {item.Creation_Time}</Text>
              <Text style={styles.info}>Status: {item.Status}</Text>

              {/* Only show three items unless expanded */}
              {isExpanded ? ( //if isexpanded  yes:....   no:....
                <>
                  <Text style={styles.info}>Retrieve Note No: {item.Retrieve_Note_No}</Text>
                  <Text style={styles.info}>Customer ID: {item.Customer_ID}</Text>
                  <Text style={styles.info}>Pallet Profile ID: {item.Pallet_Profile_ID}</Text>
                  <Text style={styles.info}>Qty: {item.Qty}</Text>
                  <Text style={styles.info}>Vehicle No: {item.Vehicle_No}</Text>
                  <Text style={styles.info}>Retrieve Date: {item.Retrieve_Date}</Text>
                  <Text style={styles.info}>Retrieve Address: {item.Retrieve_Address}</Text>
                  <Text style={styles.info}>Retrieve Type: {item.Retrieve_Type}</Text>
                  <Text style={styles.info}>Tpn Company: {item.Tpn_Company}</Text>
                  <Text style={styles.info}>Remarks: {item.Remarks}</Text>
                </>
              ) : (
                <TouchableOpacity onPress={() => toggleExpand(item.Retrieve_Note_ID)}>
                  <Text style={styles.expandText}>Show More...</Text>
                </TouchableOpacity>
              )}

              {isExpanded && (
                <TouchableOpacity onPress={() => toggleExpand(item.Retrieve_Note_ID)}>
                  <Text style={styles.expandText}>Show Less</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
        ListEmptyComponent={ 
          <View style={styles.emptyContainer}> 
            <Image source={require('../assets/LHT.png')} style={styles.emptyImage} /> 
            <Text style={styles.emptyText}>No retrieve note data available.</Text> 
          </View> 
        }
      />
      <Button title="Show all" onPress={() => showAll()} />
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  expandText: {
    color: '#778899',
    marginTop: 5,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  info: {
    fontSize: 18,
    marginVertical: 5,
  },
});
