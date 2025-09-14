import React, {useContext} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './authStack';
import { AuthContext } from '../contextAPI/authContext';
import MainRootStack from './mainRootStack';


const AppNav = () => {
  //const isFocused = useIsFocused();
    const {isLoading, userToken} = useContext(AuthContext)
  return (
            <NavigationContainer>
                  
                {userToken !== null ? <MainRootStack />: <AuthStack />}
                    
            </NavigationContainer>
  );
}

export default AppNav;
