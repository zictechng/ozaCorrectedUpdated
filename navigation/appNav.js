import React, {useContext} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './authStack';
import { AuthContext } from '../contextAPI/authContext';
import MainRootStack from './mainRootStack';


const AppNav = () => {
  //const isFocused = useIsFocused();
    const {isLoading, userToken} = useContext(AuthContext)

    // check if the app is loading and show this notification
    // if(isLoading){
    //   return (
    //     <View style={{flex: 1, justifyContent:'center', alignItems:'center', backgroundColor:colors.primaryColor2}}>
    //               {
    //                  isLoading ?
    //                     <StatusBar
    //                         barStyle={'light-content'}
    //                         translucent
    //                         backgroundColor="transparent"
    //                     />:
                        
    //                     <StatusBar barStyle='light-content' />
    //                 }
    //         <ActivityIndicator size={'large'} color={colors.textColor} />
    //     </View>
    //     )
    // }
  return (
            <NavigationContainer>
                  
                {userToken !== null ? <MainRootStack />: <AuthStack />}
                    
            </NavigationContainer>
  );
}

export default AppNav;
