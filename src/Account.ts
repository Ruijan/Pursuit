import NeurosityAccount from './NeurosityAccount';

class Account {
  loggedIn: boolean = false;
  public neurosityLoggedIn: boolean = false;
  private neurosity: NeurosityAccount;
  constructor(neurosity: NeurosityAccount) {
    this.neurosity = neurosity;
  }

  isLoggedIn() {
    return this.neurosity.loggedIn;
  }

  connectNeurosity(username: string, password: string): Promise<boolean> {
    return this.neurosity.connect(username, password);
  }

  async logout() {
    if (this.neurosity.loggedIn) {
      return this.neurosity.logout();
    }
  }
}

export default Account;
