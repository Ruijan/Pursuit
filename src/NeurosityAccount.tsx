import {
  readDir,
  readFile,
  unlink,
  writeFile,
  DocumentDirectoryPath,
  ReadDirItem,
} from 'react-native-fs';
import {Neurosity} from './EEGHeadset/Neurosity';

class NeurosityAccount {
  public loggedIn: boolean = false;
  public neurosity: Neurosity;
  private username: string = '';
  private password: string = '';
  constructor(neurosity: Neurosity) {
    this.neurosity = neurosity;
  }

  async loadUser() {
    let result = await readDir(DocumentDirectoryPath);
    let credentialsString = '';
    if (result.length > 0 && this.isLoginFile(result[0], result[0].name)) {
      credentialsString = await readFile(result[0].path, 'utf8');
      let userData = JSON.parse(credentialsString);
      this.username = userData.username;
      this.password = userData.password;
      await this.neurosity.login(userData);
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
      throw err;
    }
  }

  async logout() {
    let path = DocumentDirectoryPath + '/neurosity.json';
    await this.neurosity.logout();
    await unlink(path);
    this.loggedIn = false;
  }
}

export default NeurosityAccount;
