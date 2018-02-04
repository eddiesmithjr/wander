import React from 'react';
import { View, Text, Modal, AsyncStorage } from 'react-native';
import { FormInput, Button, Card } from 'react-native-elements';
import QRCode from 'react-native-qrcode';
import axios from 'axios';
import PropTypes from 'prop-types';
import { styles } from './Styles';


export default class Trip extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      email: '',
    };
    this.handleTripSelect = this.handleTripSelect.bind(this);
    this.showModal = this.showModal.bind(this);
    this.addByEmail = this.addByEmail.bind(this);
  }

  handleTripSelect() {
    // When a trip is clicked, get all of the events and send the user to the Itinerary page
    axios.get(`http://18.218.102.64/${this.props.schedule.id}/schedules`)
      .then((res) => {
        const datesSummary = res.data.reduce((seed, obj) => {
          seed[obj.dateTime] = true;
          return seed;
        }, {});
        const schedule = {};
        Object.keys(datesSummary).forEach((day, i) => {
          datesSummary[day] = `day_${i + 1}`;
          schedule[`day_${i + 1}`] = [];
        });
        res.data.forEach((event) => {
          schedule[datesSummary[event.dateTime]].push(event);
        });
        this.props.navigation.navigate('Timeline', { dayInfo: schedule });
      })
      .catch(err => console.error(err));
  }

  showModal() {
    this.setState({ modalVisible: true });
  }

  hideModal() {
    this.setState({ modalVisible: false });
  }

  addByEmail() {
    // Adds someone to a trip by entering their email
    const body = { userEmail: this.state.email, scheduleId: this.props.schedule.id };
    AsyncStorage.getItem('Token')
      .then(token => axios({
        url: 'http://18.218.102.64/join_schedule',
        method: 'post',
        headers: { authorization: JSON.parse(token) },
        data: body,
      }))
      .then(() => {
        this.hideModal();
      })
      .catch(err => console.error(err));
  }

  render() {
    return (
      <View style={styles.tripContainer}>
        <Card containerStyle={{ borderRadius: 10, backgroundColor: 'rgba(0, 0, 0, 0.25)' }} >
          <Modal
            visible={this.state.modalVisible}
            animationType="fade"
            onRequestClose={() => this.hideModal()}
            transparent
          >
            <View style={styles.tripModal}>
              <Text
                style={styles.tripModalText}
              >Share with a friend by entering their email address here:
              </Text>
              <FormInput
                keyboardType="email-address"
                onChangeText={text => this.setState({ email: text })}
                placeholder="enter email"
                placeholderTextColor="white"
                inputStyle={{ color: 'white' }}
                autoCapitalize="none"
              />
              <Button
                buttonStyle={{
                  backgroundColor: 'transparent',
                  borderRadius: 10,
                }}
                onPress={this.addByEmail}
                title="Add"
              />
              <Text style={styles.tripModalText}>Or have your friend scan this QR code from their Wander app</Text>
              <QRCode
                value={this.props.schedule.id.toString()}
                size={200}
                bgColor="black"
                fgColor="white"
              />
              <Button
                large
                raised
                buttonStyle={{
                  backgroundColor: 'transparent',
                  borderRadius: 10,
                }}
                onPress={() => this.hideModal()}
                title="Close"
              />
            </View>
          </Modal>
          <Text style={{ fontSize: 25, alignContent: 'center', justifyContent: 'center' }}>{this.props.schedule.name}</Text>
          <View style={styles.viewTripContainer}>
            <Button
              small
              flat
              color="black"
              buttonStyle={styles.viewTripButton}
              title="View this trip"
              onPress={this.handleTripSelect}
              underlayColor="rgba(255, 255, 255, 0.5)"
            />
            <Button
              small
              flat
              color="black"
              buttonStyle={styles.viewTripButton}
              title="Share this trip"
              onPress={this.showModal}
              underlayColor="rgba(255, 255, 255, 0.5)"
            />
          </View>
        </Card>
      </View>
    );
  }
}

Trip.propTypes = {
  navigation: PropTypes.object,
  schedule: PropTypes.object,
};
