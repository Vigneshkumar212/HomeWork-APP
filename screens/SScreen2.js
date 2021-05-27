import React, { Component } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, FlatList, StyleSheet } from 'react-native';
import { Card, Icon, ListItem } from 'react-native-elements';
import MyHeader from '../components/MyHeader.js';
import firebase from 'firebase';
import db from '../config.js';

export default class SScreen2 extends Component {
  constructor() {
    super()
    this.state = {
      studentId: firebase.auth().currentUser.email,
      studentName: "",
      allAssignments: [],
      visible: false,
      remarks: "",
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

  getAllAssignments = () => {
    this.assignmentRef = db.collection("assignments").where("email_id", '==', this.state.studentId).where('assignmentStatus', '==', 'submitted').onSnapshot((snapshot) => {
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
      subtitle={'Status : ' + item.assignmentStatus + "\nDescritption: " + item.description}
      titleStyle={{ color: 'black', fontWeight: 'bold' }}
      rightElement={
        <TouchableOpacity
          style={styles.button}
          onPress={() => { 
            this.setState({ visible: true, remarks: item.remarks });
            
         }}
        >
          <Text style={{ color: '#ffff' }}>View Remark</Text>
        </TouchableOpacity>
      }
      bottomDivider
    />
  )

  componentDidMount() {
    this.getSudentDetails(this.state.studentId)
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
            <Text style={styles.newText}>{this.state.remarks}</Text>
          <TouchableOpacity style={styles.button2} onPress={() => { this.setState({ visible: false }) }}>
            <Text style={styles.buttonText2}> Back</Text>
          </TouchableOpacity>
        </View>
          ):(null)
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
    margin: 5
  }
})