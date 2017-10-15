import 'react-native'
import React from 'react'
import Toolbar from '../Toolbar'
import renderer from 'react-test-renderer'

it('renders correctly', () => {
    const tree = renderer.create(<Toolbar />).toJSON()
    expect(tree).toMatchSnapshot()
})
