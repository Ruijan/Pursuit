import React from 'react';
import {Text, View} from 'react-native';
import styles from '../styles/Styles';
import {ExperimentSession} from '../Experiment/ExperimentSession';
// @ts-ignore
import Icon from 'react-native-vector-icons/Ionicons';
import {convertStringToLabel} from '../utils';

type ExperimentViewProps = {
  session: ExperimentSession;
};

type ExperimentViewState = {
  name: string;
  previousStep: string;
  previousStepIcon: string;
  currentStep: string;
  currentStepIcon: string;
  nextStep: string;
  duration: number;
  maxDuration: number;
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
      previousStepIcon: this.session.previousStepIcon,
      currentStep: this.session.currentStepName,
      currentStepIcon: this.session.currentStepIcon,
      nextStep: this.session.nextStepName,
      duration: this.session.currentDuration,
      maxDuration: this.session.maxDuration,
      marker: this.session.markerExpected,
      stage: this.session.state,
      trial: this.session.currentTotalTrial,
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
      name: convertStringToLabel(this.session.info.name),
      previousStep: convertStringToLabel(this.session.previousStepName),
      previousStepIcon: this.session.previousStepIcon,
      currentStep: convertStringToLabel(this.session.currentStepName),
      currentStepIcon: this.session.currentStepIcon,
      nextStep: convertStringToLabel(this.session.nextStepName),
      duration: Math.round(this.session.currentDuration),
      maxDuration: Math.round(this.session.maxDuration),
      marker: convertStringToLabel(this.session.markerExpected),
      stage: this.session.state,
      trial: this.session.currentTotalTrial,
      maxTrial: this.session.maxTrials,
      run: this.session.currentRun,
      maxRun: this.session.maxRuns,
    });
  }

  updateTimeState() {
    if (Math.round(this.session.currentDuration) !== this.state.duration) {
      this.setState({
        duration: Math.round(this.session.currentDuration),
      });
    }
  }

  render() {
    return (
      <View>
        <Text style={[styles.title, styles.centeredText]}>
          {this.state.name}
        </Text>
        {this.state.marker !== '' && (
          <View style={styles.infoPanel}>
            <View style={styles.infoBlinking}>
              <Text style={styles.labelText}>Action required</Text>
              <Text style={styles.labelText}>Press {this.state.marker}</Text>
            </View>
          </View>
        )}
        <View style={styles.container}>
          <View style={styles.rowItem}>
            <Text style={styles.titleCard}>Previous Step</Text>
            <View style={styles.infoCardLong}>
              <View style={styles.infoCardTitle}>
                <Text style={styles.textCard}>{this.state.previousStep}</Text>
              </View>
              <View style={styles.infoCardContent}>
                {this.state.previousStepIcon !== '' && (
                  <Icon
                    color={'white'}
                    name={this.state.previousStepIcon}
                    size={30}
                  />
                )}
              </View>
            </View>
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.titleCard}>Current Step</Text>
            <View style={styles.infoCardLong}>
              <View style={styles.infoCardTitle}>
                <Text style={styles.textCard}>
                  {this.state.currentStep !== '' && this.state.currentStep}
                </Text>
              </View>
              <View style={styles.infoCardContent}>
                {this.state.currentStepIcon !== '' && (
                  <Icon
                    color={'white'}
                    name={this.state.currentStepIcon}
                    size={30}
                  />
                )}
                {this.state.duration > 0 && (
                  <Text style={styles.labelText}>
                    {this.state.duration}/{this.state.maxDuration}s
                  </Text>
                )}
              </View>
            </View>
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.titleCard}>Next Step</Text>
            <View style={styles.infoCardLong}>
              <Text style={styles.textCard}>{this.state.nextStep}</Text>
            </View>
          </View>
        </View>
        <View style={styles.container}>
          <View style={styles.rowItem}>
            <View style={styles.infoCardShort}>
              <Text style={styles.titleCard}>Trial</Text>
              <Text style={[styles.textCard, styles.mt1]}>
                {this.state.trial}/{this.state.maxTrial}
              </Text>
            </View>
          </View>
          <View style={styles.rowItem}>
            <View style={styles.infoCardShort}>
              <Text style={styles.titleCard}>Run</Text>
              <Text style={[styles.textCard, styles.mt1]}>
                {this.state.run}/{this.state.maxRun}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  }
}
