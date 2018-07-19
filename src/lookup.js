const whois = require('whois-2')

const DAY = 60 * 60 * 24 * 1000

const lookup = (id, { client }) =>
  whois(id, { format: 'json' })
    .then(async whoisData => {
      whoisData.available = Object.keys(whoisData).length
        ? false
        : true
      let expires = DAY
      if (whoisData.registry_expiry_date) {
        expires = new Date(whoisData.registry_expiry_date).getTime() - Date.now()
        expires = Math.max(DAY, Math.floor(expires))
      }
      await client.set(id, JSON.stringify(whoisData), expires)
      return whoisData
    })

module.exports = lookup
