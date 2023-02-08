import {NeuroData} from './NeuroData';
import {DeviceInfo} from '@neurosity/sdk/dist/cjs/types/deviceInfo';
import {Observable} from 'rxjs';

export class SignalQualityData extends NeuroData {
  private initialized: boolean = false;
  private states = ['great', 'good', 'bad', 'noContact'];

  constructor(deviceInfo: DeviceInfo, observable: Observable<any>) {
    super('quality', deviceInfo, observable);
  }

  setData(data: {[name: string]: any}) {
    let currentTimeStamp = Date.now();
    this.bufferTimeStamp.push(currentTimeStamp);
    Object.keys(data).forEach((channel, index) => {
      if (!this.initialized) {
        this.bufferData[index * 2] = [];
        this.bufferData[index * 2 + 1] = [];
      }
      this.bufferData[index * 2].push(data[index].standardDeviation);
      this.bufferData[index * 2 + 1].push(
        this.states.indexOf(data[index].status),
      );
    });
    if (!this.initialized) {
      this.initialized = true;
    }
    /*if (this.elapsedTime() > this.bufferLength) {
      this.bufferTimeStamp.shift();
      this.bufferData.forEach((channel: Array<number>, labelIndex: number) => {
        this.bufferData[labelIndex].shift();
      });
    }*/
  }

  getLabels(): Array<string> {
    let labels: Array<string> = [];
    this.deviceInfo.channelNames.forEach(channelName => {
      labels.push(channelName + 'Std');
      labels.push(channelName + 'State');
    });
    return labels;
  }
  init() {
    this.currentTimeStamp = 0;
    this.initialized = false;
    this.bufferData = Array(2 * this.deviceInfo.channelNames.length);
    this.bufferTimeStamp = [];
  }
}
