import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function CustomSmallButton({buttonStyle, viewStyle, textStyle, textLabel, buttonAction}) {
  return (
    <View style={viewStyle}>
        <TouchableOpacity style={buttonStyle}
        onPress={buttonAction}>
            <Text style={textStyle}>{textLabel}</Text>
        </TouchableOpacity>          
    </View>
  
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
})
