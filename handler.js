const { promisify } = require('util')
const { lookup } = require('whois-2')

const createClient = async () => {
  const client = require('redis')
    .createClient(process.env.REDIS_PORT, process.env.REDIS_HOSTNAME)
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
    set: promisify(client.set).bind(client),
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

module.exports.handler = async (event, context, callback) => {
  const client = await createClient()
  const { id } = event.pathParameters
  let data = await client.get(id)
  if (!data) {
    data = await new Promise((resolve, reject) => 
      lookup(id, async (err, info) => {
        await client.set(id, data)
        resolve(info)
      })
    )
  }

  await client.end()
  callback(
    null,
    respond({ data })
  )
}