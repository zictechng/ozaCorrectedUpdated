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
    buttonRight,
    button3,
    badgeIcon,
    profileTitle,
    titleName,
    greeting,
    titleHead

}) {
  return (
        <View style={gs.homeHeaderRow}>
            <View style={{flexDirection: 'row', alignItems: 'center',
          justifyContent: 'space-between',}}>
                    <View style={{ flex: 1, alignItems: 'flex-start' }}>
                      {buttonHome}
                    </View>

                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    {greeting}
                  </View>
                  
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    {buttonLeft}
                    </View>
            </View>
            
        </View>
  );
}
