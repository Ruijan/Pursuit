import React from 'react';
import PursuitAccount from '../../Account/PursuitAccount';
import {LoggingView} from '../LoggingView';
// @ts-ignore
import Icon from 'react-native-vector-icons/FontAwesome5';
import {Image, Text, TouchableHighlight, View, ScrollView} from 'react-native';
import {ErrorHandler} from '../../ErrorHandler';
const drivingRangeIcon = require('../../assets/driving-range-icon.png');
const golfIcon = require('../../assets/18golf.png');
import styles from '../../styles/Styles';
// @ts-ignore
import Ionicons from 'react-native-vector-icons/Ionicons';
import {SessionInfoFormView} from '../SessionInfoFormView';
import {SessionInfo} from '../../Session';

type HomeScreenProps = {
  account: PursuitAccount;
  errorHandler: ErrorHandler;
  navigation: any;
};
type HomeScreenState = {
  isLoggedIn: boolean;
  error: string;
  showModal: boolean;
  deviceStatus: any;
  sessionName: string;
};

export class HomeScreen extends React.Component<
  HomeScreenProps,
  HomeScreenState
> {
  private errorHandler: ErrorHandler;
  private account: PursuitAccount;
  private navigation: any;
  constructor(props: any) {
    super(props);
    this.state = {
      isLoggedIn: false,
      error: '',
      showModal: false,
      deviceStatus: undefined,
      sessionName: '',
    };
    this.errorHandler = this.props.errorHandler;
    this.account = this.props.account;
    this.navigation = this.props.navigation;
    this.connectionHandler = this.connectionHandler.bind(this);
    this.hideSessionModal = this.hideSessionModal.bind(this);
    this.showSessionModal = this.showSessionModal.bind(this);
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
          deviceStatus: account.getDeviceStatus(),
        });
      })
      .catch(error => {
        this.setState({
          error: error.message,
        });
      });
  }

  connectionHandler() {
    this.setState({
      isLoggedIn: this.account.isLoggedIn(),
    });
  }

  hideSessionModal() {
    this.setState({
      showModal: false,
      sessionName: '',
    });
  }

  showSessionModal(type: string) {
    this.setState({
      sessionName: type,
      showModal: true,
    });
  }

  async startRecording(session: SessionInfo) {
    this.setState({
      sessionName: '',
      showModal: false,
    });
    this.navigation.navigate('Live', {session: session});
  }

  render() {
    let error = (
      <View style={styles.errorContainer}>
        <Text>{this.state.error}</Text>
        <TouchableHighlight onPress={() => this.setState({error: ''})}>
          <Icon name="window-close" size={30} color="#900" />
        </TouchableHighlight>
      </View>
    );
    let view = (
      <ScrollView style={styles.scrollView}>
        {this.state.error && error}
        <LoggingView account={this.account} />
      </ScrollView>
    );
    if (this.state.isLoggedIn) {
      view = (
        <ScrollView style={styles.scrollView}>
          {this.state.error && error}
          {this.state.showModal && (
            <SessionInfoFormView
              name={this.state.sessionName}
              modalVisible={this.state.showModal}
              headset={this.account.getHeadset()}
              creationHandler={this.startRecording}
              cancelHandler={this.hideSessionModal}
            />
          )}
          <Text style={[styles.title, styles.centeredText]}>
            Start an activity
          </Text>
          <View style={styles.container}>
            <TouchableHighlight
              style={styles.submitButton}
              onPress={() => this.showSessionModal('driving_range')}>
              <View style={styles.button}>
                <Image source={drivingRangeIcon} style={styles.width50} />
                <Text style={styles.labelText}>Driving Range Session</Text>
              </View>
            </TouchableHighlight>
            <TouchableHighlight
              style={styles.submitButton}
              onPress={() => this.showSessionModal('outdoor_golf_course')}>
              <View style={styles.button}>
                <Image source={golfIcon} style={styles.width50} />
                <Text style={styles.labelText}>Golf course outdoor</Text>
              </View>
            </TouchableHighlight>
            <TouchableHighlight
              style={styles.submitButton}
              onPress={() => this.showSessionModal('generic')}>
              <View style={styles.button}>
                <Ionicons name={'desktop-outline'} color={'white'} size={50} />
                <Text style={styles.labelText}>Work</Text>
              </View>
            </TouchableHighlight>
          </View>
          <Text style={styles.text}>Previous activities</Text>
        </ScrollView>
      );
    }
    return view;
  }
}
