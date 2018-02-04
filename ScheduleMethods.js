const axios = require('axios');
const { keys } = require('./config');
const { exampleSchedule } = require('./scheduleExample');

// Helper function to get the distance between two locations with lat/lng
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const radlat1 = Math.PI * lat1 / 180;
  const radlat2 = Math.PI * lat2 / 180;
  const theta = lon1 - lon2;
  const radtheta = Math.PI * theta / 180;
  let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1)
    * Math.cos(radlat2) * Math.cos(radtheta);
  dist = Math.acos(dist);
  dist = dist * 180 / Math.PI;
  dist = dist * 60 * 1.1515;
  dist *= 1.609344;
  return dist;
};

// Helper funtion to sort all events based on distance from one event
// Could be improved
const sortByDistance = (googleData) => {
  let sortedByDistance = googleData.slice(1);
  sortedByDistance.forEach((event) => {
    event.distanceFromTopRated = calculateDistance(
      googleData[0].latlng.lat,
      googleData[0].latlng.lng,
      event.latlng.lat,
      event.latlng.lng,
    );
  });
  sortedByDistance = sortedByDistance.sort((a, b) =>
    a.distanceFromTopRated - b.distanceFromTopRated);

  sortedByDistance.unshift(googleData[0]);
  return sortedByDistance;
};

// Finds the closest restaurant to the target event
const findRestaurant = (location, placed, restaurants) => {
  restaurants.forEach(restaurant =>
    calculateDistance(
      location.latlng.lat,
      location.latlng.lng,
      Number(restaurant.restaurant.location.latitude),
      Number(restaurant.restaurant.location.longitude),
    ));
  const sorted = restaurants.sort((a, b) => a.distanceFromTopRated - b.distanceFromTopRated);
  const result = {
    name: sorted[0].restaurant.name,
    location: {
      latitude: Number(sorted[0].restaurant.location.latitude),
      longitude: Number(sorted[0].restaurant.location.longitude),
    },
  };
  sorted.splice(0, 1);
  return result;
};

// Sorts schedule based on the possibility that a person will like an event
const sortScheduleByLikes = (scheduleDayEvents, userLikes) => {
  const likes = [];
  const dislikes = [];
  userLikes.forEach((likeObj) => {
    if (likeObj.like === true) {
      likes.push(likeObj.type);
    } else if (likeObj.like === false) {
      dislikes.push(likeObj.type);
    }
  });

  scheduleDayEvents.forEach((event) => {
    event.types.forEach((type) => {
      if (likes.includes(type)) {
        event.rating += 1;
      } else if (dislikes.includes(type)) {
        event.rating -= 1;
      }
    });
    delete event.types;
  });
  return scheduleDayEvents.sort((a, b) => b.rating - a.rating);
};

// Since we're querying Google multiple times, we end up with duplicates. This filters them
const filterAndRemoveDuplicates = (data) => {
  const filteredData = data.map(loc => ({
    name: loc.name,
    placeId: loc.place_id,
    rating: loc.rating,
    latlng: loc.geometry.location,
    types: loc.types,
  }));
  const seenNames = {};
  filteredData.forEach((event, i) => {
    if (seenNames[event.name]) {
      filteredData.splice(i, 1);
    } else {
      seenNames[event.name] = true;
    }
  });
  return filteredData;
};

const buildLiveEvent = predictHQEvent => ({
  name: predictHQEvent.title,
  latlng: {
    lat: predictHQEvent.location[1],
    lng: predictHQEvent.location[0],
  },
});

// Here's where the magic happens
const scheduleBuilder = (startDate, endDate, google, restaurantData, predictHQ, location, userLikes) => {
  startDate = new Date(startDate);
  endDate = new Date(endDate);
  const filteredData = filterAndRemoveDuplicates(google);
  const sorted = sortByDistance(filteredData);

  // Get the start day so that it can be changed without updating the original reference
  const currentDate = startDate;

  // Initialize the empty schedule object
  const schedule = {};

  // Get the total number of days that the user will be in the destination
  const numberOfDays =
    Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  // Fill the schedule with "day" objects
  for (let i = 1; i < numberOfDays + 2; i += 1) {
    schedule[`day_${i}`] = {};
  }

  const googleLength = google.length;

  // Go through each day, fill it out with events
  const days = Object.keys(schedule);
  days.forEach((day) => {
    schedule[day].events = sorted.splice(0, Math.floor(googleLength / (numberOfDays + 1)));
    schedule[day].liveEvents = [];
    schedule[day].restaurants = [];
    predictHQ.forEach((event, i) => {
      if (new Date(event.start).getDate() === currentDate.getDate()) {
        schedule[day].liveEvents.push(buildLiveEvent(event));
        predictHQ.splice(i, 1);
      }
    });
    for (let i = 0; i < 4; i++) {
      schedule[day].restaurants.push(findRestaurant(schedule[day].events[0], 0, restaurantData));
    }
    schedule[day].date = new Date(currentDate).toString();
    currentDate.setDate(currentDate.getDate() + 1);
    schedule[day].events = sortScheduleByLikes(schedule[day].events, userLikes);
  });
  schedule.name = location.split('+').join(' ');
  return schedule;
};

