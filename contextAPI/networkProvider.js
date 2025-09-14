import React, { createContext, useState, useEffect, useContext } from 'react';
import {Alert, Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { colors } from '../styles';

// Create a Context
const NetworkContext = createContext();

// Provider component to manage global internet connection state
export const NetworkProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Subscribe to connection updates
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);

      if (!state.isConnected) {
        // Show alert when internet is not connected
        // Alert.alert(
        //   'No Internet Connection',
        //   'You are not connected to the internet. Please check your connection.'
        // );
        setShowModal(true);
            } else {
        setShowModal(false);  // Hide modal when internet is restored
            }
    });

    // Clean up subscription on unmount
    return () => unsubscribe();
  }, []);

  // Function to reload the app
  const handleRetry = async () => {
    const state = await NetInfo.fetch();
    if (state.isConnected) {
      // If connected, reload the app
      Updates.reloadAsync();
    } else {
      // If still offline, keep the modal open
      setShowModal(true);
    }
  };

  return (
    <NetworkContext.Provider value={{ isConnected }}>
      {children}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          // Prevent modal from closing if there is no internet
          if (!isConnected) return;
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>No Internet Connection</Text>
            <Text style={styles.modalSubText}>
              Please connect to wifi or mobile data to continue using the app.
            </Text>
            {/* <Button title="Retry" onPress={() => {}} disabled={!isConnected} /> */}
            <TouchableOpacity style={styles.btn} onPress={handleRetry}>
                <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </NetworkContext.Provider>
  );
};

// Custom hook to use the network context
export const useNetwork = () => useContext(NetworkContext);

// Styles for modal
const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      width: 300,
      padding: 20,
      backgroundColor: 'white',
      borderRadius: 10,
      alignItems: 'center',
    },
    modalText: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    modalSubText: {
      fontSize: 14,
      color: '#666',
      marginBottom: 20,
    },

    retryButtonText: {
        color: '#aaa',  // Text color matching border color
        fontSize: 16,
      },
    btn:{
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius:20, 
        borderColor:colors.primaryColor1, 
        borderWidth:0.8, 
        justifyContent:'center', 
        alignItems:'center', 
        }
  });