import {Headset} from './Headset';
import {Neurosity} from '@neurosity/sdk';
import {DeviceStatus} from '@neurosity/sdk/dist/cjs/types/status';

export class NeurosityHeadset extends Headset {
  private _neurosity: Neurosity;

  constructor() {
    super();
    this._neurosity = new Neurosity();
  }

  get neurosity(): Neurosity {
    return this._neurosity;
  }

  async login(parameters: {email: string; password: string}): Promise<void> {
    console.log('log in with', parameters);
    await this._neurosity.login(parameters);
    await this.getLiveInfo();
    console.log('connected');
    return this._neurosity.getDevices().then(device => {
      this._deviceInfo = device[0];
    });
  }

  getLiveInfo(): DeviceStatus | undefined {
    if (!this.isGettingLiveStatus) {
      this.isGettingLiveStatus = true;
      this._neurosity.status().subscribe(status => {
        this._deviceStatus = status;
        this.deviceStatusHandlers.forEach(handler => {
          handler();
        });
      });
    }
    return this.deviceStatus;
  }

  async logout(): Promise<void> {
    return this._neurosity.logout().then(() => {
      this.dataRecorder?.stopRecording();
    });
  }

  public isDeviceConnected() {
    return (
      !this._deviceInfo ||
      !this.deviceStatus ||
      (this.deviceStatus && this.deviceStatus.state !== 'online')
    );
  }
}
