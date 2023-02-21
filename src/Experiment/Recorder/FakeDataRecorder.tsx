import {DataRecorder} from './DataRecorder';
import {Observable} from 'rxjs';
import {ProcessedData} from '../Data/ProcessedData';
import {DeviceInfo} from '@neurosity/sdk/dist/cjs/types/deviceInfo';
import {RawData} from '../Data/RawData';
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
    const channels = ['CP3', 'C3', 'F5', 'PO3', 'PO4', 'F6', 'C4', 'CP4'];
    this.data.raw = createRandomRawData(this.deviceInfo, channels);
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

function createRandomChannelData(keys: Array<string>) {
  let values: any = {
    info: {
      timestamp: Date.now(),
      startTime: Date.now(),
      samplingRate: 256,
    },
    data: [],
  };
  for (let {} of keys) {
    values.data.push(
      Array.from({length: 256}, () => Math.floor(Math.random() * 100) / 100),
    );
  }
  return values;
}

function createRandomRawData(deviceInfo: DeviceInfo, keys: Array<string>) {
  return new RawData(
    deviceInfo,
    new Observable<any>(subscriber => {
      subscriber.next(createRandomChannelData(keys));
      setInterval(() => {
        subscriber.next(createRandomChannelData(keys));
      }, 1000);
    }),
  );
}
