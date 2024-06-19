import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import CustomButton from './customButton';
import { colors } from '../styles';

export default function ConfirmAccountPin({desc, btnClose, btnAction, btnText, payDesc, sendingTo, textMoney, title, amtStyle, icon,inputType, placeholder, keyboardType, fieldButtonLabel,fieldButtonFunction, value, onChangeText}) {
  return (
            <View style={{borderRadius:10, marginHorizontal:10, backgroundColor:colors.textColor}}>
                <View style={{width:'100%', borderTopRightRadius:10, borderTopLeftRadius:10, marginBottom:20, height:30, backgroundColor:colors.primaryColor1}}>
                    <Text style={{fontFamily:'_regular', fontSize:14, color:colors.bgColor, textAlign:'center', marginTop:5}}>
                    {title}
                    </Text>
                    {btnClose}
                     
                </View>
                        <Text style={{fontFamily:'_regular', fontSize:13, color:colors.textBlack, marginHorizontal:10, marginBottom:5, marginTop:-10}}>
                            Enter your account pin to authorized this transaction. {'\n '} {payDesc} <Text style={amtStyle}>{textMoney} {sendingTo}</Text>
                            
                        </Text>
                        <Text style={amtStyle}></Text>
                    <View style={{
                        flexDirection:'row', 
                        marginTop:10,
                        marginBottom:15,
                        marginHorizontal:10,
                        borderWidth: 1,  // size/width of the border
                        borderRadius: 7,
                        borderColor: 'lightgrey',  // color of the border
                        paddingLeft: 10,
                        height: 50}}>
                        {icon}
                        
                        <TextInput 
                        desc={desc}
                        placeholder={placeholder}
                        style={{flex:1}}
                        keyboardType={keyboardType}
                        value={value}
                        onChangeText={onChangeText}
                        maxLength={4}/>
                    </View>
                        {/* Action button here to submit the validation */}
                        {btnAction}
                    
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