import {DeviceInfo} from '@neurosity/sdk/dist/cjs/types/deviceInfo';
import {Neurosity} from '@neurosity/sdk';
import {NeuroData} from './NeuroData';
import {RawData} from './RawData';
import {ProcessedData} from './ProcessedData';
import {SignalQualityData} from './SignalQualityData';
import {mkdir, DownloadDirectoryPath} from 'react-native-fs';

export class DataRecorder {
  private data: {[name: string]: NeuroData} = {};
  private deviceInfo: DeviceInfo;
  private neurosity: Neurosity;
  private startTimeRecording: number = 0;

  constructor(neurosity: Neurosity, deviceInfo: DeviceInfo) {
    this.neurosity = neurosity;
    this.deviceInfo = deviceInfo;
  }

  async record() {
    let sessionName = this.deviceInfo.modelName + '-' + String(Date.now());

    console.log('start recording data');
    /*this.data.raw = new RawData(
      this.deviceInfo,
      this.neurosity.brainwaves('raw'),
      sessionName,
    );
    this.data.calm = new ProcessedData(
      'calm',
      this.deviceInfo,
      this.neurosity.calm(),
      sessionName,
    );
    this.data.focus = new ProcessedData(
      'focus',
      this.deviceInfo,
      this.neurosity.focus(),
      sessionName,
    );*/
    this.data.accelerometer = new ProcessedData(
      'accelerometer',
      this.deviceInfo,
      this.neurosity.accelerometer(),
      sessionName,
    );
    /*this.data.signalQuality = new SignalQualityData(
      this.deviceInfo,
      this.neurosity.signalQuality(),
      sessionName,
    );*/
    Object.keys(this.data).forEach(name => {
      this.data[name].subscribe();
    });
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

  stopRecording() {
    Object.keys(this.data).forEach(name => {
      this.data[name].stopRecording();
    });
    this.data = {};
  }
}
