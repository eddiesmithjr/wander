
import React from 'react';
import { Text, View, StyleSheet, ImageBackground, AsyncStorage, Alert, Image, ScrollView } from 'react-native';
import { Button, Header, Icon } from 'react-native-elements';
// import { Button } from 'native-base';
import { NavigationActions } from 'react-navigation';
import axios from 'axios';
import PropTypes from 'prop-types';
import Trip from './Trip';
import goldenGate from '../img/GoldenGate.jpg';
import logo from '../img/whiteLogo.png'
import { styles } from './Styles';
import { keys } from '../config';
import { dashboardExample } from '../scheduleExample';
import { RNS3 } from 'react-native-aws3';
import { ImagePicker } from 'expo';

const s3Options = {
  keyPrefix: "uploads/",
  bucket: keys.s3Bucket,
  region: "us-east-2",
  accessKey: keys.s3AccessKey,
  secretKey: keys.s3SecretKey,
  successActionStatus: 201
}

const randId = () => {
  return Math.random().toString(36).substr(2, 10);
}

export default class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // Schedules the user is attending, as creator or attender
      schedules: [],
      // Schedules the user has been invited to, but has yet to accept
      invitedSchedules: [],
			avatarUrl: null
    };
    this.signout = this.signout.bind(this);
    this.acceptTrip = this.acceptTrip.bind(this);
    this.rejectTrip = this.rejectTrip.bind(this);
    this._pickImage = this._pickImage.bind(this);
  }

  componentWillMount() {
    // Get the authentication token from storage
    AsyncStorage.getItem('Token')
      // Make a request to get the user's schedules from the database
      .then(res => axios.get(`${keys.devURI}/dashboard`, { headers: { authorization: JSON.parse(res) } }))
      .then((res) => {
        // We only have the schedule id, so we need another request to get the name of each schedule
        res.data.forEach((userSchedule) => {
          axios.get(`${keys.devURI}/schedule/${userSchedule.id_schedule}`)
            .then((response) => {
              const schedule = response.data;
              // Once we have the extra information, we only need bits of it,
              // so we filter those out here
              const fullSchedule = {
                id: userSchedule.id_schedule,
                status: userSchedule.status,
                name: schedule.name,
              };
              // Users can be invitees, attenders, or creators, so we have to sort it accordingly
              if (fullSchedule.status === 'invited') {
                // Users will recieve an alert for these
                this.setState({
                  invitedSchedules: this.state.invitedSchedules.concat(fullSchedule),
                });
              } else if (fullSchedule.status === 'attending' || fullSchedule.status === 'creator') {
                // These will be listed as trips they're attending
                this.setState({ schedules: this.state.schedules.concat([fullSchedule]) });
              }
            })
            .catch(err => console.error('error', err));
        });
      })
      .catch(error => console.error('error', error));

			AsyncStorage.getItem('Token')
	      // Make a request to get the user's schedules from the database
	      .then(res => {
					// While we already have the token, we can get the user's profile picture in the same function
          axios.get(`${keys.devURI}/photo`, { headers: { authorization: JSON.parse(res) } })
						.then((response) => {
							let photo = response.data;
							console.log('photo', photo);
							if (photo) {
								this.setState({ avatarUrl: photo.url });
							}
						})
						.catch((error) => {
							console.error(error);
						});
				});
  }

  acceptTrip(trip) {
    // This route changes the user status from "invited" to "attending" in the database
    AsyncStorage.getItem('Token')
      .then((token) => {
        return axios({
          url: `${keys.devURI}/accept_invite`,
          method: 'post',
          headers: {
            authorization: JSON.parse(token),
            'Content-Type': 'application/json',
          },
          data: {
            accepted: 'true',
            scheduleId: trip.id,
          },
        })
      })
      .then(() => {
        // The trip is immediately added, so that they won't have to refresh to see it
        const newInvitedSchedules = this.state.invitedSchedules.slice(1) || [];
        this.setState({ invitedSchedules: newInvitedSchedules });
        this.setState({ schedules: this.state.schedules.concat(trip) });
      })
      .catch(err => console.error(err));
  }

  rejectTrip(trip) {
    // This route deletes the entry linking user and schedule
    AsyncStorage.getItem('Token')
      .then((token) => {
        return axios({
          url: `${keys.devURI}/accept_invite`,
          method: 'post',
          headers: {
            authorization: JSON.parse(token),
            'Content-Type': 'application/json',
          },
          data: {
            accepted: 'false',
            scheduleId: trip.id,
          },
        })
      })
      .then(() => {
        // The trip is immediately added, so that they won't have to refresh to see it
        const newInvitedSchedules = this.state.invitedSchedules.slice(1) || [];
        this.setState({ invitedSchedules: newInvitedSchedules });
        this.setState({ schedules: this.state.schedules.concat(trip) });
      })
      .catch(err => console.error(err));
  }

  signout() {
    // Destroys the token so that the user is no longer authorized
    AsyncStorage.removeItem('Token');
    // Take the user back to the login page without the ability to hit a back button
    this.props.navigation
      .dispatch(NavigationActions.reset({
        index: 0,
        actions:
          [NavigationActions.navigate({ routeName: 'Login' })],
      }));
  }

  _pickImage = async () => {
		// open the image picker
		const chosenImage = await ImagePicker.launchImageLibraryAsync({
			allowsEditing: true,
			aspect: [4, 3],
		});

    chosenImage.name = randId();	// we need to come up with a random id every time
    chosenImage.contentType = chosenImage.type;

		// save the image to S3
		RNS3.put(chosenImage, s3Options).then(response => {
		  if (response.status !== 201)
		    throw new Error('Failed to upload image to S3');

			const s3Photo = {
				url: response.body.postResponse.location
			};

      this.setState({ avatarUrl: s3Photo.url });

			AsyncStorage.getItem('Token')
				.then((res) => {
          axios.post(`${keys.devURI}/photo`, s3Photo, { headers: { authorization: JSON.parse(res) } })
						.catch((err) => console.error('Error posting image to db ', err));
				});
		});
	};

  render() {
    // First thing, we send the user an alert if they have a new schedule
    this.state.invitedSchedules.forEach((schedule) => {
      Alert.alert(
        'You\'ve been invited on a trip!',
        `Would you like to join this trip to ${schedule.name}?`,
        [
          { text: 'Yes!', onPress: () => this.acceptTrip(schedule) },
          { text: 'No thanks', onPress: () => this.rejectTrip(schedule) },
        ],
      );
    });
    // Build out the trip components from the schedules recieved from the database
    const trips = this.state.schedules
      .map(event =>
        (<Trip
          navigation={this.props.navigation}
          schedule={event}
          key={event.name}
        />));
    return (
      <ImageBackground
        style={styles.dashboardImageBackground}
        imageStyle={{ opacity: 0.4 }}
        source={goldenGate}
      >
        <Header
          statusBarProps={{ barStyle: 'light-content' }}
          outerContainerStyles={{ backgroundColor: 'black' }}
          centerComponent={{ text: 'wander', style: { color: 'white', fontSize: 30 } }}
          // leftComponent={<Icon
          //   name="home"
          //   color="white"
          // />
        />
        <ScrollView contentContainerStyle={styles.dashboardContainer}>
        <View style={styles.profileContainer}>
          <Text style={{ fontSize: 25, fontWeight: 'bold', alignItems: 'center' }}>Welcome Home!</Text>
          <View style={{ alignItems: 'center' }}>
					{this.state.avatarUrl && <Image style={{ width: 150, height: 150, borderRadius: 75 }} source={{ uri: this.state.avatarUrl }} />}
          <View>
            <Button
            small
            flat
            color="white"
            buttonStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', borderRadius: 10, marginTop: 10, alignItems: 'center', borderWidth: 1 }}
						icon={{name: 'pencil', type: 'font-awesome', color: "white"}}
            onPress={this._pickImage}
						title="Edit Photo"
            underlayColor="rgba(255, 255, 255, 0.5)"
					/>
          </View>
          <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Your upcoming trips:</Text>
            {trips}
          <View style={styles.newTripContainer}>
          <Button
            // large
            flat
            color="white"
            buttonStyle={styles.newTripButton}
            title="Plan a new trip"
            onPress={() => this.props.navigation.navigate('NewItinerary')}
            underlayColor="rgba(255, 255, 255, 0.5)"
          />
          </View>
          <View style={styles.QRContainer}>
          <Button
            // large
            flat
            color="white"
            buttonStyle={styles.QRButton}
            title="Scan a QR code"
            onPress={() => this.props.navigation.navigate('QRScanner')}
            underlayColor="rgba(255, 255, 255, 0.5)"
          />
          </View>
          </View>
          <View style={styles.signoutButtonContainer}>
          <Button
            // large
            flat
            color="white"
            buttonStyle={styles.signoutButton}
            title="Sign out"
            onPress={this.signout}
            underlayColor="rgba(255, 255, 255, 0.5)"
          />
          </View>
        </View>
        </ScrollView>
      </ImageBackground>
    );
  }
}

Dashboard.navigationOptions = () => ({
  header: null,
});

Dashboard.propTypes = {
  navigation: PropTypes.object,
};
