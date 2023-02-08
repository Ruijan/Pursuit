import {NeuroData} from './NeuroData';
import {DeviceInfo} from '@neurosity/sdk/dist/cjs/types/deviceInfo';
import {Observable} from 'rxjs';

export class ProcessedData extends NeuroData {
  private labels: Set<string> = new Set();
  private bannedLabels = ['metric', 'label', 'timestamp'];
  constructor(
    name: string,
    deviceInfo: DeviceInfo,
    observable: Observable<any>,
  ) {
    super(name, deviceInfo, observable);
  }

  setData(data: {[name: string]: any}) {
    if (!data.hasOwnProperty('timestamp')) {
      data.timestamp = Date.now();
    }
    if (this.labels.size === 0) {
      Object.keys(data).forEach((key, _) => {
        if (this.bannedLabels.indexOf(key) === -1) {
          this.labels.add(key);
          this.bufferData.push([]);
        }
      });
    }
    let index = 0;
    this.bufferTimeStamp.push(data.timestamp);
    this.labels.forEach(label => {
      if (typeof this.bufferData[index] === 'undefined') {
        this.bufferData[index] = [];
      }
      this.bufferData[index].push(data[label]);
      index += 1;
    });
    /*if (this.elapsedTime() > this.bufferLength) {
      this.bufferTimeStamp.shift();
      this.bufferData.forEach((channel: Array<number>, labelIndex: number) => {
        this.bufferData[labelIndex].shift();
      });
    }*/
  }

  getLabels(): Array<string> {
    return Array.from(this.labels);
  }

  init() {
    this.currentTimeStamp = 0;
    this.bufferData = [];
    this.bufferTimeStamp = [];
  }
}
