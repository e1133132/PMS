import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput,Alert, TouchableOpacity, FlatList, Image, Button } from 'react-native';
import axios from 'axios';
import ImageUploader from './TakePhoto';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function Movement({ route,navigation }) {
  const { token,id,customer_ID,userNumber } = route.params;
  const [moveData, setMoveData] = useState([]);
  const [dateField, setDateField] = useState('');
  const [expandedItemWithForm, setExpandedItemWithForm] = useState(null); 
  const [searchQuery, setSearchQuery] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [Ref_No, setRef_No] = useState('');
  const [Qty_to_DFI_Headquarter, setQty_to_DFI_Headquarter] = useState('');
  const [Qty_Exchanged, setQty_Exchanged] = useState('');
  const [Qty_Pending_Exchange, setQty_Pending_Exchange] = useState('');
  const [Date_Exchanged, setDate_Exchanged] = useState('');
  const [companyInputs, setCompanyInputs] = useState({});
  const [formData, setFormData] = useState({
    dateField: '',
    Ref_No: '',
    Qty_to_DFI_Headquarter: '',
    Qty_Exchanged: '',
    Qty_Pending_Exchange: '',
    Date_Exchanged: '',
  });
  const [isQtyExManuallyEdited, setIsQtyExManuallyEdited] = useState(false);
  let r=null;

  
  useEffect(() => {
    console.log(userNumber);
    const now = new Date();
    const formattedDate = now.toISOString().split('T')[0]; 
    setDateField(formattedDate);
    setDate_Exchanged(formattedDate);
    //getLastRefNo();
    //setRef_No(r);
  }, [token]);

  const handleCardPress = (item) => {
    setExpandedItemWithForm((prev) =>
      prev === item.DFI_Movement_ID ? null : item.DFI_Movement_ID
    );
  
    setCompanyInputs((prev) => {
      const currentData = prev[item.DFI_Movement_ID] || {};
  
      return {
        ...prev,
        [item.DFI_Movement_ID]: {
          dateField: currentData.dateField || '',
          Ref_No: currentData.Ref_No || 'EXD', 
          Qty_to_DFI_Headquarter: currentData.Qty_to_DFI_Headquarter || '',
          Qty_Exchanged: currentData.Qty_Exchanged || '',
          Qty_Pending_Exchange: currentData.Qty_Pending_Exchange || '',
        },
      };
    });
  };
  
  

  const handleInputChange = (DFI_Movement_ID, field, value) => {
    setCompanyInputs((prev) => {
      const currentData = prev[DFI_Movement_ID] || {};
      let updatedData = { ...currentData, [field]: value };
  
      if (field === 'Qty_to_DFI_Headquarter') {
        const qtyToHQ = parseFloat(value) || 0;
        const qtyExchanged = currentData.isQtyExManuallyEdited
          ? parseFloat(currentData.Qty_Exchanged) || 0
          : qtyToHQ;
  
        updatedData = {
          ...updatedData,
          Qty_Exchanged: currentData.isQtyExManuallyEdited
            ? currentData.Qty_Exchanged
            : qtyToHQ.toString(),
          Qty_Pending_Exchange: (qtyToHQ - qtyExchanged).toString(),
        };
      }
  
      if (field === 'Qty_Exchanged') {
        const qtyToHQ = parseFloat(currentData.Qty_to_DFI_Headquarter) || 0;
        const qtyExchanged = parseFloat(value) || 0;
  
        updatedData = {
          ...updatedData,
          Qty_Pending_Exchange: (qtyToHQ - qtyExchanged).toString(),
          isQtyExManuallyEdited: true, 
        };
      }
  
      return {
        ...prev,
        [DFI_Movement_ID]: updatedData,
      };
    });
  };
  

  const getLastRefNo = async () => {
    try {  
      //console.log("dd")
      const url=`http://115.42.158.153:85/api/SG/DFIMovementHistory/GetNextRefNo`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const ref = response.data?.RefNo;
      // update user data
      if (ref) {
        r=ref;
        console.log(r)
        setRef_No(ref);
        //console.log('Customer ID:', customer.customer_ID);
      } else {
        console.warn('No ref No found for the provided id');
      }
      //setLoading(false);
    } catch (error) {
      console.error('Error fetching ref no:', error);
      //setLoading(false);
    }
  };

  const handleSubmit = async (DFI_Movement_ID) => {
    const currentData = companyInputs[DFI_Movement_ID] || {};
   const { Ref_No, Qty_to_DFI_Headquarter, Qty_Exchanged, Qty_Pending_Exchange } = currentData;
   console.log(Ref_No);
    if (!Ref_No.trim() || !Qty_to_DFI_Headquarter || !Qty_Exchanged || !Qty_Pending_Exchange) {
      alert('All fields are required!');
      return;
    }

    const newRecord = {
      Date: dateField || null,
      Ref_No:Ref_No,
      DFI_Movement_ID: DFI_Movement_ID,
      Qty_to_DFI_Headquarter: parseFloat(Qty_to_DFI_Headquarter),
      Qty_Exchanged: parseFloat(Qty_Exchanged),
      Qty_Pending_Exchange: parseFloat(Qty_Pending_Exchange),
      Date_Exchanged: Date_Exchanged || null,
    };

    console.log(newRecord);
    try {
      const response = await fetch(`http://115.42.158.153:85/api/SG/DFIMovementHistories/${userNumber}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
           Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newRecord),
      });
      const result = await response.json();
      Alert.alert('Success', 'Exchange Note saved successfully.');
      console.log(result);
      setExpandedItemWithForm(null); 
    } catch (error) {
      console.error('Error saving Exchange Note:', error);
    }
  };


  let url=null;
  useEffect(() => {
 url=`http://115.42.158.153:85/api/SG/DFIMovement`;
   
   if (token) {
   getMovementDetail();
   }
  }, [token,id]);

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

    const incrementRefNo = () => {
      const match = Ref_No.match(/([A-Za-z]+)(\d+)/);
      if (match) {
        const prefix = match[1];
        const number = parseInt(match[2], 10);
        const newRefNo = `${prefix}${String(number + 1).padStart(match[2].length, '0')}`;
        setRef_No(newRefNo);
      }
    };
  
    const decrementRefNo = () => {
      const match = Ref_No.match(/([A-Za-z]+)(\d+)/);
      if (match) {
        const prefix = match[1];
        const number = parseInt(match[2], 10);
        if (number > 0) {
          const newRefNo = `${prefix}${String(number - 1).padStart(match[2].length, '0')}`;
          setRef_No(newRefNo);
        }
      }
    };

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
         {searchQuery.trim() ? (
        <FlatList
          data={filteredExchangeNotes}
          keyExtractor={(item) => item.DFI_Movement_ID.toString()}
          renderItem={({ item }) => {
            const isExpanded = expandedItems[item.DFI_Movement_ID];
            const showForm = expandedItemWithForm === item.DFI_Movement_ID;
  
            return (
              <View>
                <TouchableOpacity onPress={() => handleCardPress(item)}>
                  <View style={styles.issueNoteContainer}>
                    <Text style={styles.info}>
                      Customer Name: {item.Customer_Name || 'N/A'}
                    </Text>
                    {isExpanded && (
                      <>
                        <Text style={styles.info}>
                          Qty_to_DFI_Headquarter: {item.Qty_to_DFI_Headquarter || '0'}
                        </Text>
                        <Text style={styles.info}>
                          Qty_Exchanged: {item.Qty_Exchanged || '0'}
                        </Text>
                        <Text style={styles.info}>
                          Qty_Pending_Exchange: {item.Qty_Pending_Exchange || '0'}
                        </Text>
                        <Text style={styles.info}>
                          DFI Movement ID: {item.DFI_Movement_ID}
                        </Text>
                      </>
                    )}
                    <TouchableOpacity onPress={() => toggleExpand(item.DFI_Movement_ID)}>
                      <Text style={styles.expandText}>
                        {isExpanded ? 'Show Less' : 'Show More...'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
                {showForm && (
                  <View style={styles.issueNoteContainer}>
                  <View style={styles.formContainer}>
                    <Text style={styles.label}>Date:</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Date (YYYY-MM-DD)"
                      value={dateField}
                      onChangeText={(value) => handleInputChange('dateField', value)}
                    />
                     <Text style={styles.label}>Reference No:</Text>
                    <View style={styles.row}>
                    <TextInput
                      style={styles.refinput}
                      placeholder="Reference No"
                      value={companyInputs[item.DFI_Movement_ID]?.Ref_No || ''}
                      onChangeText={(value) =>
                        handleInputChange(
                          item.DFI_Movement_ID,
                          'Ref_No',
                          value
                        )
                      }
                    />
                    </View>

                    <View style={styles.inputRow}>
                      <View style={styles.inputBlock}>
                        <Text style={styles.label}>Qty to Hq:</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="Qty to Hq"
                          value={companyInputs[item.DFI_Movement_ID]?.Qty_to_DFI_Headquarter || ''}
                          onChangeText={(value) => handleInputChange(item.DFI_Movement_ID, 'Qty_to_DFI_Headquarter', value)}
                          keyboardType="numeric"
                        />
                      </View>
                      <View style={styles.inputBlock}>
                        <Text style={styles.label}>Qty Ex:</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="Qty Ex"
                          value={companyInputs[item.DFI_Movement_ID]?.Qty_Exchanged || ''}
                          onChangeText={(value) => handleInputChange(item.DFI_Movement_ID, 'Qty_Exchanged', value)}
                          keyboardType="numeric"
                        />
                      </View>
                      <View style={styles.inputBlock}>
                        <Text style={styles.label}>Qty Pending Ex:</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="Qty Pending Ex"
                          value={companyInputs[item.DFI_Movement_ID]?.Qty_Pending_Exchange || ''}
                          onChangeText={(value) => handleInputChange(item.DFI_Movement_ID, 'Qty_Pending_Exchange', value)}
                          keyboardType="numeric"
                        />
                      </View>
                    </View>
                    <Text style={styles.label}>Date Exchanged:</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Date Exchanged (YYYY-MM-DD)"
                      value={Date_Exchanged}
                      onChangeText={(value) =>
                        handleInputChange('Date_Exchanged', value)
                      }
                    />
                  <View style={styles.imageUploaderContainer}>
                  {console.log("DFI_Movement_History_ID:", item?.DFI_Movement_History_ID)}
                     <ImageUploader token={token} DFI_Movement_History_ID={item.DFI_Movement_History_ID} />
                     </View>

                    <View style={styles.buttonContainer}>
                      <TouchableOpacity style={styles.addButton}  onPress={() => handleSubmit(item.DFI_Movement_ID)}>
                        <Text style={styles.buttonText}>Save</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => setExpandedItemWithForm(null)}
                      >
                        <Text style={styles.buttonText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  </View>
                )}
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Image
                source={require('../assets/LHT.png')}
                style={styles.emptyImage}
              />
              <Text style={styles.emptyText}>No Movements Available</Text>
            </View>
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Image
                source={require('../assets/LHT.png')}
                style={styles.emptyImage}
              />
          <Text style={styles.emptyText}>Enter a search query to display results</Text>
        </View>
      )}
      </View>
    );
  };



const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  iconContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -8,
  },
  imageUploaderContainer: {
    width: '100%',
    marginTop: 0,
    marginLeft: 30,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 2, 
    //marginVertical: 0,
  },
  inputRow: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 15, 
    width: '100%', 
  },
  emptyContainer: {
    flex: 0.75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyImage: {
    width: 260,
    height: 150,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#333',
  },
  formContainer: {
    width: '100%', 
    alignItems: 'center', 
    padding: 20, 
  },
  inputBlock: {
    flex: 1, 
    alignItems: 'center', 
    marginHorizontal: -5, 
  },
  refinput: {
    width: '60%', 
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
    marginRight: 10,
  },
  input: {
    width: '80%', 
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    width: '100%', 
    marginBottom: 10,
  },
  inputqty: {
    width: '30%', 
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    width: '100%',
    marginLeft: 30,
  },
  addButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
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