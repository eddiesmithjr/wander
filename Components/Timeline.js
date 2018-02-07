import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Timeline from 'react-native-timeline-listview';
import Swiper from 'react-native-swiper';
import axios from 'axios';
import { keys } from '../config';


const stylesTimeline = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 65,
    backgroundColor: 'white',
  },
  list: {
    flex: 1,
    marginTop: 20,
  },
});

export default class TimelineExample extends Component {
  constructor(props) {
    super(props);
    this.state = {
      itinerary: {},
    };
    // this.data = {
    //   day_1:
    //     [
    //       { time: '09:00 am', title: 'Fitroy Place', description: 'rating: 5', circleColor: '#009688', lineColor: '#009688' },
    //       { time: '10:45 am', title: 'Hangar 61', description: 'rating: 5' },
    //       { time: '12:00 pm', title: 'Tropical Discovery', description: 'rating: 4.8' },
    //       { time: '2:00 pm', title: 'Ace Express Coaches Casino Bus', description: 'rating 4.7', lineColor: '#009688' },
    //       { time: '3:30 pm', title: 'Baker Historic District', description: 'rating: 5', circleColor: '#009688' }
    //     ],
    //   day_2:
    //     [
    //       { time: '9:00 am', title: 'Fitroy Place', description: 'rating: 4.3', circleColor: '#009688', lineColor: '#009688' },
    //       { time: '10:30 am', title: 'Coloardo State Capital', description: 'rating: 5' },
    //       { time: '12:00 pm', title: 'Devner Cafe and Casino', description: 'rating: 4.7' },
    //       { time: '3:00 pm', title: 'Lakeside Amusement Park', description: 'rating: 5', lineColor: '#009688' },
    //       { time: '7:30 pm', title: 'Baker Historic District', description: 'rating 4.9', circleColor: '#009688' }
    //     ],
    //   day_3:
    //     [
    //       { time: '8:30 am', title: 'Clyfford Still Museum', description: 'rating: 4.5', circleColor: '#009688', lineColor: '#009688' },
    //       { time: '10:45 am', title: 'Clear Creek', description: 'rating: 4.8' },
    //       { time: '12:00 pm', title: 'Larmimeer Square', description: 'rating: 5' },
    //       { time: '3:00 pm', title: 'Museum of Contemporary Art', description: 'rating: 4.6', lineColor: '#009688' },
    //       { time: '7:30 pm', title: 'Red Rocks Ampitheatre', description: 'rating 5', circleColor: '#009688' }
    //     ],
    // };
  }

  componentWillMount() {
    const getDaySchedule = (dayArr, cb) => Promise.all(dayArr.map(event => axios.get(`${keys.devURI}/event/${event.id_event}`)))
      .then((res) => {
        const fullDayArr = res.map((obj) => {
          const result = {};
          result.time = obj.data.startTime;
          result.title = obj.data.name;
          result.circleColor = '#009688';
          result.lineColor = '#009688';
          return result;
        });
        // Put in a callback to handle the async call
        cb(fullDayArr);
      })
      .catch(err => console.error(err));
    const schedule = Object.keys(this.props.navigation.state.params.dayInfo)
      .reduce((seed, item) => {
        seed[item] = { events: [] };
        return seed;
      }, {});

    Object.keys(this.props.navigation.state.params.dayInfo)
      .forEach((day) => {
        getDaySchedule(this.props.navigation.state.params.dayInfo[day], (response) => {
          schedule[day].events = response;
          this.setState({ itinerary: schedule }, () => console.log(this.state.itinerary));
        });
      });
  }

  render() {
    return (<Text>Itinerary</Text>);
    const scheduleView = Object.keys(this.data)
      .filter(item => item[0] === 'd')
      .map(day => (
        <View style={stylesTimeline.container}>
          <Timeline
            style={stylesTimeline.list}
            data={this.data[day]}
            circleSize={20}
            circleColor="rgb(45,156,219)"
            lineColor="rgb(45,156,219)"
            timeContainerStyle={{ minWidth: 52, marginTop: -5 }}
            timeStyle={{
              textAlign: 'center',
              backgroundColor: '#ff9797',
              color: 'white',
              padding: 5,
              borderRadius: 13,
            }}
            descriptionStyle={{ color: 'gray' }}
            options={{
              style: { paddingTop: 5 },
            }}
            innerCircle="dot"
          />
        </View>
      ));
    return (
      <Swiper>
        {scheduleView || <Text>Your Timeline is loading...</Text>}
      </Swiper>
    );
  }
  }
}
