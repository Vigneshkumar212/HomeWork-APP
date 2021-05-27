import React, { Component } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, FlatList, StyleSheet, Image } from 'react-native';
import { Card, Icon, ListItem } from 'react-native-elements';
import MyHeader from '../components/MyHeader.js';
import firebase from 'firebase';
import db from '../config.js';
import { TextInput } from 'react-native-gesture-handler';

export default class SScreen2 extends Component {
  constructor() {
    super()
    this.state = {
      teacherId: firebase.auth().currentUser.email,
      allAssignments: [],
      visible: false,
      remarks: "",
    }
    this.assignmentRef = null
  }

  getSudentDetails = (teacherId) => {
    db.collection("users").where("email_id", "==", teacherId).get().then((snapshot) => {
      snapshot.forEach((doc) => {
        this.setState({
          "teacherName": doc.data().first_name + " " + doc.data().last_name
        })
      });
    })
  }

  getAllAssignments = () => {
    this.assignmentRef = db.collection("assignments").where("teacherEmail", '==', this.state.teacherId).where('assignmentStatus', '==', 'submitted').onSnapshot((snapshot) => {
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

  sendRemark = () => {
    db.collection("assignments").doc(this.state.doc_id).update({ remarks: this.state.newRemark });
  }

  keyExtractor = (item, index) => index.toString()

  renderItem = ({ item, i }) => (
    <ListItem
      key={i}
      title={item.title}
      subtitle={'Status : ' + item.assignmentStatus + "\nStudent name : " + item.studentName}
      titleStyle={{ color: 'black', fontWeight: 'bold' }}
      rightElement={
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            this.setState({ visible: true, doc_id: item.doc_id, title: item.title, img: item.url, by: item.stuName, class: item.class, desc: item.description });
          }}
        >
          <Text style={{ color: '#ffff' }}>Give Remark</Text>
        </TouchableOpacity>
      }
      bottomDivider
    />
  )

  componentDidMount() {
    this.getSudentDetails(this.state.teacherId)
    this.getAllAssignments()
  }

  componentWillUnmount() {
    this.assignmentRef();
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <MyHeader navigation={this.props.navigation} title="Submitted" />
        <View style={{ flex: 1 }}>
          {
            this.state.allAssignments.length === 0
              ? (
                <View style={styles.subtitle}>
                  <Text style={{ fontSize: 20 }}>List of Submitted Assignments</Text>
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
              <Text style={styles.newText}>Description: {this.state.desc}</Text>
              <Text style={styles.newText}>Class: {this.state.class}</Text>
              <Text style={styles.newText}>Id: {this.state.doc_id}</Text>
              <Text style={styles.newText}>Student Name: {this.state.by}</Text>
              <Image
                style={{width: 200, height: 200}}
                source={{
                  uri: this.state.img,
                }}
              />
              <Text></Text>
              <Text style={styles.newText}>Give Remark: </Text>
              <TextInput
                placeholder="You Remark"
                style={styles.formTextInput}
                onChangeText={(text) => {
                  this.setState({
                    newRemark: text
                  })
                }} />
              <TouchableOpacity style={styles.button2} onPress={() => { this.sendRemark() }}>
                <Text style={styles.buttonText2}> Send</Text>
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
    width: 120,
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
})