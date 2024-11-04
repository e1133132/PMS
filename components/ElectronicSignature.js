import React, { useRef, useState } from 'react';
import { View, Button, Text, StyleSheet, Alert } from 'react-native';
import Signature from 'react-native-signature-canvas';
import pako from 'pako';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import axios from 'axios';
import { Buffer } from 'buffer'; 
import Toast from 'react-native-toast-message';

export default function ElectronicSignature({route,navigation}) {
  const { token, customer_ID,issueNoteId } = route.params;

  const [signature, setSignature] = useState(null);
  const ref = useRef();
  const [compressedSig, setCompressedSig] = useState(null);

  const prepareSignatureBase64 = (data) => {
    if (!data) {
      console.error("Data is undefined or empty");
      return "";
  }
    const base64Signature = data.includes(",") ? data.split(',')[1] : data;
    return base64Signature;
};

  const downloadPdf = async (pdfBase64) => {
    const fileUri = FileSystem.documentDirectory + 'IssueNote.pdf';
  
    
    await FileSystem.writeAsStringAsync(fileUri,pdfBase64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    Alert.alert(
      "Download PDF",
      "PDF has been generated. Would you like to download it?",
      [
        { text: "No" },
        {
          text: "Yes",
          onPress: () => Sharing.shareAsync(fileUri), 
        },
      ]
    );
  };

  const fetchPdf = async () => {
    try {
      const pdfResponse = await axios.get(
        `http://172.20.10.9:85/api/SG/Issue_Note/GetIssueNoteDTOForDisplay/${issueNoteId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    
      //const pdfData = pdfResponse.data;
      //console.log("Fetched PDF Data:", pdfData);
      const pdfData = {
        ...pdfResponse.data, 
        compressedSignatureBase64: compressedSig 
      };
     // console.log("Fetched PDF Data:", pdfData);
      const pdf = await axios.post('http://172.20.10.9:85/api/SG/Issue_Note/GetPdfOfIssueNote64', pdfData, {
        headers: {  Authorization: `Bearer ${token}`,'Content-Type': 'application/x-www-form-urlencoded' },
        responseType: 'arraybuffer',
      });
       console.log(pdf);
       console.log(token);
      if (pdf.status === 200 && pdf.data) {
        const pdfBlob = pdf.data; 
        const pdfBase64 = Buffer.from(pdfBlob, 'binary').toString('base64');
        await downloadPdf(pdfBase64);

      } else {
        console.log(pdf.status);
        throw new Error("Failed to generate PDF.");
      }
    } catch (error) {
      if (error.response) {
        console.error("API Error Headers:", error.response.headers);
      } else if (error.request) {
        console.error("No response received:", error.request); 
      } else {
        console.error("Error in request setup:", error.message); 
      }
      const errorDetails = JSON.stringify(error, Object.getOwnPropertyNames(error));
 // console.error("Full error details:", errorDetails);
    }    
  };
  

  const handleSignature = (sig) => {
  const jpegSignature = sig.replace('data:image/png', 'data:image/jpeg');
  setSignature(jpegSignature); // save
  const preparedSig = prepareSignatureBase64(jpegSignature);
  setCompressedSig(preparedSig);
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
      .then(() => {
        //console.log('Response data:', data);
        //fetchPdf();
        Toast.show({
          type: 'success',
          text1: 'Sign successfully',
          text2: 'Your signature has been saved',
          position: 'bottom', 
          visibilityTime: 4000, 
        });
        console.log("success");
        fetchPdf();
      })
      .catch((error) => {
       // console.error('Fetch error:', error);
       // Alert.alert('Error', error.message);
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
