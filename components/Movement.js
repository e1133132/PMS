import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Image, Button } from 'react-native';
import axios from 'axios';

export default function Movement({ route,navigation }) {
  const { token,id,customer_ID } = route.params;
  const [moveData, setMoveData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});
  const { selectedOption } = route.params || {}; 


  const handleSignPress = (DFI_Movement_ID,id) => {
    navigation.navigate('MovementHistory', {
      token: token,
      DFI_Movement_ID: DFI_Movement_ID,
      customer_ID: customer_ID,
      id:id,
    });
  };

  let url=null;
  useEffect(() => {
   switch(id){
   case 5: url=`http://172.20.10.9:85/api/SG/DFIMovement`;break;
   }
   if (token && customer_ID && id) {
   getMovementDetail();
   }
  }, [token, customer_ID,id]);

  const toggleExpand = (DFI_Movement_ID) => {
    setExpandedItems((prev) => ({ ...prev, [DFI_Movement_ID]: !prev[DFI_Movement_ID] }));
  };

  const getMovementDetail = async () => {
    try{
    const response = await axios.get(
          url,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMoveData(response.data);
    }catch(error){
        console.error('Error fetching movement:', error);
    }
  };

  const filteredExchangeNotes = moveData.filter((item) => {
    const searchTerm = searchQuery.toLowerCase();
      return (
          //(item.Customer_ID.toString().includes(searchTerm)) ||
          (item.DFI_Movement_ID.toString().includes(searchTerm)) ||
          (item.Customer_Name && item.Customer_Name.toLowerCase().includes(searchTerm)) //||
          //(item.Qty_to_DFI_Headquarter.toLowerCase().includes(searchTerm)) ||
          //(item.Qty_Exchanged.toLowerCase().includes(searchTerm)) ||
          //(item.Qty_Pending_Exchange.toLowerCase().includes(searchTerm)) 
      );
    })

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Movement</Text>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search your Movement"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />


      <FlatList
         data={filteredExchangeNotes}
        keyExtractor={(item) => item.DFI_Movement_ID.toString()}
        renderItem={({ item }) => {
          const isExpanded = expandedItems[item.DFI_Movement_ID];
          return (
            <View style={styles.issueNoteContainer}>
                <Text style={styles.info}>Customer Name: {item.Customer_Name || 'N/A'}</Text>

                {isExpanded && (
                  <>
                  <Text style={styles.info}>Qty_to_DFI_Headquarter: {item.Qty_to_DFI_Headquarter|| '0'}</Text>
                  <Text style={styles.info}>Qty_Exchanged: {item.Qty_Exchanged|| '0'}</Text>
                  <Text style={styles.info}>Qty_Pending_Exchange: {item.Qty_Pending_Exchange|| '0'}</Text>
                  <Text style={styles.info}>DFI Movement ID: {item.DFI_Movement_ID}</Text>
                  </>
                )}
              <TouchableOpacity onPress={() => toggleExpand(item.DFI_Movement_ID)}>
              <Text style={styles.expandText}>{isExpanded ? 'Show Less' : 'Show More...'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={() => handleSignPress(item.DFI_Movement_ID,id)}>
              <Text style={styles.buttonText}>Detail</Text>
              </TouchableOpacity>
            </View>
          );

        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Image source={require('../assets/LHT.png')} style={styles.emptyImage} />
            <Text style={styles.emptyText}>No Movements Available</Text>
          </View>
        }
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
  header: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  buttonText: { 
    fontSize: 12, 
    fontWeight: 'bold',
    color: '#000'
},
button: {
    backgroundColor: '#999999', 
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 5,
  },
  expandText: {
    color: '#778899',
    fontSize: 15,
    marginTop: 5,
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    marginTop: 10,
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
    fontSize: 16,
    marginVertical: 2,
  },
  containerb: {
    padding: 3,
  },
  formContainer: {
    width: "80%",
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
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
    width:350,
    marginTop: 15,
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  addButton: {
    backgroundColor: "#436850",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  cancelButton: {
    backgroundColor: "#9B4444",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});