import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  title: {
    color: '#fff',
    fontSize: 30,
  },
  centeredText: {
    textAlign: 'center',
  },
  width50: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  container: {
    backgroundColor: '#010101',
    color: '#fff',
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'space-around',
    columnGap: 10,
    rowGap: 10,
    marginTop: 10,
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    width: '100%',
    margin: 'auto',
    textAlign: 'left',
  },
  labelText: {
    color: '#fff',
    marginTop: 10,
    textAlign: 'center',
    width: '100%',
  },
  text: {
    backgroundColor: '#010101',
    color: 'white',
    paddingLeft: 10,
    marginTop: 30,
  },
  submitButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: '#1E1E1E',
    width: '40%',
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    marginTop: 15,
    backgroundColor: 'darkred',
    width: '80%',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    margin: 'auto',
    textAlign: 'center',
  },

  scrollView: {
    height: '100%',
    backgroundColor: '#010101',
  },
  errorContainer: {
    backgroundColor: 'red',
    borderRadius: 12,
    padding: 10,
    margin: 10,
    width: '75%',
    flexDirection: 'row',
    alignContent: 'space-between',
  },
});

export default styles;
