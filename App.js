import React from 'react';
import { createAppContainer, createSwitchNavigator,} from 'react-navigation';
import { createBottomTabNavigator } from 'react-navigation-tabs';

import WelcomeScreen from './screens/WelcomeScreen';
import { TAppTabNavigator } from './components/TAppTabNavigator';
import { SAppTabNavigator } from './components/SAppTabNavigator';

export default function App() {
  return (
    <AppContainer/>
  );
}


const switchNavigator = createSwitchNavigator({
  WelcomeScreen:{screen: WelcomeScreen},
  TAppTabNavigator:{screen: TAppTabNavigator},
  SAppTabNavigator:{screen: SAppTabNavigator}
})

const AppContainer =  createAppContainer(switchNavigator);