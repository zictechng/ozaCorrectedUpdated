import React from 'react';
import { StyleSheet, View, Text, Modal, ActivityIndicator, Image} from 'react-native';
import { gs, colors } from '../styles';

const LoaderIndicator = (props) => {

    const {loading, textInfo} = props;

  return (
    <Modal transparent={true} animationType={'none'} visible={loading}>
        <View style={styles.modalBackground}>

            <View style={styles.ActivityIndicatorWraper}>
                <ActivityIndicator animating={loading} size='large' color={colors.primaryColor1} />
                <Text style={gs.loaderTextStyle}>
                    {textInfo}
                </Text>
            </View>
        </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
    modalBackground:{
        flex:1,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        backgroundColor: '#00000040',
    },
    ActivityIndicatorWraper:{
        backgroundColor:'#fff',
        height: 70,
        width: '60%',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        //justifyContent: 'space-around',
        justifyContent: 'center',
        flexDirection:'row'
    }
});


export default LoaderIndicator;
