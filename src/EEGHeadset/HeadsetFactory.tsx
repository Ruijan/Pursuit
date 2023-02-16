import {Headset} from './Headset';
import {NeurosityHeadset} from './NeurosityHeadset';
import {FakeHeadset} from './FakeHeadest';

export enum HeadsetType {
  Neurosity = 0,
  Generic,
}

export class HeadsetFactory {
  build(headsetType: HeadsetType): Headset {
    if (headsetType === HeadsetType.Neurosity) {
      return new NeurosityHeadset();
    } else {
      return new FakeHeadset();
    }
  }

  static buildNeurosityHeadset() {
    return new NeurosityHeadset();
  }

  static buildFakeHeadset() {
    return new FakeHeadset();
  }
}
