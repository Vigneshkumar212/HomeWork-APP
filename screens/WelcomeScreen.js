import React, { Component } from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView
} from 'react-native';

import db from '../config';
import firebase from 'firebase';



export default class WelcomeScreen extends Component {
  constructor() {
    super();
    this.state = {
      emailId: '',
      password: '',
      firstName: '',
      lastName: '',
      userType: '',
      address: '',
      contact: '',
      confirmPassword: '',
      isModalVisible: 'false',
      class: ''
    }
  }

  userSignUp = (emailId, password, confirmPassword) => {
    if (password !== confirmPassword) {
      return Alert.alert("password doesn't match\nCheck your password.")
    } else {
      firebase.auth().createUserWithEmailAndPassword(emailId, password).then(() => {
        db.collection('users').add({
          first_name: this.state.firstName,
          last_name: this.state.lastName,
          userType: this.state.userType,
          contact: this.state.contact,
          email_id: this.state.emailId,
          address: this.state.address,
          class: this.state.class,
        })
        return Alert.alert(
          'User Added Successfully',
          '',
          [
            { text: 'OK', onPress: () => this.setState({ "isModalVisible": false }) },
          ]
        );
      }).catch((error) => {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        return Alert.alert(errorMessage)
      });
    }
  }

  userLogin = (emailId, password) => {
    firebase.auth().signInWithEmailAndPassword(emailId, password).then(() => {
      db.collection("users").where("email_id", "==", firebase.auth().currentUser.email).get().then((snapshot) => {
        snapshot.forEach((doc) => {
          console.log(doc.data().userType);
          if (doc.data().userType == "Teacher") {
            this.props.navigation.navigate('TAppTabNavigator');
          } else {
            this.props.navigation.navigate('SAppTabNavigator');
          }
        });
      })
    }).catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(errorMessage)
      return Alert.alert(errorMessage)
    })
  }
 
  showModal = () => {
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={this.state.isModalVisible}
      >
        <View style={styles.modalContainer}>
          <ScrollView style={{ width: '100%' }}>
            <KeyboardAvoidingView style={styles.KeyboardAvoidingView}>
              <Text
                style={styles.modalTitle}
              >Registration</Text>
              <TextInput
                style={styles.formTextInput}
                placeholder={"First Name"}
                maxLength={8}
                onChangeText={(text) => {
                  this.setState({
                    firstName: text
                  })
                }}
              />
              <TextInput
                style={styles.formTextInput}
                placeholder={"Last Name"}
                maxLength={8}
                onChangeText={(text) => {
                  this.setState({
                    lastName: text
                  })
                }}
              />
              <TextInput
                style={styles.formTextInput}
                placeholder={"Teacher / Student"}
                maxLength={7}
                onChangeText={(text) => {
                  this.setState({
                    userType: text
                  })
                }}
              />
              {
                this.state.userType == 'Student'? (
                  <TextInput
                style={styles.formTextInput}
                placeholder={"Class And Section (10H)"}
                maxLength={3}
                onChangeText={(text) => {
                  this.setState({
                    class: text
                  })
                }}
              />
                ):(null)
              }
              <TextInput
                style={styles.formTextInput}
                placeholder={"Contact"}
                maxLength={10}
                keyboardType={'numeric'}
                onChangeText={(text) => {
                  this.setState({
                    contact: text
                  })
                }}
              />
              <TextInput
                style={styles.formTextInput}
                placeholder={"Address"}
                multiline={true}
                onChangeText={(text) => {
                  this.setState({
                    address: text
                  })
                }}
              />
              <TextInput
                style={styles.formTextInput}
                placeholder={"Email"}
                keyboardType={'email-address'}
                onChangeText={(text) => {
                  this.setState({
                    emailId: text
                  })
                }}
              /><TextInput
                style={styles.formTextInput}
                placeholder={"Password"}
                secureTextEntry={true}
                onChangeText={(text) => {
                  this.setState({
                    password: text
                  })
                }}
              /><TextInput
                style={styles.formTextInput}
                placeholder={"Confrim Password"}
                secureTextEntry={true}
                onChangeText={(text) => {
                  this.setState({
                    confirmPassword: text
                  })
                }}
              />
              <View style={styles.modalBackButton}>
                <TouchableOpacity
                  style={styles.registerButton}
                  onPress={() =>
                    this.userSignUp(this.state.emailId, this.state.password, this.state.confirmPassword)
                  }
                >
                  <Text style={styles.registerButtonText}>SignUp</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalBackButton}>
                <TouchableOpacity
                  style={styles.registerButton}
                  onPress={() => this.setState({ "isModalVisible": false })}
                >
                  <Text style={styles.registerButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </ScrollView>
        </View>
      </Modal>
    )
  }
  render() {
    return (
      <View style={styles.container}>
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>

        </View>
        {
          this.showModal()
        }
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Text style={styles.title}>HomeWork App</Text>
        </View>
        <View>
          <TextInput
            style={styles.loginBox}
            placeholder="abc@example.com"
            keyboardType='email-address'
            onChangeText={(text) => {
              this.setState({
                emailId: text
              })
            }}
          />
          <TextInput
            style={styles.loginBox}
            secureTextEntry={true}
            placeholder="enter Password"
            onChangeText={(text) => {
              this.setState({
                password: text
              })
            }}
          />
          <TouchableOpacity
            style={[styles.button, { marginBottom: 20, marginTop: 20 }]}
            onPress={() => {
              this.userLogin(this.state.emailId, this.state.password)
            }}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => this.setState({ isModalVisible: true })}
          >
            <Text style={styles.buttonText}>SignUp</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  profileContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 45,
    fontWeight: '300',
    paddingBottom: 30,
    color: '#0084ff'
  },
  loginBox: {
    width: 300,
    height: 40,
    borderBottomWidth: 2,
    borderColor: '#0084ff',
    fontSize: 20,
    margin: 10,
    paddingLeft: 10,
    color: '#000'
  },
  KeyboardAvoidingView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalTitle: {
    justifyContent: 'center',
    alignSelf: 'center',
    fontSize: 30,
    color: '#0084ff',
    margin: 50
  },
  modalContainer: {
    flex: 1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#ffff",
    marginRight: 30,
    marginLeft: 30,
    marginTop: 80,
    marginBottom: 80,
    borderWidth: 2,
    borderColor: '#0084ff',
    paddingBottom: 20
  },
  formTextInput: {
    width: "75%",
    height: 35,
    alignSelf: 'center',
    borderColor: '#0084ff',
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 20,
    padding: 10
  },
  registerButton: {
    width: 200,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginTop: 20,
    borderWidth: 2,
    borderColor: '#0084ff'
  },
  registerButtonText: {
    color: '#0084ff',
    fontSize: 15,
  },
  cancelButton: {
    width: 200,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },

  button: {
    width: 300,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    backgroundColor: "#0084ff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.30,
    shadowRadius: 10.32,
    elevation: 16,
  },
  buttonText: {
    color: '#ffff',
    fontWeight: '200',
    fontSize: 20
  }
})
