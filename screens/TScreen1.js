import React, { Component } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, FlatList, StyleSheet, TextInput, Alert, Image } from 'react-native';
import { Card, Icon, ListItem } from 'react-native-elements';
import MyHeader from '../components/MyHeader.js';
import firebase from 'firebase';
import db from '../config.js';
import * as ImagePicker from "expo-image-picker";
import * as Permissions from "expo-permissions";

export default class SScreen2 extends Component {
  constructor() {
    super();
    this.state = {
      teacherId: firebase.auth().currentUser.email,
      allAssignments: [],
      visible: false,
      remarks: "",
      image: "",
      isUploading: false,
      title: '',
      description: '',
      lastDate: '',
    }
    this.assignmentRef = null
  }
  guidGenerator() {
    var S4 = function () {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
  }

  selectPicture = async () => {
    const { cancelled, uri } = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!cancelled) {
      this.uploadImage(uri, this.state.teacherId + this.guidGenerator());
    }
  };

  uploadImage = async (uri, imageName) => {
    this.setState({isUploading: true})
    var response = await fetch(uri);
    var blob = await response.blob();

    var ref = firebase.storage().ref().child("hw/" + imageName);

    return ref.put(blob).then((response) => {
      this.fetchImage(imageName);
    });
  };

  fetchImage = (imageName) => {
    var storageRef = firebase.storage().ref().child("hw/" + imageName);

    // Get the download URL
    storageRef.getDownloadURL().then((url) => {
      this.setState({ image: url , isUploading: false});
    }).catch((error) => {
      Alert.alert('Failed to Upload', 'UnAble to upload image please try again')
      this.setState({ image: "#", isUploading: false });
    });
  };

