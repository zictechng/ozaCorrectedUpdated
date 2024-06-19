import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { gs,colors } from '../styles';


export default function ShareFriend ({
  shareButtonStyle, 
  buttonLabel, 
  desText, 
  iconType, 
  onPress1, 
  onPress2, 
  imageSource, 
  shareButtonText, imageStyle}) {
  return (
    <View style={gs.shareView}>
    <Image source={imageSource} style={imageStyle} />
          <View style={gs.shareRow}>
              <View>
              <Text style={gs.shareText}>{desText}</Text>
              </View>
              <View>
              <TouchableOpacity style={{marginRight:10}} onPress={onPress2}>
                {iconType}
              </TouchableOpacity>
          </View>
          </View>
          
              <View style={{justifyContent:'center', alignItems:'center'}}>
                  <TouchableOpacity style={shareButtonStyle} onPress={onPress1}>
                  <Text style={shareButtonText}>{buttonLabel}</Text>
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
});
