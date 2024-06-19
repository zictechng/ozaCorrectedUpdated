import React, {useContext, useEffect, useState} from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useIsFocused } from '@react-navigation/native';
import HomeStack from './homeStack';
import BankDetailsScreen from '../screens/bankDetailsScreen';
import CompleteSignupScreen from '../screens/completeSignupScreen';
import UploadProfileImageScreen from '../screens/uploadProfileImageScreen';
import UploadDocumentScreen from '../screens/uploadDocumentScreen';
import Verify2faAccountScreen from '../screens/verify2faAccountScreen';
import ContactUsScreen from '../screens/contacUsScreen';
import AboutUs from '../screens/aboutUs';
import ResetPasswordScreen from '../screens/resetPasswordScreen';
import FundAccountScreen from '../screens/fundAccountScreen';
import FundAccountNextScreen from '../screens/fundAcctNextScreen';
import SuccessfulScreen from '../screens/successfulScreen';
import SellingScreen from '../screens/sellingScreen';
import CheckOutManualPage from '../screens/checkOutManualPage';
import BuyScreen from '../screens/buyScreen';
import WalletScreen from '../screens/walletScreen';
import DocumentScreen from '../screens/documentScreen';
import PayPaypalScreen from '../screens/payPaypal';
import PayoneerCheckOutScreen from '../screens/payoneerCheckout';
import PayBitcoinCheckoutScreen from '../screens/payBitcoinCheckout';
import PayStackScreen from '../screens/payStackScreen';
import PayPalWebviewScreen from '../screens/payPalWebviewScreen';
import FundAccountPaystackScreen from '../screens/fundAcctPaystack';
import PrivacyPolicyScreen from '../screens/privacyPolicyScreen';
import TermsConditionsScreen from '../screens/term_conditionScreen';
import SignupStepScreen from '../screens/signupStepScreen';
import UploadProofAddress from '../screens/uploadAddress';


const Stack = createNativeStackNavigator();

