import React from 'react'
import { Platform, StatusBar, UIManager } from 'react-native'
import { AppLoading, Asset, Font } from 'expo'
import { Ionicons } from '@expo/vector-icons'

import HomeScreen from './screens/HomeScreen'

import {Container} from './components'

UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true)

export default class App extends React.Component {
    state = {
        isLoadingComplete: false
    }

    render() {
        if (!this.state.isLoadingComplete) {
            return (
                <AppLoading
                    startAsync={this.loadResourcesAsync}
                    onError={this.handleLoadingError}
                    onFinish={this.handleFinishLoading}
                />
            )
        } 
            return (
                <Container>
                    <StatusBar hidden />
                    <HomeScreen />
                </Container>
            )
    }

    loadResourcesAsync = async () => {
        return Promise.all([
            Font.loadAsync({
                Montserrat: require('./assets/fonts/Montserrat-Light.otf')
            })
        ])
    }

    handleLoadingError = error => console.warn(error)

    handleFinishLoading = () => this.setState({ isLoadingComplete: true })
}