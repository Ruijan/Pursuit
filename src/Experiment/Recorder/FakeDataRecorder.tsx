import {DataRecorder} from './DataRecorder';
import {Observable} from 'rxjs';
import {ProcessedData} from '../Data/ProcessedData';
import {DeviceInfo} from '@neurosity/sdk/dist/cjs/types/deviceInfo';
const accKeys = [
  'acceleration',
  'inclination',
  'orientation',
  'pitch',
  'roll',
  'x',
  'y',
  'z',
];

export class FakeDataRecorder extends DataRecorder {
  private calm: {[name: string]: any} = {};
  async record(): Promise<void> {
    this.data.calm = createRandomProcessedData('calm', this.deviceInfo, [
      'probability',
    ]);
    this.data.focus = createRandomProcessedData('focus', this.deviceInfo, [
      'probability',
    ]);
    this.data.accelerometer = createRandomProcessedData(
      'accelerometer',
      this.deviceInfo,
      accKeys,
    );
    Object.keys(this.data).forEach(name => {
      this.data[name].subscribe();
    });
    this.interval = setInterval(this.saveData.bind(this), 5000);
  }
}

function createRandomProcessedData(
  name: string,
  deviceInfo: DeviceInfo,
  keys: Array<string>,
) {
  return new ProcessedData(
    name,
    deviceInfo,
    new Observable<any>(subscriber => {
      subscriber.next(0);
      setInterval(() => {
        let values: any = {
          timestamp: Date.now(),
        };
        for (let key of keys) {
          values[key] = Math.random();
        }
        subscriber.next(values);
      }, 1000);
    }),
  );
}
