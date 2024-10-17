import React, { useRef, useState } from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import Signature from 'react-native-signature-canvas';

export default function SignatureScreen() {
  const [signature, setSignature] = useState(null);
  const ref = useRef();

  const handleSignature = (sig) => {
    setSignature(sig); // 保存签名
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
        onEmpty={() => alert("Please add your name")}
        descriptionText="Sign here"
        clearText="Clean"
        confirmText="Finish"
        webStyle={styles.webStyle}
      />
      {signature && (
        <View style={styles.signatureContainer}>
          <Text>Sign Successfully</Text>
          <Button title="Clear your name" onPress={handleClear} />
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
  webStyle: `
    .m-signature-pad--footer { display: none; margin: 0px; }
    .m-signature-pad { border: 1px solid #000000; }
  `,
  signatureContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
});
