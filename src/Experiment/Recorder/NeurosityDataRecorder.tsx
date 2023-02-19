import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';
import {Neurosity} from '@neurosity/sdk';
import {ProcessedData} from '../Data/ProcessedData';
import {SignalQualityData} from '../Data/SignalQualityData';
import {S3Client} from '@aws-sdk/client-s3';

import {RawData} from '../Data/RawData';
import {DataRecorder} from './DataRecorder';
import {NeurosityHeadset} from '../../EEGHeadset/NeurosityHeadset';

export class NeurosityDataRecorder extends DataRecorder {
  private neurosity: Neurosity;

  constructor(headset: NeurosityHeadset, client: S3Client, type: string) {
    super(headset, client, type);
    this.neurosity = headset.neurosity;
  }

  async record() {
    console.log('start recording data');
    /*this.data.raw = new RawData(
      this.deviceInfo,
      this.neurosity.brainwaves('raw'),
    );*/
    this.data.calm = new ProcessedData(
      'calm',
      this.deviceInfo,
      this.neurosity.calm(),
    );
    this.data.focus = new ProcessedData(
      'focus',
      this.deviceInfo,
      this.neurosity.focus(),
    );
    this.data.accelerometer = new ProcessedData(
      'accelerometer',
      this.deviceInfo,
      this.neurosity.accelerometer(),
    );
    this.data.signalQuality = new SignalQualityData(
      this.deviceInfo,
      this.neurosity.signalQuality(),
    );
    Object.keys(this.data).forEach(name => {
      this.data[name].subscribe();
    });
    this.interval = setInterval(this.saveData.bind(this), 5000);
  }
}
