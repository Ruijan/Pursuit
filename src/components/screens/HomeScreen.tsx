import {
  StyleSheet,
  Button,
  Text,
  TextInput,
  View,
  TouchableHighlight,
} from 'react-native';
import React from 'react';
import Account from '../../Account';

export class HomeScreen extends React.Component {
  private navigation: any;
  private account: Account;
  constructor(props: any) {
    super(props);
    this.state = {
      email: '',
      password: '',
      isLoggedIn: this.props.account.isLoggedIn(),
    };
    this.navigation = this.props.navigation;
    this.account = this.props.account;
  }

  async connect() {
    console.log(this.state);
    await this.account
      .connectNeurosity(this.state.email, this.state.password)
      .then(() => {
        console.log('results from connection');
        this.setState({
          isLoggedIn: true,
        });
      });
  }
  async logout() {
    await this.account.logout();
    this.setState({
      isLoggedIn: this.account.loggedIn,
    });
  }

  render() {
    let button = <Button title="Log Out" onPress={() => this.logout()} />;
    console.log(this.account.isLoggedIn());
    if (!this.state.isLoggedIn) {
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
          <TouchableHighlight
            underlayColor={'grey'}
            onPress={() => this.connect()}
            style={styles.submitButton}>
            <Text>Log In</Text>
          </TouchableHighlight>
        </View>
      );
    }
    return <View style={styles.container}>{button}</View>;
  }
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#010101',
    height: '100%',
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

export default HomeScreen;
