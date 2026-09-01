import React, {useState, useEffect, useContext} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { gs,colors } from '../styles';
import client from '../contextAPI/client';
import { AuthContext } from '../contextAPI/authContext';
import { NumberValueFormat } from './controls';
export default function RateBottomSheet({ 
    titleStyle,
    titleText,
    textStyle,
    buttonTextStyle, 
    imageStyle,
    imageIconPaypal,
    imageIconPayooner,
    imageIconBitcoin

    }) 
    {
        const {userToken, userInfo, setUserInfo} = useContext(AuthContext)
        const [currentRate, setCurrentRate] = useState({});
        const [currentRateStatus, setCurrentRateStatus] = useState(false);
        
        const getCurrentRate = async() =>{
            try{
              const res = await client.get('/api/current_rate',{
                headers: {
                    'Authorization': 'Bearer '+userToken,
                        }
                })
              if(res.data.msg !== '404'){
                setCurrentRate(res.data)
                //console.log('No Notification ', res.data)
              }
              else if(res.data.status == '404') {
                //console.log('No Active Notification 404')
                setCurrentRateStatus(true)
                 }
              
            }catch (e){
              console.log('error ',e.message);
            }
            
          };

          useEffect(() =>{
            getCurrentRate()
          }, [])
    
  return (
            <View>
                <View style={{marginHorizontal:20, marginBottom:2}}>
                    <Text style={titleStyle}>{titleText}</Text>
                </View>
                {!currentRateStatus ? <ScrollView>
                     <View style={{flexDirection:'row', justifyContent:'space-evenly',}}>
                            <View>
                                <Text></Text>
                                <Text style={buttonTextStyle}>Buy</Text>
                            </View>
                            <View style={{flexDirection:'column'}}>
                                <Image source={imageIconPaypal} style={imageStyle} />
                                <Text style={textStyle}><NumberValueFormat value={currentRate.paypal_buying}></NumberValueFormat></Text>
                            </View>
                            <View style={{flexDirection:'column'}}>
                                <Image source={imageIconPayooner} style={imageStyle} />
                                <Text style={textStyle}><NumberValueFormat value={currentRate.payoneer_buying}></NumberValueFormat></Text>
                            </View>
                            <View style={{flexDirection:'column'}}>
                                <Image source={imageIconBitcoin} style={imageStyle} />
                                <Text style={textStyle}><NumberValueFormat value={currentRate.btc_buying}></NumberValueFormat></Text>
                            </View>
                         </View>

                            <View style={{borderBottomWidth: 0.5, borderColor:colors.textSecColor, marginTop:20}}></View>

                         <View style={{flexDirection:'row', justifyContent:'space-evenly', marginBottom:40, marginTop:10, marginLeft:-10}}>
                            <View>
                                <Text style={buttonTextStyle}>Sell</Text>
                            </View>
                            <View style={{flexDirection:'column'}}>
                                
                                <Text style={textStyle}><NumberValueFormat value={currentRate.paypal_selling}></NumberValueFormat></Text>
                            </View>
                            <View style={{flexDirection:'column'}}>
                                
                                <Text style={textStyle}><NumberValueFormat value={currentRate?.payoneer_selling}></NumberValueFormat></Text>
                            </View>
                            <View style={{flexDirection:'column'}}>
                                
                                <Text style={textStyle}><NumberValueFormat value={currentRate?.btc_selling}></NumberValueFormat></Text>
                            </View>
                        </View>
                        
                    </ScrollView> : <View style={{justifyContent:'center', alignItems:'center', marginBottom:15}}>
                    <Text style={{fontFamily:'_regular', fontSize:13, color:colors.textSecColor}}>No rate available!</Text>
                    <Text style={{fontFamily:'_regular', fontSize:13, color:colors.textSecColor}}>Please check back later</Text>
                    </View>
                    }
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
