import {Headset} from './Headset';
import {NeurosityHeadset} from './NeurosityHeadset';

export enum HeadsetType {
  Neurosity = 0,
  Generic,
}

export class HeadsetFactory {
  build(headsetType: HeadsetType): Headset {
    if (headsetType === HeadsetType.Neurosity) {
      return new NeurosityHeadset();
    } else {
      return new Headset();
    }
  }
}
