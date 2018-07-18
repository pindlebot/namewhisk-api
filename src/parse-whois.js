const RE = /^(?!.*[Tt][Ee][Rr][Mm][Ss])(?![Nn][Oo][Tt][Ii]?[Ce]?[Ee])([a-zA-Z0-9\s\/]+)(?:\:\s?)(?!\s?\(\d\))(.+)$/

function parse (string) {
  let lines = string.split(/\r?\n/g)
    .filter(line => line !== '')

  if (/^[no]{2}t?\s/.test(lines[0].toLowerCase())) {
    return {}
  }
  let data = lines.filter(line => RE.test(line))
    .map(line => line.match(RE).slice(1,3))
    .reduce((acc, [key, value]) => {
      key = key.trim().toLowerCase().replace(/\s/g, '_')
      acc[key] = value.trim()
      return acc
    }, {})
  
  return data
}

module.exports = parse