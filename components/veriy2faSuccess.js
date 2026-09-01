import React, {useState} from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import { Ionicons} from '@expo/vector-icons';
import Modal from "react-native-modal";
import { colors } from '../styles';

export default function Verify2faSuccess({modalVisible, image, actionButton1, actionButton2}) {
    // const [isModalVisible, setModalVisible] = useState(false);

    //   const toggleModal = () => {
    //       setModalVisible(!isModalVisible);
    //   };
  return (
    <Modal isVisible={modalVisible}
        animationIn={'zoomIn'}
        animationInTiming={900}
        animationOut={'slideOutDown'}
        animationOutTiming={700}
        backdropOpacity={0.60}
        onBackButtonPress={actionButton1}>
        <View style={{borderRadius:10, marginHorizontal:10, backgroundColor:colors.textColor}}>
            <View style={{width:'100%', borderTopRightRadius:10, borderTopLeftRadius:10, marginBottom:15, height:40, backgroundColor:colors.primaryColor1}}>
                <Text style={{fontFamily:'_semiBold', fontSize:17, color:colors.bgColor, textAlign:'center', marginTop:5}}>
                    Successful
                </Text>
            </View>
            
            <View style={{justifyContent:'center', alignItems:'center', marginBottom:15,}}>
                <Ionicons name='checkmark-circle' size={60} color={colors.primaryColor1} />
            </View>

            <Text style={{fontFamily:'_regular', fontSize:13, color:colors.textBlack, marginHorizontal:10, marginBottom:5, marginTop:-10}}>
                Your document have been submitted successfully and is now under review! We will get back shortly with a response via your email thank you.
            </Text>
            
        
       <View style={{justifyContent:'center', alignItems:'center', marginTop:20}}>
          <TouchableOpacity style={styles.btnAction}
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
    btnAction:{
        borderRadius:10, 
        marginHorizontal:20, 
        marginTop:5, 
        marginBottom:10, 
        width:80, 
        height:35, 
        justifyContent:'center', 
        alignItems:'center',
        borderColor: colors.primaryColor1,
        borderWidth:1
    },
})
