import React from 'react';
import {Modal, Text, Pressable, View, TextInput} from 'react-native';
import {Marker} from '../Experiment/Recorder/MarkerRecorder';
// @ts-ignore
import Stars from 'react-native-stars';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import modalStyles from '../styles/ModalStyles';
import {Session} from '../Experiment/Session';

type MarkerViewProps = {
  modalVisible: boolean;
  marker: Marker | undefined;
  session: Session | undefined;
  handler: any;
};

type MarkerViewState = {
  marker: Marker | undefined;
};

export class MarkerView extends React.Component<
  MarkerViewProps,
  MarkerViewState
> {
  private submitHandler: any;
  private session: Session | undefined;
  constructor(props: MarkerViewProps) {
    super(props);
    this.submitHandler = props.handler;
    this.session = this.props.session;
    this.state = {
      marker: this.props.marker,
    };
    this.updateMarker = this.updateMarker.bind(this);
  }

  static getDerivedStateFromProps(
    props: MarkerViewProps,
    state: MarkerViewState,
  ) {
    state.marker = props.marker;
    return state;
  }

  updateMarker(name: string, value: any) {
    this.state.marker!.properties[name].value = value;
    this.setState({
      marker: this.state.marker,
    });
  }

  async submit() {
    this.submitHandler();
    await this.session!.addMarker(this.state.marker!);
    console.log('marker added');
  }

  async cancel() {
    this.submitHandler();
  }

  render() {
    let markerName = '';
    let form;
    if (this.props.marker) {
      markerName = this.props.marker.name;
      form = Object.keys(this.props.marker.properties).map(key => {
        if (this.props.marker!.properties[key].type === 'number') {
          return (
            <View key={key} style={modalStyles.inputDiv}>
              <Text style={modalStyles.textStyle}>
                {this.props.marker!.properties[key].displayName}
              </Text>
              <TextInput
                onChangeText={text => this.updateMarker(key, text)}
                value={String(this.props.marker!.properties[key].value)}
                keyboardType="numeric"
                style={modalStyles.textStyle}
              />
            </View>
          );
        } else if (this.props.marker!.properties[key].type === 'string') {
          return (
            <TextInput
              onChangeText={text => this.updateMarker(key, text)}
              key={key}
              value={String(this.state.marker!.properties[key].value)}
            />
          );
        } else if (this.props.marker!.properties[key].type === 'star') {
          return (
            <View key={key} style={modalStyles.inputDiv}>
              <Text style={modalStyles.textStyle}>
                {this.props.marker!.properties[key].displayName}
              </Text>
              <Stars
                default={2.5}
                count={5}
                half={true}
                starSize={50}
                fullStar={
                  <Icon name={'star'} style={[modalStyles.myStarStyle]} />
                }
                emptyStar={
                  <Icon
                    name={'star-outline'}
                    style={[
                      modalStyles.myStarStyle,
                      modalStyles.myEmptyStarStyle,
                    ]}
                  />
                }
                halfStar={
                  <Icon name={'star-half'} style={[modalStyles.myStarStyle]} />
                }
              />
            </View>
          );
        }
      });
    }
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={this.props.modalVisible}
        style={modalStyles.modalView}>
        <View style={modalStyles.centeredView}>
          <View style={modalStyles.modalBlock}>
            <View style={modalStyles.inputDiv}>
              <Text style={modalStyles.headerStyle}>Adding {markerName}</Text>
            </View>
            {form}
            <View style={modalStyles.rowContent}>
              <Pressable
                onPress={() => this.submit()}
                style={modalStyles.submitButton}>
                <Text>Add Marker</Text>
              </Pressable>
              <Pressable
                onPress={() => this.cancel()}
                style={modalStyles.cancelButton}>
                <Text>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}
