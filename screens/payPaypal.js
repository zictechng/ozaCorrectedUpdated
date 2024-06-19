import React, { useContext, useCallback, useState, useEffect } from "react";
import {
  Dimensions,
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Image,
  StatusBar,
} from "react-native";
import { MaterialIcons, Ionicons, Feather, FontAwesome } from "@expo/vector-icons";
import Checkbox from "expo-checkbox";
import { gs, colors } from "../styles";
// import { StatusBar } from "expo-status-bar";
import background from "../assets/images/reg_bg1.png";
import HeaderMenu from "../components/headerMenu";
import LoaderIndicator from "../components/loaderIndicator";
import { ALERT_TYPE, Toast, Dialog } from "react-native-alert-notification";
import client from "../contextAPI/client";
import { noticeData } from "../components/errorNotice";
import paypalImage from '../assets/images/paypal2.png';
const { width } = Dimensions.get("window");
const windowHeight = Dimensions.get("window").height;
import { useWindowDimensions } from "react-native";
import PayPal from "expo-paypal";
import { AuthContext } from "../contextAPI/authContext";

const PayPaypalScreen = ({ route, navigation }) => {
    let receiveAmt = route.params?.amt;
    const {userToken, userInfo, setUserInfo} = useContext(AuthContext);
    const [resetLoading, setResetLoading] = useState(false);
    const [inputTag, setInputTag] = useState(false);
    const [amount, setAmount] = useState(receiveAmt.amt);
  
    // send opt to user email to verify password reset
    const sendPayment = async (startProcess) => {
        //let amount = receiveAmt.amt;
      if (amount === null) {
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: "Error",
          textBody: "Please enter amount",
          titleStyle: noticeData[0].errorTitleStyle,
          textBodyStyle: noticeData[0].errorMessageStyle,
        });
        return;
       
      }
      if(amount != null || amount != ''){
        setInputTag(true)
      }
      startProcess()
      // send request to backend here....
    };
  
    // send details to backend if payload is successful
    const sendPaymentRequest = async(data) =>{
        const manualData ={
            tag_id: userInfo.userData.tag_id,
            myId: userInfo.userData._id,
            amt: receiveAmt.amt,
            sell_note: receiveAmt.sell_note,
            serviceName: receiveAmt.serviceName,
            serviceCategory: 'Exchange',
            method: 'Paypal Checkout',
            orderId: data,
        }
        try {
            const res = await client.post('/api/paypal_checkout', manualData,{
                headers: {
                'Authorization': 'Bearer '+userToken,
                    }
                })
            // if the response is successful redirect to the new page
                if(res.data.msg == '200'){
                    //console.log('Details saved successfully')
                }
            else if(res.data.status == '401'){
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Failed to update your account',
                    textBody: res.data.message,
                    titleStyle: noticeData[0].errorTitleStyle,
                    textBodyStyle: noticeData[0].errorMessageStyle,
                    })
                }
            else if(res.data.status == '500'){
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Error',
                    textBody: res.data.message,
                    titleStyle: noticeData[0].errorTitleStyle,
                    textBodyStyle: noticeData[0].errorMessageStyle,
                    })
                }
            
            } catch (error) {
                console.log('Error catch ', error.message)
                if(error.message == 'Network Error'){
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Error',
                    textBody: error.message,
                    titleStyle: noticeData[0].errorTitleStyle,
                    textBodyStyle: noticeData[0].errorMessageStyle,
                    })
                    return
                }
                if(error.status == '500'){
                    Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Error',
                    textBody: 'Server error ' +error.message,
                    titleStyle: noticeData[0].errorTitleStyle,
                    textBodyStyle: noticeData[0].errorMessageStyle,
                    })
                    return
                    } 
                }        
        }

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, backgroundColor: colors.bgColor }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <SafeAreaView style={{ flex: 1 }}>
            <StatusBar barStyle="dark-content" backgroundColor={"transparent"} />
  
            <View style={{ flex: 1, justifyContent: "center", borderRadius: 10 }}>
              <HeaderMenu
                buttonHome={
                  <TouchableOpacity onPress={() => navigation.replace("Home")}
                  >
                    <View  style={gs.homeSideMenu}>
                            <Ionicons name='close' size={25} color={colors.textColor}/>
                    </View>
                  </TouchableOpacity>
                }
              />
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ paddingHorizontal: 20 }}
              >
                {/* show loader when processing request */}
                {resetLoading && (
                  <LoaderIndicator
                    loader={resetLoading}
                    textInfo={"Processing..."}
                  />
                )}
                <View style={{ alignItems: "center" }}>
                <View style={{marginTop: 20}}></View>
                {!inputTag &&<View style={{ alignItems: "center" }}>
                        <Image source={paypalImage} style={{borderRadius:10, width:50, height:50}}/>
                        <Text style={styles.loginTitle}>Authenticate with Paypal</Text>
                            <Text style={[styles.loginTitleDesc,{ color: colors.textSecColor }]} >
                            Please click continue to complete your transaction.
                        </Text>
                    </View>
                }
                </View>
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 15,
                    marginHorizontal: 10,
                  }}>
                  <View style={{marginTop: 20}}></View>
                  <PayPal
                    popupContainerStyle={{ height: useWindowDimensions().height }}
                    onPress={(startProcess) => sendPayment(startProcess)}
                    title="Continue with PayPal"
                    buttonStyles={styles.signInButton1}
                    btnTextStyles={styles.textSign}
                    amount={amount}//i.e $20
                    success={(a) => {
                      //callback after payment has been successfully compleated
                      //console.log(a)
                      sendPaymentRequest(a.orderID);
                      //alert(`Payment has been Completed`)
                      Dialog.show({
                        type: ALERT_TYPE.SUCCESS,
                        title: "Successful",
                        button:'Ok',
                        textBody: "Your payment was successful",
                        titleStyle: noticeData[0].errorTitleStyle,
                        textBodyStyle: noticeData[0].errorMessageStyle,
                      });
                      setAmount(null)
                      setInputTag(false)
                    navigation.navigate("Home")
                    }}
                    failed={(a) => {
                      //callback if payment is failed
                      console.log(a)
                      Toast.show({
                        type: ALERT_TYPE.DANGER,
                        title: "Error",
                        textBody: "Payment Failed, try again",
                        titleStyle: noticeData[0].errorTitleStyle,
                        textBodyStyle: noticeData[0].errorMessageStyle,
                      });
                      //alert(`Payment failed`)
                    }}
                  />    
                </View>
  
              </ScrollView>
            </View>
          </SafeAreaView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fff",
      alignItems: "center",
      justifyContent: "center",
    },
    checkboxText: {
      margin: 0,
      marginRight: 5,
      borderRadius: 5,
      color: "lightgrey",
    },
    signInButton: {
      width: "100%",
      height: 50,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 10,
      flexDirection: "row",
      backgroundColor: colors.primaryColor1,
    },
    signInButton1: {
      width: "100%",
      height: 50,
      marginTop: 40,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 10,
      flexDirection: "row",
      backgroundColor: colors.primaryColor1,
    },
  
    signInButton2: {
      width: "100%",
      height: 50,
      justifyContent: "center",
      marginTop: 40,
      alignItems: "center",
      borderRadius: 10,
      flexDirection: "row",
      backgroundColor: colors.primaryColor1,
      opacity: 0.7,
    },
  
    textSign: {
      fontFamily: "_semiBold",
      fontSize: 17,
      color: colors.textColor,
    },
    bgImage: {
      position: "absolute",
      width: 130,
      height: 90,
      bottom: -6,
      right: -10,
    },
    loginTitle: {
      fontFamily: "_bold",
      fontSize: 20,
      color: "#333",
    },
    loginTitleDesc: {
      fontFamily: "_regular",
      fontSize: 15,
      color: "#333",
      marginTop: 10,
    },
    LoginDivTitle: {
      marginBottom: 30,
      marginTop: 70,
    },
  });
  
  export default PayPaypalScreen;