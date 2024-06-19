import React, {useState} from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import Modal from "react-native-modal";
import { colors } from '../styles';

export default function Verify2faImageSample({modalVisible, image, actionButton1, actionButton2}) {
    
  return (
    <Modal isVisible={modalVisible}
        animationIn={'zoomIn'}
        animationInTiming={900}
        animationOut={'slideOutDown'}
        animationOutTiming={700}
        backdropOpacity={0.60}
        onBackButtonPress={actionButton1}>
        <View style={{borderRadius:10, marginHorizontal:10, backgroundColor:colors.textColor}}>
            <View style={{width:'100%', borderTopRightRadius:10, borderTopLeftRadius:10, marginBottom:20, height:35, backgroundColor:colors.primaryColor1}}>
                <Text style={{fontFamily:'_semiBold', fontSize:17, color:colors.bgColor, textAlign:'center', marginTop:5}}>
                    Selfie Example
                </Text>
            </View>
            <Text style={{fontFamily:'_regular', fontSize:13, color:colors.textBlack, marginHorizontal:10, marginBottom:5, marginTop:-10}}>
                Your selfie photo should be clean enough to virtually fit for verification
            </Text>
            <View style={{justifyContent:'center', alignItems:'center'}}>
                <Image source={image} style={{width:230, height:250, borderRadius:5}} />
            </View>
        
       <View style={{justifyContent:'center', alignItems:'center', marginTop:20}}>
          <TouchableOpacity style={{
          borderRadius:10, 
          marginHorizontal:20, 
          marginTop:5, 
          marginBottom:10, 
          width:80, 
          height:35, 
          justifyContent:'center', 
          alignItems:'center',
          borderColor: colors.primaryColor1,
          borderWidth:1}}
          onPress={actionButton2}>
              <Text style={{fontFamily:'_semiBold', fontSize:17, color:colors.primaryColor1}}>Okay</Text>
          </TouchableOpacity>
       </View>

    </View>
</Modal>
  );
}
const styles = StyleSheet.create({
    action: {
        marginTop: 20,
        borderBottomColor: '#aaa',
        paddingBottom: 5,
        
    },
})
