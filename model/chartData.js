import React , {useContext, useState, useEffect } from 'react';
import { StyleSheet, Text, View } from "react-native";
import { ECharts } from "react-native-echarts-wrapper";
import { gs, colors } from '../styles';
import { AuthContext } from '../contextAPI/authContext';
import client from '../contextAPI/client';

export default function App() {
  const {userToken, userInfo, homeChartDisplay, setHomeChartDisplay} = useContext(AuthContext)
  const [dataOption, setDataOption] = useState([]);
  const [dataPayoneer, setDataPayoneer] = useState([]);
  const [dataBitcoin, setDataBitcoin] = useState([]);
 
// get latest transaction details

const fetchData = async()=>{
  myId = userInfo.userData._id
  if(myId == '' || myId == null){
   //console.log('Access denied')
   return console.log('Access denied')
  }
   try{
   const recentChart = await client.get('/api/chart_transactions/'+myId,{
       headers: {
           'Authorization': 'Bearer '+userToken,
               }
       })
       if(recentChart.data.msg =='201'){
        let result = recentChart.data;
        //console.log(result)
        const objArr = recentChart.data; 
        setDataOption(objArr.paypal[0]?.totalAmount) 
        setDataPayoneer(objArr.payoneer[0]?.totalAmount)
        setDataBitcoin(objArr.bitcoin[0]?.totalAmount)
        }

       else if(recentChart.data.status == '402'){
           //console.log('Login failed')
           return
       }
       else if(recentChart.data.status == '404'){
           console.log('No chart data ',)
        }
       else{
           console.log('chart balance')
       }
       }catch (e){
       console.log(e.message);
       }

    if(dataOption == 0 && dataPayoneer == 0 && dataBitcoin == 0 ){
      setHomeChartDisplay(true);
    }
    else if(dataOption !== 0 || dataPayoneer !== 0 || dataBitcoin !== 0 ){
      setHomeChartDisplay(false);
    }

   }
  
   console.log('Empty chart ', dataOption)

  const option = {
    xAxis: {
      type: "category",
      data: ["Payoneer", "Paypal", "Bitcoin"],
      splitLine: {
        show: false, // Hide the horizontal grid lines on the Y-axis
      },
      axisLine: {
        show: false, // Hide the outside axis line on the Y-axis
      },
      axisTick: {
        show: false, // Hide the ticks on the Y-axis
      },
      axisLabel: {
        show: true, // Hide the labels on the Y-axis
      },
    },
    yAxis: {
      type: "value",
      splitLine: {
        show: true, // Hide the horizontal grid lines on the Y-axis
      },
      axisLine: {
        show: false, // Hide the outside axis line on the Y-axis
      },
      axisTick: {
        show: false, // Hide the ticks on the Y-axis
      },
      axisLabel: {
        show: false, // Hide the labels on the Y-axis
      },
      // axisLabel: {
      //   formatter: "{value}k" // Add 'k' to each label on the y-axis
      // },
      //interval: 200,
      min: 0,
      splitLine: {
        show: true,
        lineStyle: {
          color: colors.bgColor,
        },
      },
    },
    series: [
      {
        data: [dataPayoneer, dataOption, dataBitcoin],
        type: "bar",
        itemStyle: {
          color: colors.primaryColor1, // Change 'new_color' to your desired color
        },
      },
    ],
  };
  
  
  useEffect(() =>{
    //console.log((userInfo.userData.reg_stage5))
     fetchData();
     }, [])

  return (
    <>
      <View style={styles.container}>
       {/* <Text style={{fontFamily:'_regular', fontSize:15}}>100k</Text> */}
        <ECharts option={option} backgroundColor={colors.bgColor} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 350,
    width:300,
    backgroundColor:colors.bgColor,
    // alignItems: "center",
    // justifyContent: "center",
  },
});
