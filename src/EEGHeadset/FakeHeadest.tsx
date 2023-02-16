import {Headset} from './Headset';
import { DeviceStatus, SLEEP_MODE_REASON, STATUS } from "@neurosity/sdk/dist/cjs/types/status";

const device = {
  deviceId: 'FakeDevice123',
  deviceNickname: 'FakeDeviceNickname',
  channelNames: ['1', '2', '3', '4', '5', '6', '7', '8'],
  channels: 8,
  samplingRate: 256,
  manufacturer: 'Pursuit AI',
  model: 'Fake1',
  modelName: 'Fake1',
  modelVersion: 'v1.0.0',
  osVersion: 'v1.0.0.0',
  apiVersion: 'v2.3.1',
  emulator: false,
};

const deviceStatus = {
  battery: 94,
  charging: false,
  state: STATUS.ONLINE,
  sleepMode: false,
  sleepModeReason: null,
  lastHeartbeat: Date.now(),
  ssid: '1234567890',
};

export class FakeHeadset extends Headset {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async login(parameters: {email: string; password: string}): Promise<void> {
    return new Promise(resolve => {
      this._deviceInfo = device;
      resolve();
    });
  }

  async logout(): Promise<void> {
    return new Promise(resolve => {
      resolve();
    });
  }

  getLiveInfo(): DeviceStatus {
    return deviceStatus;
  }
}
