const takeWhile = require('lodash.takewhile')

const RE = /^([a-zA-Z0-9\s]+)(?:\:\s*)(.*)$/

function parse (string) {
  let lines = string.split(/\r\n/g)
    .map(line => line.trim())
    .filter(line => line !== '')

  if (/^[no]{2}t?\s/.test(lines[0].toLowerCase())) {
    return {}
  }
  let data = takeWhile(lines, line => RE.test(line))
    .map(line => line.match(RE).slice(1,3))
    .reduce((acc, [key, value]) => {
      key = key.toLowerCase().replace(/\s/g, '_')
      acc[key] = value
      return acc
    }, {})
  
  return data
}

module.exports = parse