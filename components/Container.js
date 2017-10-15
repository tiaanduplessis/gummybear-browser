import React from 'react'
import PropTypes from 'prop-types'
import { View, StyleSheet } from 'react-native'

import colors from '../constants/colors'

const Container = ({
  style,
  children,
  padding,
  backgroundColor,
  ...otherProps
}) => {
  const containerStyles = { padding, backgroundColor }

  return (
    <View style={[styles.container, containerStyles]} {...otherProps}>
      {children}
    </View>
  )
}

Container.propTypes = {
  padding: PropTypes.number,
  backgroundColor: PropTypes.string,
  center: PropTypes.bool
}

Container.defaultProps = {
  padding: 0,
  backgroundColor: colors.white
}

const styles = StyleSheet.create({
  container: { flex: 1 }
})

export default Container
