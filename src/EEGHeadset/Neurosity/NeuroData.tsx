import {DeviceInfo} from '@neurosity/sdk/dist/cjs/types/deviceInfo';
import {Observable} from 'rxjs';

export abstract class NeuroData {
  get timeStart(): number {
    return this._timeStart;
  }
  get isRecording(): boolean {
    return this._isRecording;
  }
  public bufferData: Array<Array<any>> = [];
  public bufferTimeStamp: Array<number> = [];
  public deviceInfo: DeviceInfo;
  protected currentTimeStamp = 0;
  protected bufferLength = 5; // Seconds
  private observable: Observable<any>;
  private subscription: any;
  name: string;
  private _isRecording: boolean = false;
  private _timeStart: number = 0;

  constructor(
    name: string,
    deviceInfo: DeviceInfo,
    observable: Observable<any>,
  ) {
    this.name = name;
    this.deviceInfo = deviceInfo;
    this.observable = observable;
    this.init();
  }

  init() {
    this.currentTimeStamp = 0;
    this.bufferData = Array(this.deviceInfo.channelNames.length);
    this.bufferTimeStamp = [];
  }

  protected elapsedTime() {
    return (
      (this.bufferTimeStamp[this.bufferTimeStamp.length - 1] -
        this.bufferTimeStamp[0]) /
      1000
    );
  }

  async subscribe() {
    console.log('subrscribing to ', this.name, ' stream');
    this.init();
    this.subscription = this.observable.subscribe(async data => {
      if (!this._isRecording) {
        this._isRecording = true;
        this._timeStart = Date.now();
      }
      try {
        this.setData(data);
      } catch (error) {
        console.log(error);
        throw error;
      }
    });
  }

  abstract setData(data: {[name: string]: any}): void;

  stopRecording() {
    this.subscription.unsubscribe();
    this._isRecording = false;
  }

  abstract getLabels(): Array<string>;
}
