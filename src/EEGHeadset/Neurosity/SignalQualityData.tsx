import {SignalQuality} from '@neurosity/sdk/dist/cjs/types/signalQuality';
import {mean, round} from 'mathjs';
import {NeuroData} from './NeuroData';
import {DeviceInfo} from '@neurosity/sdk/dist/cjs/types/deviceInfo';
import {Observable} from 'rxjs';

export class SignalQualityData extends NeuroData {
  get averageSignalQuality(): Array<number> {
    return this._averageSignalQuality;
  }

  get averageSignalState(): Array<string> {
    return this._averageSignalState.map(
      stateIndex => this.states[round(stateIndex)],
    );
  }

  private states = ['great', 'good', 'bad', 'noContact'];
  private _averageSignalQuality: Array<number> = [];
  private _averageSignalState: Array<number> = [];

  constructor(
    deviceInfo: DeviceInfo,
    observable: Observable<any>,
    sessionName: string,
  ) {
    super('quality', deviceInfo, observable, sessionName);
  }

  setData(data: {[name: string]: any}) {
    let quality: SignalQuality = data as SignalQuality;
    let signal: Array<Array<number>> = [];
    let state: Array<Array<number>> = [];
    Object.keys(quality).forEach((channel, index) => {
      this.bufferData[index * 2].push(quality[index].standardDeviation);
      this.bufferData[index * 2 + 1].push(quality[index].status);
      signal.push(this.bufferData[index * 2]);
      state.push(this.bufferData[index * 2 + 1]);
    });
    if (this.bufferData[0].length > this.bufferLength) {
      this.bufferData.forEach(channel => {
        channel.slice(1);
      });
    }

    this._averageSignalQuality = mean(signal, 0);
    this._averageSignalState = mean(state, 0);
    this.saveData(this.bufferData, this.bufferTimeStamp[0], Date.now());
  }

  getLabels(): Array<string> {
    let labels: Array<string> = [];
    this.deviceInfo.channelNames.forEach(channelName => {
      labels.push(channelName + 'Std');
      labels.push(channelName + 'State');
    });
    return labels;
  }
}
