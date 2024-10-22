import React, { useRef, useState } from 'react';
import { View, Button, Text, StyleSheet, Alert } from 'react-native';
import Signature from 'react-native-signature-canvas';
import pako from 'pako';

export default function ElectronicSignature({route,navigation}) {
  const { token, customer_ID,issueNoteId } = route.params;

  const [signature, setSignature] = useState(null);
  const ref = useRef();

  const compressSignature = (data) => {
    // change Base64 signature to binary
    const binaryString = atob(data.split(',')[1]);
    const binaryData = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      binaryData[i] = binaryString.charCodeAt(i);
    }

    // use pako to compress
    const compressed = pako.deflate(binaryData, { to: 'string' });

    // recode to Base64
    const compressedBase64 = btoa(
      String.fromCharCode(...new Uint8Array(compressed))
    );

    return compressedBase64;
  };


  const handleSignature = (sig) => {
  const jpegSignature = sig.replace('data:image/png', 'data:image/jpeg');
  setSignature(jpegSignature); // save
   const compressedSig = compressSignature(jpegSignature);
   //console.log(compressedSig);
    const data = {
      Issue_Note_ID: issueNoteId,  
      customer_ID: customer_ID,  
      SignatureBase64: compressedSig
    };
    fetch(`http://172.20.10.9:85/api/SG/Issue_Note/SaveIssueNoteSign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    })
      .then(response => {
        
        if (response.ok) {
          return response.text().then(text => {
            if (text) {
              return JSON.parse(text);  
            } else {
              return {};  
            }
          });
        } else {
          throw new Error('Network response was not ok');
        }
      })
      .then(data => {
        console.log('Response data:', data);
        Alert.alert('Sign successfully', 'Your signature has been saved');
      })
      .catch((error) => {
        console.error('Fetch error:', error);
        Alert.alert('Error', error.message);
      });
    
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
  minWidth={1}  
  maxWidth={3}  
  canvasWidth={150}  
  canvasHeight={50}  
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
