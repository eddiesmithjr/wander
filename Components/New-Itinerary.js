import React from 'react';
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  AsyncStorage,
  ImageBackground,
  ScrollView,
} from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Header, Text, Button, Icon } from 'react-native-elements';
import { NavigationActions } from 'react-navigation';
import DateTimePicker from 'react-native-modal-datetime-picker';
import axios from 'axios';
import PropTypes from 'prop-types';
import { keys } from '../config';
import eiffelTower from '../img/Paris.jpg';
import { getSchedule } from '../ScheduleMethods';
import { styles } from './Styles';
import { months, idTypes } from '../SampleData/Types';

export default class NewItinerary extends React.Component {
  constructor() {
    super();
    this.state = {
      // This is the actual start date displayed on the calendar
      startDate: new Date(),
      endDate: new Date(),
      startDateTimePickerVisible: false,
      endDateTimePickerVisible: false,
      destination: '',
      // This is the formatted start date that we pass to the schedule builder function
      functionStartDate: '',
      functionEndDate: '',
      loading: false,
    };
    this.getItinerary = this.getItinerary.bind(this);
    this.showStartDateTimePicker = this.showStartDateTimePicker.bind(this);
    this.showEndDateTimePicker = this.showEndDateTimePicker.bind(this);
    this.hideStartDateTimePicker = this.hideStartDateTimePicker.bind(this);
    this.hideEndDateTimePicker = this.hideEndDateTimePicker.bind(this);
    this.handleStartDatePicked = this.handleStartDatePicked.bind(this);
    this.handleEndDatePicked = this.handleEndDatePicked.bind(this);
    this.searchPlaces = this.searchPlaces.bind(this);
  }

  // Called when the user clicks the get itinerary button
  getItinerary() {
    // Get the necessary bits from the state
    const { destination, functionStartDate, functionEndDate } = this.state;
    // Add a loading circle, so that the user knows something's happening
    this.setState({ loading: true });
    // Get the token from storage...
    AsyncStorage.getItem('Token')
      .then((res) => {
        // Make a request to get the user's likes
        axios.get(`${keys.devURI}/user/likes`, {
          headers: { authorization: JSON.parse(res) },
        })
          .then((userLikes) => {
            const filteredLikes = userLikes.data.map(like => ({ type: idTypes[like.id_type], like: like.like }));
            // Call the schedule builder function
            getSchedule(functionStartDate, functionEndDate, destination, filteredLikes, (schedule) => {
              this.setState({ loading: false });
              // Send the user to the edit Itinerary view with the returned schedule
              this.props.navigation.navigate('Itinerary', { dayInfo: schedule });
            });
          })
          .catch(err => console.error(err));
      });
  }

  showStartDateTimePicker() {
    this.setState({ startDateTimePickerVisible: true });
  }

  showEndDateTimePicker() {
    this.setState({ endDateTimePickerVisible: true });
  }

  hideStartDateTimePicker() {
    this.setState({ startDateTimePickerVisible: false });
  }

  hideEndDateTimePicker() {
    this.setState({ endDateTimePickerVisible: false });
  }

  handleStartDatePicked(startDate) {
    // I could pull in Moment, but this is easier
    const formattedDate = `${months[startDate.getMonth()]} ${startDate.getDate()}, ${startDate.getFullYear()} 00:00:00`;
    this.setState({ startDate });
    this.setState({ functionStartDate: formattedDate });
    this.hideStartDateTimePicker();
  }

  handleEndDatePicked(endDate) {
    const formattedDate = `${months[endDate.getMonth()]} ${endDate.getDate()}, ${endDate.getFullYear()} 00:00:00`;
    this.setState({ endDate });
    this.setState({ functionEndDate: formattedDate });
    this.hideEndDateTimePicker();
  }

  searchPlaces(destination) {
    // We need the city name to be in a very specific format for Google: New+York+City
    destination = destination.description
      .split('')
      .slice(0, destination.description.indexOf(','))
      .join('')
      .split(' ')
      .join('+');
    this.setState({ destination });
  }

  render() {
    return (
      <ImageBackground
        style={styles.newItineraryImageBackground}
        imageStyle={{ opacity: 0.35 }}
        source={eiffelTower}
      >
        <View style={styles.newItineraryContainer}>
          <Header
            statusBarProps={{ barStyle: 'light-content' }}
            outerContainerStyles={{ backgroundColor: 'black', width: '100%' }}
            centerComponent={{ text: 'wander', style: { color: 'white', fontSize: 30 } }}
            leftComponent={
              <Icon
                name="home"
                color="white"
                onPress={() => this.props.navigation
                .dispatch(NavigationActions.reset({
                  index: 0,
                  actions:
                    [NavigationActions.navigate({ routeName: 'Dashboard' })],
                }))}
              />}
          />
          <View style={styles.newItineraryContainer}>
            <GooglePlacesAutocomplete
              placeholder="Where are you Wandering?"
              minLength={2}
              autoFocus={false}
              returnKeyType="search"
              query={{
                key: keys.googlePlacesAPI,
                language: 'en',
                types: '(cities)',
              }}
              styles={{
              textInputContainer: {
                width: '100%',
                marginBottom: 10,
              },
              description: {
                fontWeight: 'bold',
              },
              predefinedPlacesDescription: {
                color: '#1faadb',
              },
              }}
              debounce={200}
              onPress={this.searchPlaces}
            />
            <ActivityIndicator
              size="large"
              color="#0000ff"
              animating={this.state.loading}
            />
            <Text style={{ justifyContent: 'center', fontWeight: 'bold', fontSize: 18 }} >{this.state.destination.split('+').join(' ')}</Text>
            <Text h4>When are you leaving?</Text>
            <TouchableOpacity onPress={this.showStartDateTimePicker}>
              <Text style={{ color: 'black', fontSize: 20 }}>Select a date</Text>
            </TouchableOpacity>
            <DateTimePicker
              isVisible={this.state.startDateTimePickerVisible}
              onConfirm={this.handleStartDatePicked}
              onCancel={this.hideStartDateTimePicker}
            />
            <Text>{`${months[this.state.startDate.getMonth()]} ${this.state.startDate.getDate()}`}</Text>
            <Text h4>When do you come back?</Text>
            <TouchableOpacity onPress={this.showEndDateTimePicker}>
              <Text style={{ color: 'black', fontSize: 20 }}>Select a date</Text>
            </TouchableOpacity>
            <DateTimePicker
              isVisible={this.state.endDateTimePickerVisible}
              onConfirm={this.handleEndDatePicked}
              onCancel={this.hideEndDateTimePicker}
            />
            <Text>{`${months[this.state.endDate.getMonth()]} ${this.state.endDate.getDate()}`}</Text>
            <View style={styles.newItineraryContainer}>
              <Button
                large
                flat
                color="white"
                buttonStyle={styles.newItineraryButton}
                title="Get my itinerary"
                onPress={this.getItinerary}
                underlayColor="rgba(255, 255, 255, 0.5)"
              />
            </View>
            <View style={styles.newDashboardContainer}>
              <Button
                large
                flat
                color="white"
                buttonStyle={styles.dashboardButton}
                title="Go to Dashboard"
                onPress={() => this.props.navigation.navigate('Dashboard')}
                underlayColor="rgba(255, 255, 255, 0.5)"
              />
            </View>
          </View>
        </View>
      </ImageBackground>
    );
  }
}

NewItinerary.navigationOptions = () => ({
  header: null,
});

NewItinerary.propTypes = {
  navigation: PropTypes.object,
};
