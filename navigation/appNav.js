import React, {useContext} from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './authStack';
import { AuthContext } from '../contextAPI/authContext';
import MainRootStack from './mainRootStack';
import { AppModeModal } from '../components/controls';


const AppNav = () => {
  //const isFocused = useIsFocused();
    const {isLoading, userToken, appSettingDetails, logoutAction} = useContext(AuthContext)
    

  // Global maintenance check
  const showModal = 
    appSettingDetails?.app_operation_status === true || 
    appSettingDetails?.app_operation_status === 'true' ||
    appSettingDetails?.app_stop_login_status === true || 
    appSettingDetails?.app_stop_login_status === 'true';
  return (
        <View style={{ flex: 1 }}>
            <NavigationContainer>
                  
                {userToken !== null ? <MainRootStack />: <AuthStack />}
  
            </NavigationContainer>
            {/* Global Maintenance Modal - Covers every screen instantly */}
                  {showModal && userToken !== null && (
                    <AppModeModal
                      openModal={showModal}
                      animationType="slide"
                      ModalShortDesc="Service Unavailable"
                      ModalDesc={appSettingDetails?.app_mode_message}
                      closeBtn={logoutAction}
                      logoutBtn={logoutAction}
                      modalBgColor="rgba(0,0,0,0.7)"
                      bntYesText="Okay"
                    />
                  )}

        </View>
  );
}

export default AppNav;
