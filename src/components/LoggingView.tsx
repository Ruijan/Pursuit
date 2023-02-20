import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  View,
  ActivityIndicator,
} from 'react-native';
import PursuitAccount from '../Account/PursuitAccount';
import {ErrorHandler} from '../ErrorHandler';

export class LoggingView extends React.Component<any, any> {
  private account: PursuitAccount;
  private errorHandler: ErrorHandler;

  constructor(props: any) {
    super(props);
    this.state = {
      email: '',
      password: '',
      connecting: this.props.account.connecting(),
      error: '',
      isLoggedIn: this.props.account.isLoggedIn(),
    };
    this.account = this.props.account;
    this.errorHandler = this.props.errorHandler;
    this.connect = this.connect.bind(this);
    this.connectionHandler = this.connectionHandler.bind(this);
    this.account.addConnectionHandler(this.connectionHandler);
    this.account.addDisconnectHandler(this.connectionHandler);
  }

  connectionHandler() {
    this.setState({
      isLoggedIn: this.account.isLoggedIn(),
      connecting: this.account.connecting(),
    });
  }

  async connect() {
    this.setState({
      connecting: true,
    });
    try {
      await this.account.login(this.state.email, this.state.password);
    } catch (error) {
      this.setState({
        error: String(error),
        connecting: false,
      });
    }
  }

  async logout() {
    await this.account.logout();
    this.setState({
      isLoggedIn: this.account.loggedIn,
    });
  }

  render() {
    let button = (
      <View style={styles.form}>
        <TouchableHighlight
          underlayColor={'grey'}
          onPress={() => this.logout()}
          style={styles.submitButton}>
          <Text>Log Out</Text>
        </TouchableHighlight>
      </View>
    );
    if (!this.state.isLoggedIn) {
      let loggingButton = (
        <TouchableHighlight
          underlayColor={'grey'}
          onPress={() => this.connect()}
          style={styles.submitButton}>
          <Text>Log In with Neurosity</Text>
        </TouchableHighlight>
      );
      button = (
        <View style={styles.form}>
          <View>
            <Text style={styles.labelText}>Connecting</Text>
            <ActivityIndicator size="large" />
          </View>

          {loggingButton}
        </View>
      );
      if (!this.state.connecting) {
        button = (
          <View style={styles.form}>
            <Text style={styles.labelText}>Email</Text>
            <TextInput
              placeholder="firstname.lastname@gmail.com"
              placeholderTextColor="#808080"
              onChangeText={newText => this.setState({email: newText})}
              style={styles.textInput}
            />
            <Text style={styles.labelText}>Password</Text>
            <TextInput
              secureTextEntry={true}
              placeholder="*********"
              placeholderTextColor="#808080"
              onChangeText={newText => this.setState({password: newText})}
              style={styles.textInput}
            />
            {loggingButton}
          </View>
        );
      }
    }
    return <View style={styles.container}>{button}</View>;
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#010101',
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
  submitButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    marginTop: 15,
    backgroundColor: 'white',
    width: '75%',
  },
});
