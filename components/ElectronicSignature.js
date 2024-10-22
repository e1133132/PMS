import React, { useRef, useState } from 'react';
import { View, Button, Text, StyleSheet, Alert } from 'react-native';
import Signature from 'react-native-signature-canvas';

export default function ElectronicSignature({route,navigation}) {
  const { token, customer_ID } = route.params;
  const [signature, setSignature] = useState(null);
  const ref = useRef();

  const handleSignature = (sig) => {
    setSignature(sig); // save
    console.log(sig);
    Alert.alert('Sign successfully', 'Your signature have been saved');
  };

  const handleBack = () => {
    navigation.goBack(); 
  };

  const handleClear = () => {
    ref.current.clearSignature();
    setSignature(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Digital Sign</Text>
      <Signature
  ref={ref}
  onOK={handleSignature}
  onEmpty={() => Alert.alert("Please sign above")}
  descriptionText="Sign here"
  clearText="Reset"
  confirmText="Finish"
  autoClear={false}
  backgroundColor="#FFF"
  webStyle={`
          .m-signature-pad--footer {
            display: flex;
            justify-content: space-between;
          }
          .m-signature-pad--footer .button {
            color: black; 
            font-size: 16px; 
            font-weight: bold;
          }
        `}/>

         <View style={styles.backButtonContainer}>
        <Button title="Back to Issue Note" onPress={handleBack} />
         </View>
      
      {signature && (
        <View style={styles.signatureContainer}>
          <Text>Sign successfully</Text>
          <Button title="Clear signature" onPress={handleClear} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    marginVertical: 20,
  },
  signatureContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  backButtonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
});
