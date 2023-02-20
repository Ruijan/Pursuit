import {
  DocumentDirectoryPath,
  readDir,
  ReadDirItem,
  readFile,
  unlink,
  writeFile,
} from 'react-native-fs';
import {NeurosityHeadset} from '../EEGHeadset/NeurosityHeadset';
import {Account} from './Account';
import {Session, SessionInfo} from '../Experiment/Session';
import {NeurosityDataRecorder} from '../Experiment/Recorder/NeurosityDataRecorder';

import {ExperimentSession} from '../Experiment/ExperimentSession';
import {createS3Client} from '../Experiment/CreateS3Client';

export class NeurosityAccount extends Account {
  private neurosityHeadset: NeurosityHeadset;
  constructor(headset: NeurosityHeadset) {
    super(headset);
    this.neurosityHeadset = headset;
  }

  async init() {
    this.connecting = true;
    let result = await readDir(DocumentDirectoryPath);
    let credentialsString = '';
    if (result.length > 0 && this.isLoginFile(result[0], result[0].name)) {
      credentialsString = await readFile(result[0].path, 'utf8');
      let userData = JSON.parse(credentialsString);
      this.username = userData.username;
      this.password = userData.password;
      try {
        await this.headset.login(userData);
      } catch (error) {
        if (error === 'Already logged in.') {
          console.log(error);
        } else {
          this.connecting = false;
          throw error;
        }
      }
      this.loggedIn = true;
    }
    this.connecting = false;
  }

  private isLoginFile(file: ReadDirItem, name: string) {
    return file.isFile() && name.includes('.json');
  }

  async connect(username: string, password: string) {
    this.connecting = true;
    try {
      await this.headset.login({
        email: username,
        password: password,
      });
      this.loggedIn = true;
      let path = DocumentDirectoryPath + '/neurosity.json';
      await writeFile(
        path,
        JSON.stringify({email: username, password: password}),
        'utf8',
      );
    } catch (err) {
      if (err === 'Already logged in.') {
        console.log(err);
        this.loggedIn = true;
        let path = DocumentDirectoryPath + '/neurosity.json';
        await writeFile(
          path,
          JSON.stringify({email: username, password: password}),
          'utf8',
        );
      } else {
        this.connecting = false;
        throw err;
      }
    }
    this.connecting = false;
  }

  async logout() {
    let path = DocumentDirectoryPath + '/neurosity.json';
    await this.headset.logout();
    await unlink(path);
    this.loggedIn = false;
  }

  createRecordingSession(sessionInfo: SessionInfo): Session {
    let s3client = createS3Client();
    let recorder = new NeurosityDataRecorder(
      this.neurosityHeadset,
      s3client,
      sessionInfo.type,
    );
    if (sessionInfo.type === 'experiment') {
      return new ExperimentSession(sessionInfo, recorder, s3client);
    }
    return new Session(sessionInfo, recorder, s3client);
  }
}

export default NeurosityAccount;
