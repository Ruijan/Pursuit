import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  Pressable,
  View,
  TextInput,
} from 'react-native';
import {Marker} from '../MarkerRecorder';
// @ts-ignore
import Stars from 'react-native-stars';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {DataRecorder} from '../EEGHeadset/Neurosity/DataRecorder';

type MarkerViewProps = {
  modalVisible: boolean;
  marker: Marker | undefined;
  markerRecorder: DataRecorder | undefined;
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
  private recorder: DataRecorder | undefined;
  constructor(props: MarkerViewProps) {
    super(props);
    this.submitHandler = props.handler;
    this.recorder = this.props.markerRecorder;
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
    await this.recorder!.addMarker(this.state.marker!);
    console.log('marker added');
  }

  render() {
    let markerName = '';
    let form = undefined;
    if (this.props.marker) {
      markerName = this.props.marker.name;
      form = Object.keys(this.props.marker.properties).map(key => {
        if (this.props.marker!.properties[key].type === 'number') {
          return (
            <View key={key} style={styles.inputDiv}>
              <Text style={styles.textStyle}>
                {this.props.marker!.properties[key].displayName}
              </Text>
              <TextInput
                onChangeText={text => this.updateMarker(key, text)}
                value={String(this.props.marker!.properties[key].value)}
                keyboardType="numeric"
                style={styles.textStyle}
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
            <View key={key} style={styles.inputDiv}>
              <Text style={styles.textStyle}>
                {this.props.marker!.properties[key].displayName}
              </Text>
              <Stars
                default={2.5}
                count={5}
                half={true}
                starSize={50}
                fullStar={<Icon name={'star'} style={[styles.myStarStyle]} />}
                emptyStar={
                  <Icon
                    name={'star-outline'}
                    style={[styles.myStarStyle, styles.myEmptyStarStyle]}
                  />
                }
                halfStar={
                  <Icon name={'star-half'} style={[styles.myStarStyle]} />
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
        visible={this.props.modalVisible}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.inputDiv}>
              <Text style={styles.headerStyle}>Adding {markerName}</Text>
            </View>
            {form}
            <Pressable
              onPress={() => this.submit()}
              style={styles.submitButton}>
              <Text>Add Marker</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    padding: 35,
    alignItems: 'flex-start',
    elevation: 5,
    width: '75%',
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'left',
  },
  headerStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 24,
    marginBottom: 15,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  myStarStyle: {
    color: 'yellow',
    backgroundColor: 'transparent',
    textShadowColor: 'black',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  myEmptyStarStyle: {
    color: 'white',
  },
  submitButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    marginTop: 25,
    backgroundColor: 'white',
    width: '100%',
  },
  inputDiv: {
    width: '100%',
  },
});
