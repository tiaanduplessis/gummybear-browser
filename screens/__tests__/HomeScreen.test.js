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
    delete global.panResponder
    Linking.reset()
    storage.get.mockImplementation(() => Promise.resolve(null))
})

afterEach(() => {
    if (screen) screen.componentWillUnmount()
    screen = null
    delete global.panResponder
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

it('renders without assigning a panResponder global', () => {
    createScreen()
    screen.render()
    expect(Object.prototype.hasOwnProperty.call(global, 'panResponder')).toBe(false)
})

it('does not overwrite a new Linking URL with a delayed stored URL', async () => {
    let resolveStoredURL
    storage.get.mockImplementation(() => new Promise(resolve => { resolveStoredURL = resolve }))
    createScreen()
    const mounted = screen.componentDidMount()

    Linking.emitURL({ url: 'https://example.com/first-link' })
    Linking.emitURL({ url: 'https://example.com/new-link' })
    resolveStoredURL('https://example.com/old-stored-url')
    await mounted
    expectURL('https://example.com/new-link')
})

it('still restores a stored URL after an invalid Linking event', async () => {
    let resolveStoredURL
    storage.get.mockImplementation(() => new Promise(resolve => { resolveStoredURL = resolve }))
    createScreen()
    const mounted = screen.componentDidMount()

    Linking.emitURL({ url: null })
    resolveStoredURL('https://example.com/stored')
    await mounted
    expectURL('https://example.com/stored')
})

it('does not restore a delayed stored URL after unmount', async () => {
    let resolveStoredURL
    storage.get.mockImplementation(() => new Promise(resolve => { resolveStoredURL = resolve }))
    createScreen()
    const mounted = screen.componentDidMount()
    screen.componentWillUnmount()
    screen.setState.mockClear()

    resolveStoredURL('https://example.com/stored')
    await mounted
    jest.runAllTimers()
    expect(screen.setState).not.toHaveBeenCalled()
})

it('restores a fresh instance independently of an old pending restore', async () => {
    let resolveOldURL
    storage.get.mockImplementationOnce(() => new Promise(resolve => { resolveOldURL = resolve }))
    const first = createScreen()
    const firstMounted = first.componentDidMount()
    first.componentWillUnmount()
    first.setState.mockClear()

    storage.get.mockImplementation(() => Promise.resolve('https://example.com/fresh-stored'))
    createScreen()
    await screen.componentDidMount()
    resolveOldURL('https://example.com/stale-stored')
    await firstMounted
    expectURL('https://example.com/fresh-stored')
    expect(first.setState).not.toHaveBeenCalled()
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
