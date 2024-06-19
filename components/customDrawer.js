import React, {useContext, useState} from 'react';
import {Alert, ToastAndroid, Share, View, Text, ImageBackground , Image, Modal} from 'react-native';
import { useNavigation } from '@react-navigation/core';
import { DrawerActions } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { DrawerContentScrollView,  DrawerItemList} from '@react-navigation/drawer';
import { Ionicons, FontAwesome5} from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { colors } from '../styles';
import { AuthContext } from '../contextAPI/authContext';
import { ProfileImage, applicationDetails } from './controls';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CustomDrawer = (props) => {
    const navigation = useNavigation();
    const {logoutAction, userInfo, setUserInfo, logoutModal, setLogoutModal} = useContext(AuthContext)
    const [appInfo, setAppInfo] = useState({})
    const [openModal, setOpenModal] = useState(false);
    
// get user information from local storage here
 _getAppLocalInfo = async () =>{

    AsyncStorage.getItem('userInfo').then(res =>{
        if(res != null){
            setUserInfo(JSON.parse(res))
            //console.log('User data ', res);
        }
        }).catch(err => console.log(err.message))
     }
    // get application details
    const appDetails = () =>{
        applicationDetails().then((res )=>{
        //console.log(res);
        setAppInfo(res.infoData)
        })
    }
    const copyToClipboard = async () => {
        await Clipboard.setStringAsync(userInfo.userData?.tag_id);
        // Display a success message 
        if (Platform.OS === 'android') { 
            ToastAndroid.show('Tag ID copied to clipboard!', 
                ToastAndroid.SHORT); 
        } else if (Platform.OS === 'ios') { 
            Alert.alert('Your Tag ID copied to clipboard!'); 
        } 
    };
       
    // function to call logout hook from useContext
    // const signMeOut =() =>{
    //     logoutAction()
    //     //navigation.navigate('Home');
    //     Dialog.hide();
    // }

    // function to logout user
    // const logoutUser = () =>{
    //     navigation.dispatch(DrawerActions.closeDrawer());
    //     Dialog.show({
    //         type: ALERT_TYPE.WARNING,
    //         title: 'Hello...!',
    //         textBody: 'Are you sure you want to log out ?',
    //         button: 'Yes',
    //         textBodyStyle: { fontFamily: '_regular', fontSize: 16 },
    //         titleStyle: { fontFamily: '_bold', fontSize: 20 },
    //         onPressButton:(() => void signMeOut()),
    //      })
    // }

    const logoutUser = () =>{
    navigation.dispatch(DrawerActions.closeDrawer());
    setLogoutModal(true);
    }

    useEffect(() =>{
    //     setTimeout(async() =>{
        
    //    }, 1000)
        _getAppLocalInfo()
        appDetails()

    }, [])
        const title = 'Thank you for choosing '+appInfo?.app_name + '';

        // sharing of text content only.
        // to share images and other content together we need to use expo share or third party libraries
        // like react-native-share or expo share
        const onShare = async () => {
            const shareOptions ={
            message: appInfo.app_name +' is more reliable for all virtual funds transaction, I use it in selling my virtual with high rate. '+ '\n' +'Start selling your funds with it today ' +'\n ' + title + '\n'
            +' Use my ID ' +userInfo?.userData.tag_id +' to join and get free cash back' +'\n Visit ' + 'https://ozaapp.com',
            }
            try {
                const result = await Share.share(shareOptions);
                    if(result.action === Share.sharedAction){
                        if(result.activityType){
                        //console.log('Share with activity type '+ result.activityType)
                        navigation.dispatch(DrawerActions.closeDrawer());
                        }
                        else{
                        //console.log('Shared')
                        }
                    }
                    else if(result.action === Share.dismissedAction){
                        console.log('Cancelled')
                        navigation.dispatch(DrawerActions.closeDrawer());
                    }
                } catch (error) {
                    console.log('Error: ' + error.message)
                }
            }
  return (
        <View style={{flex:1}}>

                <View contentContainerStyle={{backgroundColor:colors.primaryColor1}}>
                    <ImageBackground source={require('../assets/images/menu-bg.jpeg')}
                            style={{padding:20, color:colors.primaryColor1}} >
                            {ProfileImage(userInfo.userData?.profile_photo)}
                            <Text style={{color:'#fff', fontSize:18, fontFamily:'_semiBold'}}>{userInfo.userData?.display_name}</Text>
                            
                            <View style={{flexDirection:'row'}}>
                                <Text style={{color:'#fff', fontFamily:'_regular', marginRight: 5}}>{'Tag ID: '+ userInfo.userData?.tag_id}</Text>
                                <FontAwesome5 name='coins' size={14} color='#fff' onPress={() =>copyToClipboard()} />
                             </View>
                    </ImageBackground>
                </View>

            <DrawerContentScrollView  {...props}>
                    <View style={{flex:1, backgroundColor:'#fff', marginBottom: 20}}>
                        <DrawerItemList {...props} />
                     </View>
            </DrawerContentScrollView>

            <View style={{padding:10, borderTopWidth:1, borderTopColor:'#ccc'}} {...props}>
                      
                        <TouchableOpacity onPress={() =>onShare()} style={{paddingVertical:15}}>
                            <View style={{flexDirection:'row', alignItems:'center', marginHorizontal:10}}>
                                <Ionicons name='share-social-outline' size={22} />
                                <Text style={{
                                    fontSize:15,
                                    fontFamily:'_regular',
                                    marginLeft: 5,
                                }}>Tell a friend</Text>
                            </View>
                            
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => logoutUser()} style={{paddingVertical:10}}>
                            <View style={{flexDirection:'row', alignItems:'center', marginHorizontal:10}}>
                                <Ionicons name='power' size={22} color={colors.redColor} />
                                <Text style={{
                                    fontSize:15,
                                    fontFamily:'_regular',
                                    marginLeft: 5,
                                    color:colors.redColor
                                }}>Logout {}</Text>
                            </View>
                            
                        </TouchableOpacity>
                 </View>
                
        </View>
  );
}

export default CustomDrawer;
