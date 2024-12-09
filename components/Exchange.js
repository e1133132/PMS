import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';


export default function Exchange ({ route,navigation }) {
  const { token, customer_ID,Role} = route.params;

  const cards = [
    { id: 1, name: 'GLS(JKDC)' },
    { id: 2, name: 'GLS(BNDC)' },
    { id: 3, name: 'LOREAL' },
    { id: 4, name: 's7ELEVEN' },
    { id: 5, name: 'DFI' },
    { id: 6, name: 'FNN 3PL' },
    { id: 7, name: 'YHS' },
    { id: 8, name: 'POKKA' },
    { id: 9, name: 'REDMART' },
  ];


  const handleCardPress = (id) => {
    switch(id){
      case 5:
        navigation.navigate('Movement', {
          token: token,
          customer_ID: customer_ID,
          id:id,
        });
        break;
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {cards.map((card) => (
        <TouchableOpacity
          key={card.id}
          style={styles.card}
          onPress={() => handleCardPress(card.id)}
        >
          <Text style={styles.cardText}>{card.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  )
}


const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '80%',
    backgroundColor: '#f8f8f8',
    padding: 20,
    marginVertical: 10,
    borderRadius: 10,
    elevation: 3, //  Android
    shadowColor: '#000', // iOS
    shadowOffset: { width: 0, height: 2 }, // iOS
    shadowOpacity: 0.2, // iOS
    shadowRadius: 5, // iOS
    alignItems: 'center',
  },
  cardText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});
