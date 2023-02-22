import React from 'react';
import PursuitAccount from '../../Account/PursuitAccount';
import {LoggingView} from '../LoggingView';
// @ts-ignore
import Icon from 'react-native-vector-icons/FontAwesome5';
import {
  Image,
  Text,
  TouchableHighlight,
  View,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {ErrorHandler} from '../../ErrorHandler';

const drivingRangeIcon = require('../../assets/driving-range-icon.png');
import styles from '../../styles/Styles';
// @ts-ignore
import Ionicons from 'react-native-vector-icons/Ionicons';
import {SessionInfoFormView} from '../SessionInfoFormView';
import {SessionInfo} from '../../Experiment/Session';
import {
  GetObjectCommand,
  ListObjectsCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import {createS3Client} from '../../Experiment/CreateS3Client';
import {convertStringToLabel} from '../../utils';
import RNFetchBlob from 'rn-fetch-blob';

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
  sessionType: string;
  sessionName: string;
  experiments: Array<any>;
  loading: boolean;
};

export class HomeScreen extends React.Component<
  HomeScreenProps,
  HomeScreenState
> {
  private errorHandler: ErrorHandler;
  private account: PursuitAccount;
  private navigation: any;
  private client: S3Client;

  constructor(props: any) {
    super(props);
    this.state = {
      isLoggedIn: false,
      error: '',
      showModal: false,
      deviceStatus: undefined,
      sessionType: '',
      sessionName: '',
      experiments: [],
      loading: false,
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
    this.client = createS3Client();
    this.loadExperiments();
    this.moveFilesToDownload();
  }

  private async moveFilesToDownload() {
    let sourcePath = RNFetchBlob.fs.dirs.DocumentDir;
    let destinationPath = RNFetchBlob.fs.dirs.DownloadDir;
    let listFolders = await RNFetchBlob.fs.ls(sourcePath);
    for (let folder of listFolders) {
      if (folder.includes('Crown')) {
        let experimentFiles = await RNFetchBlob.fs.ls(
          sourcePath + '/' + folder,
        );
        console.log('Files for folder', folder, experimentFiles);
        if (!(await RNFetchBlob.fs.exists(destinationPath + '/' + folder))) {
          await RNFetchBlob.fs.mkdir(destinationPath + '/' + folder);
        }
        for (let file of experimentFiles) {
          if (
            !(await RNFetchBlob.fs.exists(
              destinationPath + '/' + folder + '/' + file,
            ))
          ) {
            await RNFetchBlob.fs.mv(
              sourcePath + '/' + folder + '/' + file,
              destinationPath + '/' + folder + '/' + file,
            );
          }
        }
      }
    }
    console.log('Done moving files to download folder');
    //
  }

  private loadExperiments() {
    let params = {
      Bucket: 'pursuit-experiments',
    };
    try {
      this.client.send(new ListObjectsCommand(params)).then(results => {
        results.Contents?.forEach(async file => {
          let getParams = {
            Bucket: 'pursuit-experiments',
            Key: file.Key,
          };
          let fileData = await this.client.send(
            new GetObjectCommand(getParams),
          );
          let currentExperiments = this.state.experiments;
          currentExperiments.push(
            JSON.parse(await fileData.Body!.transformToString()),
          );
          this.setState({
            experiments: currentExperiments,
            loading: currentExperiments.length === results.Contents!.length - 1,
          });
        });
      });
    } catch (error) {
      console.log(error);
    }
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
      sessionType: '',
    });
  }

  showSessionModal(type: string, name: string) {
    this.setState({
      sessionType: type,
      sessionName: name,
      showModal: true,
    });
  }

  async startRecording(session: SessionInfo) {
    this.setState({
      sessionType: '',
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
      let experimentsView = (
        <View style={[styles.container]}>
          <ActivityIndicator size="large" color="#199FDD" />
        </View>
      );
      let experimentButtons = this.state.experiments.map(experiment => {
        return (
          <View style={styles.rowItem} key={experiment.name}>
            <TouchableHighlight
              style={styles.width100}
              onPress={() =>
                this.showSessionModal('experiment', experiment.name)
              }>
              <View style={styles.infoCardLong}>
                <View style={styles.infoCardContent}>
                  <Text style={styles.textCard}>
                    {convertStringToLabel(experiment.name)}
                  </Text>
                </View>
                <View style={styles.infoCardTitle}>
                  <Text style={styles.titleCard}>{experiment.duration}</Text>
                </View>
              </View>
            </TouchableHighlight>
          </View>
        );
      });
      view = (
        <ScrollView style={styles.scrollView}>
          {this.state.error && error}
          {this.state.showModal && (
            <SessionInfoFormView
              type={this.state.sessionType}
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
            <View style={styles.rowItem}>
              <TouchableHighlight
                style={styles.width100}
                onPress={() => this.showSessionModal('driving_range', '')}>
                <View style={styles.infoCardLong}>
                  <View style={styles.infoCardContent}>
                    <Image source={drivingRangeIcon} style={styles.width50} />
                  </View>
                  <View style={styles.infoCardTitle}>
                    <Text style={styles.labelText}>Driving Range Session</Text>
                  </View>
                </View>
              </TouchableHighlight>
            </View>
            <View style={styles.rowItem}>
              <TouchableHighlight
                style={styles.width100}
                onPress={() =>
                  this.showSessionModal('outdoor_golf_course', '')
                }>
                <View style={styles.infoCardLong}>
                  <View style={styles.infoCardContent}>
                    <Ionicons name={'golf-sharp'} color={'white'} size={50} />
                  </View>
                  <View style={styles.infoCardTitle}>
                    <Text style={styles.labelText}>Golf course outdoor</Text>
                  </View>
                </View>
              </TouchableHighlight>
            </View>
            <View style={styles.rowItem}>
              <TouchableHighlight
                style={styles.width100}
                onPress={() => this.showSessionModal('generic', '')}>
                <View style={styles.infoCardLong}>
                  <View style={styles.infoCardContent}>
                    <Ionicons
                      name={'desktop-outline'}
                      color={'white'}
                      size={50}
                    />
                  </View>
                  <View style={styles.infoCardTitle}>
                    <Text style={styles.labelText}>Work</Text>
                  </View>
                </View>
              </TouchableHighlight>
            </View>
          </View>
          <Text style={[styles.title, styles.centeredText]}>
            Start an experiment
          </Text>
          {this.state.loading && experimentsView}
          {!this.state.loading && (
            <View style={styles.container}>{experimentButtons}</View>
          )}
          <Text style={styles.text}>Previous activities</Text>
        </ScrollView>
      );
    }
    return view;
  }
}
