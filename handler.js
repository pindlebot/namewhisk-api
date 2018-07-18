const { promisify } = require('util')
const whois = require('whois-2')
const parse = require('./parse')

const createClient = async () => {
  const client = require('redis')
    .createClient(14914, process.env.REDIS_HOSTNAME)
  client.auth(process.env.REDIS_PASSWORD)

  client.on('error', (err) => {
    console.log(err)
  })
  await new Promise((resolve, reject) =>
    client.on('ready', resolve)
  )
  client.on('error', () => console.log('error'))
  client.on('connect', () => console.log('connect'))
  client.on('end', () => console.log('end'))
  return {
    get: promisify(client.get).bind(client),
    set: (key, value) => new Promise((resolve, reject) =>
      client.set(key, value, 'EX', 60 * 60 * 24 * 1000, resolve)
    ), 
    end: () => new Promise((resolve, reject) => {
      client.on('end', resolve)
      client.quit()
    })
  }
}

const respond = (message = {}) => ({
  statusCode: 200,
  body: typeof message === 'string'
    ? message
    : JSON.stringify(message),
  headers: {
    'Access-Control-Allow-Origin': '*'
  }
})

const lookup = (id, { client }) => new Promise((resolve, reject) => 
  whois.lookup(id, async (err, whoisData) => {
    whoisData = parse(whoisData)
    whoisData.available = Object.keys(whoisData).length
      ? false
      : true

    client.set(id, JSON.stringify(whoisData))
    resolve(whoisData)
  })
)

const handler = async (event, context, callback) => {
  const client = await createClient()
  const { id } = event.pathParameters
  let data = await client.get(id)
  if (data) {
    data = JSON.parse(data)
    if (data.registry_expiry_date) {
      let expiry = new Date(data.registry_expiry_date).getTime()
      if (Date.now() + (24 * 60 * 60 * 1000) > expiry) {
        data = null
      }
    }
  }

  if (!data) {
    data = await lookup(id, { client })
  }

  await client.end()
  callback(
    null,
    respond({ data })
  )
}

module.exports.handler = handler
