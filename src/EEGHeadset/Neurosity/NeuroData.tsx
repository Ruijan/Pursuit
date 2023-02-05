import {DeviceInfo} from '@neurosity/sdk/dist/cjs/types/deviceInfo';
import {Observable} from 'rxjs';
import {
  appendFile,
  DownloadDirectoryPath,
  exists, mkdir,
  writeFile
} from "react-native-fs";

export abstract class NeuroData {
  get timeStart(): number {
    return this._timeStart;
  }
  get isRecording(): boolean {
    return this._isRecording;
  }
  public bufferData: Array<Array<any>> = [];
  public bufferTimeStamp: Array<Array<number>> = [];
  public deviceInfo: DeviceInfo;
  protected lastSave = 0;
  protected currentTimeStamp = 0;
  protected bufferLength = 5; // Seconds
  private observable: Observable<any>;
  private subscription: any;
  protected name: string;
  private _isRecording: boolean = false;
  private _timeStart: number = 0;
  private sessionName: string;

  constructor(
    name: string,
    deviceInfo: DeviceInfo,
    observable: Observable<any>,
    folderPath: string,
  ) {
    this.name = name;
    this.deviceInfo = deviceInfo;
    this.observable = observable;
    this.sessionName = folderPath;
    this.init();
  }

  init() {
    this.lastSave = 0;
    this.currentTimeStamp = 0;
    this.bufferData = Array(this.deviceInfo.channelNames.length).fill(Array(0));
    this.bufferTimeStamp = Array(this.deviceInfo.channelNames.length).fill(
      Array(0),
    );
  }

  subscribe() {
    console.log('subrscribing to ', this.name, ' stream');
    this.init();
    this.subscription = this.observable.subscribe(data => {
      if (!this._isRecording) {
        this._isRecording = false;
        this._timeStart = Date.now();
      }
      this.setData(data);
    });
  }

  abstract setData(data: {[name: string]: any}): void;

  async saveData(
    data: Array<Array<number>>,
    timestamps: Array<number>,
    currentTimeStamp: number,
  ) {
    console.log('Trying to save: ', (currentTimeStamp - this.lastSave) / 1000);
    if ((currentTimeStamp - this.lastSave) / 1000 > this.bufferLength) {
      if (this.name === 'accelerometer') {
        console.log('For ', this.name, ' labels: ', this.getLabels());
        console.log(
          'For ',
          this.name,
          ' data length: ',
          this.bufferData[0].length,
        );
      }
      let startlocalts = Date.now();
      console.log(
        'saving data for stream ',
        this.name,
        ' ',
        (currentTimeStamp - this.lastSave) / 1000,
        's',
      );
      this.lastSave = currentTimeStamp;
      const headerString = this.getLabels()
        .join(',')
        .concat(',timestamp', '\n');
      let dataToSave = data;
      dataToSave.push(timestamps);
      let rowString = '';
      for (let i = 0; i < dataToSave[0].length; i++) {
        for (let j = 0; j < dataToSave.length; j++) {
          if (j !== 0) {
            rowString = rowString.concat(',');
          }
          rowString = rowString.concat(String(dataToSave[j][i]));
        }
        rowString = rowString.concat('\n');
      }
      const csvString = `${headerString}${rowString}`;
      let folderPath = DownloadDirectoryPath + '/' + this.sessionName;
      const filePath = folderPath + '/' + this.name + '.csv';
      console.log(
        'Time to process saved data: ',
        String(Date.now() - startlocalts),
        'ms',
      );
      let folderExist = await exists(folderPath);
      if (!folderExist) {
        await mkdir(folderPath);
      }
      let fileExist = await exists(filePath);
      if (fileExist) {
        await appendFile(filePath, rowString, 'utf8');
      } else {
        await writeFile(filePath, csvString, 'utf8');
      }
      console.log(
        'Time to save data: ',
        String(Date.now() - startlocalts),
        'ms',
      );
    }
  }

  stopRecording() {
    this.subscription.unsubscribe();
    this._isRecording = false;
  }

  abstract getLabels(): Array<string>;
}
