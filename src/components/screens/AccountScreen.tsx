import React from 'react';
import {LoggingView} from '../LoggingView';
import Account from '../../Account/Account';
// @ts-ignore
import Icon from 'react-native-vector-icons/Ionicons';
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
    this.connectionHandler = this.connectionHandler.bind(this);
    this.account.addDeviceStatusHandler(this.deviceStatusHandler);
    this.account.addConnectionHandler(this.connectionHandler);
    this.account.addDisconnectHandler(this.connectionHandler);
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

  connectionHandler() {
    console.log('Handling account connection in Account Screen');
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
            <Text style={styles.labelText}>
              Status:
              {this.state.deviceStatus.state === 'online' && (
                <Icon name={'ellipse'} color={'green'} />
              )}
              {this.state.deviceStatus.state === 'offline' && (
                <Icon name={'ellipse'} color={'darkred'} />
              )}
              {stateString}
              {this.state.deviceStatus.state === 'online' &&
                this.state.deviceStatus.charging && (
                  <Icon name={'battery-charging'} color={'yellow'} size={25} />
                )}
            </Text>
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
        <LoggingView account={this.account} />
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
