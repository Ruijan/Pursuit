import React from 'react';
import Account from '../../Account/Account';
import {LoggingView} from '../LoggingView';
// @ts-ignore
import Icon from 'react-native-vector-icons/FontAwesome';
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
  recording: boolean;
  error: string;
  timeSinceRecording: number;
};

export class HomeScreen extends React.Component<
  HomeScreenProps,
  HomeScreenState
> {
  private errorHandler: ErrorHandler;
  private account: Account;
  constructor(props: any) {
    super(props);
    this.state = {
      isLoggedIn: false,
      recording: false,
      error: '',
      timeSinceRecording: this.props.account.getTimeSinceRecording(),
    };
    this.errorHandler = this.props.errorHandler;
    this.account = this.props.account;
    this.connectionHandler = this.connectionHandler.bind(this);
    this.startRecording = this.startRecording.bind(this);
    this.account.addConnectionHandler(this.connectionHandler);
    this.account.addDisconnectHandler(this.connectionHandler);
  }

  componentDidMount() {
    let account = this.account;
    account
      .init()
      .then(() => {
        this.setState({
          isLoggedIn: account.isLoggedIn(),
        });
      })
      .catch(error => {
        this.setState({
          error: error.message,
        });
      });
  }

  connectionHandler() {
    console.log('Handling account connection in Home Screen');
    this.setState({
      isLoggedIn: this.account.isLoggedIn(),
    });
  }

  async startRecording(activityType: string) {
    try {
      await this.account.startRecording(activityType);
      this.setState({
        recording: true,
      });
    } catch (error: any) {
      this.setState({
        error: String(error),
      });
    }
  }
  stopRecording() {
    this.account.stopRecording();
  }

  render() {
    let error = (
      <View style={styles.errorContainer}>
        <Text>{this.state.error}</Text>
        <TouchableHighlight onPress={() => this.setState({error: ''})}>
          <Icon name="close" size={30} color="#900" />
        </TouchableHighlight>
      </View>
    );
    let view = (
      <ScrollView style={styles.scrollView}>
        {this.state.error && error}
        <LoggingView account={this.account} />
      </ScrollView>
    );
    if (this.state.isLoggedIn && !this.state.recording) {
      view = (
        <ScrollView style={styles.scrollView}>
          {this.state.error && error}
          <View style={styles.container}>
            <TouchableHighlight
              style={styles.submitButton}
              onPress={() => this.startRecording('DrivingRange')}>
              <View style={styles.button}>
                <Image source={drivingRangeIcon} style={styles.width50} />
                <Text style={styles.labelText}>Driving Range Session</Text>
              </View>
            </TouchableHighlight>
            <TouchableHighlight
              style={styles.submitButton}
              onPress={() => this.startRecording('GolfCourse')}>
              <View style={styles.button}>
                <Image source={golfIcon} style={styles.width50} />
                <Text style={styles.labelText}>Golf course outdoor</Text>
              </View>
            </TouchableHighlight>
            <TouchableHighlight
              style={styles.submitButton}
              onPress={() => this.startRecording('Generic')}>
              <View style={styles.button}>
                <Image source={workIcon} style={styles.width50} />
                <Text style={styles.labelText}>Generic Activity</Text>
              </View>
            </TouchableHighlight>
          </View>
          <Text style={styles.text}>Previous activities</Text>
        </ScrollView>
      );
    } else if (this.state.isLoggedIn && this.state.recording) {
      view = (
        <ScrollView style={styles.scrollView}>
          {this.state.error && error}
          <Text style={styles.labelText}>Recording for {}</Text>
          <View style={styles.container}>
            <TouchableHighlight style={styles.submitButton}>
              <View style={styles.button}>
                <Image source={workIcon} style={styles.width50} />
                <Text style={styles.labelText}>Add shot</Text>
              </View>
            </TouchableHighlight>
          </View>
          <View style={styles.container}>
            <TouchableHighlight
              style={styles.cancelButton}
              onPress={() => this.stopRecording()}>
              <View style={styles.button}>
                <Text style={styles.labelText}>StopRecording</Text>
              </View>
            </TouchableHighlight>
          </View>
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
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    marginTop: 15,
    backgroundColor: 'darkred',
    width: '80%',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    margin: 'auto',
    textAlign: 'center',
  },

  scrollView: {
    height: '100%',
    backgroundColor: '#010101',
  },
  errorContainer: {
    backgroundColor: 'red',
    borderRadius: 12,
    padding: 10,
    margin: 10,
    width: '75%',
    flexDirection: 'row',
    alignContent: 'space-between',
  },
});
