import NeurosityAccount from './NeurosityAccount';
import {HeadsetFactory, HeadsetType} from '../EEGHeadset/HeadsetFactory';

export class AccountFactory {
  async build() {
    let headsetFactory = new HeadsetFactory();
    let account = new NeurosityAccount(
      headsetFactory.build(HeadsetType.Neurosity),
    );
    await account.init();
    return account;
  }
}
