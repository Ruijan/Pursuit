import {ScrollView, Text, TouchableHighlight, View} from 'react-native';
import React from 'react';
import {MarkerView} from '../MarkerView';
import {Marker, MarkerBuilder} from '../../Experiment/Recorder/MarkerRecorder';
// @ts-ignore
import Icon from 'react-native-vector-icons/FontAwesome5';
// @ts-ignore
import Ionicons from 'react-native-vector-icons/Ionicons';
import PursuitAccount from '../../Account/PursuitAccount';
import {ErrorHandler} from '../../ErrorHandler';
import {Session} from '../../Experiment/Session';
import {ExperimentView} from '../ExperimentView';
import {ExperimentSession} from '../../Experiment/ExperimentSession';
import styles from '../../styles/Styles';

type LiveScreenProps = {
  account: PursuitAccount;
  errorHandler: ErrorHandler;
  route: any;
  navigation: any;
};
type LiveScreenState = {
  error: string;
  showModal: boolean;
  marker: Marker | undefined;
  deviceStatus: any;
  stoppingRecording: boolean;
  recordingTime: number;
  startingRecording: boolean;
  expectedMarker: string;
  session: Session;
};

export class LiveScreen extends React.Component<
  LiveScreenProps,
  LiveScreenState
> {
  private account: PursuitAccount;
  private session: Session;
  constructor(props: any) {
    super(props);
    this.account = this.props.account;
    if (
      !this.props.route.params ||
      !this.props.route.params.hasOwnProperty('session')
    ) {
      throw new Error('No session provided');
    }
    this.session = this.account.headsetAccount.createRecordingSession(
      this.props.route.params.session,
    );
    this.state = {
      error: '',
      showModal: false,
      marker: undefined,
      deviceStatus: undefined,
      stoppingRecording: false,
      recordingTime: 0,
      startingRecording: true,
      session: this.session,
      expectedMarker: '',
    };
    this.modalHandler = this.modalHandler.bind(this);
    this.startHandler = this.startHandler.bind(this);
    this.updateHandler = this.updateHandler.bind(this);
    this.session.addStartHandler(this.startHandler);
    this.session.addStateUpdateHandler(this.updateHandler);
    this.session.startRecording().catch(error => {
      throw error;
    });
  }

  modalHandler() {
    this.setState({
      showModal: false,
    });
  }

  updateHandler() {
    this.setState({
      recordingTime: this.session.recorder.getTimeSinceRecording(),
      session: this.session,
      expectedMarker:
        this.state.session instanceof ExperimentSession
          ? this.session.expectedMarker
          : '',
    });
  }

  startHandler() {
    this.setState({
      startingRecording: false,
    });
  }

  async stopRecording() {
    this.setState({
      stoppingRecording: true,
    });
    await this.session.stopRecording();
    this.setState({
      stoppingRecording: false,
    });
    this.props.navigation.goBack();
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
    return (
      <ScrollView style={styles.scrollView}>
        <MarkerView
          modalVisible={this.state.showModal}
          marker={this.state.marker}
          session={this.session}
          handler={this.modalHandler}
        />
        {this.state.error && error}
        {this.state.session instanceof ExperimentSession && (
          <ExperimentView session={this.session} />
        )}
        <Text style={styles.labelText}>
          Recording for {this.state.recordingTime}s
        </Text>
        <View style={styles.container}>
          <TouchableHighlight
            style={styles.submitButton}
            onPress={() =>
              this.setState({
                showModal: true,
                marker: MarkerBuilder.buildShot(Date.now(), 0, 0, 0),
              })
            }>
            <View style={styles.button}>
              <Icon name={'golf-ball'} color={'white'} size={50} />
              <Text style={styles.labelText}>Add Shot</Text>
            </View>
          </TouchableHighlight>
          <TouchableHighlight
            style={styles.submitButton}
            onPress={() =>
              this.setState({
                showModal: true,
                marker: MarkerBuilder.buildGenericMarker(
                  'fake_shot',
                  Date.now(),
                ),
              })
            }>
            <View style={styles.button}>
              <Icon name={'times'} color={'white'} size={50} />
              <Text style={styles.labelText}>Add Fake Shot</Text>
            </View>
          </TouchableHighlight>
          <TouchableHighlight
            style={styles.submitButton}
            onPress={() =>
              this.setState({
                showModal: true,
                marker: MarkerBuilder.buildGenericMarker(
                  'start_closed_eyes',
                  Date.now(),
                ),
              })
            }>
            <View style={styles.button}>
              <Icon name={'eye-slash'} color={'white'} size={50} />
              <Text style={styles.labelText}>Start Close eyes</Text>
            </View>
          </TouchableHighlight>
          <TouchableHighlight
            style={styles.submitButton}
            onPress={() =>
              this.setState({
                showModal: true,
                marker: MarkerBuilder.buildGenericMarker(
                  'stop_closed_eyes',
                  Date.now(),
                ),
              })
            }>
            <View style={styles.button}>
              <Icon name={'eye'} color={'white'} size={50} />
              <Text style={styles.labelText}>Stop Close eyes</Text>
            </View>
          </TouchableHighlight>
          <TouchableHighlight
            style={styles.submitButton}
            onPress={() =>
              this.setState({
                showModal: true,
                marker: MarkerBuilder.buildGenericMarker(
                  'start_walk',
                  Date.now(),
                ),
              })
            }>
            <View style={styles.button}>
              <Ionicons name={'walk'} color={'white'} size={50} />
              <Text style={styles.labelText}>Start walk</Text>
            </View>
          </TouchableHighlight>
          <TouchableHighlight
            style={[
              styles.submitButton,
              this.state.expectedMarker === 'stop_walk'
                ? styles.highlightedButton
                : {},
            ]}
            onPress={() =>
              this.setState({
                showModal: true,
                marker: MarkerBuilder.buildGenericMarker(
                  'stop_walk',
                  Date.now(),
                ),
              })
            }>
            <View style={styles.button}>
              <Ionicons name={'man'} color={'white'} size={50} />
              <Text style={styles.labelText}>Stop walk</Text>
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
}
