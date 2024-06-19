import { StyleSheet, Platform } from "react-native";

export const colors = {
    darkBg: "#222",
    textBlack:'#353535',
    blackColor1: "#51534D",
    blackColor2: "#23261E",
    primaryColor1: "#1D2667",
    primaryColor2: "#010A4F",
    primaryLightBlue: "#595F90",
    yellowColor1: "#F4D41B",
    lightBg: "#333",
    bgColor:"#F7F7F7",
    shahColorLight:"#F2F3F7",
    shahColorDark:"#EEEFF3",
    statusBarColor:"#666",
    greenColorLight:"#E6F0FC",
    textColorBlack:"#D9DDE0",
    textColorBlack2:"#6C737B",
    darkHl: "#666",
    lightHl: "#888",
    iconColor: "#05375a",
    warningColor: "#FF0000",
    redColor: "#e32f45",
    lightRed: "#f0cecc",
    greenColor:"#1CB377",
    lightGreenColor1: "#A0DFC6",
    lightGreenColor2: "#DCF2EA",
    textColor: "#fff",
    colorWhite:"#fff",
    textSecColor: "#aaa",
    textColor1:"#05375a",
    
    dividerColor: "#595957",
};

export const gs = StyleSheet.create({

    actionButtonShare:{
    width:80, 
    height:35, 
    borderRadius:20, 
    backgroundColor:colors.primaryColor1, 
    justifyContent:'center', 
    alignItems:'center', 
    marginRight:10,
    marginBottom:7,
},
    buttonSellText:{
      color:colors.textColor, 
      fontFamily:'_semiBold', 
      fontSize:15
    },
    sectionContainer: {
        paddingVertical: 24,
        paddingHorizontal: 32,
        marginBottom: 8,
        backgroundColor: colors.lightBg
    },
    sectionTitle:{
        fontWeight: "700",
        color: colors.text,
        fontSize: 15
    },

    rowBetween:{
        flexDirection: "row",
        justifyContent:'space-between',
    },
    rowCenter:{
        flexDirection:"row",
        alignItems:"center",
    },
    center:{
        alignItems:"center",
        justifyContent:"center",
    },
    divider:{
        borderBottomColor:"#444",
        borderBottomWidth: 1,
        marginVertical: 24
    },
    loaderTextStyle:{
      fontSize:14, 
      alignItems:'center', 
      justifyContent:'center', 
      fontFamily: '_regular', 
      color:'#777', 
      marginLeft: 5,
  },
    
    title:{
        color: colors.text,
        fontSize: 30,
    },
    subTitle:{
        fontWeight: "600",
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.6)",
        fontSize: 15,
        letterSpacing: 1,
    },
    absoluteFull:{
        position: 'absolute',
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
    },
    button:{
        justifyContent:"center",
        alignItems: "center",
        backgroundColor: colors.pink,
        borderRadius: 100,
    },
    btnDisabled:{
        width: '100%',
        height: 50,
        justifyContent: 'center',
        marginTop: 40,
        alignItems: 'center',
        borderRadius: 10,
        backgroundColor: colors.primaryColor1
      },
    
    circleIconLeft: {
        borderRadius: 8,
        borderColor: "#fff",
        borderWidth:2,
        width: 45,
        height: 45,
        alignItems: "center",
        justifyContent: "center",
      },
      circleIcon: {
        borderRadius: 7,
        backgroundColor: "#fff",
        width: 35,
        height: 35,
        alignItems: "center",
        justifyContent: "center",
      },
      logoText: {
        fontSize: 40,
        color: "#fff",
        fontFamily: "_bold",
        fontWeight: "600",
      },
      landPageTitle:{
        fontSize: 30,
        color: "#fff",
        fontFamily: "_semiBold",
        letterSpacing: 0.41,
      },
      landPageDesc:{
        fontSize: 13,
        color: "#fff",
        fontFamily: "_regular",
        letterSpacing: -0.08
      },
      loginPageDescTitle:{
        fontFamily:"_regular",
        fontSize:17,
        color:colors.textColor
      },

      loginPageForgetPass:{
        fontSize:14,
        fontFamily: "_regular",
        color:"#666",
       // marginHorizontal:Platform.OS =='ios'? 7 :'15'
      },
      loginPageDesc:{
        fontFamily:"_semiBold",
        fontSize:17,
        color:colors.lightGreenColor1
      },
      signupPageDescTitle:{
        fontFamily:"_regular",
        fontSize:17,
        color:colors.lightBg
      },
      singupPageDesc:{
        fontFamily:"_semiBold",
        fontSize:17,
        color:colors.greenColor
      },
      homeHeaderRow:{
        backgroundColor:'transparent', 
        marginTop:Platform.OS ==='ios'? 10 : 40, 
        
        marginHorizontal:15
      },
      homeSideMenu:{
        borderRadius: 50, 
        //borderWidth: 1, 
        backgroundColor:colors.primaryColor2, 
        width:30, 
        height:30,
        alignItems:'center', 
        justifyContent:'center'
      },
      shareView:{
        borderRadius:10, 
        backgroundColor:colors.textColor, 
        marginHorizontal:10, 
        marginTop:10,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { 
          width: 0, 
          height: 2 
        },
        shadowOpacity: 0.5,
        shadowRadius: 2,
        elevation: 2, 
        marginBottom:20,
    },
    shareRow:{
        flexDirection:'row', 
        justifyContent:'space-between', 
        alignItems:'center', 
        marginHorizontal:10, 
        marginTop:5,
    },
    shareText:{
    fontFamily:'_regular', 
    fontSize:14, 
    marginHorizontal:5, 
    flexShrink:1, 
    flexWrap: 'wrap',
    color:colors.textBlack,
  },

    bgImage:{
      position: 'absolute',
      resizeMode:'cover',
      opacity: 0.7,
      transform: [{skewX: '45deg'}],
      bottom: 0,
      right: 10,
      borderRadius:8, 
      opacity:0.6,
      width:90, 
      height:85, 
     },
     actionButton:{
      alignContent:'center',
      alignItems:'center',
      width:70, 
      height:30, 
      borderRadius:20, 
      backgroundColor:colors.primaryColor1, 
      marginBottom:5,
      marginHorizontal:10,
  },
  buttonSellText:{
    color:colors.textColor, 
    fontFamily:'_semiBold', 
    fontSize:15,
    justifyContent:'center', 
    alignItems:'center', 
},
})