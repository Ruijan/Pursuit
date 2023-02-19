import React from 'react';
import {Text, View} from 'react-native';
import styles from '../styles/Styles';
import {ExperimentSession} from '../Experiment/ExperimentSession';

type ExperimentViewProps = {
  session: ExperimentSession;
};

type ExperimentViewState = {
  name: string;
  previousStep: string;
  currentStep: string;
  nextStep: string;
  duration: number;
  marker: string;
  stage: string;
  trial: number;
  maxTrial: number;
  run: number;
  maxRun: number;
};

export class ExperimentView extends React.Component<
  ExperimentViewProps,
  ExperimentViewState
> {
  private session: any;
  constructor(props: ExperimentViewProps) {
    super(props);
    this.session = props.session;
    this.state = {
      name: this.session.info.name,
      previousStep: this.session.previousStepName,
      currentStep: this.session.currentStepName,
      nextStep: this.session.nextStepName,
      duration: this.session.currentDuration,
      marker: this.session.markerExpected,
      stage: this.session.state,
      trial: this.session.currentTrial,
      maxTrial: this.session.maxTrials,
      run: this.session.currentRun,
      maxRun: this.session.maxRuns,
    };
    this.updateSessionState = this.updateSessionState.bind(this);
    this.updateTimeState = this.updateTimeState.bind(this);
    this.session.addStateUpdateHandler(this.updateSessionState);
    this.session.addTimerUpdateHandler(this.updateTimeState);
  }

  updateSessionState() {
    this.setState({
      name: this.session.info.name,
      previousStep: this.session.previousStepName,
      currentStep: this.session.currentStepName,
      nextStep: this.session.nextStepName,
      duration: this.session.currentDuration,
      marker: this.session.markerExpected,
      stage: this.session.state,
      trial: this.session.currentTotalTrial,
      maxTrial: this.session.maxTrials,
      run: this.session.currentRun,
      maxRun: this.session.maxRuns,
    });
  }

  updateTimeState() {
    this.setState({
      duration: this.session.currentDuration,
    });
  }

  render() {
    return (
      <View>
        <Text style={[styles.title, styles.centeredText]}>
          {this.state.name}
        </Text>
        <View style={styles.container}>
          <View style={styles.infoCard}>
            <Text style={styles.titleCard}>Previous Step</Text>
            <Text style={styles.labelText}>{this.state.previousStep}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.titleCard}>Current Step</Text>
            <Text style={styles.labelText}>
              {this.state.currentStep !== '' && this.state.currentStep}
            </Text>
            {(this.state.duration > 0 || this.state.marker !== '') && (
              <Text style={styles.labelText}>
                {this.state.duration > 0 && String(this.state.duration) + 's'}
                {this.state.marker !== '' &&
                  'Expected event ' + String(this.state.marker)}
              </Text>
            )}
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.titleCard}>Next Step</Text>
            <Text style={styles.labelText}>{this.state.nextStep}</Text>
          </View>
        </View>
        <View style={styles.container}>
          <View style={styles.infoCard}>
            <Text style={styles.titleCard}>Trial</Text>
            <Text style={styles.labelText}>
              {this.state.trial}/{this.state.maxTrial}
            </Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.titleCard}>Run</Text>
            <Text style={styles.labelText}>
              {this.state.run}/{this.state.maxRun}
            </Text>
          </View>
        </View>
      </View>
    );
  }
}
