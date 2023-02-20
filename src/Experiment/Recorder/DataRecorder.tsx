import {NeuroData} from '../Data/NeuroData';
import {Marker, MarkerRecorder} from './MarkerRecorder';
import {DeviceInfo} from '@neurosity/sdk/dist/cjs/types/deviceInfo';
import {PutObjectCommand, S3Client} from '@aws-sdk/client-s3';
import RNFetchBlob from 'rn-fetch-blob';
import {Headset} from '../../EEGHeadset/Headset';

export abstract class DataRecorder {
  set folderPath(value: string) {
    this._folderPath = value;
    this.marker.folderPath = value;
  }
  protected headset: Headset;
  protected data: {[name: string]: NeuroData} = {};
  protected marker: MarkerRecorder;
  protected deviceInfo: DeviceInfo;
  protected interval: NodeJS.Timer | undefined;
  protected sessionName: string;
  private _folderPath: string;
  protected fileExist: boolean = false;
  protected client: S3Client;
  protected type: string;

  constructor(headset: Headset, client: S3Client, type: string) {
    this.headset = headset;
    this.deviceInfo = headset.deviceInfo!;
    this.type = type;
    console.log('Type', type);

    this.sessionName =
      this.deviceInfo.deviceNickname + '-' + String(Date.now());
    console.log(this.sessionName);
    this._folderPath = RNFetchBlob.fs.dirs.DocumentDir + '/' + this.sessionName;
    this.client = client;
    this.marker = new MarkerRecorder(this._folderPath);
  }

  abstract record(): void;

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

  addMarker(marker: Marker) {
    this.marker.addMarker(marker);
  }

  async stopRecording() {
    for (const name of Object.keys(this.data)) {
      this.data[name].stopRecording();
    }
    this.marker.stopSavingMarker();
    clearInterval(this.interval);
    await this.saveData();
    await this.marker.saveMarkers();
    let path = this.type + '/' + this.sessionName + '/';
    for (const name of Object.keys(this.data)) {
      let filename = this._folderPath + '/' + name + '.csv';
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
    let sessionFilename = this._folderPath + '/session.json';
    if (await RNFetchBlob.fs.exists(sessionFilename)) {
      let params = {
        Bucket: 'pursuit-poc',
        Key: path + 'session.json',
        Body: await RNFetchBlob.fs.readFile(sessionFilename, 'utf8'),
      };
      try {
        await this.client.send(new PutObjectCommand(params));
      } catch (error) {
        console.log(error);
      }
    }
    let filename = this._folderPath + '/marker.json';
    if (await RNFetchBlob.fs.exists(filename)) {
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
    }
    this.data = {};
    console.log('files uploaded in ', path);
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
      const filePath = this._folderPath + '/' + name + '.csv';
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
