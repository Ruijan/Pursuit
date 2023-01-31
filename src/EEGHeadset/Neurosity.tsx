export class Neurosity {
  async login(parameters: {email: string; password: string}): Promise<void> {
    console.log('logging in', parameters);
    return new Promise(() => {
      console.log('returning value');
    });
  }

  async logout(): Promise<void> {
    return new Promise(() => {});
  }
}
