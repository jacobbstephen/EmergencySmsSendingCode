import React, { useState } from 'react';
import { StyleSheet, View, Button, Alert, PermissionsAndroid, Platform } from 'react-native';
import SendSMS from 'react-native-sms';
import Geolocation from 'react-native-geolocation-service';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

// Function to request SMS permissions (for Android only)
const requestSMSPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.SEND_SMS,
        {
          title: 'SMS Permission',
          message: 'This app needs access to send SMS messages.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
  return true;
};

// Function to request Location permissions (for Android only)
const requestLocationPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
  return true;
};

const EmergencySMS = () => {
  const [contacts] = useState(['XXXXXXXXXXX']); // Replace with real emergency contact numbers
  const [location, setLocation] = useState(null);

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        console.log('Current location:', latitude, longitude);
      },
      (error) => {
        // Alert.alert('Error', 'Failed to get location.');
        console.log(error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const sendEmergencySMS = async () => {
    const smsPermissionGranted = await requestSMSPermission();
    if (!smsPermissionGranted) {
      Alert.alert('Permission Denied', 'SMS permission is required to send messages.');
      return;
    }

    const locationPermissionGranted = await requestLocationPermission();
    if (!locationPermissionGranted) {
      Alert.alert('Permission Denied', 'Location permission is required to access your location.');
      return;
    }
    console.log(locationPermissionGranted);
    getCurrentLocation(); // Fetch location after permissions are granted

    if (!location) {
      Alert.alert('Error', 'Location is not available yet.');
      return;
    }
    console.log(location);
    const message = `Emergency! I need help. My current location: https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
    console.log('Sending SMS...');

    SendSMS.send(
      {
        body: message,
        recipients: contacts, // Array of phone numbers
        successTypes: ['sent', 'queued'],
      },
      (completed, cancelled, error) => {
        console.log('Callback reached');
        if (completed) {
          console.log('SMS Sent:', completed);
          Alert.alert('Success', 'Emergency SMS sent successfully!');
        } else if (cancelled) {
          Alert.alert('Cancelled', 'SMS sending was cancelled.');
        } else {
          Alert.alert('Error', 'Failed to send SMS.');
        }
      }
    );
  };

  return (
    <View style={styles.container}>
      <Button title="Send Emergency SMS" onPress={sendEmergencySMS} />
    </View>
  );
};

export default EmergencySMS;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
