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
  PermissionsAndroid,
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
  movingFiles: boolean;
  currentFile: string;
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
      movingFiles: true,
      currentFile: 'None',
    };
    this.errorHandler = this.props.errorHandler;
    this.account = this.props.account;
    this.navigation = this.props.navigation;
    this.connectionHandler = this.connectionHandler.bind(this);
    this.hideSessionModal = this.hideSessionModal.bind(this);
    this.showSessionModal = this.showSessionModal.bind(this);
    this.startRecording = this.startRecording.bind(this);
    this.moveFilesToDownload = this.moveFilesToDownload.bind(this);
    this.account.addConnectionHandler(this.connectionHandler);
    this.account.addDisconnectHandler(this.connectionHandler);
    this.client = createS3Client();
    this.loadExperiments();
    this.moveFilesToDownload().then(() => this.setState({movingFiles: false}));
  }

  private async moveFilesToDownload() {
    try {
      const granted1 = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Pursuit AI writing files permission',
          message: 'Pursuit AI needs permission to save data file.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      const granted2 = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'Pursuit AI reading files permission',
          message: 'Pursuit AI needs permission to save data file.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (
        granted1 === PermissionsAndroid.RESULTS.GRANTED &&
        granted2 === PermissionsAndroid.RESULTS.GRANTED
      ) {
        console.log('You can read and write files');
      } else {
        console.log('Reading and Writing files permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
    let sourcePath = RNFetchBlob.fs.dirs.DocumentDir + '/experiment';
    let destinationPath = RNFetchBlob.fs.dirs.DownloadDir;
    let listSubjects = await RNFetchBlob.fs.ls(sourcePath);
    for (let subject of listSubjects) {
      let destSubject = subject.replace(' ', '_');
      let subjectPath = sourcePath + '/' + subject;
      let listExperiments = await RNFetchBlob.fs.ls(subjectPath);
      if (!(await RNFetchBlob.fs.exists(destinationPath + '/' + destSubject))) {
        await RNFetchBlob.fs.mkdir(destinationPath + '/' + destSubject);
      }
      let isDir = true;
      for (let experiment of listExperiments) {
        let experimentPath = subjectPath + '/' + experiment;
        if (isDir && (await RNFetchBlob.fs.isDir(experimentPath))) {
          let destination =
            destinationPath + '/' + destSubject + '/' + experiment;
          this.setState({
            currentFile: subject + ' - ' + experiment + ' - creating folder ',
          });
          if (!(await RNFetchBlob.fs.exists(destination))) {
            await RNFetchBlob.fs.mkdir(destination);
          }
          this.setState({
            currentFile: subject + ' - ' + experiment + ' Folder created ',
          });
          await this.moveExperiment(
            subject,
            experiment,
            destination,
            experimentPath,
          );
        } else {
          isDir = false;
        }
        if (!isDir) {
          let destination = destinationPath + '/' + destSubject;
          await this.moveExperiment(
            subject,
            experiment,
            destination,
            subjectPath,
          );
        }
      }
    }
    console.log('Done moving files to download folder');
    //
  }

  private async moveExperiment(
    subject: string,
    experiment: string,
    destination: string,
    experimentPath: string,
  ) {
    let experimentFiles = await RNFetchBlob.fs.ls(experimentPath);
    for (let file of experimentFiles) {
      this.setState({
        currentFile: subject + ' - ' + experiment + ' - ' + file,
      });
      if (!(await RNFetchBlob.fs.exists(destination + '/' + file))) {
        await RNFetchBlob.fs.cp(
          experimentPath + '/' + file,
          destination + '/' + file,
        );
      }
    }
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
    let experimentsView = (
      <View style={[styles.container]}>
        <ActivityIndicator size="large" color="#199FDD" />
      </View>
    );
    let filesView = (
      <View style={[styles.container]}>
        <ActivityIndicator size="large" color="#199FDD" />
      </View>
    );
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
        {this.state.movingFiles && (
          <View style={styles.container}>
            <Text style={styles.labelText}>Moving files test</Text>
            <Text style={styles.labelText}>Test {this.state.currentFile}</Text>
            {filesView}
          </View>
        )}
      </ScrollView>
    );
    if (this.state.isLoggedIn) {
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
          {this.state.movingFiles && (
            <View style={styles.container}>
              <Text style={styles.labelText}>Moving files</Text>
              <Text style={styles.labelText}>
                Test {this.state.currentFile}
              </Text>
              {filesView}
            </View>
          )}
          <Text style={styles.text}>Previous activities</Text>
        </ScrollView>
      );
    }
    return view;
  }
}
