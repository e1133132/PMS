import React, { useRef, useState,useEffect } from 'react';
import { View, Button, Text, StyleSheet, Alert,Image,Dimensions,FlatList,useWindowDimensions} from 'react-native';
import Signature from 'react-native-signature-canvas';
import pako from 'pako';
import SignatureView from 'react-native-signature-view';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import axios from 'axios';
import { Buffer } from 'buffer'; 
import Toast from 'react-native-toast-message';
import ImageUploader from './TakePhoto';
import QRCode from 'react-native-qrcode-svg';
const screenWidth = Dimensions.get('window').width;

export default function ElectronicSignature({route,navigation}) {
  const { token, customer_ID,issueNoteId } = route.params;
  const [signature, setSignature] = useState(null);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const ref = useRef();
  const [compressedSig, setCompressedSig] = useState(null);
  const [Issuenote,setIssuenote] = useState({});
  const [qrCodeUri, setQrCodeUri] = useState(null);
  const [loading, setLoading] = useState(true);
  const retryCount = 4
 const [canvasWidth, setCanvasWidth] = useState(screenWidth * 0.9);
 const [canvasHeight, setCanvasHeight] = useState(screenWidth * 0.6);
  const { width, height } = useWindowDimensions();
  const [canvasSize, setCanvasSize] = useState({ width: 100, height: 100 });
  const [imageData, setImageData] = useState(null);

  useEffect(() => {
    //fetchQRCode();
    fetchImage();
    if (compressedSig) {
      fetchPdf();
    }

  }, [ issueNoteId, token,compressedSig]);

  const onLayout = (event) => {
    const { width, height } = event.nativeEvent.layout;
    setCanvasWidth(width * 0.9); 
    setCanvasHeight(height * 0.4); 
  };

 const fetchImage = async () => {
      try {
        const response = await fetch(`http://172.20.10.9:85/api/SG/Issue_Note/${issueNoteId}/qrcodepdf`, {
          method: 'GET',
        });

        if (response.ok) {
          const blob = await response.blob();
          const reader = new FileReader();
          reader.onloadend = () => {
            setImageData(reader.result);
            setLoading(false);
          };
          reader.readAsDataURL(blob);
        }
      } catch (error) {
        console.error('Error fetching image:', error);
        setLoading(false);
      }
    };

  const handleLayout = (event) => {
    const { width, height } = event.nativeEvent.layout;
    setCanvasSize({ width, height });
  };
  
  const prepareSignatureBase64 = (data) => {
    if (!data) {
      console.error("Data is undefined or empty");
      return "";
  }
    const base64Signature = data.includes(",") ? data.split(',')[1] : data;
    return base64Signature;
};

const fetchQRCode = async () => {
  try {
      const response = await axios.get(`http://172.20.10.9:85/api/SG/Issue_Note/${issueNoteId}/qrcode`, {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'arraybuffer', 
      });
      
      const base64Image = `data:image/png;base64,${Buffer.from(response.data, 'binary').toString('base64')}`;
      setQrCodeUri(base64Image);
  } catch (error) {
      if (error.response) {
          console.error(`Error fetching QR code: ${error.response.status} - ${error.response.data}`);
      } else {
          console.error(`Error fetching QR code: ${error.message}`);
      }
      Alert.alert("Error", "Failed to fetch QR code");
  } finally {
      setLoading(false);
  }
};

  const downloadPdf = async (pdfBase64) => {
    const fileUri = FileSystem.documentDirectory + 'IssueNote.pdf';
    try {
      const url=`http://172.20.10.9:85/api/SG/Issue_Note/pdfupload/${issueNoteId}`;
      const response = await axios.post(url,
        {
          fileData: pdfBase64,
        },
        { 
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
      //  Alert.alert('PDF upload successfully');
      } else {
        Alert.alert('PDF upload fail');
      }
    } catch (error) {
      console.error('upload pdf fail:', error);
      Alert.alert('upload pdf fail', error.message);
    }
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
      // const pdf = await axios.post('http://172.20.10.9:85/api/SG/Issue_Note/GetPdfOfIssueNote64', pdfData, {
      //   headers: {  Authorization: `Bearer ${token}`,'Content-Type': 'application/json' },
      //   responseType: 'arraybuffer',
      // });
      for (let attempt = 0; attempt < retryCount; attempt++) {
        try {
          console.log(`Fetching PDF attempt ${attempt + 1}...`);
          const pdf = await axios.post(
            'http://172.20.10.9:85/api/SG/Issue_Note/GetPdfOfIssueNote64',
            pdfData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              responseType: 'arraybuffer'
            }
          );
          const email = await axios.post(
            `http://172.20.10.9:85/api/SG/Issue_Note/SendEmail/${issueNoteId}`,
            pdfData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              responseType: 'json'
            }
          );

          if (email.status === 200 && email.data) {
            console.log("email sent successfully");
          } else {
            console.log("Failed to send email");
          }
          //console.log(pdf.status);
          if (pdf.status === 200 && pdf.data) {
            const pdfBlob = pdf.data;
            const pdfBase64 = Buffer.from(pdfBlob, 'binary').toString('base64');
            await downloadPdf(pdfBase64);
            console.log("PDF downloaded successfully");
            return;
          } else {
            throw new Error("Failed to generate PDF");
          }
        } catch (error) {
          //console.log(pdf.status);
          if (attempt < retryCount - 1) {
            console.warn(`Retrying... (${attempt + 2}/${retryCount})`);
            await new Promise((resolve) => setTimeout(resolve, 1000)); 
          } else {
            console.error("Max retries reached. Failed to fetch PDF.");
            if (error.response) {
              console.log("API Error Status:", error.response.status);
              console.error("API Error Headers:", error.response.headers);
              console.error("API Error Data:", error.response.data);
            } else if (error.request) {
              console.error("No response received:", error.request);
            } else {
              console.error("Error in request setup:", error.message);
            }
          }
        }
      }}catch(error){

      }};
    

  const okRecheck=(sig)=>{
    Alert.alert(
      "Signature submitting recheck",
      "Are you sure to submit signature?",
      [
        {
          text: "No",
          onPress: () => console.log("Signature submitting cancel"),
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: () => handleSignature(sig),
        },
      ],
      { cancelable: false }
    );
  };

  const handleSignature = async(sig) => {
    try{
  const jpegSignature = sig.replace('data:image/png', 'data:image/jpeg');
  setSignature(jpegSignature); // save
  const preparedSig = prepareSignatureBase64(jpegSignature);
  setCompressedSig(preparedSig);
    const data = {
      Issue_Note_ID: issueNoteId,  
      customer_ID: customer_ID,  
      SignatureBase64: preparedSig
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(`http://172.20.10.9:85/api/SG/Issue_Note/SaveIssueNoteSign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error('network error');
    }
    //console.log("success");
    Toast.show({
      type: 'success',
      text1: 'Sign successfully',
      position: 'bottom',
      visibilityTime: 2000,
    });
   // await fetchPdfWithRetry();
  }catch (error) {
    if (error.name === 'AbortError') {
      console.error("request timeout");
     // Alert.alert('error', 'timeout,try later');
    } else {
      console.error('request error:', error);
    //  Alert.alert('error', error.message);
    }
  }
  };

  const handleBack = () => {
    navigation.goBack(); 
  };

  const handleClear = () => {
    ref.current.clearSignature();
    setSignature(null);
  };

  return (
        <View style={styles.container} onLayout={onLayout}>
           <View style={styles.header}>
          <Text style={styles.title}>Digital Sign</Text>
        </View>
        <View style={styles.sheader}>
          <Signature
      ref={ref}
      onOK={okRecheck}
      onEmpty={() => Alert.alert("Please sign above")}
      onBegin={() => setScrollEnabled(false)}
      onEnd={() => setScrollEnabled(true)}
      descriptionText="Sign here"
      clearText="Reset"
      confirmText="Finish"
      autoClear={false}
      backgroundColor="#FFF"
      canvasWidth={canvasWidth}
      canvasHeight={canvasHeight}
      webStyle={`
        .m-signature-pad {
          width: 100%;
          height: 100%;
        }
        .m-signature-pad--footer .button {
          display: block;
          font-size: 15px;
          margin-top: 0px;

        }
      `}
    />
    </View>
    <FlatList
    data={[]}
    renderItem={null} 
    keyExtractor={(_, index) => `header-footer-${index}`}
    ListHeaderComponent={
      <>
        <View style={styles.imageUploaderContainer}>
          <ImageUploader token={token} issueNoteId={issueNoteId} />
        </View>
      </>
    }
    
    ListFooterComponent={
      <>
        <View style={styles.qrCodeContainer}>
          <Image source={{ uri: imageData }} style={{ width: 175, height: 175 }} />
        </View>
        <View style={styles.backButtonContainer}>
          <Button title="Back to Issue Note" onPress={handleBack} />
        </View>
      </>
    }
    contentContainerStyle={styles.flatListContainer}
  />
      </View>
  )  
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
    backgroundColor: '#f5f5f5',
  },
  flatListContainer: {
    paddingTop: 0, 
  },
 
  imageUploaderContainer: {
    width: '100%',
    marginTop: 0,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    fontWeight: 'bold',
    flex: 1, 
  },
  titleContainer: {                   
    alignItems: 'center',       
  },
  sheader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    paddingHorizontal: 10, 
    height: 370,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 0,
    paddingHorizontal: 20, 
    height: 35,
  },
  qrCodeContainer: {
    alignItems: 'center',
    marginBottom: 5,
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
