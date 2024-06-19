import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect } from 'react';
import { View, Text } from 'react-native';

const  _retrieveData = async (data) => {
        try {
          const value = await AsyncStorage.getItem(data);
          newValue = JSON.parse(value);
          if (newValue !== null || newValue !=='') {
            // We have data!!
            //console.log(JSON.parse(newValue));
            return true;
          }
          else{
            return false;
          }
        } catch (error) {
          // Error retrieving data
        }
  
}
export default _retrieveData
