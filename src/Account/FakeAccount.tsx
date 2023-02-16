import {Account} from './Account';
import {FakeHeadset} from '../EEGHeadset/FakeHeadest';
import {Session, SessionInfo} from '../Session';
import {S3Client} from '@aws-sdk/client-s3';
import {FakeDataRecorder} from '../EEGHeadset/FakeDataRecorder';
import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';
// @ts-ignore
import {v4 as uuidv4} from 'uuid';
// @ts-ignore
import {AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY} from '@env';

export class FakeAccount extends Account {
  constructor(headset: FakeHeadset) {
    super(headset);
  }

  async init() {
    this.connecting = true;
    await this.connect('', '');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async connect(username: string, password: string) {
    this.connecting = true;
    await this.headset.login({email: username, password: password});
    this.connecting = false;
    this.loggedIn = true;
  }

  async logout() {
    await this.headset.logout();
    this.loggedIn = false;
  }

  isConnecting() {
    return this.connecting;
  }

  createRecordingSession(sessionInfo: SessionInfo): Session {
    let credentials = {
      accessKeyId: AWS_ACCESS_KEY_ID ? AWS_ACCESS_KEY_ID : '',
      secretAccessKey: AWS_SECRET_ACCESS_KEY ? AWS_SECRET_ACCESS_KEY : '',
    };
    let s3client = new S3Client({
      region: 'us-east-1',
      credentials: credentials,
    });
    let recorder = new FakeDataRecorder(
      this.headset,
      s3client,
      sessionInfo.type,
    );
    return new Session(sessionInfo, recorder, s3client);
  }
}
