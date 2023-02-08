export class Headset {
  get timeSinceRecording(): number {
    return this._timeSinceRecording;
  }

  private _timeSinceRecording: number = 0;
  public recording: boolean = false;

  async login(parameters: {email: string; password: string}): Promise<void> {
    console.log('logging in', parameters);
    return new Promise(resolve => {
      console.log('returning value');
      resolve();
    });
  }

  async logout(): Promise<void> {
    return new Promise(resolve => {
      resolve();
    });
  }

  isRecording() {
    return true;
  }
}
