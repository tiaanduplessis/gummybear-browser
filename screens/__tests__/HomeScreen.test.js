import { BackHandler, Linking } from 'react-native'
import storage from 'react-native-modest-storage'
import HomeScreen from '../HomeScreen'
import { BASE_URL } from '../../constants/config'

jest.mock('react-native', () => {
    let listeners = []

    return {
        View: 'View',
        WebView: 'WebView',
        StyleSheet: { create: styles => styles },
        PanResponder: { create: () => ({ panHandlers: {} }) },
        LayoutAnimation: {
            configureNext: jest.fn(),
            Presets: { linear: {}, easeInEaseOut: {} }
        },
        BackHandler: {
            addEventListener: jest.fn(),
            removeEventListener: jest.fn()
        },
        Linking: {
            addEventListener: jest.fn((type, listener) => listeners.push(listener)),
            removeEventListener: jest.fn((type, listener) => {
                listeners = listeners.filter(item => item !== listener)
            }),
            emitURL: event => listeners.slice().forEach(listener => listener(event)),
            reset: () => { listeners = [] }
        }
    }
}, { virtual: true })

jest.mock('react-native-modest-storage', () => ({
    get: jest.fn(),
    set: jest.fn()
}), { virtual: true })

jest.mock('../../components', () => ({
    AddressBar: 'AddressBar',
    Container: 'Container',
    Toolbar: 'Toolbar',
    Spinner: 'Spinner'
}))

let screen

function createScreen(props = {}) {
    const instance = new HomeScreen(props)
    instance.setState = jest.fn(update => {
        instance.state = Object.assign({}, instance.state, update)
    })
    screen = instance
    return screen
}

function expectURL(url) {
    expect(screen.state.url).toBe(url)
    expect(screen.state.activeUrl).toBe(url)
    const children = screen.render().props.children
    expect(children[0].props.url).toBe(url)
    expect(children[1].props.children.props.source.uri).toBe(url)
    expect(typeof children[1].props.children.props.source.uri).toBe('string')
}

beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
    Linking.reset()
    storage.get.mockImplementation(() => Promise.resolve(null))
})

afterEach(() => {
    if (screen) screen.componentWillUnmount()
    screen = null
    jest.useRealTimers()
})

it('loads the URL string from successive Linking events', async () => {
    createScreen()
    await screen.componentDidMount()

    Linking.emitURL({ url: 'https://example.com/First?token=CaseSensitive' })
    expectURL('https://example.com/First?token=CaseSensitive')
    Linking.emitURL({ url: 'https://example.org/second#fragment' })
    expectURL('https://example.org/second#fragment')
})

it('ignores malformed Linking events without replacing the current URL', async () => {
    createScreen({ initialURL: 'https://example.com/current' })
    await screen.componentDidMount()

    const malformedEvents = [null, undefined, {}, 'https://example.com/raw',
        { url: null }, { url: 42 }, { url: {} }, { url: '' }]
    malformedEvents.forEach(event => {
        Linking.emitURL(event)
        expectURL('https://example.com/current')
    })
})

it('uses the initial URL without reading the stored URL', async () => {
    createScreen({ initialURL: 'https://example.com/initial' })
    await screen.componentDidMount()
    expectURL('https://example.com/initial')
    expect(storage.get).not.toHaveBeenCalled()
})

it('restores a stored URL when no initial URL was provided', async () => {
    storage.get.mockImplementation(() => Promise.resolve('https://example.com/stored'))
    createScreen()
    await screen.componentDidMount()
    expectURL('https://example.com/stored')
    expect(storage.get).toHaveBeenCalledWith('url')
})

it('keeps the home URL when neither startup source has a URL', async () => {
    createScreen()
    await screen.componentDidMount()
    expectURL(BASE_URL)
})

it('removes the same listeners on unmount and supports a fresh mount', async () => {
    const first = createScreen()
    await first.componentDidMount()
    first.componentWillUnmount()
    expect(Linking.removeEventListener).toHaveBeenCalledWith('url', first.handleURL)
    expect(BackHandler.removeEventListener).toHaveBeenCalledWith('hardwareBackPress', first.handleHardwareBack)
    first.setState.mockClear()
    Linking.emitURL({ url: 'https://example.com/after-unmount' })
    expect(first.setState).not.toHaveBeenCalled()

    createScreen()
    await screen.componentDidMount()
    Linking.emitURL({ url: 'https://example.com/remounted' })
    expectURL('https://example.com/remounted')
    expect(first.setState).not.toHaveBeenCalled()
})
