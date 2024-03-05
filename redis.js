const { createClient } = require('redis')
const client = createClient({
    host: '127.0.0.1',
    port: 6379
})
module.exports = {client}






