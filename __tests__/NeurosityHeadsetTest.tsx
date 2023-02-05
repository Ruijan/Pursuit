import {NeurosityHeadset} from '../src/EEGHeadset/NeurosityHeadset';

test('login to neurosity', async () => {
  let headset = new NeurosityHeadset();
  await headset.login({email: 'rechenmann@gmail.com', password: 'Nuggets83n!'});
  expect(headset.isDeviceConnected()).toBeTruthy();
});
