import React from 'react';
import { View, Text } from 'react-native';

export default function SumFormal() {

    // {
    //     $match: {
    //       fund_status: "Pending"
    //     }
    //   },
    //   {
    //     $group: {
    //       _id: null,
    //       totalAmount: { $sum: "$amount" }
    //     }
    //   }
    // ])'




    // .aggregate([
    //   {
    //   $match: {
    //   userId: mongoose.Types.ObjectId(userId),
    //   status: { $in: ['pending', 'completed'] },
    //   },
    //   },
    //   {
    //   $group: {
    //   _id: {
    //   userId: '$userId', // Include userId in the _id field
    //   $switch: {
    //   branches: [
    //   { case: { $eq: [interval, 'weekly'] }, then: { week: { $week: '$createdOn' } } },
    //   { case: { $eq: [interval, 'monthly'] }, then: { month: { $month: '$createdOn' } } },
    //   { case: { $eq: [interval, 'yearly'] }, then: { year: { $year: '$createdOn' } } },
    //   ],
    //   default: '$fund_status',
    //   },
    //   },
    //   totalAmount: { $sum: '$amount' },
    //   },
    //   },
    //   ]);
  return (
    <View></View>
    // <View style={{flex:1, backgroundColor:colors.bgColor}}>
    //     <SafeAreaView style={{flex:1}}>

    //         <StatusBar style='dark' />

    //             <View style={gs.homeHeaderRow}>
    //                 <View style={{justifyContent:'space-between', flexDirection:'row'}}>
    //                     <TouchableOpacity onPress={() => navigation.goBack()}>
    //                     <View style={[gs.homeSideMenu, {borderWidth: 0}]}><Ionicons name='arrow-back' size={25} color={colors.textColor}/></View>
                            
    //                     </TouchableOpacity>

    //                     {/* <Text style={styles.settingTitle}>Settings</Text> */}
    //                     <Text></Text>
    //                     {/* <TouchableOpacity style={gs.homeSideMenu}>
    //                         <Feather name='bell' size={20} color={colors.textColor}/>
                            
    //                     </TouchableOpacity> */}
    //                 </View>
    //                 <View style={{marginBottom:30}}></View>
                    
    //              </View>
    //              <View style={{flex:1, backgroundColor:colors.bgColor}}>
    //                 <ScrollView>
    //                     <View style={{marginHorizontal:10, marginTop:10}}>
    //                         <Text style={{fontFamily:'_bold', fontSize:30, color:colors.textBlack}}>Authenticate with Paypal</Text>
    //                     </View>

    //                     <View style={{marginHorizontal:10, marginTop:10, marginBottom:10}}>
    //                        <Text style={{fontFamily:'_regular', fontSize:14, color:colors.textBlack}}>Click authenticate and enter your details to authorized the transaction</Text>

    //                     </View>
                

    //                             <View style={styles.formPage}>
                                  
    //                                     <View style={{justifyContent:'center', alignItems:'center'}}>
    //                                         {documentVerify && <Ionicons name='document' size={200} color={colors.primaryColor2}
    //                                         style={{transform: [{rotate: '-15deg'}], opacity:.25}} />}

    //                                         {!documentVerify && <Ionicons name='document' size={200} color={colors.primaryColor2}
    //                                         style={{transform: [{rotate: '-15deg'}], opacity:.70}} /> }
    //                                         {documentVerify && <MaterialCommunityIcons name='check-decagram' size={25} style={styles.accountVerify} />}
    //                                     </View>
                           
    //                             </View>

                        
    //                     <View style={{marginBottom:30}}></View>
                         
    //                 </ScrollView>
    //                 <TouchableOpacity style={[styles.formPage, documentVerify? styles.formPageDisable: '' ]}
    //                     onPress={() =>navigation.navigate('UploadDocument')}
    //                     disabled={documentVerify}>
    //                         <View style={{flexDirection:'row', height:50, alignItems:'center', marginHorizontal:15,}}>
    //                             <FontAwesome5 name='file' size={25} color={colors.primaryColor1} />
    //                             <Text style={{fontFamily:'_semiBold', fontSize:17, marginLeft:15, color:colors.primaryColor1}}>Upload Documents</Text>
    //                         </View>
                            
    //                 </TouchableOpacity>
    //             </View>
            
    //     </SafeAreaView>
    // </View>
  );
}
