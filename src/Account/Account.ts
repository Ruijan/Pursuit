import NeurosityAccount from './NeurosityAccount';

class Account {
  loggedIn: boolean = false;
  hasInitiated: boolean = false;
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

  isLoggedIn() {
    return this.neurosity.loggedIn;
  }

  getDeviceStatus() {
    return this.neurosity.neurosity.getLiveInfo();
  }

  addDeviceStatusHandler(handler: () => void) {
    this.neurosity.neurosity.addDeviceStatusHandlers(handler);
  }

  connectNeurosity(username: string, password: string): Promise<void> {
    return this.neurosity.connect(username, password);
  }

  async logout() {
    if (this.neurosity.loggedIn) {
      return this.neurosity.logout();
    }
  }
}

export default Account;
