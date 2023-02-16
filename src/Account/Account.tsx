import {Headset} from '../EEGHeadset/Headset';
import {Session, SessionInfo} from '../Session';

export abstract class Account {
  get headset(): Headset {
    return this._headset;
  }
  public loggedIn: boolean = false;
  protected username: string = '';
  protected password: string = '';
  protected connecting: boolean = false;
  protected _headset: Headset;
  protected constructor(headset: Headset) {
    this._headset = headset;
  }

  abstract init(): void;

  abstract connect(username: string, password: string): Promise<void>;

  abstract logout(): Promise<void>;

  abstract createRecordingSession(sessionInfo: SessionInfo): Session;

  isConnecting() {
    return this.connecting;
  }
}
