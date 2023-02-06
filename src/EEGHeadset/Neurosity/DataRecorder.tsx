import {DeviceInfo} from '@neurosity/sdk/dist/cjs/types/deviceInfo';
import {Neurosity} from '@neurosity/sdk';
import {NeuroData} from './NeuroData';
import {RawData} from './RawData';
import {ProcessedData} from './ProcessedData';
import {SignalQualityData} from './SignalQualityData';
import RNFetchBlob from 'rn-fetch-blob';
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

export class DataRecorder {
  private data: {[name: string]: NeuroData} = {};
  private deviceInfo: DeviceInfo;
  private neurosity: Neurosity;
  private startTimeRecording: number = 0;
  private interval: NodeJS.Timer | undefined;
  private sessionName: string;
  private folderPath: string;
  private fileExist: boolean = false;
  private client: S3Client;

  constructor(neurosity: Neurosity, deviceInfo: DeviceInfo) {
    this.neurosity = neurosity;
    this.deviceInfo = deviceInfo;
    this.sessionName =
      this.deviceInfo.deviceNickname + '-' + String(Date.now());
    this.folderPath = RNFetchBlob.fs.dirs.CacheDir + '/' + this.sessionName;
    this.client = new S3Client({region: 'REGION'});
  }

  async record() {
    await RNFetchBlob.fs.mkdir(this.folderPath);
    console.log('start recording data');
    this.data.raw = new RawData(
      this.deviceInfo,
      this.neurosity.brainwaves('raw'),
    );
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

  async stopRecording() {
    const client = new S3Client({
      region: 'us-east-1',
    });
    for (const name of Object.keys(this.data)) {
      this.data[name].stopRecording();
      let filename = this.folderPath + '/' + name + '.csv';
      let params = {
        Bucket: 'pursuit-poc',
        Key: filename,
        Body: await RNFetchBlob.fs.readFile(filename, 'utf8'),
      };
      await client.send(new PutObjectCommand(params));
    }
    clearInterval(this.interval);
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
