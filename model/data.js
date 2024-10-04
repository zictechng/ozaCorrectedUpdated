import React , {useContext, useCallback, useState, useEffect, useMemo, useRef } from 'react';
export const sliderData = [
    {
        title: 'PayPal Funds',
        desc:'We offer competitive rate for your PayPal! Do not waste your money on low rates with unverified dealers.',
        bgColor:'#1D2667',
        image: require('../assets/images/paypal2.png'),
      },
    
    {
      title: 'Payooner',
      desc:'Our competitive rate is mount watery! Bring in your payoneer funds with instant payout.',
      bgColor:'#A0DFC6',
      image: require('../assets/images/payooner3.png'),
    },
    {
        title: 'Awesome Rate with Bitcoin',
        desc:'Get the best rate when you trade your Bitcoin with us, No better place than mappido',
        bgColor: '#DCF2EA',
        image: require('../assets/images/bitcoin1.png'),
      },
  ];

  export const DocumentName = [
        { label: 'International Passport', value: 'International Passport' },
        { label: 'Government ID', value: 'Government ID' },
        { label: 'Driving License', value: 'Driving License' },
        { label: 'Bank Statement', value: 'Bank Statement' },
  ];

  export const GenderData =[
        { label: 'Male', value: 'Male' },
        { label: 'Female', value: 'Female' },
        { label: 'Others', value: 'Others' },
  ]

  export const ContactOptionData = [ 
      { label: 'Account Funding', value: 'Account Funding' },
      { label: 'Account Profile Update', value: 'Account Profile Update' },
      { label: 'Account Approval', value: 'Account Approval' },
      { label: 'Bounces Issues', value: 'Bounces Issues' },
      { label: 'Closing Account', value: 'Closing Account' },
      { label: 'Documents Upload', value: 'Documents Upload' },
      { label: 'Funds Sending', value: 'Funds Sending' },
      { label: 'Funds Withdrawal', value: 'Funds Withdrawal' },
      { label: 'Payment Issues', value: 'Payment Issues' },
      { label: 'Paypal Account Opening', value: 'Paypal Account Opening' },
      { label: 'Transaction Issues', value: 'Transaction Issues' },
      { label: '2FA Issue', value: '2FA Verification' },
      { label: 'Others', value: 'Others' },
  ]

  export const SendFundOptionData = [ 
    { label: 'Fund Account [NGN]', value: '1' },
    { label: 'Bonus Account [USD]', value: '2' },
    
  ]
  
  