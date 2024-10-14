import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Navbar() {
  return (
    <View style={styles.navbar}>
      <Text style={styles.navbarText}>Activity 3                                     Sanchez, L</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    backgroundColor: 'White',
    height: 60,
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 20,
  },
  navbarText: {
    color: '#007bff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
