import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { gs,colors } from '../styles';

export default function MoreBottomSheet({
    buttonStyle, 
    titleStyle,
    titleText,
    buttonLabel_paypal,
    buttonLabel_payooner,
    buttonLabel_bitcoin, 
    desText, 
    iconType1, 
    iconType2, 
    iconType3, 
    onPress1, 
    onPress2,
    onPress3, 
    imageSource, 
    buttonTextStyle, 
    imageStyle,
    imageIconPaypal,
    imageIconPayooner,
    imageIconBitcoin

    }) 
    {
  return (
            <View>
                <View style={{marginHorizontal:20, marginBottom:2}}>
                    <Text style={titleStyle}>{titleText}</Text>
                </View>
                <ScrollView>
                    <View style={{paddingVertical:5, marginHorizontal:20}}>
                        <Text style={{fontFamily:'_semiBold', fontSize:14, color:colors.textSecColor}}>What do you want to do today? Select option to get started</Text>
                    </View>

                        <View style={{marginHorizontal:10, marginBottom:20}}>
                            <TouchableOpacity style={buttonStyle} onPress={onPress1}>
                            <View style={{marginHorizontal:8, flexDirection:'row'}}>
                                {iconType1}
                                
                                <Text style={buttonTextStyle}>{buttonLabel_paypal}</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={buttonStyle} onPress={onPress2}>
                            <View style={{marginHorizontal:8, flexDirection:'row'}}>
                                {iconType2}
                                <Text style={buttonTextStyle}>{buttonLabel_payooner}</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={buttonStyle} onPress={onPress3}>
                            <View style={{marginHorizontal:8, flexDirection:'row'}}>
                                {iconType3}
                                <Text style={buttonTextStyle}>{buttonLabel_bitcoin}</Text>
                            </View>
                        </TouchableOpacity>
                        </View>
                        
                </ScrollView>
            </View>
  );
}

const styles = StyleSheet.create({
    action: {
        marginTop: 20,
        borderBottomColor: '#aaa',
        paddingBottom: 5,
        
    },
})