import React from 'react';
import Account from '../../Account/Account';
import {LoggingView} from '../LoggingView';
import {
  Image,
  Text,
  TouchableHighlight,
  View,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {ErrorHandler} from '../../ErrorHandler';
const drivingRangeIcon = require('../../assets/driving-range-icon.png');
const workIcon = require('../../assets/work.png');
const golfIcon = require('../../assets/18golf.png');

type HomeScreenProps = {account: Account; errorHandler: ErrorHandler};
type HomeScreenState = {
  isLoggedIn: boolean;
};

export class HomeScreen extends React.Component<
  HomeScreenProps,
  HomeScreenState
> {
  private errorHandler: any;
  private account: Account;
  constructor(props: any) {
    super(props);
    this.state = {
      isLoggedIn: false,
    };
    this.errorHandler = this.props.errorHandler;
    this.account = this.props.account;
    this.connect = this.connect.bind(this);
  }

  componentDidMount() {
    let account = this.account;
    account.init().then(() => {
      this.setState({
        isLoggedIn: account.isLoggedIn(),
      });
    });
  }

  connect() {
    this.setState({
      isLoggedIn: this.account.isLoggedIn(),
    });
  }

  render() {
    let view = (
      <LoggingView account={this.account} connectHandler={this.connect} />
    );
    if (this.state.isLoggedIn) {
      view = (
        <ScrollView style={{minHeight: 800, backgroundColor: '#010101'}}>
          <View style={styles.container}>
            <TouchableHighlight style={styles.submitButton}>
              <View style={styles.form}>
                <Image source={drivingRangeIcon} style={styles.width50} />
                <Text style={styles.labelText}>Driving Range Session</Text>
              </View>
            </TouchableHighlight>
            <TouchableHighlight style={styles.submitButton}>
              <View style={styles.form}>
                <Image source={golfIcon} style={styles.width50} />
                <Text style={styles.labelText}>Golf course outdoor</Text>
              </View>
            </TouchableHighlight>
            <TouchableHighlight style={styles.submitButton}>
              <View style={styles.form}>
                <Image source={workIcon} style={styles.width50} />
                <Text style={styles.labelText}>Generic Activity</Text>
              </View>
            </TouchableHighlight>
          </View>
          <Text style={styles.text}>Previous activities</Text>
          <View style={styles.container} />
        </ScrollView>
      );
    }
    return view;
  }
}

const styles = StyleSheet.create({
  width50: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  container: {
    backgroundColor: '#010101',
    color: '#fff',
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'space-around',
    columnGap: 10,
    rowGap: 10,
    marginTop: 10,
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    width: '100%',
    margin: 'auto',
    textAlign: 'left',
  },
  labelText: {
    color: '#fff',
    marginTop: 10,
    textAlign: 'center',
    width: '100%',
  },
  text: {
    backgroundColor: '#010101',
    color: 'white',
    paddingLeft: 10,
    marginTop: 30,
  },
  submitButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: '#1E1E1E',
    width: '40%',
  },
  form: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    margin: 'auto',
    textAlign: 'center',
  },
});
