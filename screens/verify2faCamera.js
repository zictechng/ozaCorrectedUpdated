import React, { useState, useEffect } from 'react';
import { Dimensions , Text, View, Button, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Camera, CameraType } from "expo-camera/legacy";
import { gs, colors } from '../styles';
import { Ionicons} from '@expo/vector-icons';


export default function Verify2faCamera({navigation}) {
  
  const [hasPermission, setHasPermission] = useState(null); // To store camera permissions
  const [cameraRef, setCameraRef] = useState(null);         // Reference to camera instance
  const [type, setType] = useState(CameraType.front); // Default to rear camera
  const [photo, setPhoto] = useState(null); // Store captured photo
  const [photoTaken, setPhotoTaken] = useState(false); // check if photo is taken);
  const [isCameraReady, setIsCameraReady] = useState(false);
  
  const [isFaceAligned, setIsFaceAligned] = useState(false); // To track face alignment

  const { height, width } = Dimensions.get('window'); 
  const frameSize = width * 0.8;  // Adjust frame size as needed (e.g., 70% of screen width)
      
  const framePosition = { top: '30%', left: '15%', right: '20%' };  // Frame position

    const maskRowHeight = Math.round((height - 200) / 20);
    const maskColWidth = (width - 200) / 2;

  // Request camera permission
      useEffect(() => {
        (async () => {
          const { status } = await Camera.requestCameraPermissionsAsync();
          setHasPermission(status === 'granted');
        })();
      }, []);

          if (hasPermission === null) {
            return <Text style={{justifyContent:'center', alignItems:'center', fontSize:14}}>Requesting camera permissions...</Text>;
          }
          if (hasPermission === false) {
            return <Text style={{justifyContent:'center', alignItems:'center', fontSize:14}}>No access to camera</Text>;
          }

          // Check camera readiness (triggers when the camera is ready to capture)
          const onCameraReady = () => {
            setIsCameraReady(true); // Set camera ready state to true
          };
        
       // function to capture photo via camera
      const capturePhoto = async () => {
        if (cameraRef) {
          quality = cameraRef.quality
          let result = await cameraRef.takePictureAsync();
          setPhoto(result.uri);  // Capture photo
          setPhotoTaken(true); //

          navigation.navigate('Verify2faces',{
            userPhoto:result.uri,
            });
        }
      };

      // Check if the face is within the frame
  // const isFaceInsideFrame = (face) => {
  //   const { bounds } = face;
  //   const frameTop = Dimensions.get('window').height * parseFloat(framePosition.top) / 100;
  //   const frameLeft = Dimensions.get('window').width * parseFloat(framePosition.left) / 100;
  //   const frameBottom = frameTop + frameSize;
  //   const frameRight = frameLeft + frameSize;

  //   return (
  //     bounds.origin.y >= frameTop &&
  //     bounds.origin.y + bounds.size.height <= frameBottom &&
  //     bounds.origin.x >= frameLeft &&
  //     bounds.origin.x + bounds.size.width <= frameRight
  //   );
  // };

  // const handleFacesDetected = ({ faces }) => {
  //   if (faces.length > 0) {
  //     const face = faces[0];
  //     if (isFaceInsideFrame(face)) {
  //       setIsFaceAligned(true);
  //     } else {
  //       setIsFaceAligned(false);
  //     }
  //   } else {
  //     setIsFaceAligned(false);  // No face detected, set frame to default
  //   }
  // };



  return (
    
    <View style={styles.container}>
      <SafeAreaView style={{flex:1}}>
      
          <Camera
            style={{flex:1, justifyContent: "flex-start"}}
            type={type}
            ratio={'16:9'}
            ref={ref => setCameraRef(ref)}
            onCameraReady={onCameraReady}>

                <View style={gs.homeHeaderRow}>
                    <View style={{justifyContent:'space-between', flexDirection:'row'}}>
                        <Text></Text>
                        {isCameraReady &&
                        <TouchableOpacity onPress={() => navigation.navigate('Verify2faces')}>
                          <View style={[gs.homeSideMenu, {borderWidth: 0}]}>
                          <Ionicons name='close-outline' size={23} color={colors.textColor}/>
                        </View>
                        </TouchableOpacity>}          
                    </View>
                </View>
                {/* this will turn the camera to back or front view */}
              {/* <View style={styles.actionButtonView}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    setType(
                      type === Camera.Constants.Type.back
                        ? Camera.Constants.Type.front
                        : Camera.Constants.Type.back
                    );
                  }}>
                  <Text style={styles.buttonText}> Flip Camera </Text>
                </TouchableOpacity>
                
              </View> */}

              {/* Frame focus overlay */}
              <View style={styles.focusFrame}>
                <View style={[styles.frame, { width: frameSize, height: frameSize,
                  borderColor: isFaceAligned ? '#1CB377' : '#1D2667',
                 }]} />
              </View>
        
              <View style={styles.btnTakePhotoDiv}>
                {isCameraReady &&
                <TouchableOpacity style={styles.btnTakePhoto}
                onPress={ () => capturePhoto()}>
                <Text style={[gs.loginPageDesc,{color:colors.colorWhite}]}>Take Photo</Text>
                </TouchableOpacity>}
              </View>
          </Camera>
      </SafeAreaView>
    </View>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    margin: 20,
  },

  actionButtonView:{
    flex:1, height:100, 
    justifyContent:'center', 
    alignItems:'center', 
    padding:10, 
    borderRadius: 8, 
    marginBottom: 30
},

  button: {
    flex: 0.1,
    alignSelf: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 10,
    padding: 10,
  },

  actionButton:{
    width:90, 
    height:40, 
    borderRadius:15, 
    backgroundColor:colors.primaryColor1, 
    justifyContent:'center', 
    alignItems:'center', 
    },

actionButtonClose:{
  height:50, 
  borderRadius:50, 
  backgroundColor:'transparent', 
  justifyContent:'center', 
  alignItems:'center', 
  marginRight:15
},

btnTakePhoto:{
  width:150,
  height:40, 
  borderRadius:10, 
  backgroundColor:colors.primaryColor1,
  justifyContent:'center', 
  alignItems:'center', 
  },

  btnTakePhotoDisable:{
    width:150,
    height:40, 
    borderRadius:10, 
    backgroundColor:colors.primaryColor1,
    justifyContent:'center', 
    alignItems:'center', 
    },

  btnTakePhotoDiv:{
    justifyContent:'center', 
    alignItems:'center', 
    flex: 1, // Full height of the screen
    justifyContent: 'flex-end', // Pushes content to the bottom
    padding: 30
  },
  text: {
    fontSize: 18,
    color: 'black',
  },

  buttonText:{
    color:colors.textColor, 
    fontFamily:'_semiBold', 
    fontSize:15
},

focusFrame: {
  position: 'absolute',
  top: '25%',  // Adjust the position of the frame (30% from the top in this case)
  left: '15%',
  right: '15%',  // Center the frame horizontally (15% from the left in this case)
  justifyContent: 'center',
  alignItems: 'center',
  
},
frame: {
  borderWidth: 2,
  borderColor: '#595F90',//'#00FF00',  // Green frame color (customize as needed)
  borderRadius: 40,  // Rounded corners (optional)
  
},

});