import React from 'react';
import {
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
  StyleSheet,
} from 'react-native';
import modalStyles from '../styles/ModalStyles';
import {SessionInfo} from '../Experiment/Session';
import {Headset} from '../EEGHeadset/Headset';
import {Dropdown} from 'react-native-element-dropdown';

const clubType = [
  {label: 'Driver', value: 'driver'},
  {label: 'Wood 2', value: 'wood2'},
  {label: 'Wood 3', value: 'wood3'},
  {label: 'Wood 4', value: 'wood4'},
  {label: 'Wood 5', value: 'wood5'},
  {label: 'Iron 4', value: 'iron4'},
  {label: 'Iron 5', value: 'iron5'},
  {label: 'Iron 6', value: 'iron6'},
  {label: 'Iron 7', value: 'iron7'},
  {label: 'Iron 8', value: 'iron8'},
  {label: 'Iron 9', value: 'iron9'},
  {label: 'Pitch Wedge', value: 'pitch_wedge'},
  {label: 'Sand Wedge', value: 'sand_wedge'},
  {label: 'Putter', value: 'putter'},
];

type SessionInfoFormViewProps = {
  modalVisible: boolean;
  name: string;
  type: string;
  headset: Headset;
  creationHandler: any;
  cancelHandler: any;
};

type SessionInfoFormViewState = {
  session: Partial<SessionInfo>;
  focus: boolean;
};

export class SessionInfoFormView extends React.Component<
  SessionInfoFormViewProps,
  SessionInfoFormViewState
> {
  private submitHandler: any;
  private cancelHandler: any;

  constructor(props: SessionInfoFormViewProps) {
    super(props);
    this.state = {
      session: {
        name: this.props.name,
        startTime: Date.now(),
        subject: '',
        device: this.props.headset.deviceInfo!.deviceNickname,
        club: clubType[0].value,
        info: '',
        type: this.props.type,
      },
      focus: false,
    };
    this.submitHandler = this.props.creationHandler;
    this.cancelHandler = this.props.cancelHandler;
    this.updateSessionInfo = this.updateSessionInfo.bind(this);
    this.submit = this.submit.bind(this);
  }

  submit() {
    this.submitHandler(this.state.session);
  }

  cancel() {
    this.cancelHandler();
  }

  updateSessionInfo(label: keyof SessionInfo, value: any) {
    this.state.session[label] = value;
    this.setState({
      session: this.state.session,
    });
  }

  render() {
    const {session, focus} = this.state;
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={this.props.modalVisible}
        style={modalStyles.modalView}>
        <View style={modalStyles.centeredView}>
          <View style={modalStyles.modalBlock}>
            <View style={modalStyles.inputDiv}>
              <Text style={modalStyles.headerStyle}>Creating session</Text>
            </View>
            <Text style={modalStyles.textStyle}>Name</Text>
            <TextInput
              onChangeText={text => this.updateSessionInfo('name', text)}
              value={session.name}
              style={[modalStyles.textStyle, modalStyles.textInput]}
            />
            <Text style={modalStyles.textStyle}>Subject's name</Text>
            <TextInput
              onChangeText={text => this.updateSessionInfo('subject', text)}
              value={session.subject}
              style={[modalStyles.textStyle, modalStyles.textInput]}
            />
            <Text style={modalStyles.textStyle}>Club</Text>
            <View style={styles.container}>
              <Dropdown
                style={[styles.dropdown, focus && {borderColor: 'white'}]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                data={clubType}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={!focus ? 'Select club' : '...'}
                value={session.club}
                onFocus={() => this.setState({focus: true})}
                onBlur={() => this.setState({focus: false})}
                onChange={item => {
                  this.updateSessionInfo('club', item.value);
                  this.setState({focus: false});
                }}
              />
            </View>
            <Text style={modalStyles.textStyle}>Gerenal info</Text>
            <TextInput
              onChangeText={text => this.updateSessionInfo('info', text)}
              value={this.state.session.info}
              editable
              multiline
              numberOfLines={4}
              style={[modalStyles.textStyle, modalStyles.textMultiInput]}
            />

            <View style={modalStyles.rowContent}>
              <Pressable
                onPress={() => this.cancel()}
                style={modalStyles.cancelButton}>
                <Text style={modalStyles.textStyle}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => this.submit()}
                style={modalStyles.submitButton}>
                <Text>Create</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 20,
  },
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    color: 'white',
  },
  icon: {
    marginRight: 5,
  },
  placeholderStyle: {
    fontSize: 16,
    color: 'white',
  },
  selectedTextStyle: {
    fontSize: 16,
    color: 'white',
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});
