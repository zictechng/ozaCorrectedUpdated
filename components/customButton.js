import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity,  } from 'react-native';

export default function CustomButton({buttonStyle, icon, viewStyle, textStyle, textLabel, buttonAction}) {
  return (
        <TouchableOpacity style={buttonStyle} onPress={buttonAction}>
            <View style={viewStyle}>
              {icon}
                <Text style={textStyle}>{textLabel}</Text>
            </View>
        </TouchableOpacity>
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