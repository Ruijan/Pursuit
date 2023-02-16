import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import React from 'react';
import {MarkerView} from '../MarkerView';
import {Marker, MarkerBuilder} from '../../MarkerRecorder';
// @ts-ignore
import Icon from 'react-native-vector-icons/FontAwesome5';
// @ts-ignore
import Ionicons from 'react-native-vector-icons/Ionicons';
import PursuitAccount from '../../Account/PursuitAccount';
import {ErrorHandler} from '../../ErrorHandler';
import {Session} from '../../Session';

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
};

export class LiveScreen extends React.Component<
  LiveScreenProps,
  LiveScreenState
> {
  private account: PursuitAccount;
  private session: Session;
  constructor(props: any) {
    super(props);
    this.state = {
      error: '',
      showModal: false,
      marker: undefined,
      deviceStatus: undefined,
      stoppingRecording: false,
    };
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
    this.session.startRecording().catch(error => {
      throw error;
    });
    this.modalHandler = this.modalHandler.bind(this);
  }

  modalHandler() {
    this.setState({
      showModal: false,
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
          markerRecorder={this.session.recorder}
          handler={this.modalHandler}
        />
        {this.state.error && error}
        <Text style={styles.labelText}>Recording for {}</Text>
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
            style={styles.submitButton}
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
