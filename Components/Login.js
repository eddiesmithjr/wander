import React from 'react';
import { ImageBackground, Text, View, AsyncStorage, Image } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import axios from 'axios';
import { FormInput, Button } from 'react-native-elements';
import { NavigationActions } from 'react-navigation';
import PropTypes from 'prop-types';
import NYC from '../img/NYC.jpg';
import whiteLogo from '../img/whiteLogo.png';
import { styles } from './Styles';

export default class Login extends React.Component {
  constructor() {
    super();
    this.state = {
      email: '',
      password: '',
    };
    this.login = this.login.bind(this);
  }

  login() {
    // Get the stuff that we need for the login request
    const user = { email: this.state.email, password: this.state.password };
    // Make a request to the login route
    axios.post('http://18.218.102.64/login', user)
      .then((res) => {
        // If the password is incorrect, do some error handling
        if (res.data === 'User does not exist' || res.data === 'Password is incorrect') {
          alert('Sorry, there was a problem with your email/password combination. Please try again. Remember, email AND password are case sensitive');
        // Otherwise, save the token on the user's device and send them to the dashboard
        } else {
          const token = res.data.slice(4);
          AsyncStorage.setItem('Token', JSON.stringify(token));
          this.props.navigation
          // This prevents the user from having the ability to go back
            .dispatch(NavigationActions.reset({
              index: 0,
              actions:
                [NavigationActions.navigate({ routeName: 'Dashboard' })],
            }));
        }
      })
      .catch((err) => {
        console.error('Login error ', err);
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
        source={NYC}
      >
        <View style={{ justifyContent: 'center', alignItems: 'center' }} >
          <Image
            source={whiteLogo}
            style={{
              width: 300,
              height: 70,
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 80,
            }}
          />
        </View>
        <View style={{ height: 100 }} />
        <KeyboardAwareScrollView contentContainerStyle={styles.loginContainer}>
          <Text style={{ fontSize: 30, color: 'white', marginTop: 180 }}>email</Text>
          <FormInput
            keyboardType="email-address"
            style={styles.loginInput}
            inputStyle={{ color: 'white', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            onChangeText={text => this.setState({ email: text })}
            placeholder="enter email"
            placeholderTextColor="grey"
            autoCapitalize="none"
          />
          <Text style={{ fontSize: 30, color: 'white' }}>password</Text>
          <FormInput
            style={styles.loginInput}
            inputStyle={{ color: 'white', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            onChangeText={text => this.setState({ password: text })}
            placeholder="enter password"
            placeholderTextColor="grey"
            secureTextEntry
          />
          <View style={styles.loginButtonContainer}>
            <Button
              large
              raised
              buttonStyle={styles.loginButton}
              onPress={this.login}
              title="Log In"
              transparent
              underlayColor="rgba(255, 255, 255, 0.5)"
            />
            <Button
              large
              raised
              buttonStyle={styles.loginButton}
              onPress={() => this.props.navigation.navigate('Signup')}
              title="Sign Up"
              transparent
              underlayColor="rgba(255, 255, 255, 0.5)"
            />
          </View>
        </KeyboardAwareScrollView>
      </ImageBackground>
    );
  }
}

Login.navigationOptions = () => ({
  header: null,
});

Login.propTypes = {
  navigation: PropTypes.object,
};

