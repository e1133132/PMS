import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

export default function MovementManage({ route,navigation }) {
  const { token,id,customer_ID,item } = route.params;
  const [DFI_Movement_History_ID, setDFI_Movement_History_ID] = useState('');
  const [dateField, setDateField] = useState('');
  const [Ref_No, setRef_No] = useState('');
  const [Qty_to_DFI_Headquarter, setQty_to_DFI_Headquarter] = useState('');
  const [Qty_Exchanged, setQty_Exchanged] = useState('');
  const [Qty_Pending_Exchange, setQty_Pending_Exchange] = useState('');
  const [Date_Exchanged, setDate_Exchanged] = useState('');
  

  useEffect(() => {
    const now = new Date();
    const formattedDate = now.toISOString().split('T')[0]; 
    setDateField(formattedDate);
    setDate_Exchanged(formattedDate);
  }, []);

  const handleSubmit = async () => {
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

    try {
      const response = await fetch(`http://172.20.10.9:85/api/SG/DFIMovementHistories/${customer_ID}`, {
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
      navigation.goBack();
    } catch (error) {
      console.error('Error saving Exchange Note:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Add Exchange Note</Text>
      <View style={styles.card}>
      <Text style={styles.label}>Date:</Text>
        <TextInput
            style={styles.input}
            placeholder="Date (YYYY-MM-DD)"
            value={dateField}
            onChangeText={setDateField}
          />

        <Text style={styles.label}>Reference No:</Text>
        <TextInput
          style={styles.input}
          placeholder="Reference No"
          value={Ref_No}
          onChangeText={setRef_No}
        />

        <Text style={styles.label}>Qty to DFI Headquarter:</Text>
        <TextInput
          style={styles.input}
          placeholder="Qty to DFI Headquarter"
          value={Qty_to_DFI_Headquarter}
          onChangeText={setQty_to_DFI_Headquarter}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Qty Exchanged:</Text>
        <TextInput
          style={styles.input}
          placeholder="Qty Exchanged"
          value={Qty_Exchanged}
          onChangeText={setQty_Exchanged}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Qty Pending Exchange:</Text>
        <TextInput
          style={styles.input}
          placeholder="Qty Pending Exchange"
          value={Qty_Pending_Exchange}
          onChangeText={setQty_Pending_Exchange}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Date Exchanged:</Text>
        <TextInput
          style={styles.input}
          placeholder="Date Exchanged (YYYY-MM-DD)"
          value={Date_Exchanged}
          onChangeText={setDate_Exchanged}
        />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.addButton} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
