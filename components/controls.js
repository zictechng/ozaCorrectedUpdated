import React, { useContext } from "react";
import {
  View,
  Text,
  Image,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../contextAPI/authContext";
import { NumericFormat } from "react-number-format";
import client from "../contextAPI/client";
import defaultImage from "../assets/images/default_profile.png";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";
import { noticeData } from "./errorNotice";
import { colors } from "../styles";
import { Ionicons, FontAwesome, MaterialIcons} from '@expo/vector-icons';

export const CheckRegistrationStage = () => {
  const { userInfo, setUserInfo } = useContext(AuthContext);

  // check registration process status at once
  let stage1 = userInfo.userData?.reg_stage1;
  let stage2 = userInfo.userData?.reg_stage2;
  let stage3 = userInfo.userData?.reg_stage3;
  let stage4 = userInfo.userData?.reg_stage4;
  let stage5 = userInfo.userData?.reg_stage5;
  let stage6 = userInfo.userData?.reg_stage6;
  if (
    stage1 == "Yes" &&
    stage2 == "Yes" &&
    stage3 == "Yes" &&
    stage4 == "Yes" &&
    stage5 == "Yes" &&
    stage6 == "Yes"
  ) {
    return "true";
  } else {
    return false;
  }
};
// check registration stage step by step here

export function RegistrationStage(data) {
  if (data === "Yes") {
    return true;
  } else {
    return false;
  }
}

// format currency function
export function NumberValueFormat({ value }) {
  return (
    <NumericFormat
      value={value}
      displayType={"text"}
      thousandSeparator={true}
      prefix={"\u20A6"}
      renderText={(formattedValue) => <Text>{formattedValue}</Text>} // <--- Don't forget this!
    />
  );
}

// reusable function to fetch/update user details in context API
export const GetLocalStorage = async () => {
  const { userInfo, setUserInfo, userToken, setUserToken } =
    useContext(AuthContext);
  try {
    let userInfoDetails = await AsyncStorage.getItem("userInfo");
    userInfoDetails = JSON.parse(userInfoDetails);
    if (userInfoDetails) {
      setUserInfo(userInfoDetails);
      console.log("User Details fetch local storage ");
    }
    return userInfoDetails;
  } catch (error) {
    console.log(`Login error ${error}`);
  }
};

// function to check if user profile photo exists or show a default profile photo if
export function ProfileImage(data) {
  if (data == null || data == undefined || data == "") {
    const userImage = (
      <Image
        source={defaultImage}
        style={{
          height: 60,
          width: 60,
          borderRadius: 40,
          marginBottom: 5,
          marginTop: 10,
        }}
      />
    );
    return userImage;
  } else {
    const userImage = (
      <Image
        source={{ uri: data }}
        style={{
          height: 60,
          width: 60,
          borderRadius: 40,
          marginBottom: 5,
          marginTop: 10,
        }}
      />
    );
    return userImage;
  }
}

// reusable function to check for valid text characters only
export function isLetters(str) {
  //const pattern = new RegExp(/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/);

  return /[~`\^*\\[\]\\/{}|\\<>\/]/.test(str);
}

//   if(string.match(/\W/)){
//     /^(?:[A-Za-z]+|\d+)$/.test(this.state.myValue)
//     value = value.replace(/[^A-Za-z]/ig, '')
//     return true;    // Contains at least one special character or space
// } else {
//     return false;
// }

// function to handle api requests when email notification switch is clicked
export const sendEmailNotification = async (myId, value, userToken) => {
  sendInfo = {
    user_Id: myId,
    status_value: value,
  };
  try {
    const res = await client.post("api/user_activate_email", sendInfo, {
      headers: {
        Authorization: "Bearer " + userToken,
      },
    });
    if (res.data.msg == "201") {
      if (value == true) {
        return Alert.alert(" Email notification enable successfully");
      }
      if (value == false) {
        return Alert.alert(" Email notification disabled");
      }
    } else if (res.data.status == "403") {
      console.log("ACCESS DENIED");
    } else if (res.data.status == "404") {
      console.log("No user found");
    } else if (res.data.status == "500") {
      console.log("Sorry, something went wrong");
    } else {
      console.log("Technical errored occurred, try again");
    }
  } catch (error) {
    console.log("error occurred ", error);
  }
};

// function to handle api requests when 2FA switch is clicked
export const send2FANotification = async (myId, value, userToken) => {
  sendInfo = {
    user_Id: myId,
    status_value: value,
  };
  try {
    const res = await client.post("api/user_activate_2fa_notice", sendInfo, {
      headers: {
        Authorization: "Bearer " + userToken,
      },
    });
    if (res.data.msg == "201") {
      if (value == true) {
        return Alert.alert(" 2FA authentication enable successfully");
      }
      if (value == false) {
        return Alert.alert(" 2FA authentication disabled");
      }
    } else if (res.data.status == "403") {
      console.log("ACCESS DENIED");
    } else if (res.data.status == "404") {
      console.log("No record found");
    } else if (res.data.status == "500") {
      return Toast.show({
        type: ALERT_TYPE.DANGER,
        title: "Failed",
        textBody: "Sorry, something went wrong",
        titleStyle: noticeData[0].errorTitleStyle,
        textBodyStyle: noticeData[0].errorMessageStyle,
      });
    } else {
      return Toast.show({
        type: ALERT_TYPE.DANGER,
        title: "Network Error",
        textBody: "Technical errored occurred, try again",
        titleStyle: noticeData[0].errorTitleStyle,
        textBodyStyle: noticeData[0].errorMessageStyle,
      });
    }
  } catch (error) {
    console.log("error occurred ", error);
  }
};

// function to handle api requests when In-App notification switch is clicked
export const sendInAppNotification = async (myId, value, userToken) => {
  sendInfo = {
    user_Id: myId,
    status_value: value,
  };
  try {
    const res = await client.post("api/user_notice_request", sendInfo, {
      headers: {
        Authorization: "Bearer " + userToken,
      },
    });
    if (res.data.msg == "201") {
      if (value == true) {
        return Alert.alert(" In-App notification enable successfully");
      }
      if (value == false) {
        return Alert.alert(" In-App notification disabled");
      }
    } else if (res.data.status == "403") {
      console.log("ACCESS DENIED");
    } else if (res.data.status == "404") {
      console.log("No record found");
    } else if (res.data.status == "500") {
      return Toast.show({
        type: ALERT_TYPE.DANGER,
        title: "Failed",
        textBody: "Sorry, something went wrong",
        titleStyle: noticeData[0].errorTitleStyle,
        textBodyStyle: noticeData[0].errorMessageStyle,
      });
    } else {
      return Toast.show({
        type: ALERT_TYPE.DANGER,
        title: "Network Error",
        textBody: "Technical errored occurred, try again",
        titleStyle: noticeData[0].errorTitleStyle,
        textBodyStyle: noticeData[0].errorMessageStyle,
      });
    }
  } catch (error) {
    console.log("error occurred ", error);
  }
};

// function to check user token expiration
export const accessCheck = async (data, userToken) => {
  myId = data;
  let userAccessToken = "";
  if (myId == "" || myId == null) {
    console.log("Access denied", myId);
    return "404";
  }
  try {
    const res = await client.get("/api/authenticate_user/" + myId, {
      headers: {
        Authorization: "Bearer " + userToken,
      },
    });
    //console.log('response ', JSON.stringify(res.data))
    if (res.data.msg == "200") {
      //console.log('Yes ')
      return "200";
    } else if (res.data.status == "402") {
      //console.log('Access Login failed ', res.data.status)
      return "402";
    } else if (res.data.status == "401") {
      return "401";
    } else if (res.data.status == "404") {
      return "404";
    }
  } catch (e) {
    console.log(e.message);
  }
};

// custom function to get application details and share among app components
export const applicationDetails = async () => {
  // fetch app laughing page information
  try {
    const res = await client.get("/api/fetchApp_info");
    //console.log('response ', JSON.stringify(res.data))
    if (res.data.msg == "200") {
      //console.log('Yes ', res.data)
      return res.data;
    } else if (res.data.status == "404") {
      //console.log('Access Login failed ', res.data.status)
      return res.data.status;
    }
  } catch (e) {
    console.log(e.message);
  }
};

// create logout modal  function here
export const ShowLogoutModal = ({
  openModal,
  modalTitle,
  ModalDesc,
  closeBtn,
  logoutBtn,
  modalBgColor,
  animationType,
  bntYesText,
}) => {
  return (
    <Modal
      animationType={animationType}
      transparent={true}
      visible={openModal}
      onRequestClose={() => {
        Alert.alert("Modal has been closed.");
        // closeModal(!logoutModal);
      }}
    >
      <View style={[styles.centeredView, {backgroundColor: modalBgColor,
  } ]}>
        <View style={styles.modalView}>
          <View
            style={{
              flex: 1,
              backgroundColor: colors.redColor,
              width: "100%",
              borderTopRightRadius: 8,
              borderTopLeftRadius: 8,
              marginTop: -1,
              maxHeight: 40,
              justifyContent:'center',
              }}>
            <Text
              style={{
                color: "white",
                textAlign: "center",
                fontFamily: "_regular",
                fontSize: 15,
              }}>
              {modalTitle}
            </Text>
          </View>
          <View style={{ marginTop: 15, marginBottom: 20, marginHorizontal: 3  }}>
            <Text style={{ fontFamily: "_regular", fontSize: 14,  }}>
              {ModalDesc}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              padding: 10,
            }}
          >
            <View style={{ marginRight: 40 }}>
              <Pressable style={[styles.button]} onPress={closeBtn}>
                <Text style={[styles.textStyle, { color: colors.blackColor1 }]}>
                  Cancel
                </Text>
              </Pressable>
            </View>
            <View style={{ marginLeft: 40 }}>
              <Pressable
                style={[styles.button, styles.buttonYes]}
                onPress={logoutBtn}
              >
                <Text style={styles.textStyle}>{bntYesText}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export const LogoutModal = ({
  openModal,
  modalTitle,
  ModalDesc,
  closeBtn,
  logoutBtn,
  modalBgColor,
  animationType,
  bntYesText,
}) => {
  return (
    <Modal
            visible={openModal}
            transparent={true}
            animationType="slide" 
            >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalText}>{modalTitle}</Text>
                <Text style={styles.modalSubText}>
                  {ModalDesc}
                </Text>
                
                <View style={{ flexDirection: "row", justifyContent: "space-between", padding: 10,}}>
                <View style={{ marginRight: 40 }}>
                  <Pressable style={[styles.button]} onPress={closeBtn}>
                    <Text style={[styles.textStyle, { color: colors.blackColor1 }]}>
                      Cancel
                    </Text>
                  </Pressable>
                </View>

                <View style={{ marginLeft: 40 }}>
                  <Pressable
                    style={[styles.btn]}
                    onPress={logoutBtn}>
                    <Text style={styles.textStyle}>{bntYesText}</Text>
                  </Pressable>
                </View>
                </View>
              </View>
            </View>
          </Modal>
  )
}

// create update modal  function here
export const ShowUpdateModal = ({
  openModal,
  modalTitle,
  ModalDesc,
  logoutBtn,
  modalBgColor,
  animationType,
  bntYesText,
}) => {
  return (
    <Modal
      animationType={animationType}
      transparent={true}
      visible={openModal}
      onRequestClose={() => {
        Alert.alert("Modal has been closed.");
        // closeModal(!logoutModal);
      }}
    >
      <View style={[styles.centeredView, {backgroundColor: modalBgColor,
  } ]}>
        <View style={styles.modalViewUpdate}>
          {/* <View
            style={{
              flex: 1,
              //backgroundColor: colors.redColor,
              width: "100%",
              borderTopRightRadius: 10,
              borderTopLeftRadius: 8,
              marginTop: -1,
              maxHeight: 40,
              justifyContent:'center',
              }}>
            <Text
              style={{
                color: "white",
                textAlign: "center",
                fontFamily: "_regular",
                fontSize: 16,
              }}>
              {modalTitle}
            </Text>
          </View> */}
         <View style={{justifyContent:'center', alignItems:'center', borderRadius:50, width:65, height:65, backgroundColor: colors.greenColor, marginTop: -20}}>
            <Ionicons name='download' size={40} color={colors.textColor} marginLeft={2} />
            
          </View>  
          <View style={{ marginTop: 15, marginBottom: 20, marginHorizontal: 3  }}>
            <Text style={{ fontFamily: "_regular", fontSize: 14,  }}>
              {ModalDesc}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              }}
          >
           <View style={{justifyContent:'center', alignItems:'center', marginBottom:15 }}>
              <Pressable
                style={[styles.button, {borderColor:colors.greenColor, borderWidth:1}]}
                onPress={logoutBtn}
              >
                <Text style={styles.textStyle}>{bntYesText}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// create logout modal  function here
export const ConfirmPaymentModal = ({
  openModal,
  ModalShortDesc,
  ModalDesc,
  logoutBtn,
  modalBgColor,
  animationType,
  bntYesText
}) => {
  return (
    <Modal
      animationType={animationType}
      transparent={true}
      visible={openModal}
      onRequestClose={() => {
        Alert.alert("Modal has been closed.");
        // closeModal(!logoutModal);
      }}
    >
      <View style={[styles.centeredView, {backgroundColor: modalBgColor,
  } ]}>
        <View style={styles.modalViewManualPayment}>
          <View
            style={{
              flex: 1,
              backgroundColor: colors.greenColor,
              width: "100%",
              borderTopRightRadius: 8,
              borderTopLeftRadius: 8,
              marginTop: -1,
              maxHeight: 60,
              justifyContent:'center',
              }}>
      <View style={{justifyContent:'center', alignItems:'center', marginTop: -60}}>
        <Ionicons name='checkmark-circle-sharp' size={80} color={colors.textColor}/>
        
      </View>          

          </View>
          <View style={{ marginTop: 10, marginBottom: 20, marginHorizontal: 3  }}>
          
            <Text style={{ fontFamily: "_semiBold", fontSize: 14, textAlign:'center', padding:5 }}>
              {ModalShortDesc}
            </Text>
            <Text style={{ fontFamily: "_regular", fontSize: 14,  }}>
              {ModalDesc}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              padding: 10,
            }}
          >
            {/* <View style={{ marginRight: 40 }}>
              <Pressable style={[styles.button]} onPress={closeBtn}>
                <Text style={[styles.textStyle, { color: colors.blackColor1 }]}>
                  Cancel
                </Text>
              </Pressable>
            </View> */}
            <View style={{ }}>
              <Pressable
                style={[styles.button, styles.buttonYes]}
                onPress={logoutBtn}
              >
                <Text style={styles.textStyle}>{bntYesText}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// create app modal  function here
export const AppModeModal = ({
  openModal,
  ModalShortDesc,
  ModalDesc,
  logoutBtn,
  modalBgColor,
  animationType,
  bntYesText
}) => {
  return (
    <Modal
      animationType={animationType}
      transparent={true}
      visible={openModal}
      onRequestClose={() => {
        Alert.alert("Modal has been closed.");
        // closeModal(!logoutModal);
      }}
    >
      <View style={[styles.centeredView, {backgroundColor: modalBgColor,
  } ]}>
        <View style={styles.modalViewManualPayment}>
          <View
            style={{
              flex: 1,
              backgroundColor: colors.redColor,
              width: "100%",
              borderTopRightRadius: 8,
              borderTopLeftRadius: 8,
              marginTop: -1,
              maxHeight: 60,
              justifyContent:'center',
              }}>
      <View style={{justifyContent:'center', alignItems:'center', marginTop: -30}}>
      <MaterialIcons name='warning' size={70} color={colors.textColor} />
       </View>          

          </View>
          <View style={{ marginTop: 10, marginBottom: 20, marginHorizontal: 3  }}>
          
            <Text style={{ fontFamily: "_semiBold", fontSize: 14, textAlign:'center', padding:5 }}>
              {ModalShortDesc}
            </Text>
            <Text style={{ fontFamily: "_regular", fontSize: 14,  }}>
              {ModalDesc}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              padding: 10,
            }}
          >
            {/* <View style={{ marginRight: 40 }}>
              <Pressable style={[styles.button]} onPress={closeBtn}>
                <Text style={[styles.textStyle, { color: colors.blackColor1 }]}>
                  Cancel
                </Text>
              </Pressable>
            </View> */}
            <View style={{ }}>
              <Pressable
                style={[styles.button, styles.buttonYes]}
                onPress={logoutBtn}
              >
                <Text style={styles.textStyle}>{bntYesText}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// get app setting details from database
export const _AppSystemSettings = async() =>{
   const response = await client.get('/api/fetchApp_info')
   
       if(response.data.status == '404'){
           console.log("No  App Info found")
           return '404'
        }
       if(response.data.msg == '200'){
       //setAppSignupStatus(response.data.infoData?.app_new_signup_status)
       return response.data.infoData
       //console.log(" App Info ", "Yes")
       }

   }

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
    },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 15,
    width: "85%",
    height: 150,
    alignItems: "center",
    justifyContent:'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0.8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },

  modalViewUpdate: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 15,
    width: "85%",
    height: 160,
    alignItems: "center",
    justifyContent:'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0.8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  modalViewManualPayment: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 10,
    width: "85%",
    height: 210,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0.8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    borderRadius: 8,
    padding: 8,
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#ccc",
  },
  buttonYes: {
    borderColor:colors.primaryColor2, 
    borderWidth:1,
  },
  textStyle: {
    fontFamily: "_bold",
    fontSize: 13,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    marginTop: -30,
  },


  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalSubText: {
    fontSize: 14,
    marginBottom: 20,
  },

  retryButtonText: {
      color: '#aaa',  // Text color matching border color
      fontSize: 16,
    },
  btn:{
      paddingVertical: 5,
      paddingHorizontal: 20,
      borderRadius:20, 
      borderColor:colors.bannerTextColor, 
      borderWidth:0.8, 
      justifyContent:'center', 
      alignItems:'center',
      backgroundColor: "#FF6347",
    
      }
});
