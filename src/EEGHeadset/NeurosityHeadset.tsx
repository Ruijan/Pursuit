import {Headset} from './Headset';
import {Neurosity} from '@neurosity/sdk';
import {DeviceStatus} from '@neurosity/sdk/dist/cjs/types/status';
import {DeviceInfo} from '@neurosity/sdk/dist/cjs/types/deviceInfo';
import {DataRecorder} from './Neurosity/DataRecorder';

export class NeurosityHeadset extends Headset {
  private neurosity: Neurosity;
  private deviceInfo: DeviceInfo | undefined;
  public deviceStatus: DeviceStatus | undefined;
  private isGettingLiveStatus: boolean = false;
  private deviceStatusHandlers: Array<any> = [];
  private dataRecorder: DataRecorder | undefined;

  constructor() {
    super();
    this.neurosity = new Neurosity();
  }

  addDeviceStatusHandlers(handler: any) {
    this.deviceStatusHandlers.push(handler);
  }

  async login(parameters: {email: string; password: string}): Promise<void> {
    console.log('log in with', parameters);
    await this.neurosity.login(parameters);
    console.log('connected');
    return this.neurosity.getDevices().then(device => {
      this.deviceInfo = device[0];
    });
  }

  getLiveInfo() {
    if (!this.isGettingLiveStatus) {
      this.isGettingLiveStatus = true;
      this.neurosity.status().subscribe(status => {
        this.deviceStatus = status;
        this.deviceStatusHandlers.forEach(handler => {
          handler();
        });
      });
    }
    return this.deviceStatus;
  }

  async logout(): Promise<void> {
    return this.neurosity.logout().then(() => {
      this.dataRecorder?.stopRecording();
    });
  }

  async record() {
    if (this.isDeviceConnected()) {
      throw new Error('Device not connected');
    }
    if (!this.recording && this.deviceInfo) {
      this.dataRecorder = new DataRecorder(this.neurosity, this.deviceInfo);
      await this.dataRecorder.record();
    }
  }

  stopRecording() {
    if (!this.recording && this.dataRecorder) {
      this.dataRecorder.stopRecording();
    }
  }

  isRecording() {
    if (this.dataRecorder) {
      return this.dataRecorder.isRecording();
    }
    return false;
  }

  get timeSinceRecording(): number {
    if (this.dataRecorder) {
      return this.dataRecorder.getTimeSinceRecording();
    }
    return 0;
  }

  public isDeviceConnected() {
    return (
      !this.deviceInfo ||
      !this.deviceStatus ||
      (this.deviceStatus && this.deviceStatus.state !== 'online')
    );
  }
}
