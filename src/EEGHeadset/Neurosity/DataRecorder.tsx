import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';
import {DeviceInfo} from '@neurosity/sdk/dist/cjs/types/deviceInfo';
import {Neurosity} from '@neurosity/sdk';
import {NeuroData} from './NeuroData';
import {RawData} from './RawData';
import {ProcessedData} from './ProcessedData';
import {SignalQualityData} from './SignalQualityData';
import RNFetchBlob from 'rn-fetch-blob';
import {
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Marker, MarkerRecorder } from "../../MarkerRecorder";
// @ts-ignore
import {AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY} from '@env';

export class DataRecorder {
  private data: {[name: string]: NeuroData} = {};
  private marker: MarkerRecorder;
  private deviceInfo: DeviceInfo;
  private neurosity: Neurosity;
  private startTimeRecording: number = 0;
  private interval: NodeJS.Timer | undefined;
  private sessionName: string;
  private folderPath: string;
  private fileExist: boolean = false;
  private client: S3Client;
  private recordingHandler: Array<any> = [];
  private type: string;

  constructor(neurosity: Neurosity, deviceInfo: DeviceInfo, type: string) {
    this.neurosity = neurosity;
    this.deviceInfo = deviceInfo;
    this.type = type;
    this.sessionName =
      this.deviceInfo.deviceNickname + '-' + String(Date.now());
    this.folderPath = RNFetchBlob.fs.dirs.DownloadDir + '/' + this.sessionName;
    let credentials = {
      accessKeyId: AWS_ACCESS_KEY_ID ? AWS_ACCESS_KEY_ID : '',
      secretAccessKey: AWS_SECRET_ACCESS_KEY ? AWS_SECRET_ACCESS_KEY : '',
    };
    console.log(credentials);
    this.client = new S3Client({region: 'us-east-1', credentials: credentials});
    this.marker = new MarkerRecorder(this.folderPath);
  }

  async record() {
    await RNFetchBlob.fs.mkdir(this.folderPath);
    console.log('start recording data');
    /*this.data.raw = new RawData(
      this.deviceInfo,
      this.neurosity.brainwaves('raw'),
    );*/
    this.data.calm = new ProcessedData(
      'calm',
      this.deviceInfo,
      this.neurosity.calm(),
    );
    this.data.focus = new ProcessedData(
      'focus',
      this.deviceInfo,
      this.neurosity.focus(),
    );
    this.data.accelerometer = new ProcessedData(
      'accelerometer',
      this.deviceInfo,
      this.neurosity.accelerometer(),
    );
    this.data.signalQuality = new SignalQualityData(
      this.deviceInfo,
      this.neurosity.signalQuality(),
    );
    Object.keys(this.data).forEach(name => {
      this.data[name].subscribe();
    });
    this.interval = setInterval(this.saveData.bind(this), 5000);
  }

  isRecording(): boolean {
    Object.keys(this.data).forEach(name => {
      return this.data[name].isRecording;
    });
    return false;
  }

  getTimeSinceRecording(): number {
    Object.keys(this.data).forEach(name => {
      return this.data[name].timeStart;
    });
    return 0;
  }

  async addMarker(marker: Marker) {
    await this.marker.addMarker(marker);
  }

  async stopRecording() {
    for (const name of Object.keys(this.data)) {
      this.data[name].stopRecording();
    }
    clearInterval(this.interval);
    let path = this.type + '/' + this.sessionName + '/';
    for (const name of Object.keys(this.data)) {
      let filename = this.folderPath + '/' + name + '.csv';
      let params = {
        Bucket: 'pursuit-poc',
        Key: path + name + '.csv',
        Body: await RNFetchBlob.fs.readFile(filename, 'utf8'),
      };
      try {
        await this.client.send(new PutObjectCommand(params));
      } catch (error) {
        console.log(error);
      }
    }
    let filename = this.folderPath + '/marker.json';
    let params = {
      Bucket: 'pursuit-poc',
      Key: path + 'marker.json',
      Body: await RNFetchBlob.fs.readFile(filename, 'utf8'),
    };
    try {
      await this.client.send(new PutObjectCommand(params));
    } catch (error) {
      console.log(error);
    }
    this.data = {};
  }

  async saveData() {
    Object.keys(this.data).forEach(name => {
      let currentData = this.data[name];
      let startLocalTs = Date.now();
      const headerString = currentData
        .getLabels()
        .join(',')
        .concat(',timestamp', '\n');

      let dataToSave = [...currentData.bufferData];
      dataToSave.push(currentData.bufferTimeStamp);
      let transposedData = dataToSave[0].map((col, c) =>
        dataToSave.map((row, r) => dataToSave[r][c]),
      );
      let rowString = this.fileExist ? '' : headerString;
      for (let i = 0; i < transposedData.length; i++) {
        rowString = rowString.concat(transposedData[i].join(','));
        rowString = rowString.concat('\n');
      }
      const filePath = this.folderPath + '/' + name + '.csv';
      if (!this.fileExist) {
        RNFetchBlob.fs.writeFile(filePath, rowString, 'utf8');
      } else {
        RNFetchBlob.fs.appendFile(filePath, rowString, 'utf8');
      }
      currentData.init();
      let currentLocalTs = String(Date.now() - startLocalTs);
      console.log(
        startLocalTs,
        name,
        ' - Time to save data: ',
        currentLocalTs,
        'ms',
      );
    });
    if (!this.fileExist) {
      this.fileExist = true;
    }
  }
}
