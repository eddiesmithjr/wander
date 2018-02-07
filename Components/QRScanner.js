import React from 'react';
import { StyleSheet, Text, View, AsyncStorage } from 'react-native';
import { BarCodeScanner, Permissions } from 'expo';
import axios from 'axios';
import PropTypes from 'prop-types';
import { keys } from '../config';

// Honestly, most of this component was copied and pasted from the docs
// But it works. Don't touch it
export default class QRScanner extends React.Component {
  constructor() {
    super();
    this.state = {
      hasCameraPermission: null,
      read: true,
    };
    this.handleBarCodeRead = this.handleBarCodeRead.bind(this);
  }

  async componentWillMount() {
    // Ask for camera permission first thing
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  }

  handleBarCodeRead({ data }) {
    // Make a request to join in on a trip, using the trip number you got from the qr code
    // and the user's token to get the id
    this.setState({ read: false }, () => {
      AsyncStorage.getItem('Token')
        .then((token) => {
          const body = { scheduleId: data };
          return axios({
            url: `${keys.devURI}/join_schedule`,
            method: 'post',
            headers: {
              authorization: JSON.parse(token),
              'Content-Type': 'application/json',
            },
            data: body,
          });
        })
        // Send the user back to the dashboard. They should see the new schedule immediately
        .then(() => this.props.navigation.navigate('Dashboard'))
        .catch(err => console.error(err));
    });
  }

  render() {
    const { hasCameraPermission } = this.state;
    if (hasCameraPermission === null) {
      return <Text>Requesting for camera permission</Text>;
    } else if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    }
    return (
      <View style={{ flex: 1 }}>
        <BarCodeScanner
          barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
          onBarCodeRead={this.state.read && this.handleBarCodeRead}
          style={StyleSheet.absoluteFill}
        />
      </View>
    );
  }
}

QRScanner.propTypes = {
  navigation: PropTypes.object,
};
