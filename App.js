import React from 'react';
import { StackNavigator } from 'react-navigation';
import Dashboard from './Components/Dashboard';
import Login from './Components/Login';
import GatherInterests from './Components/Gather-Interests';
import Itinerary from './Components/Itinerary';
import NewItinerary from './Components/New-Itinerary';
import Signup from './Components/Signup';
import QRScanner from './Components/QRScanner';
import Timeline from './Components/Timeline';

console.disableYellowBox = true;

const App = StackNavigator({
  Login: { screen: Login },
  Signup: { screen: Signup },
  GatherInterests: { screen: GatherInterests },
  Dashboard: { screen: Dashboard },
  NewItinerary: { screen: NewItinerary },
  Itinerary: { screen: Itinerary },
  QRScanner: { screen: QRScanner },
  Timeline: { screen : Timeline }
});

export default App;
