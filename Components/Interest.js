import React from 'react';
import { AsyncStorage } from 'react-native';
import { Button } from 'react-native-elements';
import axios from 'axios';
import PropTypes from 'prop-types';
import { icons } from '../SampleData/Types';
import { keys } from '../config';

export default class Interest extends React.Component {
  constructor(props) {
    super(props);
    this.selectInterest = this.selectInterest.bind(this);
    this.state = {
      // Keep track of whether or not a button has been selected
      status: false,
    };
  }

  selectInterest() {
    // Toggle the status so that the style changes
    this.setState({ status: !this.state.status });
    // Add an entry to the database showing that this user likes this type of event
    AsyncStorage.getItem('Token').then((res) => {
      const savedToken = JSON.parse(res);
      if (this.state.status) {
        axios({
          method: 'post',
          url: `${keys.devURI}/user_like`,
          headers: {
            authorization: savedToken,
            'Content-Type': 'application/json',
          },
          data: { id_type: this.props.type.id, like: true },
        })
          .catch(err => console.error(`select interest post error ${err}`));
      } else {
        axios({
          method: 'delete',
          url: `${keys.devURI}/user_like`,
          headers: {
            authorization: savedToken,
          },
          params: { id_type: this.props.type.id, like: false },
        })
          .catch(err => console.error(`select interest delete error ${err}`));
      }
    });
  }

  render() {
    return (
      <Button
        large
        flat
        buttonStyle={{
          backgroundColor: this.state.status ? '#0b81e8' : 'rgba(0,0,0,0.5)',
          width: '95%',
          marginVertical: 5,
          borderRadius: 10,
          marginTop: 10,
          borderColor: 'black',
          borderWidth: 2,
        }}
        onPress={this.selectInterest}
        icon={{ name: icons[this.props.type.name], type: 'font-awesome' }}
        title={this.props.name}
      />
    );
  }
}

Interest.propTypes = {
  name: PropTypes.string,
  type: PropTypes.object,
};
