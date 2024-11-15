import React, { useState } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Alert, FlatList, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function ImageUploader({ issueNoteId, token }) {
  const [selectedImages, setSelectedImages] = useState([]);

  const selectImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "Permission to access the photo library is required!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });
    if (!result.canceled && result.assets) {
      setSelectedImages([...selectedImages, ...result.assets]);
    }
  };

  const deleteImage = (uri) => {
    setSelectedImages(selectedImages.filter(image => image.uri !== uri));
  };

  const uploadImages = async () => {
    const formData = new FormData();
    selectedImages.forEach((image, index) => {
      formData.append(`file${index}`, {
        uri: image.uri,
        type: image.mimeType || 'image/jpeg',
        name: image.fileName || `photo${index}.jpg`,
      });
    });

    const uploadUrl = `http://172.20.10.9:85/api/SG/Issue_Note/upload/${issueNoteId}`;
    try {
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        Alert.alert("Upload Successful", "Files uploaded successfully.");
        setSelectedImages([]);
      } else {
        Alert.alert("Upload Failed", "Please select images.");
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      Alert.alert("Upload Failed", "Network error or server not reachable");
    }
  };

  return (
    <View style={styles.container}>
    {/* <Text style={styles.addButtonText}>--upload attached pictures--</Text> */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.addButton} onPress={selectImage}>
          <Text style={styles.addButtonText}>+ Add New Pictures</Text>
        </TouchableOpacity>
        
          <TouchableOpacity style={styles.uploadButton} onPress={uploadImages}>
            <Text style={styles.uploadButtonText}>Confirm Upload</Text>
          </TouchableOpacity>
        
      </View>
  
      <FlatList
        data={selectedImages.length > 0 ? selectedImages : Array(6).fill(null)}
        keyExtractor={(item, index) => item ? item.uri : `placeholder-${index}`}
        numColumns={3}
        renderItem={({ item }) => (
          item ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: item.uri }} style={styles.image} />
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteImage(item.uri)}
              >
                <Text style={styles.deleteButtonText}>X</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderText}></Text>
            </View>
          )
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    margin: 5,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  deleteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
  },
  buttonsContainer: {
    flexDirection: 'row',
    marginTop: 0,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
    marginRight: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
  },

  uploadButton: {
    backgroundColor: '#28a745',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
  },

});
