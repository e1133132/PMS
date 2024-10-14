import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const EditScreen = ({ route, navigation }) => {
  const { item } = route.params;
  const [username, setUsername] = useState(item.username);
  const [email, setEmail] = useState(item.email);
  const [password, setPassword] = useState(item.password);

  const handleSave = async () => {
    const updatedItem = { ...item, username, email, password };
    try {
      // Update item in AsyncStorage
      const storedData = await AsyncStorage.getItem("userData");
      if (storedData !== null) {
        const data = JSON.parse(storedData);
        const updatedData = data.map((userDataItem) =>
          userDataItem.id === item.id ? updatedItem : userDataItem
        );
        await AsyncStorage.setItem("userData", JSON.stringify(updatedData));
      }
      navigation.goBack();
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Username"
        onChangeText={(text) => setUsername(text)}
        value={username}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        onChangeText={(text) => setEmail(text)}
        value={email}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        onChangeText={(text) => setPassword(text)}
        value={password}
        secureTextEntry={true}
      />
      <View style={styles.buttonContainer}>
        <Button title="Save" onPress={handleSave} />
        <Button title="Cancel" onPress={handleCancel} color="red" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  input: {
    height: 40,
    width: "100%",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingLeft: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
});

export default EditScreen;
