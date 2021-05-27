import React, { Component } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, FlatList, StyleSheet, Image } from 'react-native';
import { Card, Icon, ListItem } from 'react-native-elements';
import MyHeader from '../components/MyHeader.js';
import firebase from 'firebase';
import db from '../config.js';
import * as ImagePicker from "expo-image-picker";
import * as Permissions from "expo-permissions";

export default class SScreen2 extends Component {
  constructor() {
    super()
    this.state = {
      studentId: firebase.auth().currentUser.email,
      studentName: "",
      allAssignments: [],
      visible: false,
      remarks: "",
      image: "",
    }
    this.assignmentRef = null
  }

  getSudentDetails = (studentId) => {
    db.collection("users").where("email_id", "==", studentId).get().then((snapshot) => {
      snapshot.forEach((doc) => {
        this.setState({
          "studentName": doc.data().first_name + " " + doc.data().last_name
        })
      });
    })
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
      this.uploadImage(uri, this.state.studentId + this.guidGenerator());
    }
  };

  uploadImage = async (uri, imageName) => {
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
      this.setState({ image: url });
      db.collection("assignments").doc(this.state.doc_id).update({ url: url, assignmentStatus: 'submitted', by: this.state.studentName });
    }).catch((error) => {
      this.setState({ image: "#" });
    });
  };

  getUserProfile() {
    db.collection("users").where("email_id", "==", this.state.studentId).onSnapshot((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        this.setState({
          name: doc.data().first_name + " " + doc.data().last_name,
          docId: doc.id,
          image: doc.data().image,
        });
      });
    });
  }

  componentDidMount() {
    this.fetchImage(this.state.userId);
    this.getUserProfile();
  }



  getAllAssignments = () => {
    this.assignmentRef = db.collection("assignments").where("email_id", '==', this.state.studentId).where('assignmentStatus', '==', 'assigned').onSnapshot((snapshot) => {
      var allAssignments = []
      snapshot.docs.map((doc) => {
        var assignment = doc.data()
        assignment["doc_id"] = doc.id
        allAssignments.push(assignment)
      });
      this.setState({
        allAssignments: allAssignments
      });
    })
  }

  keyExtractor = (item, index) => index.toString()

  renderItem = ({ item, i }) => (
    <ListItem
      key={i}
      title={item.title}
      subtitle={'Status : ' + item.assignmentStatus + "\nSubmitted on : " + item.submittedDate}
      titleStyle={{ color: 'black', fontWeight: 'bold' }}
      rightElement={
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            this.setState({ visible: true, title: item.title, lastDate: item.lastDate, doc_id: item.doc_id, status: item.assignmentStatus, description: item.description, photo: item.photoUrl });
            console.log(this.state.photo)
          }}
        >
          <Text style={{ color: '#ffff' }}>View Assignment</Text>
        </TouchableOpacity>
      }
      bottomDivider
    />
  )

  componentDidMount() {
    this.getSudentDetails(this.state.studentId)
    this.getAllAssignments()
    this.fetchImage(this.state.studentId);
    this.getUserProfile();
  }

  componentWillUnmount() {
    this.assignmentRef();
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <MyHeader navigation={this.props.navigation} title="Assigned" />
        <View style={{ flex: 1 }}>
          {
            this.state.allAssignments.length === 0
              ? (
                <View style={styles.subtitle}>
                  <Text style={{ fontSize: 20 }}>List of Assignments</Text>
                </View>
              )
              : (
                <FlatList
                  keyExtractor={this.keyExtractor}
                  data={this.state.allAssignments}
                  renderItem={this.renderItem}
                />
              )
          }
        </View>

        {
          this.state.visible == true ? (
            <View style={styles.pop}>
              <Text style={styles.newText}>Title: {this.state.title}</Text>
              <Text style={styles.newText}>Description: {this.state.description}</Text>
              <Text style={styles.newText}>Last date: {this.state.lastDate}</Text>
              <Text style={styles.newText}>AssigmentId: {this.state.doc_id}</Text>
              <Text style={styles.newText}>Status: {this.state.status}</Text>

              <Image
                style={{ width: 200, height: 300 }}
                source={{
                  uri: this.state.photo,
                }}
              />
              <TouchableOpacity style={styles.button2}
                onPress={() => {
                  this.selectPicture()
                }}
              >
                <Text style={styles.buttonText2}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button2} onPress={() => { this.setState({ visible: false }) }}>
                <Text style={styles.buttonText2}> Back</Text>
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
    backgroundColor: '#ff5722'
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
    height: '94%',
    position: 'absolute',
    marginLeft: '3%',
    marginTop: '3%',
    backgroundColor: '#ffffff',
    borderRadius: 50,
    padding: 20,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
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