import React from 'react';
import { Image } from 'react-native';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import SScreen1 from '../screens/SScreen1';
import SScreen2 from '../screens/SScreen2';



export const SAppTabNavigator = createBottomTabNavigator({
  SScreen1 : {
    screen: SScreen1,
    navigationOptions :{
      tabBarIcon : <Image source={require("../assets/request-list.png")} style={{width:20, height:20}}/>,
      tabBarLabel : "Assigned",
    }
  },
  SScreen2 : {
    screen: SScreen2,
    navigationOptions :{
      tabBarIcon : <Image source={require("../assets/request-book.png")} style={{width:20, height:20}}/>,
      tabBarLabel : "Submitted",
    }
  }
});
