//import liraries
import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Container, Content, Header, Left, Right, Body } from 'native-base';
import MapComponent from '../../components/MapComponent';
import { TextInput, FlatList, Button, Image } from 'react-native';
import { Feather, FontAwesome as Icon } from "@expo/vector-icons";
import SearchBar from '../../components/SearchBar';
import Feed from '../../components/Feed';

import { Permissions, Location } from 'expo';

// create a component
class HomeTab extends Component {
  constructor(props) {
    super(props)

    this.state = {
      locationText: '',
      result: '',
      inProgress: true,
      location: '',
      pinLocations: [],
      focusedPhoto: ''
    }

    this._attemptGeocodeAsync = this._attemptGeocodeAsync.bind(this);
  }

  // Defines the icon for the tab and the styles
  static navigationOptions = {
    tabBarIcon: ({ tintColor }) => (
      <Icon name="home" style={styles.tabBarIcon} />
    )
  }

  // Get the location when component mounts
  componentDidMount() {
    this._getLocationAsync();
  }

  // Function to check for permissions and get the current location's lat and long
  _getLocationAsync = async () => {
    this.setState({ inProgress: true });
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        locationResult: 'Permission to access location was denied',
        location,
      });
    }

    let location = await Location.getCurrentPositionAsync({});
    this.setState({ location: location });
    this.setState({ inProgress: false });
  };

  //gets the device's position and removes map pins from the previous location
  _attemptGeocodeAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        locationResult: 'Permission to access location was denied',
        location,
      });
    }

    const { locationText, result } = this.state;

    try {
      let result = await Location.geocodeAsync(this.state.locationText);
      if(result != undefined) {
        this.setState({ inProgress: true });
        this.setState({ location: { coords: { latitude: result[0].latitude, longitude: result[0].longitude } } });
      }
    } catch (e) {
      console.log(e);
    } finally {
      //remove old pins from map
      this.setState({pinLocations: []});
      this.setState({inProgress: false});
    }
  };

  // updates the search text to be used in the Google Maps search
  updateState = (text) => {
    this.setState({ locationText: text });
  }

  // update state with a new map pin
  addPinLocation(photoData) {
    var locationArray = photoData.location.split(" ");
    var pinLocation = {
      coords: {
        latitude: parseFloat(locationArray[0]),
        longitude: parseFloat(locationArray[1]),
      },
      id: photoData._id,
      title: photoData.title,
      description: photoData.description
    };
    var pinLocations = this.state.pinLocations;
    pinLocations.push(pinLocation);
    this.setState({pinLocations});
  }

  focusOnPhoto(id) {
    this.setState({focusedPhoto: id});
  }

  render() {
    return (
      <Container style={styles.container}>
        {/* Loads map and the feed once data has been received */}
        {
          this.state.inProgress 
            ? <Text>Loading</Text> 
            : <MapComponent 
                locationResult={this.state.location}
                pinLocations={this.state.pinLocations}
                focusedPhoto={this.state.focusedPhoto}
                focusOnPhoto={this.focusOnPhoto.bind(this)} 
              />
        }

        <SearchBar
          updateState={this.updateState}
          updateLocation={this._attemptGeocodeAsync}
        />

        {
          this.state.inProgress 
          ? <Text>Loading</Text> 
          : <Feed 
              location={this.state.location} 
              navigation={this.props.navigation}
              focusedPhoto={this.state.focusedPhoto}
              addPinLocation={this.addPinLocation.bind(this)}
              focusOnPhoto={this.focusOnPhoto.bind(this)} 
            />
        }

      </Container>
    );
  }
}

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  list: {
    justifyContent: 'center',
    flexDirection: 'row'
  },
  icon: {
    fontSize: 20,
    color: 'white'
  },
  tabBarIcon: {
    color: '#e8195b',
    fontSize: 20
  }
});

//make this component available to the app
export default HomeTab;