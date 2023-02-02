import React from 'react';
import {LoggingView} from '../LoggingView';
import Account from '../../Account/Account';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {DeviceStatus} from '@neurosity/sdk/dist/cjs/types/status';

type AccountScreenProps = {account: Account};
type AccountScreenState = {
  deviceStatus: DeviceStatus | undefined;
  isLoggedIn: boolean;
};

export class AccountScreen extends React.Component<
  AccountScreenProps,
  AccountScreenState
> {
  private account: Account;
  constructor(props: any) {
    super(props);
    this.state = {
      deviceStatus: undefined,
      isLoggedIn: this.props.account.isLoggedIn(),
    };
    this.account = this.props.account;
    this.deviceStatusHandler = this.deviceStatusHandler.bind(this);
    this.account.addDeviceStatusHandler(this.deviceStatusHandler);
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
  }

  componentDidMount() {
    this.account.init().then(() => {
      let deviceStatus = this.account.getDeviceStatus();
      this.setState({
        isLoggedIn: this.account.isLoggedIn(),
        deviceStatus: deviceStatus,
      });
    });
  }

  connect() {
    this.setState({
      isLoggedIn: this.account.isLoggedIn(),
    });
  }

  disconnect() {
    this.setState({
      isLoggedIn: this.account.isLoggedIn(),
    });
  }

  deviceStatusHandler() {
    this.setState({
      deviceStatus: this.account.getDeviceStatus(),
    });
  }

  render() {
    let view;
    if (this.state.isLoggedIn) {
      if (typeof this.state.deviceStatus !== 'undefined') {
        console.log('Device Status collected and displaying in Account Sceen');
        let stateString = String(this.state.deviceStatus.state);
        if (this.state.deviceStatus.charging) {
          stateString += ' - charging';
        }
        view = (
          <View style={styles.width75}>
            <Text style={styles.labelText}>Status: {stateString}</Text>
            <Text style={styles.labelText}>
              Battery: {this.state.deviceStatus.battery}
            </Text>
            <Text style={styles.labelText}>
              Last seen:{' '}
              {new Date(this.state.deviceStatus.lastHeartbeat).toDateString()}
            </Text>
          </View>
        );
      } else {
        console.log('Retrieving Device Status in Account Sceen');
        view = (
          <View>
            <Text style={styles.labelText}>Retrieving Device Information</Text>
            <ActivityIndicator size="large" />
          </View>
        );
      }
    } else {
      console.log('Not logged in');
    }

    return (
      <ScrollView style={styles.container}>
        {view}
        <LoggingView
          account={this.account}
          connectHandler={this.connect}
          disconnectHandler={this.disconnect}
        />
      </ScrollView>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#010101',
    flex: 1,
    color: '#fff',
  },
  labelText: {
    color: '#fff',
    marginTop: 10,
    width: '75%',
  },
  textInput: {
    color: '#fff',
    width: '75%',
    marginTop: 10,
    borderRadius: 12,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    margin: 'auto',
    textAlign: 'left',
  },
  width75: {
    width: '75%',
    margin: 'auto',
  },
});

export default AccountScreen;
