import React from 'react';
import { Image } from 'react-native';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import TScreen1 from '../screens/TScreen1';
import TScreen2 from '../screens/TScreen2';



export const TAppTabNavigator = createBottomTabNavigator({
  TScreen1 : {
    screen: TScreen1,
    navigationOptions :{
      tabBarIcon : <Image source={require("../assets/request-list.png")} style={{width:20, height:20}}/>,
      tabBarLabel : "Assinged",
    }
  },
  TScreen2 : {
    screen: TScreen2,
    navigationOptions :{
      tabBarIcon : <Image source={require("../assets/request-book.png")} style={{width:20, height:20}}/>,
      tabBarLabel : "Completed",
    }
  }
});
