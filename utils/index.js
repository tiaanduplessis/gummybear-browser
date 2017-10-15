export function sanitizeUrl (url) {
  if (!/^[a-zA-Z-_]+:/.test(url)) {
    url = 'https://' + url
  }
  return url.toLowerCase()
}

export function noop () {}
