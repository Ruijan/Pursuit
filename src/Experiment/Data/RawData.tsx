import {DeviceInfo} from '@neurosity/sdk/dist/cjs/types/deviceInfo';
import {Observable} from 'rxjs';
import {NeuroData} from './NeuroData';

export class RawData extends NeuroData {
  initialized: boolean = false;
  constructor(deviceInfo: DeviceInfo, observable: Observable<any>) {
    super('raw', deviceInfo, observable);
  }

  init() {
    super.init();
    this.initialized = false;
  }

  setData(data: {[name: string]: any}) {
    let info = data.info as {[name: string]: any};
    let rawData = data.data as Array<Array<number>>;

    let step = (1 / info.samplingRate) * 1000;
    for (let index = 0; index < rawData[0].length; index++) {
      this.bufferTimeStamp.push(info.startTime + Math.round(index * step));
    }
    for (let channel = 0; channel < rawData.length; channel++) {
      if (!this.initialized) {
        this.bufferData[channel] = [];
      }
      for (let index = 0; index < rawData[channel].length; index++) {
        this.bufferData[channel].push(rawData[channel][index]);
      }
    }
    if (!this.initialized) {
      this.initialized = true;
    }

    /*if (this.elapsedTime() > this.bufferLength) {
      this.bufferTimeStamp.splice(0, rawData[0].length);
      for (let index = 0; index < this.bufferData.length; index++) {
        this.bufferData[index].splice(0, rawData[index].length);
      }
    }*/
    this.currentTimeStamp = info.startTime;
  }

  getLabels(): Array<string> {
    return this.deviceInfo.channelNames;
  }
}
