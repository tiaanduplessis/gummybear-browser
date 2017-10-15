import 'react-native'
import React from 'react'
import AddressBar from '../AddressBar'
import renderer from 'react-test-renderer'

it('renders correctly', () => {
    const tree = renderer.create(<AddressBar/>).toJSON()
    expect(tree).toMatchSnapshot()
})
