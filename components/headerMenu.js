import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { gs, colors } from '../styles';


export default function HeaderMenu({
    icon1, 
    icon2, 
    icon3, 
    actionButton1, 
    actionButton2, 
    actionButton3,
    buttonHome,
    buttonLeft,
    button3,
    badgeIcon,
    profileTitle,
    titleName,
    titleHead

}) {
  return (
        <View style={gs.homeHeaderRow}>
                    
            <View style={{justifyContent:'space-between', flexDirection:'row'}}>
                    {buttonHome}

                    <Text style={profileTitle}>{titleName}</Text>
                    <Text></Text>

                    {buttonLeft}
            </View>
            
        </View>
  );
}
