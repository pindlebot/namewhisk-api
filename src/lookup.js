const parse = require('./parse-whois')
const whois = require('whois-2')

const DAY = 60 * 60 * 24 * 1000

const lookup = (id, { client }) => new Promise((resolve, reject) => 
  whois.lookup(id, async (err, whoisData) => {
    whoisData = parse(whoisData)
    whoisData.available = Object.keys(whoisData).length
      ? false
      : true
    let expires = DAY
    if (whoisData.registry_expiry_date) {
      expires = new Date(whoisData.registry_expiry_date).getTime() - Date.now()
      expires = Math.max(DAY, Math.floor(expires))
    }
    client.set(id, JSON.stringify(whoisData), expires)
    resolve(whoisData)
  })
)

module.exports = lookup
