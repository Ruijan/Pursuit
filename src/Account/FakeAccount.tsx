import {Account} from './Account';
import {FakeHeadset} from '../EEGHeadset/FakeHeadest';
import {Session, SessionInfo} from '../Experiment/Session';
import {FakeDataRecorder} from '../Experiment/Recorder/FakeDataRecorder';
import {ExperimentSession} from '../Experiment/ExperimentSession';
import {createS3Client} from '../Experiment/CreateS3Client';

export class FakeAccount extends Account {
  constructor(headset: FakeHeadset) {
    super(headset);
  }

  async init() {
    this.connecting = true;
    await this.connect('', '');
  }

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
    let s3client = createS3Client();
    let recorder = new FakeDataRecorder(
      this.headset,
      s3client,
      sessionInfo.type,
    );
    if (sessionInfo.type === 'experiment') {
      return new ExperimentSession(sessionInfo, recorder, s3client);
    }
    return new Session(sessionInfo, recorder, s3client);
  }
}
