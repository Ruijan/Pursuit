import {Account} from './Account';

class PursuitAccount {
  get headsetAccount(): Account {
    return this._headsetAccount;
  }
  loggedIn: boolean = false;
  hasInitiated: boolean = false;
  private connectHandler: Array<any> = [];
  private disconnectHandler: Array<any> = [];
  private _headsetAccount: Account;
  constructor(headsetAccount: Account) {
    this._headsetAccount = headsetAccount;
  }

  async init() {
    if (!this.hasInitiated) {
      await this._headsetAccount.init();
      console.log('Connected ', this._headsetAccount.loggedIn);
      if (this._headsetAccount.loggedIn) {
        this.loggedIn = true;
        this.connectHandler.forEach(handler => {
          handler();
        });
      }
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
    return this._headsetAccount.loggedIn;
  }

  getDeviceStatus() {
    return this._headsetAccount.headset.getLiveInfo();
  }

  addDeviceStatusHandler(handler: () => void) {
    this._headsetAccount.headset.addDeviceStatusHandlers(handler);
  }

  login(username: string, password: string): Promise<void> {
    return this._headsetAccount.connect(username, password).then(() => {
      this.connectHandler.forEach(handler => {
        handler();
      });
    });
  }

  async logout() {
    if (this._headsetAccount.loggedIn) {
      return this._headsetAccount.logout().then(() => {
        this.disconnectHandler.forEach(handler => {
          handler();
        });
      });
    }
  }

  getHeadset() {
    return this._headsetAccount.headset;
  }

  connecting() {
    return this._headsetAccount.isConnecting();
  }
}

export default PursuitAccount;
