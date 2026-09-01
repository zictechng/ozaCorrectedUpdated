import React, { useContext } from 'react';
import { AuthContext } from '../contextAPI/authContext';

export async function GetUserInfo(data){
    const {userInfo, setUserInfo, userToken} = useContext(AuthContext)
    console.log("User ID ", data)
    try {
        const res = await client.get('/api/userProfileMobile/'+data)
        if(res.data.msg == '200'){
          const userDetails = res.data; 
          setUserInfo(userDetails)
          //console.log('User details ', userDetails) 
         return userDetails;
        }
        else{
            console.log("something went wrong while fetching user details")
        }
    } catch (error) {
        console.log( 'fetching user information failed ', error)
    }
}
