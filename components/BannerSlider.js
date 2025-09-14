import React from 'react';
import { View, Text, Image} from 'react-native';
import { colors } from '../styles';

export default function BannerSlider({data}) {

    const isPayooner = data.title === 'Payooner';
    const isPaypal = data.title === 'PayPal Funds';

  return (
    <View style={{marginBottom: 20,}}>
        <View style={{backgroundColor: isPayooner ? 'transparent' : data.bgColor, height:150, borderRadius:10, borderWidth: isPayooner ? 2 : 0,
          borderColor: isPayooner ? data.borderColor : 'transparent',}}>
            <View style={{flexDirection:'row', marginTop: 5, marginHorizontal:5, alignItems:'center'}}>
                <Image source={data.image} style={{borderRadius:10, width:30, height:30}}/>
                <Text style={{marginLeft: 5, fontFamily:'_bold', fontSize:14, color: isPayooner ? '#51534D': isPaypal?'#222': (data.bgColor === '#1D2667' ? '#fff' : '#51534D')}}>{data.title} </Text>
            </View>
            <View style={{marginVertical:5, marginHorizontal:8}}>
                <Text style={{marginLeft: 5, fontFamily:'_regular', fontSize:16, color: isPayooner ? '#51534D' : isPaypal?colors.blackColor1:(data.bgColor === '#1D2667' ? '#fff' : '#51534D')}}> {data.desc}</Text>
            </View>
                            
        </View>

    </View>
    );
}
