import React from 'react';
import { ImageBackground, AsyncStorage, Image, View, Text } from 'react-native';
import PropTypes from 'prop-types';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { FormInput, Button } from 'react-native-elements';
import axios from 'axios';
import { NavigationActions } from 'react-navigation';
import Chicago from '../img/Chicago.jpg';
import whiteLogo from '../img/whiteLogo.png';
import { styles } from './Styles';
import { keys } from '../config';

export default class Signup extends React.Component {
  constructor() {
    super();
    this.state = {
      email: '',
      password: '',
      username: '',
    };
    this.signup = this.signup.bind(this);
  }
  signup() {
    // We only need email, password, and username to create a user
    const user = {
      email: this.state.email,
      password: this.state.password,
      username: this.state.username,
    };
    axios.post(`${keys.devURI}/signup`, user)
      .then((res) => {
        // If the user wasn't created, give the user the option to try again
        if (res.data === 'User was not created') {
          alert('There was a problem. Please try again');
        // Otherwise, save their token and send them to GatherInterests
        } else {
          AsyncStorage.setItem('Token', JSON.stringify(res.data));
          this.props.navigation
            .dispatch(NavigationActions.reset({
              index: 0,
              actions:
                [NavigationActions.navigate({ routeName: 'GatherInterests' })],
            }));
        }
      })
      .catch((err) => {
        console.error('signup error ', err);
      });
  }
  render() {
    return (
      <ImageBackground
        style={{
          backgroundColor: '#000000',
          flex: 1,
          position: 'absolute',
          width: '100%',
          height: '100%',
          justifyContent: 'center',
        }}
        source={Chicago}
      >
        <View style={{ justifyContent: 'center', alignItems: 'center'}} >
          <Image
            source={whiteLogo}
            style={{
              width: 300,
              height: 70,
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 50,
            }}
          />
        </View>
        <KeyboardAwareScrollView contentContainerStyle={styles.signupContainer}>
          <Text style={{ fontSize: 30, color: 'white' }}>email</Text>
          <FormInput
            style={styles.signupFormInput}
            keyboardType="email-address"
            onChangeText={text => this.setState({ email: text })}
            placeholder="Enter your email address"
            placeholderTextColor="grey"
            autoCapitalize="none"
            inputStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', color: 'white' }}
          />
          <Text style={{ fontSize: 30, color: 'white' }}>username</Text>
          <FormInput
            style={styles.signupFormInput}
            placeholder="Enter a username"
            placeholderTextColor="grey"
            onChangeText={text => this.setState({ username: text })}
            autoCapitalize="none"
            inputStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', color: 'white' }}
          />
          <Text style={{ fontSize: 30, color: 'white' }}>password</Text>
          <FormInput
            style={styles.signupFormInput}
            placeholder="Enter a password"
            placeholderTextColor="grey"
            secureTextEntry
            onChangeText={text => this.setState({ password: text })}
            inputStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', color: 'white' }}
          />
          <Button
            large
            raised
            buttonStyle={styles.signupButton}
            title="Create your account"
            onPress={this.signup}
            underlayColor="rgba(255, 255, 255, 0.5)"
          />
        </KeyboardAwareScrollView>
      </ImageBackground>
    );
  }
}

Signup.navigationOptions = () => ({
  header: null,
});

Signup.propTypes = {
  navigation: PropTypes.object,
};
