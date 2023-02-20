/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {HomeScreen} from './components/screens/HomeScreen';
import AccountScreen from './components/screens/AccountScreen';
import {LiveScreen} from './components/screens/LiveScreen';
import PursuitAccount from './Account/PursuitAccount';
import {ErrorHandler} from './ErrorHandler';
// @ts-ignore
import Ionicons from 'react-native-vector-icons/Ionicons';
import {AccountFactory, AccountType} from './Account/AccountFactory';

const Stack = createBottomTabNavigator();
const account = new PursuitAccount(AccountFactory.build(AccountType.Neurosity));
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
          <HomeScreen
            {...{
              account: account,
              errorHandler: errorHandler,
              route: this.props.route,
              navigation: this.props.navigation,
            }}
          />
        )}
      </AppContext.Consumer>
    );
  }
}

class LiveScreenConsumer extends React.Component<{
  navigation: any;
  route: any;
}> {
  render() {
    return (
      <AppContext.Consumer>
        {account => (
          <LiveScreen
            {...{
              account: account,
              errorHandler: errorHandler,
              route: this.props.route,
              navigation: this.props.navigation,
            }}
          />
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
        <StatusBar barStyle={'dark-content'} />
        <NavigationContainer
          theme={{
            dark: true,
            colors: {
              primary: 'rgb(255, 45, 85)',
              background: '#1A1A1B',
              card: 'rgb(255, 255, 255)',
              text: 'rgb(28, 28, 30)',
              border: 'rgb(199, 199, 204)',
              notification: 'rgb(255, 69, 58)',
            },
          }}>
          <Stack.Navigator
            screenOptions={({route}) => ({
              tabBarStyle: {backgroundColor: '#1A1A1B'},
              tabBarIcon: ({focused, color, size}) => {
                let iconName;

                if (route.name === 'Home') {
                  iconName = focused ? 'home' : 'home-outline';
                } else if (route.name === 'Live') {
                  iconName = focused ? 'pulse' : 'pulse-sharp';
                } else if (route.name === 'Account') {
                  iconName = focused ? 'person' : 'person-outline';
                }

                // You can return any component that you like here!
                return <Ionicons name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: 'tomato',
              tabBarInactiveTintColor: 'gray',
            })}>
            <Stack.Screen
              name="Home"
              component={HomeScreenConsumer}
              options={{
                title: 'Welcome',
              }}
            />
            <Stack.Screen
              name="Live"
              component={LiveScreenConsumer}
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
