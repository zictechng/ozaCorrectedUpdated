import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NormalFile () {
  return (
    <View style={{flex:1, backgroundColor:colors.bgColor}}>
    <SafeAreaView style={{flex:1}}>


{/* home header bar */}
<HeaderMenu 
    buttonHome={<TouchableOpacity style={gs.homeSideMenu}
    onPress={() =>navigation.openDrawer()}>
        <Entypo name='sweden' size={23} color={colors.textColor}/>
    </TouchableOpacity>}

    buttonLeft={<TouchableOpacity style={gs.homeSideMenu} onPress={() =>navigation.navigate('Message')} >
    <Feather name='bell' size={20} color={colors.textColor}/>
    {notifications > 0 && <Badge status="danger"
        onPress={() => navigation.navigate('Message')}
        containerStyle={{position: "absolute", top: -6, right: -15, marginRight: 10}}
        value={notifications} 
        badgeStyle={{backgroundColor: colors.greenColor}}
        textStyle={{fontFamily: '_semiBold', fontSize: 10}}
        />}
    </TouchableOpacity>}
/>

<View style={[styles.LoginDivTitle, {marginHorizontal:20}]}>
<Text style={styles.loginTitle}>Hi {myName},</Text>
<Text style={styles.loginTitleDesc}>A simple, secure and profitable way to sell virtual funds </Text>
</View>

<ScrollView showsVerticalScrollIndicator={false} style={{paddingHorizontal:20}}>

<View style={styles.balanceStyle}>
    <ImageBackground source={background} resizeMode='cover' imageStyle={{opacity: 0.3}} style={{flex:1}}>
        
        <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom:8}}>

                <View style={{marginHorizontal:10, marginTop:10}}>
                    <Text style={styles.balanceTitle}>All time transaction</Text>
                    <Text style={styles.amtStyle}><NumberValueFormat value={userInfo.userData.amount}/></Text>
                </View>
                <View style={{marginHorizontal:5, flexDirection:'row', alignItems:'center' }}>
                    <View>
                    <Text style={{fontFamily:'_semiBold', fontSize:12, color:colors.textColor}}>Valid payment</Text>
                    </View>
                    
                    <PaymentIcon type='master' width={30}/>
                </View>
        </View>
    </ImageBackground>
    
</View>

<View style={{flex:1, justifyContent:'center', alignItems:'center', padding:5}}>
<Ionicons name="chevron-down" size={20} color={colors.textSecColor} />
</View>

{/* action buttons */}
<View style={styles.actionButtonView}>
    
    <TouchableOpacity style={styles.actionButton} onPress={() => refSellRBSheet.current.open()}>
        <Text style={styles.buttonSellText}>Sell</Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.actionButtonAdd} onPress={() =>navigation.navigate('FundAccount')}>
        <Text style={styles.buttonAddText}>Add</Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.actionButtonBuy} onPress={() => refBuyRBSheet.current.open()}>
        <Text style={styles.buttonBuyText}>Buy</Text>
    </TouchableOpacity>
</View>

    {/* Chart data goes here */}
    <Text style={styles.recentChartText}>Transactions Flow</Text>
    <View style={styles.chartView}>
        <ChartData />
    </View>




</ScrollView>

{/* Bottom sheet here when sell button is click */}
<RBSheet
    ref={refSellRBSheet}
    closeOnDragDown={true}
    closeOnPressMask={true}
    openDuration={900}
    closeDuration={400}
    height={350}
    
    closeOnPressBack={true}
    keyboardAvoidingViewEnabled={true}
    customStyles={{
    container:{
        backgroundColor: colors.bgColor,
    },
    draggableIcon: {
        backgroundColor: "#000"
    }
    }}>
        
        <SellBottomSheet 
            titleText={'Sell'}
            titleStyle={{fontFamily:'_semiBold', fontSize:25, color:colors.textBlack}}
            buttonStyle={styles.bottomSheetButton}
            imageIconPaypal={paypalImage}
            imageIconPayooner={payoonerImage}
            imageIconBitcoin={bitcoinImage}
            imageStyle={styles.bottomSheetImageStyle}
            buttonTextStyle={styles.bottomSheetButtonText}
            buttonLabel_paypal={'PayPal'}
            buttonLabel_payooner={'Payooner'}
            buttonLabel_bitcoin={'Bitcoin'}
            onPress1={() => console.log('Paypal pressed')}
            onPress2={() => console.log('Payooner pressed')}
            onPress3={() => console.log('Bitcoin pressed')}
        />
        
    {/* create custom component and add it */}
