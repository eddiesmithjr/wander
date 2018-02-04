import { StyleSheet, Platform, Animated, Dimensions } from 'react-native';
import { Button, Header, Icon } from 'react-native-elements';

const window = Dimensions.get('window');

module.exports.styles = StyleSheet.create({
  // Dashboard page
  dashboardContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0)',
  },
  dashboardImageBackground: {
    backgroundColor: 'transparent',
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
  },

  profileContainer: {
    backgroundColor: 'rgba(0,0,0,0)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
  },

  profileButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 10,
    marginTop: 10,
    borderColor: 'black',
    borderWidth: 2,
    width: (window.width * 0.95),
  },

  viewTripContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  viewTripButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 10,
    alignSelf: 'flex-end',
    marginTop: 10,
    borderColor: 'black',
    borderWidth: 2,
    width: 150,
  },

  newTripContainer: {
    backgroundColor: 'rgba(0,0,0,0)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },

  newTripButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 10,
    marginTop: 10,
    borderColor: 'black',
    borderWidth: 2,
    width: (window.width * 0.95),
  },

  QRContainer: {
    backgroundColor: 'rgba(0,0,0,0)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
  },

  QRButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 10,
    marginTop: 10,
    borderColor: 'black',
    borderWidth: 2,
    width: (window.width * 0.95),
  },

  signoutContainer: {
    backgroundColor: 'rgba(0,0,0,0)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 35,
  },

  signoutButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 10,
    marginTop: 10,
    borderColor: 'black',
    borderWidth: 2,
    width: (window.width * 0.95),
  },
  // Event page
  eventContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // Login page
  loginContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0)',
  },
  loginButton: {
    borderRadius: 10,
    alignSelf: 'flex-end',
    marginTop: 10,
    borderColor: 'white',
    borderWidth: 1,
    width: 150,
  },
  loginInput: {
    marginTop: 4,
    color: 'white',
    textAlign: 'center',
  },
  loginButtonContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  // New Itinerary page

  newItineraryImageBackground: {
    backgroundColor: 'transparent',
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
  },

  newItineraryContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0)',
    alignItems: 'center',
    justifyContent: 'flex-end',
    // marginTop: 10,
  },

  newItineraryButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 10,
    marginTop: 10,
    borderColor: 'black',
    borderWidth: 2,
    width: (window.width * 0.95),
  },

  newDashboardContainer: {
    backgroundColor: 'rgba(0,0,0,0)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
		paddingBottom: 10
  },

  dashboardButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 10,
    marginTop: 10,
    borderColor: 'black',
    borderWidth: 2,
    width: (window.width * 0.95),
  },

  // Trip page
  tripContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0)',
  },
  tripModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(127, 127, 127, 0.89)',
  },
  tripModalText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
  tripModalButton: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  // Schedule page
  scheduleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',

    ...Platform.select({
      ios: {
        paddingTop: 20,
      },
    }),
  },
  scheduleList: {
    flex: 1,
  },
  scheduleContentContainer: {
    width: window.width,

    ...Platform.select({
      ios: {
        paddingHorizontal: 30,
      },

      android: {
        paddingHorizontal: 0,
      },
    }),
  },
  // GatherInterests page
  gatherInterestsContainer: {
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  gatherInterestsTitleText: {
    backgroundColor: '#fff',
    alignItems: 'center',
    fontSize: 60,
    fontWeight: 'bold',
  },
  gatherInterestsImageBackground: {
    backgroundColor: 'transparent',
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
  },

  // Signup page
  signupContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 200,
  },
  signupFormInput: {
    height: 40,
    width: 300,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 5,
  },
  signupButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.0)',
    borderRadius: 10,
    marginTop: 10,
    borderColor: 'white',
    borderWidth: 1,
    width: (window.width * 0.95),
  },
  // Row.js
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    height: 90,
    flex: 1,
    marginTop: 7,
    marginBottom: 12,
    borderRadius: 25,

    ...Platform.select({
      ios: {
        width: window.width - 30 * 2,
        shadowColor: 'rgba(0,0,0,0.2)',
        shadowOpacity: 1,
        shadowOffset: { height: 2, width: 2 },
        shadowRadius: 2,
      },

      android: {
        width: window.width - 30 * 2,
        elevation: 0,
        marginHorizontal: 30,
      },
    }),
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222222',
    alignItems: 'center',
    padding: 10,
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(127, 127, 127, 0.75)',
  },
  innerContainer: {
    alignItems: 'center',
  },
});

this.active = new Animated.Value(0);

module.exports.rowStyle = {
  ...Platform.select({
    ios: {
      transform: [{
        scale: this.active.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.1],
        }),
      }],
      shadowRadius: this.active.interpolate({
        inputRange: [0, 1],
        outputRange: [2, 10],
      }),
    },

    android: {
      transform: [{
        scale: this.active.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.07],
        }),
      }],
      elevation: this.active.interpolate({
        inputRange: [0, 1],
        outputRange: [2, 6],
      }),
    },
  }),
};
