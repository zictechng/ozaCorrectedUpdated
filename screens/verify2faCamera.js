import React, { useState, useEffect, useRef } from 'react';
import { TouchableOpacity, Image, View, Text, StyleSheet, Dimensions, Linking, Alert, Platform, } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useIsFocused } from '@react-navigation/native';
import Svg, { Rect, Mask, Ellipse } from 'react-native-svg';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Oval size
const OVAL_WIDTH = screenWidth * 0.8;
const OVAL_HEIGHT = screenHeight * 0.4;

const Verify2faCamera = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [image, setImage] = useState(null);
  const [type, setType] = useState('front');
  const [permission, requestPermission] = useCameraPermissions();

  const cameraRef = useRef(null);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      refreshPermission();
    }
  }, [isFocused]);

  const refreshPermission = async () => {
    const { status } = await CameraView.requestCameraPermissionsAsync();
    if (status === 'granted') {
      await requestPermission(); // updates hook state
    }
  };

  const checkPermissions = async () => {
    if (!permission) {
      return false;
    }
  
    // If permission is already granted, we’re good
    if (permission.granted) {
      return true;
    }

    const { status } = await CameraView.requestCameraPermissionsAsync();
  
    if (status === 'granted') {
      await requestPermission(); // update hook state
      return true;
    }
  
    if (status === 'denied') {
      Alert.alert(
        'Permission Required',
        Platform.OS === 'ios'
          ? 'Please enable full camera access in your device settings and reopen the app.'
          : 'Please enable camera access in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
      return false;
    }
  
    // If still undetermined, request again
    const { status: newStatus } = await CameraView.requestCameraPermissionsAsync();
    return newStatus === 'granted';
  };

  const takePicture = async () => {
    const granted = await checkPermissions();
    if (!granted) return;

    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setImage(photo.uri);

      navigation.navigate('Verify2faces', {
        userPhoto: photo.uri, // use the captured photo URI directly
      });
    }
    
  };

  const retakePicture = () => {
    setImage(null);
  };

  // this is optional
  const submitPicture = () => {
    console.log('Submitting photo:', image);
    navigation.navigate('Verify2faces', {
      userPhoto: image.uri,
    });
  };

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <TouchableOpacity onPress={checkPermissions} style={styles.permissionButton}>
          <Text style={styles.permissionText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!image ? (
        <View style={{ flex: 1, width: '100%' }}>
          <CameraView style={styles.camera} facing={type} ref={cameraRef} />

          {/* Overlay with oval focus area */}
          <View style={StyleSheet.absoluteFill}>
            <Svg height="100%" width="100%">
              <Mask id="mask">
                <Rect width="100%" height="100%" fill="white" />
                <Ellipse
                  cx={screenWidth / 2}
                  cy={screenHeight / 2}
                  rx={OVAL_WIDTH / 2}
                  ry={OVAL_HEIGHT / 2}
                  fill="black"
                />
              </Mask>

                <Rect
                  width="100%"
                  height="100%"
                  fill="rgba(0,0,0,0.95)"
                  mask="url(#mask)"
                />
                {/* Oval border */}
                <Ellipse
                  cx={screenWidth / 2}
                  cy={screenHeight / 2}
                  rx={OVAL_WIDTH / 2} // correct half-width
                  ry={OVAL_HEIGHT / 2} // correct half-height
                  stroke="#7f8cda"
                  strokeWidth={2}
                  fill="transparent"
                />
            </Svg>
          </View>

          {/* Floating Capture Button */}
          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <View style={styles.innerCircle} />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ flex: 1, width: '100%' }}>
          <Image source={{ uri: image }} style={{ flex: 1, width: '100%' }} />

          {/* Bottom Buttons after photo taken */}
          <View style={styles.bottomButtons}>
            <TouchableOpacity style={[styles.actionButton, styles.retakeButton]} onPress={retakePicture}>
              <Text style={styles.actionText}>Retake</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, styles.submitButton]} onPress={submitPicture}>
              <Text style={styles.actionText}>Use Photo</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: '#fff',
  },
  permissionButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignSelf: 'center',
  },
  permissionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  captureButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#ffffff55',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#7f8cda',
  },
  bottomButtons: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    alignSelf: 'center',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  retakeButton: {
    backgroundColor: '#ff3b30',
  },
  submitButton: {
    backgroundColor: '#5464c4',
  },
  actionText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default Verify2faCamera;
