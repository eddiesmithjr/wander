import React from 'react';
import { Text, AsyncStorage } from 'react-native';
import Swiper from 'react-native-swiper';
import axios from 'axios';
import PropTypes from 'prop-types';
import Event from './Event';
import { keys } from '../config';

export default class Itinerary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      itinerary: {},
      timeLine: {},
    };
    this.goToDashboard = this.goToDashboard.bind(this);
    this.saveSchedule = this.saveSchedule.bind(this);
    this.updateTimeLine = this.updateTimeLine.bind(this);
  }

  componentWillMount() {
    // Creating a helper function to get the event information when we have the event id
    const getDaySchedule = (dayArr, cb) => Promise.all(dayArr.map(event => axios.get(`${keys.devURI}/event/${event.id}`)))
      .then((res) => {
        // res is an array holding the response objects from each of the calls to the database
        // They're not formatted correctly, so we map through them here and pull out what we need
        const fullDayArr = res.map((obj) => {
          const result = obj.data;
          result.latlng = { lat: obj.data.latitude, lng: obj.data.longitude };
          result.placeId = obj.data.googleId;
          delete result.latitude;
          delete result.longitude;
          return result;
        });
        // Put in a callback to handle the async call
        cb(fullDayArr);
      })
      .catch(err => console.error(err));
    // We're getting data two different ways: from the database or direct from the schedule builder
    // If it's from the function, follow the first path
    if (this.props.navigation.state.params.dayInfo.day_1.events) {
      this.setState({ itinerary: this.props.navigation.state.params.dayInfo }, () => {
        const timeLine = {};
        Object.keys(this.state.itinerary).forEach((key) => {
          if (key.slice(0, 3) === 'day') {
            timeLine[key] = { events: [], date: this.state.itinerary[key].date };
          } else {
            timeLine[key] = this.state.itinerary[key];
          }
        });
        this.setState({ timeLine });
      });
    // If the data comes from the db, we're following this path
    } else {
      // We need to format the data so that it looks like it does coming back from schedule builder
      // Doing some backflips to make that happen. Check out scheduleExample.js to see the format
      const schedule = Object.keys(this.props.navigation.state.params.dayInfo)
        .reduce((seed, item) => {
          seed[item] = { events: [] };
          return seed;
        }, {});
      Object.keys(this.props.navigation.state.params.dayInfo)
        .forEach((day) => {
          getDaySchedule(this.props.navigation.state.params.dayInfo[day], (response) => {
            schedule[day].events = response;
            this.setState({ itinerary: schedule }, () => {
              const timeLine = {};
              Object.keys(this.state.itinerary).forEach((key) => {
                if (key.slice(0, 3) === 'day') {
                  timeLine[key] = { events: [], date: this.state.itinerary[key].date };
                } else {
                  timeLine[key] = this.state.itinerary[key];
                }
              });
              this.setState({ timeLine });
            });
          });
        });
    }
  }

  goToDashboard() {
    this.props.navigation.navigate('Dashboard');
  }

  updateSchedule(schedule) {
    this.setState({ itinerary: schedule });
  }

  updateTimeLine(event) {
    const newTimeLine = this.state.timeLine;
    newTimeLine[event.data.dayNumber].events.push(event.data);
    this.setState({ timeLine: newTimeLine });
  }

  saveSchedule() {
    // Here, we send the information to the db to be saved
    AsyncStorage.getItem('Token').then((res) => {
      const savedToken = JSON.parse(res);
      axios({
        method: 'post',
        url: `${keys.devURI}/user/schedule`,
        headers: {
          authorization: savedToken,
          'Content-Type': 'application/json',
        },
        data: { schedule: this.state.timeLine },
      })
      // Send the user back to the dashboard once the schedule is saved
        .then(() => this.props.navigation.navigate('Dashboard'))
      // If there was an issue, keep them on the same page and let them hit save again
        .catch(err => console.error('schedule post error', err));
    });
  }

  render() {
    // Create the event components from the dayinfo
    const eventViews = Object.keys(this.state.itinerary)
      .filter(item => item[0] === 'd')
      .map(day =>
        (<Event
          dayInfo={this.state.itinerary[day]}
          key={day}
          navigation={this.props.navigation}
          // The saveSchedule function has to be called later
          saveSchedule={this.saveSchedule}
          updateTimeLine={this.updateTimeLine}
          dayNumber={day}
        />));
      // I think that the only thing that can exist in the swiper view is the swiper itself
    return (
      <Swiper>
        {eventViews || <Text>Loading...</Text>}
      </Swiper>
    );
  }
}

Itinerary.navigationOptions = () => ({
  header: null,
});

Itinerary.propTypes = {
  navigation: PropTypes.object,
};
