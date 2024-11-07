import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

export default function ImageUploader({ issueNoteId ,token}) {
  const [selectedImage, setSelectedImage] = useState(null);


  const selectImage = async () => {
    try {
      // ask for permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permission Required", "Permission to access the photo library is required!");
        return;
      }

      // open album
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
       // allowsEditing: true,
        allowsMultipleSelection: true,
        quality: 1,
      });

      // check whether choose
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const image = result.assets;
        console.log("Result assets:", result.assets);
        //setSelectedImage(image.map((img) => img.uri));
        setSelectedImage(image);
        await uploadImage(image);
      }
    } catch (error) {
      console.error("Error selecting image:", error);
      Alert.alert("Error", "An error occurred while selecting the image.");
    }
  };
const uploadImage = async (images) => {
    const formData = new FormData();

    images.forEach((image, index) => {
        const formattedUri = image.uri.startsWith('file://') ? image.uri.replace('file://', '') : image.uri;
        formData.append(`file${index}`, {
            uri: formattedUri,
            type: image.mimeType || 'image/jpeg',
            name: image.fileName || `photo${index}.jpg`,
        });
        console.log(`Added file${index}: `, { uri: formattedUri, type: image.mimeType, name: image.fileName });
    });
    const uploadUrl = `http://172.20.10.9:85/api/SG/Issue_Note/upload/${issueNoteId}`;

    try {
        const response = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });
    
        console.log("Response status:", response.status);
        console.log("Response headers:", response.headers);
    
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const jsonResponse = await response.json();
            if (response.ok) {
                console.log("Upload successful:", jsonResponse);
                Alert.alert("Upload Successful", jsonResponse.message || "Files uploaded successfully.");
            } else {
                console.log("Upload failed:", jsonResponse);
                Alert.alert("Upload Failed", jsonResponse.details || "An error occurred on the server.");
            }
        } else {
            const textResponse = await response.text();
            console.log("Non-JSON response:", textResponse);
            Alert.alert("Upload Failed", textResponse || "An unexpected error occurred.");
        }
    } catch (error) {
        console.error("Error uploading images:", error);
        Alert.alert("Upload Failed", "Network error or server not reachable");
    }
    
};

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.cameraButton} onPress={() => selectImage()}>
        <Image source={require('../assets/camera.png')} style={styles.cameraIcon} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
  },
  cameraButton: {
    width: 40,
    height: 40,
  },
  cameraIcon: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  content: {
    flex: 1,
  },
});
