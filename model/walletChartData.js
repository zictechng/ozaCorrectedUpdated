import React , {useContext, useState, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { ECharts } from "react-native-echarts-wrapper";
import { gs, colors } from '../styles';
import { AuthContext } from '../contextAPI/authContext';
import client from '../contextAPI/client';

export default function App() {
  const {userToken, userInfo,} = useContext(AuthContext)
  const [weeklyData, setWeeklyData] = useState({});
  const [monthlyData, setMonthlyData] = useState({});
  const [yearlyData, setYearlyData] = useState({});
  const [chartLoading, setChartLoading] = useState(false);
  const [chartDetails, setChartDetails] = useState(false);

  
  // get latest transaction details
const fetchData = async()=>{
  myId = userInfo.userData._id
  if(myId == '' || myId == null){
   console.log('Access denied')
   return console.log('Access denied')
  }
  setChartLoading(true)
   try{

   const recentChart = await client.get('/api/chart_transactions/'+myId,{
       headers: {
           'Authorization': 'Bearer '+userToken,
               }
       })
       if(recentChart.data.msg =='201'){
        let result = recentChart.data;
        const objArr = recentChart.data; 
        setWeeklyData(result.weekly) 
        setMonthlyData(result.monthly)
        setYearlyData(result.yearly)
         //console.log('Yes ', result)  
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
       finally{
        setChartLoading(false);
       }
   }
   
  
   useEffect(() =>{
    //console.log((userInfo.userData.reg_stage5))
     fetchData();
     if(weeklyData == '0' || weeklyData =='' || monthlyData == 0 || monthlyData == '' || yearlyData == 0 || yearlyData == '') {
      setChartDetails(true);
     } 
     }, [])
     
  const option = {
    xAxis: {
      type: "category",
      data: ["Weekly", "Monthly", "Yearly"],
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
        show: false, // Hide the horizontal grid lines on the Y-axis
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
      //   formatter: "{value}k", // Add 'k' to each label on the y-axis
      // },
      // interval: 2,
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
        data: [weeklyData, monthlyData, yearlyData],
        type: "bar",
        itemStyle: {
          color: colors.primaryColor1, // Change 'new_color' to your desired color
        },
      },
    ],
  };

  return (
    <>
      <View style={styles.container}>
        {chartLoading ? <ActivityIndicator size={'large'} color={colors.primaryColor1} />:
          chartDetails ? '' : <ECharts option={option} backgroundColor={colors.bgColor} />}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 300,
    width:300,
    backgroundColor:colors.bgColor,
    // alignItems: "center",
    // justifyContent: "center",
  },
});
