import {Session, SessionInfo} from './Session';
import {DataRecorder} from './Recorder/DataRecorder';
import {S3Client} from '@aws-sdk/client-s3';
import {experiments, sounds} from '../assets/experiments';
import {Marker, MarkerBuilder} from './Recorder/MarkerRecorder';
import Sound from 'react-native-sound';

enum TrialState {
  WAITING,
  RUNNING,
}

enum ExperimentState {
  WAITING = 'waiting',
  CALIBRATING = 'calibration',
  TRIAL = 'trial',
  BREAK = 'break',
  DONE = 'done',
}

export class ExperimentSession extends Session {
  get currentTotalTrial(): number {
    return this._currentTotalTrial;
  }
  get maxTrials(): number {
    return this._maxTrials;
  }

  get maxRuns(): number {
    return this._maxRuns;
  }
  get state(): ExperimentState {
    return this._state;
  }

  get currentTrial(): Array<number> {
    return this._currentTrial;
  }

  get currentRun(): number {
    return this._currentRun;
  }
  get markerExpected(): string {
    return this._markerExpected;
  }
  get currentDuration(): number {
    return this._currentDuration;
  }
  get currentStepName(): string {
    return this._currentStepName;
  }

  get previousStepName(): string {
    return this._previousStepName;
  }

  get nextStepName(): string {
    return this._nextStepName;
  }
  private experiment: any;
  private previousTimestamp: number = Date.now();
  private _state: ExperimentState = ExperimentState.WAITING;
  private _currentTrial: Array<number> = [];
  private _currentRun = 0;
  private intervalCallback: any = 0;
  private trialState: TrialState = TrialState.WAITING;
  private currentTrialStep: number = 0;
  private currentSituation: number = 0;
  private _currentStepName: string = '';
  private _previousStepName: string = '';
  private _nextStepName: string = '';
  private _currentDuration: number = 0;
  private _markerExpected: string = '';
  private _maxTrials: number = 0;
  private _maxRuns: number = 0;
  private _currentTotalTrial: number = 0;
  private currentSound: Array<string> = [];
  private sounds: {[key: string]: Sound} = {};

  constructor(info: SessionInfo, recorder: DataRecorder, s3client: S3Client) {
    super(info, recorder, s3client);
    this.experiment = findExperiment(this.info.name);
    this._maxRuns = this.experiment.nbRuns;
    this._maxTrials = this.experiment.nbTrials.reduce(
      (partialSum: number, a: number) => partialSum + a,
      0,
    );
    this.initTrialCount();
    Sound.setCategory('Playback');
    sounds.forEach(sound => {
      console.log('loading ', sound.name);
      this.sounds[sound.name] = new Sound(sound.file, error => {
        if (error) {
          console.log('failed to load the sound', error);
          return;
        }
        console.log('file ', sound.name, ' loaded');
      });
    });
  }

  private initTrialCount() {
    this._currentTrial = Array<number>(this.experiment.nbSituations).fill(0);
    this._currentTotalTrial = 0;
  }

  async startRecording() {
    await super.startRecording();
    this.intervalCallback = setInterval(async () => {
      await this.update();
    }, 100);
  }

  async update() {
    switch (this._state) {
      case ExperimentState.WAITING:
        this._state = ExperimentState.CALIBRATING;
        this.recorder.addMarker(
          MarkerBuilder.buildGenericMarker('start_calibration', Date.now()),
        );
        break;
      case ExperimentState.CALIBRATING:
        await this.calibrate();
        break;
      case ExperimentState.TRIAL:
        await this.runTrial();
        break;
      case ExperimentState.BREAK:
        await this.runBreak();
        break;
    }
  }

  async addMarker(marker: Marker) {
    super.addMarker(marker);
    let currentEndpoint = this.getCurrentEndpoint();
    if (currentEndpoint.type === 'multiple_or') {
      let result = currentEndpoint.value.filter((stop: {type: string}) => {
        return stop.type === 'marker';
      });
      if (result.length > 0) {
        currentEndpoint = result[0];
      }
    }
    if (
      currentEndpoint.type === 'marker' &&
      marker.name === this._markerExpected
    ) {
      this._markerExpected = '';
      let currentStep = this.getCurrentStep();
      if (this.trialState === TrialState.WAITING) {
        await this.startStep(currentStep, false);
      } else {
        if (
          this._state === ExperimentState.CALIBRATING ||
          this._state === ExperimentState.TRIAL
        ) {
          await this.nextStep(currentStep, false);
        } else {
          await this.nextRun();
        }
      }
    }
  }

