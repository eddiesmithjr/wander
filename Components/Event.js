import React from 'react';
import { Button, View, ScrollView } from 'react-native';
import { MapView } from 'expo';
import { Header, Icon, Text } from 'react-native-elements';
import { NavigationActions } from 'react-navigation';
import PropTypes from 'prop-types';
import Schedule from './Schedule';
import { styles } from './Styles';

export default class Event extends React.Component {
  componentWillMount() {
    const seen = {};
    for (let i = 0; i < this.props.dayInfo.events.length; i++) {
      if (seen[this.props.dayInfo.events[i].name] || this.props.dayInfo.events[i].name === undefined) {
        this.props.dayInfo.events.splice(i, 1);
        i--;
      } else {
        seen[this.props.dayInfo.events[i].name] = true;
      }
    }
  }
  render() {
    // The way this page loads, we don't always have the events when this first runs
    // Declare eventMarkers so that it won't error rendering
    let eventMarkers;
    // A default starting point is New York City. It'll be reasigned later
    let startingPoint = {
      latitude: 40.741231,
      longitude: -74.00670099999999,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };
    this.props.dayInfo.events.forEach(event => {
      event.updateTimeLine = this.props.updateTimeLine;
      event.dayNumber = this.props.dayNumber;
    });
    // If we try to run the code in this if statement before we have events, it'll error out
    if (this.props.dayInfo.events.length) {
      // Pull out the locations that will show up on the map
      const eventCoordinates = this.props.dayInfo.events.map((event) => {
        if (event.latlng) {
          return {
            title: event.name,
            coordinates: { latitude: event.latlng.lat, longitude: event.latlng.lng },
          };
        }
      });
      // Create the pins for the map
      eventMarkers = eventCoordinates
        .map((coor) => {
          if (coor && coor.coordinates) {
            return (<MapView.Marker
              coordinate={coor.coordinates}
              title={coor.title}
              key={coor.title}
            />);
          }
        });
      // The starting point is just the first event in the list
      // They won't be perfectly centered, but close enough
      startingPoint = {
        latitude: eventCoordinates[1].coordinates.latitude,
        longitude: eventCoordinates[1].coordinates.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
    }
    return (
      <View style={styles.eventContainer}>
        <Header
          style={{ height: 35 }}
          statusBarProps={{ barStyle: 'light-content' }}
          outerContainerStyles={{ backgroundColor: 'black' }}
          centerComponent={{ text: 'wander', style: { color: 'white', fontSize: 28, height: 30 } }}
          leftComponent={<Icon
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

        <View style={{ width: 400, height: 200 }}>
          <MapView
            style={{ flex: 1 }}
            initialRegion={startingPoint}
          >
            {eventMarkers}
          </MapView>
        </View>

        <ScrollView>
          <Text h4 center> Here are your suggestions!</Text>
          {
            this.props.dayInfo.events.length ?
              <Schedule
                data={this.props.dayInfo}
              />
            :
              <Text>Loading</Text>
          }

          <Button
            title="Save your Trip Recommendations"
            onPress={this.props.saveSchedule}
          />
        </ScrollView>
      </View>
    );
  }
}

Event.propTypes = {
  saveSchedule: PropTypes.func,
  navigation: PropTypes.object,
  dayInfo: PropTypes.object,
};
