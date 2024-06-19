import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { windowWidth } from '../utils/Dimensions';
import { gs, colors } from '../styles';
import { Ionicons } from '@expo/vector-icons';

export default function BottomWarning({buttonText, closeBtn, buttonTextStyle, buttonStyle, bgColor, icon, title, titleStyle, subTitleStyle, subTitle, onPress}) {
  return (
                <View style={bgColor}>
                    {closeBtn}
                    <View style={{flexDirection:'row', marginHorizontal:5, alignItems:'center',marginVertical:5}}>
                        {/* <Ionicons name="md-information-circle-outline" size={24} color={colors.textColor}/> */}
                        {icon}
                        <Text style={titleStyle}>{title} </Text>
                    </View>
                    
                    <View style={{marginVertical:5, marginHorizontal:10}}>
                        <Text style={subTitleStyle}>{subTitle}</Text>
                    </View>
                    
                    <View style={{justifyContent:'center', alignItems:'center',}}>
                        
                        <TouchableOpacity onPress={onPress}
                                style={buttonStyle}>
                                <Text style={buttonTextStyle}>{buttonText}</Text>
                        </TouchableOpacity>
                    </View>
                    
                </View>
  );
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bgColor,
      alignItems: 'center',
      justifyContent: 'center',
    },
})