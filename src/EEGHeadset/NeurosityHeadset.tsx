import {Headset} from './Headset';
import {Neurosity} from '@neurosity/sdk';
import {DeviceStatus} from '@neurosity/sdk/dist/cjs/types/status';

export class NeurosityHeadset extends Headset {
  private neurosity: Neurosity;
  public deviceStatus: DeviceStatus | undefined;
  private isGettingLiveStatus: boolean = false;
  private deviceStatusHandlers: Array<any> = [];
  constructor() {
    super();
    this.neurosity = new Neurosity();
    this.deviceStatus = undefined;
  }

  addDeviceStatusHandlers(handler: any) {
    this.deviceStatusHandlers.push(handler);
  }

  async login(parameters: {email: string; password: string}): Promise<void> {
    return this.neurosity.login(parameters);
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
    return this.neurosity.logout();
  }
}
