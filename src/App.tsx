/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {HomeScreen} from './components/screens/HomeScreen';
import AccountScreen from './components/screens/AccountScreen';
import LiveScreen from './components/screens/LiveScreen';
import Account from './Account/Account';
import NeurosityAccount from './Account/NeurosityAccount';
import {ErrorHandler} from './ErrorHandler';
import {NeurosityHeadset} from './EEGHeadset/NeurosityHeadset';

const Stack = createBottomTabNavigator();
const neurosityAccount = new NeurosityAccount(new NeurosityHeadset());
const account = new Account(neurosityAccount);
const errorHandler = new ErrorHandler();
const AppContext = React.createContext(account);

class HomeScreenConsumer extends React.Component<{
  navigation: any;
  route: any;
}> {
  render() {
    return (
      <AppContext.Consumer>
        {account => (
          <HomeScreen {...{account: account, errorHandler: errorHandler}} />
        )}
      </AppContext.Consumer>
    );
  }
}

class AccountScreenConsumer extends React.Component<{
  navigation: any;
  route: any;
}> {
  render() {
    return (
      <AppContext.Consumer>
        {account => (
          <AccountScreen {...{account: account, errorHandler: errorHandler}} />
        )}
      </AppContext.Consumer>
    );
  }
}

class App extends React.Component {
  render() {
    return (
      <AppContext.Provider value={account}>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              tabBarStyle: {backgroundColor: '#1A1A1B'},
            }}>
            <Stack.Screen
              name="Home"
              component={HomeScreenConsumer}
              options={{title: 'Welcome'}}
            />
            <Stack.Screen
              name="Live"
              component={LiveScreen}
              options={{title: 'Live'}}
            />
            <Stack.Screen
              name="Account"
              component={AccountScreenConsumer}
              options={{title: 'Account'}}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </AppContext.Provider>
    );
  }
}

export default App;
