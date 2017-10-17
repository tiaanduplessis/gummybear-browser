import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { SimpleLineIcons } from '@expo/vector-icons'

import { TOOLBAR_HEIGHT } from '../constants/config'
import colors from '../constants/colors'

import { noop } from '../utils'

const Toolbar = ({ onHome, onBack, onForward, enableBack, enableForward }) => (
  <View style={styles.toolbar}>
    <TouchableOpacity
      onPress={onHome}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <SimpleLineIcons name='home' size={25} color={colors.black} />
    </TouchableOpacity>
    <View style={styles.innerContainer}>
      <TouchableOpacity onPress={onBack}>
        <SimpleLineIcons
          name='arrow-left'
          size={25}
          color={enableBack ? colors.black : colors.lightGray}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={onForward}>
        <SimpleLineIcons
          name='arrow-right'
          size={25}
          color={enableForward ? colors.black : colors.lightGray}
        />
      </TouchableOpacity>
    </View>
  </View>
)

Toolbar.defaultProps = {
  enableBack: false,
  enableForward: false,
  onHome: noop,
  onBack: noop,
  onForward: noop
}

const styles = StyleSheet.create({
  toolbar: {
    alignItems: 'center',
    padding: 12,
    zIndex: 1,
    justifyContent: 'space-between',
    flexDirection: 'row',
    shadowOffset: { width: 0, height: -1 },
    shadowColor: colors.gray,
    shadowOpacity: 0.7,
    elevation: 2,
    backgroundColor: colors.white,
    height: TOOLBAR_HEIGHT,
    borderColor: colors.offWhite,
    borderTopWidth: 1
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 100,
    justifyContent: 'space-between',
    alignItems: 'center'
  }
})

export default Toolbar
