import {
  readDir,
  readFile,
  unlink,
  writeFile,
  DocumentDirectoryPath,
  ReadDirItem,
} from 'react-native-fs';
import {NeurosityHeadset} from '../EEGHeadset/NeurosityHeadset';

class NeurosityAccount {
  public loggedIn: boolean = false;
  public neurosity: NeurosityHeadset;
  private username: string = '';
  private password: string = '';
  private connecting: boolean = false;
  constructor(neurosity: NeurosityHeadset) {
    this.neurosity = neurosity;
  }

  async init() {
    let result = await readDir(DocumentDirectoryPath);
    let credentialsString = '';
    if (result.length > 0 && this.isLoginFile(result[0], result[0].name)) {
      credentialsString = await readFile(result[0].path, 'utf8');
      let userData = JSON.parse(credentialsString);
      this.username = userData.username;
      this.password = userData.password;
      try {
        await this.neurosity.login(userData);
      } catch (error) {
        if (error === 'Already logged in.') {
          console.log(error);
        } else {
          throw error;
        }
      }
      this.loggedIn = true;
    }
  }

  private isLoginFile(file: ReadDirItem, name: string) {
    return file.isFile() && name.includes('.json');
  }

  async connect(username: string, password: string) {
    try {
      await this.neurosity.login({
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
        throw err;
      }
    }
  }

  record() {
    return this.neurosity.record();
  }

  stopRecording() {
    this.neurosity.stopRecording();
  }

  async logout() {
    let path = DocumentDirectoryPath + '/neurosity.json';
    await this.neurosity.logout();
    await unlink(path);
    this.loggedIn = false;
  }

  isConnecting() {
    return this.connecting;
  }
}

export default NeurosityAccount;
