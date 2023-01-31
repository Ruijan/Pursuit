import React from 'react';
import {Button, FlatList, StatusBar, StyleSheet, View} from 'react-native';

function Item(title: string, target: any, navigation: any) {
  return <Button title={title} onPress={() => navigation.navigate(target)} />;
}

export class NavBar extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={styles.bar}>
        <FlatList
          horizontal={true}
          data={[
            {title: 'Home', target: 'Home', icon: 'assets/home.jpg', id: 1},
            {title: 'Live', target: 'Live', icon: 'assets/live.jpg', id: 2},
            {
              title: 'Account',
              target: 'Account',
              icon: 'assets/account.jpg',
              id: 3,
            },
          ]}
          renderItem={({item}) =>
            Item(item.title, item.target, this.props.navigation)
          }
          style={styles.bar}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: '#1A1A1B',
  }
});
