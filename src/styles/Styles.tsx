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
  width100: {
    width: '100%',
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
  mt1: {
    marginTop: 10,
  },
  mt2: {
    marginTop: 20,
  },
  mt3: {
    marginTop: 30,
  },
  mt4: {
    marginTop: 40,
  },
  mt5: {
    marginTop: 50,
  },
  labelText: {
    color: '#fff',
    textAlign: 'center',
    width: '100%',
    fontSize: 16,
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
    color: 'black',
    width: '40%',
  },
  highlightedButton: {
    shadowColor: '#199FDD',
    shadowRadius: 5,
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
  infoCardLong: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderRadius: 4,
    elevation: 3,
    padding: 5,
    backgroundColor: '#1E1E1E',
    width: '100%',
    height: 125,
  },
  infoCardShort: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderRadius: 4,
    elevation: 3,
    padding: 10,
    backgroundColor: '#1E1E1E',
    width: '100%',
    height: 80,
  },
  infoCardTitle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
  },
  infoCardContent: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  titleCard: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    width: '100%',
  },
  textCard: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 20,
    width: '100%',
  },
  infoPanel: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoBlinking: {
    width: '50%',
    backgroundColor: '#199FDD',
    borderRadius: 12,
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
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
  rowItem: {
    width: '30%',
  },
});

export default styles;
