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
  ActivityIndicator
} from 'react-native'
import storage from 'react-native-modest-storage'

import { AddressBar, Container, Toolbar, Spinner } from '../components'

import {
  BASE_URL,
  TOOLBAR_HEIGHT,
  ADDRESS_BAR_HEIGHT
} from '../constants/config'
import colors from '../constants/colors'
import mixins from '../constants/style-mixins'
import spacing from '../constants/spacing'

import { sanitizeUrl } from '../utils'

class HomeScreen extends Component {
  state = {
    lastPress: 0,
    title: '',
    loading: true,
    url: BASE_URL,
    activeUrl: BASE_URL,
    backButtonEnabled: false,
    forwardButtonEnabled: false,
    showInput: false
  }

  async componentDidMount () {
    BackHandler.addEventListener('hardwareBackPress', this.handleHardwareBack)

    const url = await storage.get('url')

    if (url) {
      this.setState({ url, activeUrl: url })
    }

    this.setupAnimations()
  }

  componentWillUnmount () {
    BackHandler.removeEventListener(
      'hardwareBackPress',
      this.handleHardwareBack
    )
    clearTimeout(this.timeout)
  }

  render () {
    const {
      url,
      activeUrl,
      loading,
      backButtonEnabled,
      forwardButtonEnabled,
      showInput,
      title
    } = this.state

    return (
      <Container>
        <AddressBar
          showInput={showInput}
          title={title}
          url={activeUrl}
          loading={loading}
          onReload={this.handleReload}
          onLoad={this.handleLoad}
        />

        <WebView
          ref={ref => {
            this.webview = ref
          }}
          onNavigationStateChange={this.handleNavigationStateChange}
          source={{ uri: url }}
          style={styles.webview}
          startInLoadingState
          renderLoading={() => <Spinner />}
          automaticallyAdjustContentInsets={false}
          scalesPageToFit
        />

        <Toolbar
          enableBack={backButtonEnabled}
          enableForward={forwardButtonEnabled}
          onBack={this.handleBack}
          onForward={this.handleForward}
          onHome={this.handleHome}
        />
      </Container>
    )
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
    }, 2000)
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

  handleHome = () => this.setState({ url: BASE_URL })
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
    marginTop: ADDRESS_BAR_HEIGHT,
    marginBottom: TOOLBAR_HEIGHT
  }
})

export default HomeScreen