  private async nextRun() {
    this._state = ExperimentState.TRIAL;
    this.trialState = TrialState.WAITING;
    await this.createTrialMarker();
  }

  private async createTrialMarker() {
    let currentTrial = this._currentTrial.reduce(
      (partialSum, a) => partialSum + a,
      0,
    );
    this._currentTotalTrial = currentTrial;
    this.recorder.addMarker(
      MarkerBuilder.buildGenericMarker(
        'start_run_' +
          String(this._currentRun) +
          '_trial_' +
          String(currentTrial),
        Date.now(),
      ),
    );
  }

  private getCurrentEndpoint() {
    let currentStage = this.getCurrentStep();
    let endpoint = 'start';
    if (this.trialState === TrialState.RUNNING) {
      endpoint = 'stop';
    }
    return currentStage[endpoint];
  }

  private getCurrentStep() {
    let currentStage = null;
    if (this._state === ExperimentState.TRIAL) {
      currentStage =
        this.experiment.trials[this.currentSituation][this.currentTrialStep];
    } else if (this._state === ExperimentState.BREAK) {
      currentStage = this.experiment.break;
    } else if (this._state === ExperimentState.CALIBRATING) {
      currentStage = this.experiment.calibration[this.currentTrialStep];
    }
    return currentStage;
  }

  private async runBreak() {
    if (this._currentRun >= this.experiment.nbRuns) {
      this._state = ExperimentState.DONE;
      clearInterval(this.intervalCallback);
      Object.keys(this.sounds).forEach(name => this.sounds[name].release());
      this.stopRecording().then();
      return;
    }
    if (this.trialState === TrialState.WAITING) {
      if (this.experiment.break.stop.type === 'duration') {
        this.previousTimestamp = Date.now();
      }
      this.trialState = TrialState.RUNNING;
    } else if (this.trialState === TrialState.RUNNING) {
      if (this.experiment.break.stop.type === 'duration') {
        this._currentDuration = (Date.now() - this.previousTimestamp) / 1000;
        if (this._currentDuration > this.experiment.break.stop.value) {
          await this.nextRun();
        }
      }
    }
  }

  private async runTrial() {
    let totalTrials = this.experiment.nbTrials.reduce(
      (sum: number, a: number) => sum + a,
      0,
    );

    if (this._currentTotalTrial >= totalTrials) {
      this._state = ExperimentState.BREAK;
      this._currentRun += 1;
      this.initTrialCount();
      this._currentTotalTrial = this._currentTrial.reduce(
        (sum, a) => sum + a,
        0,
      );
      this.currentTrialStep = 0;
      return;
    }
    let currentSituation = this.experiment.trials[this.currentSituation];
    let currentStep = currentSituation.sequence[this.currentTrialStep];
    if (this.currentTrialStep >= currentSituation.sequence.length) {
      this._currentTrial[this.currentSituation] += 1;
      this._currentTotalTrial = this._currentTrial.reduce(
        (sum, a) => sum + a,
        0,
      );
      this.currentTrialStep = 0;
      this.trialState = TrialState.WAITING;
      if (this._currentTotalTrial < totalTrials) {
        this.setNewSituationRandomly();
      }
      await this.createTrialMarker();
      return;
    }
    await this.updateCurrentTrialStep(currentStep);
  }

  private setNewSituationRandomly() {
    let situationIndices = this._currentTrial.map((trialNb, index) => {
      if (trialNb < this.experiment.nbTrials[index]) {
        return index;
      }
      return -1;
    });
    situationIndices = situationIndices.filter(value => {
      return value !== -1;
    });
    if (situationIndices) {
      let randomIndex = Math.round(
        Math.random() * (situationIndices.length - 1),
      );
      this.currentSituation = situationIndices[randomIndex];
    }
  }

