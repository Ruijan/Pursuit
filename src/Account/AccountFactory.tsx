import NeurosityAccount from './NeurosityAccount';
import {HeadsetFactory, HeadsetType} from '../EEGHeadset/HeadsetFactory';
import {FakeAccount} from './FakeAccount';

export enum AccountType {
  Neurosity = 0,
  Fake,
}

export class AccountFactory {
  static build(type: AccountType) {
    if (type === AccountType.Neurosity) {
      return new NeurosityAccount(HeadsetFactory.buildNeurosityHeadset());
    } else {
      return new FakeAccount(HeadsetFactory.buildFakeHeadset());
    }
  }
}
