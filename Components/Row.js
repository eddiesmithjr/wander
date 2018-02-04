import React from 'react';
import {
  Animated,
  Easing,
  View,
  Modal,
  AsyncStorage,
  TouchableHighlight,
} from 'react-native';
import openMap from 'react-native-open-maps';
import { Button, Icon, Text, Card } from 'react-native-elements';
import DateTimePicker from 'react-native-modal-datetime-picker';
import { TextField } from 'react-native-material-textfield';
import axios from 'axios';
import PropTypes from 'prop-types';
import { keys } from '../config';
import { styles, rowStyle } from './Styles';
import { typeIds } from '../SampleData/Types';
import moment from 'moment';


export default class Row extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      extraData: {},
      modalVisible: false,
      isDateTimePickerVisible: false,
      time: ''
    };

    this.openNewMap = this.openNewMap.bind(this);
    this.dislikeEvent = this.dislikeEvent.bind(this);
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this._showDateTimePicker = this._showDateTimePicker.bind(this);
    this._hideDateTimePicker = this._hideDateTimePicker.bind(this);
    this._handleDatePicked = this._handleDatePicked.bind(this);
    this.active = new Animated.Value(0);
  }

  componentWillMount() {
    if (this.props.data.placeId) {
      axios.get(`https://maps.googleapis.com/maps/api/place/details/json?placeid=${this.props.data.placeId}&key=${keys.googleMapsAPI}`)
        .then((res) => {
          this.setState({ extraData: res.data.result });
        })
        .catch(err => console.error('google api error', err));
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.active !== nextProps.active) {
      Animated.timing(this.active, {
        duration: 300,
        easing: Easing.bounce,
        toValue: Number(nextProps.active),
      }).start();
    }
  }

  openNewMap() {
    openMap({ latitude: this.props.data.latlng.lat, longitude: this.props.data.latlng.lng });
  }

  dislikeEvent() {
    this.state.extraData.types.forEach((type) => {
      if (typeIds[type]) {
        AsyncStorage.getItem('Token').then((res) => {
          const savedToken = JSON.parse(res);
          axios({
            method: 'post',
            url: 'http://18.218.102.64/user_like',
            headers: {
              authorization: savedToken,
              'Content-Type': 'application/json',
            },
            data: { id_type: typeIds[type], like: false },
          })
            .catch((err) => {
              console.error(`select interest post error ${err}`);
            });
        });
      }
    });
  }

  openModal() {
    this.setState({ modalVisible: true });
  }

  closeModal() {
    this.setState({ modalVisible: false });
  }

  _showDateTimePicker = () => this.setState({ isDateTimePickerVisible: true });

  _hideDateTimePicker = () => this.setState({ isDateTimePickerVisible: false });

  _handleDatePicked = time => {

    let startTime = moment(time).format('hh:mm a');
    this.setState({ time:startTime });
    
    this._hideDateTimePicker();
  };

  render() {
    const { data } = this.props;
    const text = this.state.text;
    const time  = this.state.time;
    const modalInfo = this.state.extraData || {};
    let openHoursText;

    if (modalInfo.opening_hours !== undefined || null) {
      openHoursText = modalInfo.opening_hours.weekday_text.map(item => (<Text key={item} >{item}</Text>));
    }

    
    data.startTime = this.state.time;
    
    return (
      <Animated.View style={[
          styles.row,
          rowStyle,
        ]}
      >
        <Icon
          name="plus-circle"
          type="font-awesome"
          color="#f50"
          style={{ padding: 2 }}
          onPress={() => {
            this.openModal()
            }
          }
        />
        <View>
          <Modal
            visible={this.state.modalVisible}

            animationType={'slide'}

            onRequestClose={() => this.closeModal()}
          >
            <View style={styles.modalContainer}>
              <View style={styles.innerContainer}>
                <Card title={modalInfo.name !== undefined ? modalInfo.name : '...loading'}> 
                  <Text>Phone Number: {'\n'} {modalInfo.formatted_phone_number !== undefined ? modalInfo.formatted_phone_number : '...loading'}{'\n'}</Text>
                  <Text>Address: {'\n'} {modalInfo.formatted_address !== undefined ? modalInfo.formatted_address : '...loading'}{'\n'}</Text>
                  <Text>Open Hours
                    {openHoursText}
                  </Text>
                  <View style={styles.timeContainer}>
                    <TouchableHighlight onPress={this._showDateTimePicker}>
                      <View style={styles.timeButton}>
                        <Text>Start Time for Your Event</Text>
                      </View>
                    </TouchableHighlight>
                    <DateTimePicker
                      mode='time'
                      isVisible={this.state.isDateTimePickerVisible}
                      onConfirm={(this._handleDatePicked)}
                      onCancel={this._hideDateTimePicker}
                      is24Hour='false'
                    />
                  </View>
                  <Button
                    raised
                    title="Open in Maps"
                    onPress={this.openNewMap}
                  />
                  <Button
                    raised
                    title="I'll pass on this event"
                    onPress={this.dislikeEvent}
                  />
                  <Button
                    raised
                    onPress={() =>  data.updateTimeLine( { data } )}
                    title="Add Event to my Trip"
                  />
                  <Button
                    raised
                    onPress={() => this.closeModal()}
                    title="Close modal"
                  />
                </Card>
              </View>
            </View>
          </Modal>
        </View>


        <View style={{ flex: 1 }}>
          <Text style={styles.text}>{data.name}</Text>
        </View>
        {/* <Image source={{uri: data.image}} style={styles.image} /> */}

      </Animated.View>
    );
  }
}
