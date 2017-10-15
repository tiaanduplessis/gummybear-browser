import 'react-native'
import React from 'react'
import Spinner from '../Spinner'
import renderer from 'react-test-renderer'

it('renders correctly', () => {
    const tree = renderer.create(<Spinner />).toJSON()
    expect(tree).toMatchSnapshot()
})