const MainRootStack = ({navigation}) =>{
  const isFocused = useIsFocused();
  
    // check user token if still active or expiration details
    
    // This will make scree slide from left to right / right to slide
    const horizontalAnimation = {
        gestureDirection: 'horizontal',
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 1],
                  }),
                },
              ],
            },
          };
        },
      };
     
  return (
    <Stack.Navigator screenOptions={{headerShown:false}}>
      <Stack.Group screenOptions={{ animation: 'slide_from_bottom'}}>

      <Stack.Screen 
      name='Home'
        screenOptions={{horizontalAnimation}}
        component={HomeStack}>
      </Stack.Screen>
      </Stack.Group>
      <Stack.Group screenOptions={Platform.OS == 'ios'? { presentation: 'modal'}: { animation: 'slide_from_bottom'}}>
        <Stack.Screen 
        name='BankDetails'
        component={BankDetailsScreen}
        options={() => ({
          presentation: 'modal'
        })}/>
        
      </Stack.Group>
      
      <Stack.Group screenOptions={{ animation: 'slide_from_bottom'}}>
      <Stack.Screen 
      name='CompleteSignup'
      component={CompleteSignupScreen}
      >
      </Stack.Screen>
      </Stack.Group>

      <Stack.Group screenOptions={{ animation: 'slide_from_bottom'}}>
      <Stack.Screen 
      name='UploadProfile_image'
      component={UploadProfileImageScreen}
      >
      </Stack.Screen>
      </Stack.Group>

      <Stack.Group  screenOptions={{ animation: 'slide_from_bottom'}}>
      <Stack.Screen 
      screenOptions={{animation: 'slide_from_bottom'}}
      name='UploadDocument'
      component={UploadDocumentScreen}
      />
      </Stack.Group>

      <Stack.Group  screenOptions={{ animation: 'slide_from_bottom'}}>
      <Stack.Screen 
      screenOptions={{animation: 'slide_from_bottom'}}
      name='Verify2faces'
      component={Verify2faAccountScreen}
      />
      </Stack.Group>

      <Stack.Group screenOptions={{ animation: 'slide_from_bottom'}}>
      <Stack.Screen 
      name='UploadProofAddress'
      component={UploadProofAddress}>
      </Stack.Screen>
      </Stack.Group>

      <Stack.Group  screenOptions={{ animation: 'slide_from_right'}}>
      <Stack.Screen
        screenOptions={{animation: 'slide_from_right'}}
        name='contacts'
        component={ContactUsScreen}
      />
      </Stack.Group>

      <Stack.Group  screenOptions={{ animation: 'slide_from_right'}}>
      <Stack.Screen
        screenOptions={{animation: 'slide_from_right'}}
        name='About'
        component={AboutUs}
      />
      </Stack.Group>

      <Stack.Group screenOptions={Platform.OS == 'ios'?{ presentation: 'modal'}:{
        animation: 'slide_from_bottom',
      }}>
        <Stack.Screen 
        name='ResetPassword'
        component={ResetPasswordScreen}
        />
       </Stack.Group>
      
      <Stack.Group  screenOptions={{ animation: 'slide_from_right'}}>
        <Stack.Screen 
        screenOptions={{animation: 'slide_from_right'}}
        name='FundingNextPage'
        component={FundAccountNextScreen}
        />
        </Stack.Group>

        <Stack.Group  screenOptions={{ animation: 'slide_from_bottom'}}>
        <Stack.Screen 
        screenOptions={{animation: 'slide_from_bottom'}}
        name='Successful'
        component={SuccessfulScreen}
        />
        </Stack.Group>

        <Stack.Group  screenOptions={{ animation: 'slide_from_right'}}>
        <Stack.Screen 
        screenOptions={{animation: 'slide_from_right'}}
        name='PaypalPayment'
        component={PayPaypalScreen}
        />
        </Stack.Group>

        <Stack.Group  screenOptions={{ animation: 'slide_from_right'}}>
        <Stack.Screen 
        screenOptions={{animation: 'slide_from_right'}}
        name='PayoneerCheckout'
        component={PayoneerCheckOutScreen}
        />
        </Stack.Group>

        <Stack.Group  screenOptions={{ animation: 'slide_from_right'}}>
        <Stack.Screen 
        screenOptions={{animation: 'slide_from_right'}}
        name='Paystack_checkout'
        component={PayStackScreen}
        />
        </Stack.Group>


        <Stack.Group  screenOptions={{ animation: 'slide_from_right'}}>
        <Stack.Screen 
        screenOptions={{animation: 'slide_from_right'}}
        name='paypalWebview'
        component={PayPalWebviewScreen}
        />
        </Stack.Group>

        <Stack.Group  screenOptions={{ animation: 'slide_from_right'}}>
        <Stack.Screen 
        screenOptions={{animation: 'slide_from_right'}}
        name='BitcoinCheckout'
        component={PayBitcoinCheckoutScreen}
        />
        </Stack.Group>

        <Stack.Group screenOptions={{ animation: 'slide_from_right' }}>
        <Stack.Screen 
        screenOptions={{animation: 'slide_from_right'}}
        name='SalesPage'
        component={SellingScreen}
        />
        </Stack.Group>

        <Stack.Group screenOptions={{ animation: 'slide_from_right' }}>
        <Stack.Screen 
        screenOptions={{animation: 'slide_from_right'}}
        name='BuyPage'
        component={BuyScreen}
        />
        </Stack.Group>

        <Stack.Group screenOptions={{ animation: 'slide_from_right'}}>
        <Stack.Screen 
        name='Wallet'
        component={WalletScreen}
        />
        </Stack.Group>

        <Stack.Group  screenOptions={{ animation: 'slide_from_bottom'}}>
        <Stack.Screen 
        name='DocumentView'
        component={DocumentScreen}
        />
        </Stack.Group>
        
        <Stack.Group  screenOptions={{ animation: 'slide_from_right'}}>
        <Stack.Screen 
        screenOptions={{animation: 'slide_from_right'}}
        name='FundAcctPaystackCheckout'
        component={FundAccountPaystackScreen}
        />
        </Stack.Group>

        <Stack.Group screenOptions={{ animation: 'slide_from_bottom'}}>
        <Stack.Screen 
        screenOptions={{animation: 'slide_from_bottom'}}
        name='CheckManual'
        component={CheckOutManualPage}
        />
        </Stack.Group>

        <Stack.Group screenOptions={{ animation: 'slide_from_right'}}>
        <Stack.Screen 
        screenOptions={{animation: 'slide_from_right'}}
        name='Privacy_Policy'
        component={PrivacyPolicyScreen}
        />
        </Stack.Group>

        <Stack.Group screenOptions={{ animation: 'slide_from_right'}}>
        <Stack.Screen 
        screenOptions={{animation: 'slide_from_right'}}
        name='Terms_Conditions'
        component={TermsConditionsScreen}
        />
        </Stack.Group>

        <Stack.Group screenOptions={{ animation: 'slide_from_right'}}>
        <Stack.Screen 
        screenOptions={{animation: 'slide_from_right'}}
        name='SignupSteps'
        component={SignupStepScreen}
        />
        </Stack.Group>
        
        
</Stack.Navigator>
  );
}

export default MainRootStack;
