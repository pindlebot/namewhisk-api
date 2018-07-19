const { promisify } = require('util')
const lookup = require('./lookup')

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
    set: (key, value, expires) => new Promise((resolve, reject) =>
      client.set(key, value, 'EX', expires, resolve)
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

const handler = async (event, context, callback) => {
  const client = await createClient()
  const { id } = event.pathParameters
  let data = await client.get(id)
  if (data) {
    data = JSON.parse(data)
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
