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
    sessionName: string,
  ) {
    super(name, deviceInfo, observable, sessionName);
  }

  setData(data: {[name: string]: any}) {
    if (!data.hasOwnProperty('timestamp')) {
      data.timestamp = Date.now();
      console.log('Does not have timestamp propery');
    }

    Object.keys(data).forEach((key, index) => {
      if (this.bannedLabels.indexOf(key) === -1) {
        this.labels.add(key);
        this.bufferData[index].push(data[key]);
        this.bufferTimeStamp[index].push(data.timestamp);
      }
    });
    while (this.elapsedTime() > this.bufferLength) {
      this.bufferTimeStamp.forEach(
        (channel: Array<number>, labelIndex: number) => {
          this.bufferTimeStamp[labelIndex] =
            this.bufferTimeStamp[labelIndex].slice(1);
          this.bufferData[labelIndex] = this.bufferData[labelIndex].slice(1);
        },
      );
    }
    this.saveData(this.bufferData, this.bufferTimeStamp[0], data.timeStamp);
  }

  private elapsedTime() {
    return (
      (this.bufferTimeStamp[0][this.bufferTimeStamp[0].length - 1] -
        this.bufferTimeStamp[0][0]) /
      1000
    );
  }

  getLabels(): Array<string> {
    return Array.from(this.labels);
  }
}