  getAllAssignments = () => {
    this.assignmentRef = db.collection("assignmentsTemplates").where("teacherEmail", '==', this.state.teacherId).onSnapshot((snapshot) => {
      var allAssignments = []
      snapshot.docs.map((doc) => {
        var assignment = doc.data()
        assignment["doc_id"] = doc.id
        allAssignments.push(assignment)
      });
      this.setState({
        allAssignments: allAssignments
      });
    });
  }
  getUserProfile() {
    db.collection("users").where("teacherEmail", "==", this.state.teacherId).onSnapshot((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        this.setState({
          name: doc.data().first_name + " " + doc.data().last_name,
          docId: doc.id,
          image: doc.data().image,
        });
      });
    });
  }

  createAssignment = () => {
    db.collection("assignmentsTemplates").add({
      teacherEmail: this.state.teacherId,
      title: this.state.title,
      description: this.state.description,
      class: this.state.class,
      lastDate: this.state.lastDate,
      photoUrl: this.state.image?this.state.image: "",
    })
    db.collection("users").where("class", "==", this.state.class).onSnapshot((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        console.log('found')
        db.collection("assignments").add({
          teacherEmail: this.state.teacherId,
          title: this.state.title,
          description: this.state.description,
          class: this.state.class,
          lastDate: this.state.lastDate,
          photoUrl: this.state.image?this.state.image: "",
          email_id: doc.data().email_id,
          assignmentStatus: 'assigned',
          studentName: doc.data().first_name
        }).then(() => {
          Alert.alert('hi', 'Created Assignment')
        })
      });
    });
  }

  keyExtractor = (item, index) => index.toString()

  renderItem = ({ item, i }) => (
    <ListItem
      key={i}
      title={item.title}
      subtitle={'lastDate : ' + item.lastDate + "\nTo class : " + item.class}
      titleStyle={{ color: 'black', fontWeight: 'bold' }}
      rightElement={
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            this.setState({ visible2: true, title: item.title, lastDate: item.lastDate, doc_id: item.doc_id, status: item.assignmentStatus, description: item.description, class: item.class });
          }}
        >
          <Text style={{ color: '#ffff' }}>View Assignment</Text>
        </TouchableOpacity>
      }
      bottomDivider
    />
  )
  componentDidMount() {
    this.getAllAssignments();
    this.getUserProfile();
  }
  componentWillUnmount() {
    this.assignmentRef();
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <MyHeader navigation={this.props.navigation} title="Assigned By You" />
        <View style={{ flex: 1 }}>
          {
            this.state.allAssignments.length === 0
              ? (
                <View style={styles.subtitle}>
                  <Text style={{ fontSize: 20, textAlign: 'center' }}>To Assign An Assignment Click The + button</Text>
                </View>
              )
              : (
                <View>
                  <FlatList
                    keyExtractor={this.keyExtractor}
                    data={this.state.allAssignments}
                    renderItem={this.renderItem}
                  />
                </View>
              )
          }
          <TouchableOpacity
            style={styles.plus}
            onPress={() => {
              this.setState({ visible: true });
            }}
          >
            <Text style={{ color: '#fff', fontSize: 50, marginTop: -5 }}>+</Text>
          </TouchableOpacity>
        </View>

        {
          this.state.visible == true ? (
            <View style={styles.pop}>
              <TextInput
                style={styles.formTextInput}
                placeholder={"Title"}
                onChangeText={(text) => {
                  this.setState({
                    title: text
                  })
                }}
              />
              <TextInput
                style={styles.formTextInput}
                placeholder={"Description"}
                onChangeText={(text) => {
                  this.setState({
                    description: text
                  })
                }}
              />
              <TextInput
                style={styles.formTextInput}
                placeholder={"To Class (10H)"}
                onChangeText={(text) => {
                  this.setState({
                    class: text
                  })
                }}
              />
              <TextInput
                style={styles.formTextInput}
                placeholder={"Last Date"}
                onChangeText={(text) => {
                  this.setState({
                    lastDate: text
                  })
                }}
              />
              <TouchableOpacity
                onPress={() => {
                  this.selectPicture();
                }}
                style={styles.button2}
              >
                <Text style={[styles.buttonText2, {fontSize: 17.5}]}>Add Picture/Video</Text>
              </TouchableOpacity>

              {
                this.state.isUploading == false?(
                  <TouchableOpacity
                style={styles.button2}
                onPress={() => {
                  this.createAssignment();
                }}
              >
                <Text style={[styles.buttonText2, {textAlign: 'center'}]}>
                  Assign
                </Text>
              </TouchableOpacity>
                ):(<Text>Photo is uploading...</Text>)
              }
              <TouchableOpacity style={styles.button2}
                onPress={() => { this.setState({ visible: false }) }}>
                <Text style={styles.buttonText2}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          ) : (null)
        }
        {
          this.state.visible2 == true ? (
            <View style={styles.pop}>
              <Text style={styles.newText}>Title: {this.state.title}</Text>
              <Text style={styles.newText}>Description: {this.state.description}</Text>
              <Text style={styles.newText}>Class: {this.state.class}</Text>
              <Text style={styles.newText}>lastDate: {this.state.lastDate}</Text>
              <Text style={styles.newText}>Id: {this.state.doc_id}</Text>
              <TouchableOpacity style={styles.button2} onPress={() => { this.setState({ visible2: false }) }}>
                <Text style={styles.buttonText2}>OK</Text>
              </TouchableOpacity>
            </View>
          ) : (null)
        }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  button: {
    width: 140,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8
    },
    elevation: 16,
    backgroundColor: '#ff5722',
  },
  subtitle: {
    flex: 1,
    fontSize: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  pop: {
    top: 0,
    left: 0,
    width: '94%',
    height: '95%',
    position: 'absolute',
    marginLeft: '3%',
    marginTop: '3%',
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  plus: {
    width: 50,
    height: 50,
    backgroundColor: "#000",
    borderRadius: 50,
    padding: 10,
    fontSize: 20,
    margin: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  formTextInput: {
    width: "75%",
    height: 35,
    alignSelf: 'center',
    borderColor: '#ffab91',
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 20,
    padding: 10
  },
  button2: {
    width: 200,
    height: 20,
    padding: 20,
    backgroundColor: '#ffab91',
    borderRadius: 15,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15
  },
  buttonText2: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold'
  },
  newText:{
    fontSize: 14,
    fontWeight: 'bold',
    margin: 5
  }
})