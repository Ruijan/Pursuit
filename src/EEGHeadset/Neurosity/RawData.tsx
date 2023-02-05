import {DeviceInfo} from '@neurosity/sdk/dist/cjs/types/deviceInfo';
import {Observable} from 'rxjs';
import {round} from 'mathjs';
import {NeuroData} from './NeuroData';

export class RawData extends NeuroData {
  constructor(
    deviceInfo: DeviceInfo,
    observable: Observable<any>,
    sessionName: string,
  ) {
    super('raw', deviceInfo, observable, sessionName);
  }

  setData(data: {[name: string]: any}) {
    let info = data.info as {[name: string]: any};
    let rawData = data.data as Array<Array<number>>;
    let currentTimeStamp = this.bufferTimeStamp;
    let currentData = this.bufferData;
    let timestamps = Array.apply(null, Array(rawData[0].length)).map(function (
      x,
      timeIndex,
    ) {
      return info.startTime + round((timeIndex / info.samplingRate) * 1000);
    });
    rawData.map((channel: Array<number>, channelIndex: number) => {
      currentData[channelIndex] = currentData[channelIndex].concat(channel);
      currentTimeStamp[channelIndex] =
        currentTimeStamp[channelIndex].concat(timestamps);
    });
    if (
      currentTimeStamp[0].length >
      (info.samplingRate / 16) * this.bufferLength
    ) {
      currentTimeStamp.forEach(
        (channel: Array<number>, channelIndex: number) => {
          currentTimeStamp[channelIndex] = currentTimeStamp[channelIndex].slice(
            rawData[channelIndex].length,
          );
          currentData[channelIndex] = currentData[channelIndex].slice(
            rawData[channelIndex].length,
          );
        },
      );
    }
    this.bufferTimeStamp = currentTimeStamp;
    this.bufferData = currentData;
    this.currentTimeStamp = info.startTime;
    this.saveData(rawData, timestamps, info.startTime);
  }

  getLabels(): Array<string> {
    return this.deviceInfo.channelNames;
  }
}
