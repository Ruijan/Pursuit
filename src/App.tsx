/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeScreen from './components/screens/HomeScreen';
import AccountScreen from './components/screens/AccountScreen';
import LiveScreen from './components/screens/LiveScreen';
import Account from './Account';
import NeurosityAccount from './NeurosityAccount';
import {Neurosity} from './EEGHeadset/Neurosity';

const Stack = createBottomTabNavigator();
const neurosityAccount = new NeurosityAccount(new Neurosity());
const account = new Account(neurosityAccount);
const AppContext = React.createContext(account);

class HomeScreenConsumer extends React.Component<{
  navigation: any;
  route: any;
}> {
  render() {
    let navigation = this.props.navigation;
    return (
      <AppContext.Consumer>
        {account => (
          <HomeScreen {...{account: account, navigation: navigation}} />
        )}
      </AppContext.Consumer>
    );
  }
}

function App(): JSX.Element {
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
            component={AccountScreen}
            options={{title: 'Account'}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AppContext.Provider>
  );
}

export default App;
