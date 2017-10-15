import React, { Component } from 'react'
import {
  TextInput,
  View,
  StyleSheet,
  ActivityIndicator,
  Image
} from 'react-native'

import { ADDRESS_BAR_HEIGHT } from '../constants/config'
import images from '../constants/images'
import colors from '../constants/colors'
import spacing from '../constants/spacing'
import mixins from '../constants/style-mixins'

import { sanitizeUrl } from '../utils'

class AddressBar extends Component {
  state = {
    focused: false,
    inputTitle: this.props.title,
    inputText: this.props.url
  }

  componentWillReceiveProps (nextProps) {
    // HACK:
    // Keep internal state of the provided props until submission is made
    this.setState({
      inputTitle: nextProps.title,
      inputText: nextProps.url
    })
  }

  render () {
    const { loading, onRefresh, showInput } = this.props
    const { inputText, inputTitle, focused } = this.state

    return (
      <View style={styles.addressBar}>
        <Image source={images.logo} style={styles.logo} />

        {showInput && (
          <TextInput
            ref={ref => {
              this.input = ref
            }}
            numberOfLines={1}
            value={focused ? inputText : inputTitle}
            autoCapitalize='none'
            underlineColorAndroid={colors.transparent}
            onSubmitEditing={this.onSubmitEditing}
            returnKeyType='search'
            onChangeText={this.handleTextInputChange}
            clearButtonMode='while-editing'
            onFocus={this.handleInputFocus}
            style={styles.input}
            onBlur={this.handleInputBlur}
          />
        )}

        {loading && showInput && <ActivityIndicator color={colors.gray} />}
      </View>
    )
  }

  handleTextInputChange = text => {
    const inputText = sanitizeUrl(text)
    this.setState({ inputText })
  }

  onSubmitEditing = () => {
    const { inputText } = this.state
    const { url, onReload, onLoad } = this.props

    inputText === url ? onReload() : onLoad(url)
    this.input && this.input.blur()
  }

  handleInputBlur = () => this.setState({ focused: false })

  handleInputFocus = () => this.setState({ focused: true })
}

const styles = StyleSheet.create({
  addressBar: {
    ...mixins.shadow,
    shadowOffset: { width: 0, height: 1 },
    position: 'absolute',
    top: spacing[0],
    left: spacing[0],
    right: spacing[0],
    zIndex: 1,
    padding: spacing[2],
    backgroundColor: colors.white,
    height: ADDRESS_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  input: {
    fontSize: 14,
    fontFamily: 'Montserrat',
    flex: 1,
    color: colors.black
  },
  logo: { width: 20, resizeMode: 'contain', marginRight: spacing[2] }
})

module.exports = AddressBar
