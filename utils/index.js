import { BASE_URL } from '../constants/config'

export function sanitizeUrl (url) {
  // We check if a search string is provided and format it as a query
  if (!/^[a-zA-Z-_]+:/.test(url)) {
    url = `${BASE_URL}${jsonToQueryString({ q: url })}`
  }
  return url.toLowerCase()
}

export function noop () {}

export function isTrue () {
  return true
}

export function jsonToQueryString (json) {
  const items = Object.keys(json).map(
    key => encodeURIComponent(key) + '=' + encodeURIComponent(json[key])
  )

  if (items.length) {
    return `?${items.join('&')}`
  }
  return ''
}
