import {DeviceStatus} from '@neurosity/sdk/dist/cjs/types/status';
import {DeviceInfo} from '@neurosity/sdk/dist/cjs/types/deviceInfo';
import {DataRecorder} from '../Experiment/Recorder/DataRecorder';

export abstract class Headset {
  get deviceStatus(): DeviceStatus | undefined {
    return this._deviceStatus;
  }

  get deviceInfo(): DeviceInfo | undefined {
    return this._deviceInfo;
  }

  get timeSinceRecording(): number {
    return this._timeSinceRecording;
  }

  protected _timeSinceRecording: number = 0;
  public recording: boolean = false;
  protected _deviceStatus: DeviceStatus | undefined;
  protected isGettingLiveStatus: boolean = false;
  protected deviceStatusHandlers: Array<any> = [];
  protected dataRecorder: DataRecorder | undefined;
  protected _deviceInfo: DeviceInfo | undefined;

  addDeviceStatusHandlers(handler: any) {
    this.deviceStatusHandlers.push(handler);
  }

  abstract login(parameters: {email: string; password: string}): Promise<void>;

  abstract logout(): Promise<void>;

  abstract getLiveInfo(): DeviceStatus | undefined;
}