// This handles all the async calls to APIs and puts data into the schedule builder
module.exports.getSchedule = (startDate, endDate, query, userLikes, cb) => {
  let googleData = [];
  axios.get(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}+point+of+interest&language=en&key=${keys.googlePlacesAPI}`)
    .then((response1) => {
      googleData = googleData.concat(response1.data.results);
      return Promise.all([
        axios.get(`https://maps.googleapis.com/maps/api/place/textsearch/json?pagetoken=${response1.data.next_page_token}&key=${keys.googlePlacesAPI}`),
        axios.get(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}+landmarks&language=en&key=${keys.googlePlacesAPI}`),
        axios.get(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}+casinos&language=en&key=${keys.googlePlacesAPI}`),
      ]);
    })
    .then(([response2, landmarks, casinos]) => {
      googleData = googleData.concat(landmarks.data.results);
      googleData = googleData.concat(casinos.data.results);
      if (response2.data.results.length) {
        googleData = googleData.concat(response2.data.results);
      }
      return Promise.all([
        axios.get(`https://maps.googleapis.com/maps/api/place/textsearch/json?pagetoken=${response2.data.next_page_token}&key=${keys.googlePlacesAPI}`),
        axios.get(`https://api.predicthq.com/v1/events/?category=concerts,festivals,performing-arts,sports&within=10mi@${googleData[0].geometry.location.lat},${googleData[0].geometry.location.lng}.0060&start.gte=2018-02-11&start.lte=2018-02-17&rank_level=4,5`, { headers: { Authorization: `Bearer ${keys.predictHQToken}` } }),
        axios.get(`https://developers.zomato.com/api/v2.1/search?lat=${googleData[0].geometry.location.lat}&lon=${googleData[0].geometry.location.lng}&sort=rating`, { headers: { 'user-key': keys.zomato } }),
        axios.get(`https://maps.googleapis.com/maps/api/place/textsearch/json?pagetoken=${landmarks.data.next_page_token}&key=${keys.googlePlacesAPI}`),
      ]);
    })
    .then(([response3, predictHQ, zomato, landmarks2]) => {
      if (response3.data.results.length) {
        googleData = googleData.concat(response3.data.results);
      }
      if (landmarks2.data.results.length) {
        googleData = googleData.concat(landmarks2.data.results);
      }
      cb(scheduleBuilder(
        startDate,
        endDate,
        googleData,
        zomato.data.restaurants,
        predictHQ.data.results,
        query,
        userLikes,
      ));
    })
    .catch(err => console.error(err));
};

// This is a more proper ML algorithm. However, we don't have enough data to implement it.
// Will be plugged in once we do have enough data
const properSort = (scheduleEvent, userLikes) => {
  let allUserLikes;
  const summaryArr = [];
  // Query the database for all users who have liked/disliked each event on the schedule
  // Something like:
  // axios.get(`http://18.218.102.64/allUserLikes`)
  //  .then(likes => allUserLikes = likes)
  //  .catch(err => console.error(err));
  // Retrieve this format:
  // [
  //   {
  //     userId: 1,
  //     likes: {
  //       'The Empire State Building': true,
  //       'Central Park': false,
  //       'Some other place': true,
  //     }
  //   }
  //   {
  //     userId: 1,
  //     likes: {
  //       'The Empire State Building': true,
  //       'Central Park': false,
  //       'Some other place': true,
  //     }
  //   }
  // ]

  const findUserIntersection = (user1, user2) => {
    let similarity = 1;
    let dissimilarity = 1;
    let totalIntersection = 0;
    const user1likes = Object.keys(user1.likes);
    user1likes.forEach((like) => {
      if (user1.likes[like] === true && user2.likes[like] === true) {
        similarity++;
        total++;
      } else if (user1.likes[like] === false && user2.likes[like] === false) {
        similarity++;
        total++;
      } else if (user1.likes[like] === true && user2.likes[like] === false) {
        dissimilarity++;
        total++;
      } else if (user1.likes[like] === false && user2.likes[like] === true) {
        dissimilarity++;
        total++;
      }
    });
    return (similarity - dissimilarity) / totalIntersection;
  };

  allUserLikes.forEach((user) => {
    summaryArr.push(findUserIntersection(userLikes, user));
  });
  const reduced = summaryArr.reduce((seed, element) => { 
    return seed + element;
  }, 0);
  scheduleEvent.rating = reduced / summaryArr.length;
};

// This can be used for testing purposes
// const exampleLikes = [
//   { type: 'museum', like: false },
//   { type: 'art_gallery', like: false },
//   { type: 'point_of_interest', like: false },
//   { type: 'night_club', like: true },
//   { type: 'park', like: false },
//   { type: 'zoo', like: false },
//   { type: 'casinos', like: true },
// ];
// const exampleLikes = [
//   { type: 'museum', like: true },
//   { type: 'art_gallery', like: true },
//   { type: 'point_of_interest', like: true },
//   { type: 'night_club', like: false },
//   { type: 'park', like: true },
//   { type: 'zoo', like: false },
//   { type: 'casinos', like: false },
// ];
// const start = new Date('February 10, 2018 00:00:00');
// const end = new Date('Febrauary 13, 2018 00:00:00');
// const query = 'Las+Vegas';

// module.exports.getSchedule(start, end, query, exampleLikes, response => console.log(response.day_1.events));
