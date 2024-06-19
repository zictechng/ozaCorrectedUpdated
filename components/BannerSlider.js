import React from 'react';
import { View, Text, Image} from 'react-native';

export default function BannerSlider({data}) {
  return (
    <View style={{marginBottom: 20,}}>
        <View style={{backgroundColor:data.bgColor, height:130, borderRadius:10}}>
            <View style={{flexDirection:'row', marginTop: 5, marginHorizontal:5, alignItems:'center'}}>
                <Image source={data.image} style={{borderRadius:10, width:50, height:50}}/>
                <Text style={{marginLeft: 5, fontFamily:'_bold', fontSize:14, color:data.bgColor =='#1D2667'? '#fff':'#51534D'}}>{data.title} </Text>
            </View>
            <View style={{marginVertical:5, marginHorizontal:8}}>
                <Text style={{marginLeft: 5, fontFamily:'_regular', fontSize:12, color:data.bgColor =='#1D2667'? '#fff':'#51534D'}}> {data.desc}</Text>
            </View>
                            
        </View>

    </View>
    );
}
