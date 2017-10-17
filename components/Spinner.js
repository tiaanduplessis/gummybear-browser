import React from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'

import colors from '../constants/colors'

const Spinner = () => (
  <View style={styles.container}>
    <ActivityIndicator size='large' color={colors.gray} />
  </View>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.offWhite
  }
})

export default Spinner
