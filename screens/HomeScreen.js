import React, { Component } from 'react'
import {
    View,
    StyleSheet,
    WebView,
    TextInput,
    LayoutAnimation,
    BackHandler,
    ScrollView,
    Alert,
    ActivityIndicator,
    PanResponder,
    Linking
} from 'react-native'
import storage from 'react-native-modest-storage'

import { AddressBar, Container, Toolbar, Spinner } from '../components'

import { BASE_URL, TOOLBAR_HEIGHT, ADDRESS_BAR_HEIGHT } from '../constants/config'
import colors from '../constants/colors'
import mixins from '../constants/style-mixins'
import spacing from '../constants/spacing'

import { isTrue } from '../utils'

class HomeScreen extends Component {
    state = {
        lastPress: 0,
        title: '',
        loading: true,
        url: BASE_URL,
        activeUrl: BASE_URL,
        backButtonEnabled: false,
        forwardButtonEnabled: false,
        showInput: false,
        firstMoveY: 0,
        isScrolling: false
    }
    async componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleHardwareBack)
        this.setupAnimations()
        Linking.addEventListener('url', this.handleURL)

        const { initialURL } = this.props

        if (initialURL) {
            this.setState({ url: initialURL, activeUrl: initialURL })
        } else {
            const url = await storage.get('url')

            if (url) {
                this.setState({ url, activeUrl: url })
            }
        }
    }

    handleURL = url => this.setState({ url, activeUrl: url })

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleHardwareBack)
        Linking.removeEventListener('url', this.handleURL)
        clearTimeout(this.timeout)
    }

    render() {
        const {
            url,
            activeUrl,
            loading,
            backButtonEnabled,
            forwardButtonEnabled,
            showInput,
            title,
            isScrolling
        } = this.state

        const { panHandlers } = (panResponder = PanResponder.create({
            onStartShouldSetPanResponder: isTrue,
            onStartShouldSetPanResponderCapture: isTrue,
            onMoveShouldSetPanResponder: isTrue,
            onMoveShouldSetPanResponderCapture: isTrue,
            onPanResponderGrant: this.handlePanResponderGrant,
            onPanResponderMove: this.handlePanResponderMove,
            onPanResponderRelease: this.handlePanResponderRelease
        }))

        return (
            <Container backgroundColor={colors.offWhite}>
                {!isScrolling && (
                    <AddressBar
                        showInput={showInput}
                        title={title}
                        url={activeUrl}
                        loading={loading}
                        onReload={this.handleReload}
                        onLoad={this.handleLoad}
                    />
                )}

                <View style={{ flex: 1 }} {...panHandlers}>
                    <WebView
                        ref={ref => {
                            this.webview = ref
                        }}
                        style={styles.webview}
                        onNavigationStateChange={this.handleNavigationStateChange}
                        source={{ uri: url }}
                        startInLoadingState
                        renderLoading={() => <Spinner />}
                        automaticallyAdjustContentInsets={false}
                        scalesPageToFit
                    />
                </View>

                {!isScrolling && (
                    <Toolbar
                        enableBack={backButtonEnabled}
                        enableForward={forwardButtonEnabled}
                        onBack={this.handleBack}
                        onForward={this.handleForward}
                        onHome={this.handleHome}
                    />
                )}
            </Container>
        )
    }

    handlePanResponderRelease = () => {
        this.timeout = setTimeout(() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.linear)
            this.setState({ isScrolling: false })
        }, 1000)
    }

    handlePanResponderGrant = (evt, gestureState) => {
        clearTimeout(this.timeout)
        this.setState({
            firstMoveY: gestureState.y0
        })
    }

    handlePanResponderMove = (evt, gestureState) => {
        const distance = Math.abs(gestureState.moveY - this.state.firstMoveY)
        if (distance > 200) {
            this.setState({ isScrolling: true })
        }
    }

    handleHardwareBack = () => {
        const delta = new Date().getTime() - this.state.lastPress
        this.setState({
            lastPress: new Date().getTime()
        })

        // Detect if single tab or double
        // Adapted from: https://gist.github.com/mrzmyr/9ac94ca4622c1602a2a3
        if (delta < 200) {
            Alert.alert('Hold up!', 'Would you like to exit?', [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Yes',
                    onPress: BackHandler.exitApp
                }
            ])
        } else {
            this.handleBack()
        }

        return true
    }

    setupAnimations = () => {
        this.timeout = setTimeout(() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
            this.setState({ showInput: true })
        }, 1500)
    }

    handleNavigationStateChange = navState => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)

        this.setState({
            backButtonEnabled: navState.canGoBack,
            forwardButtonEnabled: navState.canGoForward,
            activeUrl: navState.url,
            title: navState.title,
            loading: navState.loading
        })

        storage.set('url', navState.url)
    }

    handleLoad = url => this.setState({ url })

    handleReload = () => this.webview.reload()

    handleBack = () => this.webview.goBack()

    handleForward = () => this.webview.goForward()

    handleHome = () => this.setState({ url: BASE_URL, activeUrl: BASE_URL })
}

const styles = StyleSheet.create({
    toolbar: {
        ...mixins.shadow,
        shadowOffset: { width: 0, height: -1 },
        position: 'absolute',
        bottom: spacing[0],
        left: spacing[0],
        right: spacing[0],
        backgroundColor: colors.white,
        height: TOOLBAR_HEIGHT
    },
    webview: {
        backgroundColor: colors.offWhite
    }
})

export default HomeScreen