  private async calibrate() {
    if (this.currentTrialStep >= this.experiment!.calibration.length) {
      this._state = ExperimentState.TRIAL;
      this.currentTrialStep = 0;
      this.recorder.addMarker(
        MarkerBuilder.buildGenericMarker('end_calibration', Date.now()),
      );

      this.setNewSituationRandomly();
      await this.createTrialMarker();
      return;
    }
    let currentStep = this.experiment.calibration[this.currentTrialStep];
    await this.updateCurrentTrialStep(currentStep);
  }

  private async updateCurrentTrialStep(currentStep: any) {
    if (this.trialState === TrialState.WAITING) {
      if (currentStep.start.type === 'after_previous') {
        if (currentStep.stop.type === 'marker') {
          this._markerExpected = currentStep.stop.value;
          this.updateStateHandler.forEach(handler => handler());
        }
        await this.startStep(currentStep, true);
      }
      if (currentStep.start.type === 'marker' && this._markerExpected === '') {
        this._markerExpected = currentStep.start.value;
        this.updateStateHandler.forEach(handler => handler());
      }
    } else if (this.trialState === TrialState.RUNNING) {
      let currentStop = currentStep.stop;
      if (currentStop.type === 'multiple_or') {
        let result = currentStop.value.filter((stop: {type: string}) => {
          return stop.type === 'duration';
        });
        if (result.length > 0) {
          currentStop = result[0];
        }
      }
      if (currentStop.type === 'duration') {
        this._currentDuration = (Date.now() - this.previousTimestamp) / 1000;
        this.updateTimerHandler.forEach(handler => handler());
        if (this._currentDuration > currentStop.value) {
          this._currentDuration = 0;
          await this.nextStep(currentStep, true);
        }
      }
    }
  }

  private async nextStep(currentStep: any, saveMarker: boolean) {
    this.currentTrialStep += 1;
    this.trialState = TrialState.WAITING;
    if (saveMarker) {
      this.recorder.addMarker(
        MarkerBuilder.buildGenericMarker(
          'stop_' + currentStep.name,
          Date.now(),
        ),
      );
    }
    if (currentStep.data.hasOwnProperty('audio_file')) {
      this.currentSound.forEach(sound => this.sounds[sound].pause());
    }
    this.updateStateHandler.forEach(handler => handler());
  }

  private async startStep(currentStep: any, saveMarker: boolean) {
    this._previousStepName = this._currentStepName;
    this._currentStepName = currentStep.name;
    this.trialState = TrialState.RUNNING;
    let currentStop = currentStep.stop;
    if (currentStop.type === 'multiple_or') {
      let result = currentStop.value.filter((stop: {type: string}) => {
        return stop.type === 'duration';
      });
      if (result.length > 0) {
        currentStop = result[0];
      }
    }
    if (currentStop.type === 'duration') {
      this.previousTimestamp = Date.now();
    }
    if (saveMarker) {
      this.recorder.addMarker(
        MarkerBuilder.buildGenericMarker(
          'start_' + currentStep.name,
          Date.now(),
        ),
      );
    }
    if (currentStep.data.hasOwnProperty('start_audio')) {
      this.playAudioFile(currentStep.data.start_audio);
    }
    if (currentStep.data.hasOwnProperty('audio_file')) {
      this.playAudioFile(currentStep.data.audio_file);
    }
    this.updateStateHandler.forEach(handler => handler());
  }

  private playAudioFile(audioFile: string) {
    if (!this.currentSound.includes(audioFile)) {
      this.currentSound.push(audioFile);
    }
    this.sounds[audioFile].play(() => {
      const index = this.currentSound.indexOf(audioFile);
      this.currentSound.splice(index, 1);
    });
  }

  private getAudioFile(audioFile: string) {
    let soundResults = sounds.filter(sound => sound.name === audioFile);
    if (soundResults.length === 0) {
      throw Error('No audio file found with name ' + audioFile);
    }
    return soundResults[0];
  }
}

function findExperiment(experimentName: string) {
  for (let experiment of experiments) {
    if (experiment.name === experimentName) {
      return experiment;
    }
  }
}
