import React, { Component } from 'react';
import { View } from 'react-native';
import SortableList from 'react-native-sortable-list';
import PropTypes from 'prop-types';
import Row from './Row';
import { styles } from './Styles';

export default class Schedule extends Component {
  renderRow({ data, active }) {
    return <Row 
      data={data} 
      active={active} 
      key={data.name}
    />
  }

  render() {
    return (
      <View style={styles.scheduleContainer}>
        <SortableList
          style={styles.scheduleList}
          contentContainerStyle={styles.scheduleContentContainer}
          data={this.props.data.events}
          renderRow={this.renderRow}
        />
      </View>
    );
  }
}

Schedule.propTypes = {
  data: PropTypes.object,
};