</RBSheet>

    {/* Buy bottom sheet */}
<RBSheet
    ref={refBuyRBSheet}
    closeOnDragDown={true}
    closeOnPressMask={true}
    openDuration={900}
    closeDuration={400}
    height={350}
    
    closeOnPressBack={true}
    keyboardAvoidingViewEnabled={true}
    customStyles={{
    container:{
        backgroundColor: colors.bgColor,
    },
    draggableIcon: {
        backgroundColor: "#000"
    }
    }}>
        
        <BuyBottomSheet 
            titleText={'Buy'}
            titleStyle={{fontFamily:'_semiBold', fontSize:25, color:colors.textBlack}}
            buttonStyle={styles.bottomSheetButton}
            imageIconPaypal={paypalImage}
            imageIconPayooner={payoonerImage}
            imageIconBitcoin={bitcoinImage}
            imageStyle={styles.bottomSheetImageStyle}
            buttonTextStyle={styles.bottomSheetButtonText}
            buttonLabel_paypal={'PayPal'}
            buttonLabel_payooner={'Payooner'}
            buttonLabel_bitcoin={'Bitcoin'}
            onPress1={() => console.log('Paypal pressed')}
            onPress2={() => console.log('Payooner pressed')}
            onPress3={() => console.log('Bitcoin pressed')}
        />
        
    {/* create custom component and add it */}
</RBSheet>

{/* Show current rate here... */}
<BottomSheet isOpen={false}
    sliderMinHeight={25}
    wrapperStyle={{
            backgroundColor: colors.textColor,
        }}
    innerContentStyle={{
        backgroundColor: colors.textColor,
    }}>
        
    {(onScrollEndDrag) => (
    <ScrollView onScrollEndDrag={onScrollEndDrag}>
    <RateBottomSheet 
        titleText={'Rate'}
        titleStyle={{fontFamily:'_semiBold', fontSize:20, color:colors.textBlack}}
        imageIconPaypal={paypalImage}
        imageIconPayooner={payoonerImage}
        imageIconBitcoin={bitcoinImage}
        imageStyle={styles.bottomSheetImageStyle}
        buttonTextStyle={styles.bottomSheetButtonText}
        textStyle={{fontFamily:'_semiBold', fontSize:14, marginTop:8}}
    />

    </ScrollView>
    )}

</BottomSheet>

    {/* show if user profile is not complete */}
    {completeRegData && <BottomWarning 
    closeBtn={<View style={{justifyContent:'flex-end', alignItems:'flex-end'}}>
                <TouchableOpacity style={styles.closeBnt}
                onPress={() => {closeIncompleteRegistration()}}>
                    <View style={styles.closeBtnView}>
                        <Ionicons name="close" size={25} color={colors.textColor}/>
                    </View>
                </TouchableOpacity>
            </View>
        }
    icon={<Ionicons name="information-circle-outline" size={24} color={colors.textColor}/>}
    title={'Incomplete Profile'}
    subTitle={'Complete your registration to remove restrictions in your account to enjoy the amazing offer we have for you.'}
    buttonText={'Okay'}
    buttonTextStyle={{color:colors.textColor, fontFamily:'_semiBold', fontSize:14}}
    buttonStyle={{borderRadius:50, borderColor:colors.lightGreenColor1, width:60, height:30, borderWidth:1, justifyContent:'center', alignItems:'center', marginBottom:20}}
    titleStyle={{marginLeft: 5, fontFamily:'_bold', fontSize:17, color:colors.bgColor}}
    subTitleStyle={{marginLeft: 5, fontFamily:'_regular', fontSize:14, color:colors.textColor}}
    onPress={() => navigateToNextPage()}
    bgColor={{backgroundColor:colors.primaryColor1}}
    />}


</SafeAreaView>
</View>
  );
}

