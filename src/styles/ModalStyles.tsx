import {StyleSheet} from 'react-native';

const modalStyles = StyleSheet.create({
  centeredView: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'rgba(52, 52, 52, 0.8)',
  },
  modalView: {
    backgroundColor: 'rgba(52, 52, 52, 0.8)',
    alignItems: 'flex-start',
    elevation: 5,
    width: '100%',
    height: '100%',
  },
  modalBlock: {
    margin: 20,
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    padding: 35,
    alignItems: 'flex-start',
    elevation: 5,
    width: '75%',
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'left',
  },
  headerStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 24,
    marginBottom: 15,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  myStarStyle: {
    color: 'yellow',
    backgroundColor: 'transparent',
    textShadowColor: 'black',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  myEmptyStarStyle: {
    color: 'white',
  },
  submitButton: {
    textAlign: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    elevation: 3,
    marginTop: 25,
    marginLeft: 5,
    marginRight: 5,
    backgroundColor: '#199FDD',
    width: '45%',
    alignItems: 'center',
    height: 35,
  },
  inputDiv: {
    width: '100%',
  },
  rowContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 20,
    height: 100,
  },
  cancelButton: {
    textAlign: 'center',
    height: 35,
    borderRadius: 4,
    elevation: 3,
    marginTop: 25,
    marginLeft: 5,
    marginRight: 5,
    backgroundColor: 'darkred',
    width: '45%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    borderBottomWidth: 1,
    borderBottomColor: 'grey',
    marginBottom: 10,
    padding: 0,
    height: 30,
    width: '100%',
  },
  textMultiInput: {
    borderBottomWidth: 1,
    borderBottomColor: 'grey',
    marginBottom: 10,
    padding: 0,
    height: 90,
    width: '100%',
  },
  dropDown: {
    backgroundColor: '#444',
    width: '75%',
    height: 50,
    padding: 0,
  },
});

export default modalStyles;
