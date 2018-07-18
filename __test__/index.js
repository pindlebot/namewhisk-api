const parse = require('../src/parse-whois')
const lookup = require('../src/lookup')

const client = {
  set: (data, expiry) => {
    return Promise.resolve({})
  }
}

lookup('google.com', { client }).then(data => {
  console.log(data)
})