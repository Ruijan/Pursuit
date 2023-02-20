import {S3Client} from '@aws-sdk/client-s3';
import RNFetchBlob from 'rn-fetch-blob';
// @ts-ignore
import {DataRecorder} from './Recorder/DataRecorder';
import {Marker} from './Recorder/MarkerRecorder';

export class Session {
  info: SessionInfo;
  recorder: DataRecorder;
  s3client: S3Client;
  folderPath: string;
  startHandler: Array<any> = [];
  updateStateHandler: Array<any> = [];
  updateTimerHandler: Array<any> = [];
  stopHandler: Array<any> = [];

  constructor(info: SessionInfo, recorder: DataRecorder, s3client: S3Client) {
    this.info = info;
    this.recorder = recorder;
    this.s3client = s3client;
    this.folderPath =
      RNFetchBlob.fs.dirs.DocumentDir +
      '/' +
      this.info.type +
      '/' +
      this.info.subject +
      '/' +
      String(this.info.startTime);
    this.recorder.folderPath = this.folderPath;
  }

  async createLocalFolder() {
    let sessionTypeDir = RNFetchBlob.fs.dirs.DocumentDir + '/' + this.info.type;
    let subjectDir = sessionTypeDir + '/' + this.info.subject;
    let sessionDir = subjectDir + '/' + this.info.startTime;
    await this.tryCreatingFolder(sessionTypeDir);
    await this.tryCreatingFolder(subjectDir);
    await this.tryCreatingFolder(sessionDir);
  }

  async tryCreatingFolder(folderName: string) {
    try {
      await RNFetchBlob.fs.mkdir(folderName);
    } catch (error: any) {
      console.log(error.message);
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }
  }

  addMarker(marker: Marker) {
    this.recorder.addMarker(marker);
  }

  addStartHandler(handler: any) {
    this.startHandler.push(handler);
  }

  addStopHandler(handler: any) {
    this.stopHandler.push(handler);
  }

  addStateUpdateHandler(handler: any) {
    this.updateStateHandler.push(handler);
  }

  addTimerUpdateHandler(handler: any) {
    this.updateTimerHandler.push(handler);
  }

  async startRecording() {
    await this.createLocalFolder();
    let filePath = this.folderPath + '/session.json';
    await RNFetchBlob.fs.writeFile(
      filePath,
      JSON.stringify(this.info, undefined, '\t'),
      'utf8',
    );
    await this.recorder.record();
    this.startHandler.forEach(handler => handler());
  }

  async stopRecording() {
    console.log('Stop recording session');
    await this.recorder.stopRecording();
    this.stopHandler.forEach(handler => handler());
  }
}

export interface SessionInfo {
  name: string;
  startTime: number;
  subject: string;
  device: string;
  club: string;
  info: string;
  type: string;
}
