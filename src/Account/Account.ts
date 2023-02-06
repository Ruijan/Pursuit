import NeurosityAccount from './NeurosityAccount';

class Account {
  loggedIn: boolean = false;
  hasInitiated: boolean = false;
  private connectHandler: Array<any> = [];
  private recordingHandler: Array<any> = [];
  private disconnectHandler: Array<any> = [];
  private stopRecordingHandler: Array<any> = [];
  private neurosity: NeurosityAccount;
  constructor(neurosity: NeurosityAccount) {
    this.neurosity = neurosity;
  }

  async init() {
    if (!this.hasInitiated) {
      await this.neurosity.init();
      this.hasInitiated = true;
    }
  }

  addConnectionHandler(handler: any) {
    this.connectHandler.push(handler);
  }
  addDisconnectHandler(handler: any) {
    this.disconnectHandler.push(handler);
  }

  isLoggedIn() {
    return this.neurosity.loggedIn;
  }

  getDeviceStatus() {
    return this.neurosity.neurosity.getLiveInfo();
  }

  addDeviceStatusHandler(handler: () => void) {
    this.neurosity.neurosity.addDeviceStatusHandlers(handler);
  }

  isRecording() {
    return this.neurosity.neurosity.isRecording();
  }

  getTimeSinceRecording() {
    return this.neurosity.neurosity.timeSinceRecording;
  }

  connectNeurosity(username: string, password: string): Promise<void> {
    return this.neurosity.connect(username, password).then(() => {
      this.connectHandler.forEach(handler => {
        handler();
      });
    });
  }

  async logout() {
    if (this.neurosity.loggedIn) {
      return this.neurosity.logout().then(() => {
        this.disconnectHandler.forEach(handler => {
          handler();
        });
      });
    }
  }

  async startRecording(activityType: string) {
    if (this.neurosity.loggedIn) {
      await this.neurosity.record();
      this.recordingHandler.forEach(handler => {
        handler();
      });
    }
  }

  stopRecording() {
    if (this.neurosity.loggedIn) {
      this.neurosity.stopRecording();
      this.stopRecordingHandler.forEach(handler => {
        handler();
      });
    }
  }

  connecting() {
    return this.neurosity.isConnecting();
  }
}

export default Account;
