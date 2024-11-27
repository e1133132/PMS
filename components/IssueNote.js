import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Button, TextInput, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';

export default function IssueNote({ route, navigation }) {
  const { token, customer_ID,Role} = route.params;
  const [issueNotesData, setIssueNotesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});

//console.log(Role);
  let issueURL=null;
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
  
  const showall = async() =>{
    setDateFilter(null);
 }

  const toggleExpand = (issueNoteId) => {
    setExpandedItems((prev) => ({ ...prev, [issueNoteId]: !prev[issueNoteId] }));
  };

  useEffect(() => {
    const fetchIssueNotes = async () => {
      try {
        if(Role=="Customer")
          {issueURL=`http://172.20.10.9:85/api/SG/Issue_Note/GetIssueNoteFromCustomerIdWithCombinedTablesWithName/${customer_ID}`}
        else if(Role=="Staff")
        {issueURL=`http://172.20.10.9:85/api/SG/Issue_Note/NewIssueNote`}

        const response = await axios.get(
          issueURL,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIssueNotesData(response.data);
      } catch (error) {
        console.error('Error fetching issue notes:', error);
      } finally {
        setLoading(false);
      }
    };
    if (token && customer_ID) {
      fetchIssueNotes();
    }
  }, [token, customer_ID]);

  const filteredIssueNotes = issueNotesData.filter((item) => {
    const searchTerm = searchQuery.toLowerCase();
    const issueDate = new Date(item.Issue_Date);
    const dateMatches = dateFilter
      ? (issueDate.getMonth() === dateFilter.getMonth() && issueDate.getFullYear() === dateFilter.getFullYear())
      : true;

      return (
        dateMatches &&
        (
          (item.Issue_Note_ID.toString().includes(searchTerm)) ||
          (item.Tpn_Company && item.Tpn_Company.toLowerCase().includes(searchTerm)) ||
          (item.Customer_Name && item.Customer_Name.toLowerCase().includes(searchTerm)) ||
          (item.Issue_Note_No && item.Issue_Note_No.toLowerCase().includes(searchTerm)) ||
          (item.Status && item.Status.toLowerCase().includes(searchTerm)) ||
          (item.Driver && item.Driver.toLowerCase().includes(searchTerm)) ||
          (item.Driver_IC && item.Driver_IC.toLowerCase().includes(searchTerm)) ||
          (item.Vehicle_No && item.Vehicle_No.toLowerCase().includes(searchTerm)) ||
          (item.Remarks && item.Remarks.toLowerCase().includes(searchTerm))
        )
      );
    }).sort((a, b) => new Date(b.Issue_Date) - new Date(a.Issue_Date));

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
        <Text style={styles.header}>Issue Notes</Text>
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
        placeholder="Search Issue Notes"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />


      <FlatList
         data={filteredIssueNotes.filter(item => item.Status === "New")}
        keyExtractor={(item) => item.Issue_Note_ID.toString()}
        renderItem={({ item }) => {
          const isExpanded = expandedItems[item.Issue_Note_ID];
          return (
            <View style={styles.issueNoteContainer}>
              <Text style={styles.info}>Issue Note No: {item.Issue_Note_No}</Text>
                <Text style={styles.info}>Customer Name: {item.Customer_Name || 'N/A'}</Text>
                {isExpanded && (
                  <>
                   <Text style={styles.info}>Issue Note ID: {item.Issue_Note_ID}</Text>
                    <Text style={styles.info}>Issue Note No: {item.Issue_Note_No}</Text>
                    <Text style={styles.info}>Status: {item.Status || 'N/A'}</Text>
                    <Text style={styles.info}>Issue Qty: {item.Issue_Qty || 'N/A'}</Text>
                    <Text style={styles.info}>Tpn Company: {item.Tpn_Company}</Text>
                    <Text style={styles.info}>Vehicle No: {item.Vehicle_No || 'N/A'}</Text>
                    <Text style={styles.info}>Driver: {item.Driver || 'N/A'}</Text>
                    <Text style={styles.info}>Issue Date: {item.Issue_Date || 'N/A'}</Text>
                    <Text style={styles.info}>Driver IC: {item.Driver_IC || 'NULL'}</Text>
                    <Text style={styles.info}>Remarks: {item.Remarks || 'N/A'}</Text>
                  </>
                )}
              <TouchableOpacity onPress={() => toggleExpand(item.Issue_Note_ID)}>
              <Text style={styles.expandText}>{isExpanded ? 'Show Less' : 'Show More...'}</Text>
              </TouchableOpacity>
              <Button title="Manage" onPress={() => handleSignPress(item.Issue_Note_ID)} />
            </View>
          );

        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Image source={require('../assets/LHT.png')} style={styles.emptyImage} />
            <Text style={styles.emptyText}>No Issue Notes Available</Text>
          </View>
        }
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
  issueNoteContainer: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  info: {
    fontSize: 18,
    marginVertical: 2,
  },
  expandText: {
    color: '#778899',
    fontSize: 15,
    marginTop: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyImage: {
    width: 300,
    height: 150,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#333',
  },
});
