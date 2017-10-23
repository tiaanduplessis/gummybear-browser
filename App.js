import React from 'react'
import { Platform, StatusBar, UIManager, Linking } from 'react-native'
import { AppLoading, Asset, Font, Permissions } from 'expo'
import { Ionicons } from '@expo/vector-icons'

import HomeScreen from './screens/HomeScreen'

import {Container} from './components'

UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true)

export default class App extends React.Component {
    state = {
        isLoadingComplete: false,
        initialURL: ''
    }

    async componentDidMount() {
        const url = await Linking.getInitialURL()
        this.setState({initialURL: url})
    }

    render() {
        const {isLoadingComplete, initialURL} = this.state

        if (!isLoadingComplete) {
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
                    <HomeScreen initialURL={initialURL} />
                </Container>
            )
    }

    loadResourcesAsync = async () => {
        return Promise.all([
            Permissions.askAsync(Permissions.LOCATION),
            Asset.fromModule(require('./assets/images/gummybear.png')).downloadAsync(),
            Font.loadAsync({
                Montserrat: require('./assets/fonts/Montserrat-Light.otf')
            })
        ])
    }

    handleLoadingError = error => console.warn(error)

    handleFinishLoading = () => this.setState({ isLoadingComplete: true })
}