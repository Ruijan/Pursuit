import {
  readDir,
  readFile,
  unlink,
  writeFile,
  DocumentDirectoryPath,
  ReadDirItem,
} from 'react-native-fs';
import {NeurosityHeadset} from '../EEGHeadset/NeurosityHeadset';
import {Account} from './Account';
import {Session, SessionInfo} from '../Session';
import {S3Client} from '@aws-sdk/client-s3';
import {NeurosityDataRecorder} from '../EEGHeadset/Neurosity/NeurosityDataRecorder';
import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';
// @ts-ignore
import {v4 as uuidv4} from 'uuid';
// @ts-ignore
import {AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY} from '@env';

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
    let credentials = {
      accessKeyId: AWS_ACCESS_KEY_ID ? AWS_ACCESS_KEY_ID : '',
      secretAccessKey: AWS_SECRET_ACCESS_KEY ? AWS_SECRET_ACCESS_KEY : '',
    };
    let s3client = new S3Client({
      region: 'us-east-1',
      credentials: credentials,
    });
    let recorder = new NeurosityDataRecorder(
      this.neurosityHeadset,
      s3client,
      sessionInfo.type,
    );
    return new Session(sessionInfo, recorder, s3client);
  }
}

export default NeurosityAccount;
